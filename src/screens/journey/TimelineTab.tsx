import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
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
import { mockStreaks } from '../../data/mockStreaks';
import { StreakFooter } from '../../components/StreakFooter';

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
type DayGroup = {
  date: string;
  session?: TimelineSession;
  tasks: TimelineTask[];
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
    const rollForward = !t.done && t.date < today;
    const targetDate = rollForward ? today : t.date;
    get(targetDate).tasks.push(t);
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
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const groups = buildDayGroups(today);
  return (
    <View style={styles.container}>
      {groups.map((g, i) => (
        <TimelineRow
          key={g.date}
          group={g}
          today={today}
          isFirst={i === 0}
          isLast={i === groups.length - 1}
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
  onTapSession: (s: TimelineSession) => void;
  onTapHwTask: (t: TimelineTask) => void;
  onTapQuizTask: (t: TimelineTask) => void;
  onTapGkTask: (t: TimelineTask) => void;
  extraCompletedTaskIds?: Set<string>;
  justSubmittedHwTaskId?: string | null;
  onTapNotThere?: (s: TimelineSession) => void;
}) {
  const dateLabel = formatShortDate(group.date);
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

  const base = group.session
    ? `${dateLabel} · Session ${group.session.sessionNumber}`
    : `${dateLabel} · Tasks`;
  const headline = isToday ? `Today · ${base}` : base;

  return (
    <View style={styles.row}>
      {/* Gutter: connector line + dot */}
      <View style={styles.gutter}>
        {!isFirst && <View style={styles.connector} />}
        <NodeDot variant={nodeVariant} />
        {!isLast && <View style={[styles.connector, { flex: 1 }]} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text variant="label" tone="muted">
          {headline}
        </Text>

        {group.session && (
          <SessionCard
            session={group.session}
            onPress={() => onTapSession(group.session!)}
            onPressNotThere={
              onTapNotThere ? () => onTapNotThere(group.session!) : undefined
            }
          />
        )}

        {group.tasks.length > 0 && (
          <View style={styles.taskStack}>
            {group.tasks.map((t) => {
              const doneOverride = extraCompletedTaskIds?.has(t.id)
                ? true
                : t.done;
              const celebrate = t.id === justSubmittedHwTaskId;
              return (
                <TaskCard
                  key={t.id}
                  task={{ ...t, done: doneOverride }}
                  onPressHw={() => onTapHwTask(t)}
                  onPressQuiz={() => onTapQuizTask(t)}
                  onPressGk={() => onTapGkTask(t)}
                  celebrate={celebrate}
                />
              );
            })}
          </View>
        )}
      </View>
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

function SessionTypeIcon() {
  return (
    <View style={styles.sessionTypeIcon}>
      <Ionicons name="brush-outline" size={18} color={colors.textPrimary} />
    </View>
  );
}

function SessionCard({
  session,
  onPress,
  onPressNotThere,
}: {
  session: TimelineSession;
  onPress: () => void;
  onPressNotThere?: () => void;
}) {
  if (session.status === 'upcoming') {
    return (
      <Card style={styles.card}>
        <View style={styles.sessionTitleRow}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text variant="bodyBold">{session.title}</Text>
            <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
              Information will be visible on class day
            </Text>
          </View>
          <SessionTypeIcon />
        </View>
        <Pressable
          onPress={onPressNotThere}
          disabled={!onPressNotThere}
          style={({ pressed }) => [styles.notHereRow, pressed && { opacity: 0.7 }]}
        >
          <Text variant="small" tone="secondary">
            Not there on this day?
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </Card>
    );
  }
  if (session.status === 'missed') {
    return (
      <Card style={styles.card}>
        <View style={styles.sessionTitleRow}>
          <Chip label="Missed" tone="error" />
          <SessionTypeIcon />
        </View>
        <Text variant="bodyBold" style={{ marginTop: spacing.sm }}>
          {session.title}
        </Text>
      </Card>
    );
  }
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.sessionTitleRow}>
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          <Text variant="bodyBold">
            {session.title}{' '}
            <Text variant="small" tone="muted">
              · Class {session.sessionNumber}
            </Text>
          </Text>
        </View>
        <SessionTypeIcon />
      </View>
      <Text variant="label" tone="muted" style={{ marginTop: spacing.sm }}>
        Key concepts
      </Text>
      <View style={{ marginTop: 4 }}>
        {session.keyConcepts.slice(0, 3).map((k) => (
          <View key={k} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text variant="small" tone="secondary" style={{ flex: 1 }}>
              {k}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.viewMore}>
        <Text variant="small" tone="muted">
          View more
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>
    </Card>
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
    task.kind === 'quiz' ? mockStreaks.quiz : mockStreaks.gk;

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
      <StreakFooter type="hw" count={mockStreaks.hw} />
    </Card>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
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
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sessionTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingBottom: spacing.xl,
    marginLeft: spacing.sm,
  },
  card: {
    marginTop: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginTop: 9,
    marginRight: spacing.sm,
  },
  viewMore: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  notHereRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  taskStack: {
    gap: spacing.sm,
    marginTop: spacing.xs,
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
