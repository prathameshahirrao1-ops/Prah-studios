// Spec:
//   - docs/spec/ui-map/timeline-tab.md
//   - docs/spec/schema/session.md
//   - docs/spec/schema/homework.md
//

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { colors, radius, spacing } from '../../theme';
import {
  TimelineSession,
  TimelineTask,
  mockTasks,
  mockTimeline,
} from '../../data/mockStudent';
import { useStreaksData } from '../../data/mockStreaks';
import { StreakFooter } from '../../components/StreakFooter';
import { formatDateWithWeekday } from '../../utils/formatDate';
import { TimelineSessionCard } from './TimelineSessionCard';

interface Props {
  onTapSession: (session: TimelineSession) => void;
  onTapHwTask: (task: TimelineTask) => void;
  onTapQuizTask: (task: TimelineTask) => void;
  onTapGkTask: (task: TimelineTask) => void;
  /** Task IDs marked done during this session (e.g. HW just submitted in the popup). */
  extraCompletedTaskIds?: Set<string>;
  /** The HW task that was JUST submitted — plays the celebration animation. */
  justSubmittedHwTaskId?: string | null;
  /** Tap on "Not there on this day?" on an upcoming session card. */
  onTapNotThere?: (session: TimelineSession) => void;
  /** Parent scroll view — timeline auto-scrolls to today's row on first mount. */
  scrollRef?: React.RefObject<ScrollView | null>;
  /** Y offset of the timeline container within the outer ScrollView. */
  contentYOffset?: React.RefObject<number>;
}

/**
 * One dot per day. Each day-group collects the session (0 or 1) + all tasks
 * that land on that date. Incomplete tasks from past days "roll forward" to
 * today's group — so the user always sees pending work under today's dot.
 *
 * A task's canonical date comes from the original data; rolling uses the
 * original `done` flag so the task stays on today once moved (even after
 * submitting in-session via the HW popup).
 */
type TaggedTask = TimelineTask & { rolledForward: boolean };

type DayGroup = {
  date: string;
  session?: TimelineSession;
  tasks: TaggedTask[];
};

