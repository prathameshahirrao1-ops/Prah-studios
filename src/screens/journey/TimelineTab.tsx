import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { colors, radius, spacing } from '../../theme';
import {
  TimelineSession,
  TimelineTask,
  mockTasks,
  mockTimeline,
} from '../../data/mockStudent';

interface Props {
  onTapSession: (session: TimelineSession) => void;
  onTapHwTask: (task: TimelineTask) => void;
  /** Task IDs marked done during this session (e.g. HW just submitted in the popup). */
  extraCompletedTaskIds?: Set<string>;
}

/** Merge + sort sessions and tasks by date into a single timeline stream. */
type TimelineItem =
  | { kind: 'session'; date: string; data: TimelineSession }
  | { kind: 'task'; date: string; data: TimelineTask };

function buildStream(): TimelineItem[] {
  const items: TimelineItem[] = [
    ...mockTimeline.map((s): TimelineItem => ({ kind: 'session', date: s.date, data: s })),
    ...mockTasks.map((t): TimelineItem => ({ kind: 'task', date: t.date, data: t })),
  ];
  items.sort((a, b) => a.date.localeCompare(b.date));
  return items;
}

/** Group adjacent task items that share the same date so they stack under one node. */
type Group =
  | { kind: 'session'; date: string; session: TimelineSession }
  | { kind: 'tasks'; date: string; tasks: TimelineTask[] };

function buildGroups(): Group[] {
  const stream = buildStream();
  const groups: Group[] = [];
  for (const item of stream) {
    if (item.kind === 'session') {
      groups.push({ kind: 'session', date: item.date, session: item.data });
    } else {
      const last = groups[groups.length - 1];
      if (last && last.kind === 'tasks' && last.date === item.date) {
        last.tasks.push(item.data);
      } else {
        groups.push({ kind: 'tasks', date: item.date, tasks: [item.data] });
      }
    }
  }
  return groups;
}

export function TimelineTab({ onTapSession, onTapHwTask, extraCompletedTaskIds }: Props) {
  const groups = buildGroups();
  return (
    <View style={styles.container}>
      {groups.map((g, i) => (
        <TimelineRow
          key={`${g.kind}-${g.date}-${i}`}
          group={g}
          isFirst={i === 0}
          isLast={i === groups.length - 1}
          onTapSession={onTapSession}
          onTapHwTask={onTapHwTask}
          extraCompletedTaskIds={extraCompletedTaskIds}
        />
      ))}
    </View>
  );
}

function TimelineRow({
  group,
  isFirst,
  isLast,
  onTapSession,
  onTapHwTask,
  extraCompletedTaskIds,
}: {
  group: Group;
  isFirst: boolean;
  isLast: boolean;
  onTapSession: (s: TimelineSession) => void;
  onTapHwTask: (t: TimelineTask) => void;
  extraCompletedTaskIds?: Set<string>;
}) {
  const dateLabel = formatShortDate(group.date);
  const nodeVariant =
    group.kind === 'session'
      ? group.session.status === 'attended'
        ? 'filled'
        : group.session.status === 'missed'
        ? 'missed'
        : 'upcoming'
      : 'task';
  const headline =
    group.kind === 'session'
      ? `${dateLabel} · Session ${group.session.sessionNumber}`
      : `${dateLabel} · Tasks`;

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

        {group.kind === 'session' ? (
          <SessionCard session={group.session} onPress={() => onTapSession(group.session)} />
        ) : (
          <View style={styles.taskStack}>
            {group.tasks.map((t) => {
              const doneOverride = extraCompletedTaskIds?.has(t.id) ? true : t.done;
              return (
                <TaskCard
                  key={t.id}
                  task={{ ...t, done: doneOverride }}
                  onPressHw={() => onTapHwTask(t)}
                />
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

function NodeDot({ variant }: { variant: 'filled' | 'missed' | 'upcoming' | 'task' }) {
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

function SessionCard({
  session,
  onPress,
}: {
  session: TimelineSession;
  onPress: () => void;
}) {
  if (session.status === 'upcoming') {
    return (
      <Card style={styles.card}>
        <Text variant="bodyBold">{session.title}</Text>
        <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
          Information will be visible on class day
        </Text>
        <View style={styles.notHereRow}>
          <Text variant="small" tone="secondary">
            Not there on this day?
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </Card>
    );
  }
  if (session.status === 'missed') {
    return (
      <Card style={styles.card}>
        <Chip label="Missed" tone="error" />
        <Text variant="bodyBold" style={{ marginTop: spacing.sm }}>
          {session.title}
        </Text>
      </Card>
    );
  }
  return (
    <Card onPress={onPress} style={styles.card}>
      <Text variant="bodyBold">
        {session.title} <Text variant="small" tone="muted">· Class {session.sessionNumber}</Text>
      </Text>
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
}: {
  task: TimelineTask;
  onPressHw: () => void;
}) {
  const icon: 'bulb-outline' | 'help-circle-outline' | 'camera-outline' =
    task.kind === 'gk'
      ? 'bulb-outline'
      : task.kind === 'quiz'
      ? 'help-circle-outline'
      : 'camera-outline';

  const onPress = task.kind === 'hw' ? onPressHw : () => {};
  const rightMeta = task.done ? 'Completed' : task.meta;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <Card compact style={styles.taskCard}>
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
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </Card>
    </Pressable>
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
  taskCard: {
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
});