function buildDayGroups(today: string): DayGroup[] {
  const map = new Map<string, DayGroup>();
  const get = (date: string) => {
    let g = map.get(date);
    if (!g) {
      g = { date, tasks: [] };
      map.set(date, g);
    }
    return g;
  };

  for (const s of mockTimeline) {
    get(s.date).session = s;
  }

  for (const t of mockTasks) {
    const rolledForward = !t.done && t.date < today;
    const targetDate = rolledForward ? today : t.date;
    get(targetDate).tasks.push({ ...t, rolledForward });
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function TimelineTab({
  onTapSession,
  onTapHwTask,
  onTapQuizTask,
  onTapGkTask,
  extraCompletedTaskIds,
  justSubmittedHwTaskId,
  onTapNotThere,
  scrollRef,
  contentYOffset,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const groups = buildDayGroups(today);

  // Scroll to today's row.
  // The row Y includes an 18px connector line above the dot — skip it so the
  // TODAY label snaps to the top. Subtract 12px for a tiny context sliver.
  // A 120ms delay ensures contentYOffset (set by JourneyScreen's onLayout) is
  // written before we read it — avoids a layout-order race on web.
  const CONNECTOR_H = 18;
  const handleTodayLayout = (e: LayoutChangeEvent) => {
    const rowY = e.nativeEvent.layout.y;
    setTimeout(() => {
      const scrollView = scrollRef?.current;
      if (!scrollView) return;
      const parentY = contentYOffset?.current ?? 0;
      scrollView.scrollTo({
        y: Math.max(0, parentY + rowY + CONNECTOR_H - 12),
        animated: true,
      });
    }, 120);
  };

  return (
    <View style={styles.container}>
      {groups.map((g, i) => (
        <TimelineRow
          key={g.date}
          group={g}
          today={today}
          isFirst={i === 0}
          isLast={i === groups.length - 1}
          onTodayLayout={g.date === today ? handleTodayLayout : undefined}
          onTapSession={onTapSession}
          onTapHwTask={onTapHwTask}
          onTapQuizTask={onTapQuizTask}
          onTapGkTask={onTapGkTask}
          extraCompletedTaskIds={extraCompletedTaskIds}
          justSubmittedHwTaskId={justSubmittedHwTaskId}
          onTapNotThere={onTapNotThere}
        />
      ))}
    </View>
  );
}

function TimelineRow({
  group,
  today,
  isFirst,
  isLast,
  onTodayLayout,
  onTapSession,
  onTapHwTask,
  onTapQuizTask,
  onTapGkTask,
  extraCompletedTaskIds,
  justSubmittedHwTaskId,
  onTapNotThere,
}: {
  group: DayGroup;
  today: string;
  isFirst: boolean;
  isLast: boolean;
  onTodayLayout?: (e: LayoutChangeEvent) => void;
  onTapSession: (s: TimelineSession) => void;
  onTapHwTask: (t: TimelineTask) => void;
  onTapQuizTask: (t: TimelineTask) => void;
  onTapGkTask: (t: TimelineTask) => void;
  extraCompletedTaskIds?: Set<string>;
  justSubmittedHwTaskId?: string | null;
  onTapNotThere?: (s: TimelineSession) => void;
}) {
  const dateLabel = formatDateWithWeekday(group.date);
  const isToday = group.date === today;
  const isPast = group.date < today;

  let nodeVariant: 'filled' | 'missed' | 'upcoming' | 'today' | 'task';
  if (isToday) {
    nodeVariant = 'today';
  } else if (group.session?.status === 'missed') {
    nodeVariant = 'missed';
  } else if (isPast) {
    nodeVariant = 'filled';
  } else {
    nodeVariant = 'upcoming';
  }

  return (
    <View onLayout={onTodayLayout} style={styles.row}>
      {/* Gutter: connector line + dot */}
      <View style={styles.gutter}>
        {!isFirst && <View style={styles.connector} />}
        <NodeDot variant={nodeVariant} />
        {!isLast && <View style={[styles.connector, { flex: 1 }]} />}
      </View>

      {/* Content */}
      <View style={[styles.content, isToday && styles.contentToday]}>
        <View style={styles.dateRow}>
          {isToday && (
            <View style={styles.todayPill}>
              <Text variant="caption" style={styles.todayPillText}>
                TODAY
              </Text>
            </View>
          )}
          <Text variant="caption" tone="muted" style={styles.dateLabel}>
            {dateLabel}
          </Text>
        </View>

        {group.session && (
          <TimelineSessionCard
            session={group.session}
            isPast={isPast}
            isToday={isToday}
            onPress={() => onTapSession(group.session!)}
            onPressNotThere={
              onTapNotThere ? () => onTapNotThere(group.session!) : undefined
            }
          />
        )}

        {group.tasks.length > 0 && (
          <TaskStack
            tasks={group.tasks}
            split={isToday}
            extraCompletedTaskIds={extraCompletedTaskIds}
            justSubmittedHwTaskId={justSubmittedHwTaskId}
            onTapHwTask={onTapHwTask}
            onTapQuizTask={onTapQuizTask}
            onTapGkTask={onTapGkTask}
          />
        )}
      </View>
    </View>
  );
}

/**
 * Renders the task list for a day group.
 * When `split` is true (today only) and any task is rolled-forward, splits
 * into "From earlier" + "New today" sections. Otherwise flat list.
 */
function TaskStack({
  tasks,
  split,
  extraCompletedTaskIds,
  justSubmittedHwTaskId,
  onTapHwTask,
  onTapQuizTask,
  onTapGkTask,
}: {
  tasks: TaggedTask[];
  split: boolean;
  extraCompletedTaskIds?: Set<string>;
  justSubmittedHwTaskId?: string | null;
  onTapHwTask: (t: TimelineTask) => void;
  onTapQuizTask: (t: TimelineTask) => void;
  onTapGkTask: (t: TimelineTask) => void;
}) {
  const renderTask = (t: TaggedTask) => (
    <TaskCard
      key={t.id}
      task={{ ...t, done: extraCompletedTaskIds?.has(t.id) || t.done }}
      onPressHw={() => onTapHwTask(t)}
      onPressQuiz={() => onTapQuizTask(t)}
      onPressGk={() => onTapGkTask(t)}
      celebrate={t.id === justSubmittedHwTaskId}
    />
  );

  const carried = split ? tasks.filter((t) => t.rolledForward) : [];
  // Flat list when not splitting or no carry-overs.
  if (carried.length === 0) {
    return <View style={styles.taskStack}>{tasks.map(renderTask)}</View>;
  }

  const fresh = tasks.filter((t) => !t.rolledForward);
  return (
    <View style={styles.taskStack}>
      <SectionLabel icon="time-outline" label="From earlier" />
      <View style={styles.carriedStack}>{carried.map(renderTask)}</View>
      {fresh.length > 0 && (
        <>
          <SectionLabel icon="sparkles-outline" label="New today" />
          <View style={styles.taskStack}>{fresh.map(renderTask)}</View>
        </>
      )}
    </View>
  );
}

function SectionLabel({ icon, label }: { icon: 'time-outline' | 'sparkles-outline'; label: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Ionicons name={icon} size={12} color={colors.textMuted} />
      <Text variant="caption" tone="muted" style={styles.sectionLabel}>
        {label}
      </Text>
    </View>
  );
}

function NodeDot({
  variant,
}: {
  variant: 'filled' | 'missed' | 'upcoming' | 'today' | 'task';
}) {
  if (variant === 'today') {
    return <TodayDot />;
  }
  if (variant === 'task') {
    return (
      <View style={[styles.dot, styles.dotTask]}>
        <View style={styles.dotTaskInner} />
      </View>
    );
  }
  if (variant === 'upcoming') {
    return <View style={[styles.dot, styles.dotUpcoming]} />;
  }
  if (variant === 'missed') {
    return <View style={[styles.dot, styles.dotMissed]} />;
  }
  return <View style={[styles.dot, styles.dotFilled]} />;
}

function TodayDot() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={styles.todayWrap}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.todayRing,
          { transform: [{ scale: ringScale }], opacity: ringOpacity },
        ]}
      />
      <View style={styles.dotToday} />
    </View>
  );
}

function TaskCard({
  task,
  onPressHw,
  onPressQuiz,
  onPressGk,
  celebrate,
}: {
  task: TimelineTask;
  onPressHw: () => void;
  onPressQuiz: () => void;
  onPressGk: () => void;
  celebrate?: boolean;
}) {
  const streaks = useStreaksData();
  // Pending HW gets a richer, more actionable card.
  if (task.kind === 'hw' && !task.done) {
    return <PendingHwCard task={task} onPress={onPressHw} />;
  }

  const icon: 'bulb-outline' | 'help-circle-outline' | 'camera-outline' =
    task.kind === 'gk'
      ? 'bulb-outline'
      : task.kind === 'quiz'
      ? 'help-circle-outline'
      : 'camera-outline';

  const onPress =
    task.kind === 'hw'
      ? onPressHw
      : task.kind === 'quiz' && !task.done
      ? onPressQuiz
      : task.kind === 'gk' && !task.done
      ? onPressGk
      : () => {};
  const rightMeta = task.done ? 'Completed' : task.meta;

  // Celebration: only for freshly-completed HW tasks.
  const shouldCelebrate = !!celebrate && task.kind === 'hw' && !!task.done;

  // Show streak footer on actionable (pending) quiz/GK cards only.
  const showStreakFooter =
    !task.done && (task.kind === 'quiz' || task.kind === 'gk');
  const streakCount =
    task.kind === 'quiz' ? streaks.quiz : streaks.gk;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <CelebrationWrapper enabled={shouldCelebrate}>
        <Card compact>
          <View style={styles.taskRow}>
            <View style={styles.taskIcon}>
              <Ionicons name={icon} size={18} color={colors.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyBold">{task.title}</Text>
              {rightMeta && (
                <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
                  {rightMeta}
                </Text>
              )}
            </View>
            {task.done ? (
              <CheckmarkBadge animate={shouldCelebrate} />
            ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            )}
          </View>
          {showStreakFooter && (
            <StreakFooter
              type={task.kind as 'quiz' | 'gk'}
              count={streakCount}
            />
          )}
        </Card>
      </CelebrationWrapper>
    </Pressable>
  );
}

/**
 * Celebration animation wrapper.
 * Plays a soft green glow + outline stroke that fades in, holds, then fades out.
 * The child card stays put — only the halo changes.
 */
function CelebrationWrapper({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) {
      glow.setValue(0);
      return;
    }
    glow.setValue(0);
    Animated.sequence([
      Animated.timing(glow, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.delay(1400),
      Animated.timing(glow, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [enabled, glow]);

  // Always render the wrapper so the halo child can mount exactly once.
  const haloOpacity = glow;
  const haloScale = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.02],
  });

  return (
    <View style={styles.celebrateWrap}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.celebrateHalo,
          { opacity: haloOpacity, transform: [{ scale: haloScale }] },
        ]}
      />
      {children}
    </View>
  );
}

/**
 * Checkmark circle with a pop-in scale animation on first appearance.
 */
function CheckmarkBadge({ animate }: { animate: boolean }) {
  const scale = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animate, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name="checkmark-circle" size={22} color={colors.success} />
    </Animated.View>
  );
}

function PendingHwCard({ task, onPress }: { task: TimelineTask; onPress: () => void }) {
  const streaks = useStreaksData();
  return (
    <Card style={styles.hwPendingCard}>
      <View style={styles.hwHeader}>
        <Chip label="Homework" tone="warning" />
        {task.meta && (
          <Text variant="small" tone="muted">
            {task.meta}
          </Text>
        )}
      </View>
      <Text variant="bodyBold" style={{ marginTop: spacing.sm }}>
        {task.title}
      </Text>
      <Text variant="small" tone="secondary" style={{ marginTop: 2 }}>
        Upload a photo of your drawing to submit.
      </Text>
      <View style={{ marginTop: spacing.md }}>
        <Button label="Submit homework" size="sm" onPress={onPress} />
      </View>
      <StreakFooter type="hw" count={streaks.hw} />
    </Card>
  );
}

const DOT_SIZE = 14;
const GUTTER = 28;

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  row: {
    flexDirection: 'row',
    minHeight: 90,
  },
  gutter: {
    width: GUTTER,
    alignItems: 'center',
  },
  connector: {
    width: 2,
    height: 18,
    backgroundColor: colors.border,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotMissed: {
    backgroundColor: colors.error,
  },
  dotUpcoming: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotTask: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.textMuted,
    borderStyle: 'dashed',
  },
  dotTaskInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  todayWrap: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRing: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.warning,
  },
  dotToday: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.warning,
  },
  content: {
    flex: 1,
    paddingBottom: spacing['2xl'],
    marginLeft: spacing.sm,
  },
  contentToday: {
    backgroundColor: 'rgba(209, 141, 30, 0.06)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    marginRight: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateLabel: {
    letterSpacing: 0.3,
  },
  todayPill: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  todayPillText: {
    color: colors.textInverse,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  taskStack: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  carriedStack: {
    gap: spacing.sm,
    opacity: 0.78,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  taskIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hwPendingCard: {
    borderColor: colors.warning,
    borderWidth: 1.5,
  },
  hwHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  celebrateWrap: {
    position: 'relative',
  },
  celebrateHalo: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: radius.lg + 4,
    borderWidth: 2,
    borderColor: colors.success,
    backgroundColor: 'rgba(47, 158, 106, 0.12)',
    zIndex: 1,
  },
});
