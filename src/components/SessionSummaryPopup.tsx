import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Popup } from './Popup';
import { Text } from './Text';
import { Button } from './Button';
import { colors, radius, spacing } from '../theme';
import type { TimelineSession } from '../data/mockStudent';
import {
  SKILL_COLORS,
  SKILL_META,
  SKILL_ORDER,
  SkillType,
} from '../data/mockSkills';

/**
 * Post-class celebration popup (Loop 1).
 *
 * Fired in two contexts:
 *   - Automatically on Home when `unseenCompletedSessionId` is set (the
 *     "session just completed" moment).
 *   - Manually when the student taps a completed session card in Timeline —
 *     re-opens the same summary.
 *
 * Keeps no internal state: caller owns visibility + the level-up hand-off
 * (if a tier/sub crossing fired, LevelUpPopup is shown after `onClose`).
 */
interface Props {
  session: TimelineSession | null;
  awards: Partial<Record<SkillType, number>>;
  /** True = fresh post-class (shows "Session N complete!" + celebratory check). */
  fresh: boolean;
  onClose: () => void;
}

export function SessionSummaryPopup({ session, awards, fresh, onClose }: Props) {
  if (!session) {
    return (
      <Popup visible={false} title="" onClose={onClose}>
        <View />
      </Popup>
    );
  }

  const total = SKILL_ORDER.reduce((s, k) => s + (awards[k] ?? 0), 0);
  const title = fresh
    ? `Session ${session.sessionNumber} complete!`
    : `Session ${session.sessionNumber} · ${session.title}`;

  return (
    <Popup visible onClose={onClose} title={title}>
      {/* Hero */}
      <View style={styles.heroRow}>
        <View style={styles.heroIcon}>
          <Ionicons
            name={fresh ? 'checkmark-circle' : 'ribbon-outline'}
            size={40}
            color={colors.success}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="h3">{session.title}</Text>
          <Text variant="small" tone="muted">
            {friendlyDate(session.date)}
          </Text>
        </View>
      </View>

      {/* Key concepts */}
      {session.keyConcepts.length > 0 && (
        <View>
          <Text variant="label" tone="muted" style={{ marginBottom: spacing.sm }}>
            What you covered
          </Text>
          {session.keyConcepts.map((k) => (
            <View key={k} style={styles.conceptRow}>
              <Ionicons
                name="checkmark"
                size={16}
                color={colors.success}
                style={{ marginTop: 3 }}
              />
              <Text
                variant="body"
                tone="secondary"
                style={{ flex: 1, marginLeft: spacing.sm }}
              >
                {k}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Skill points gained */}
      {total > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <Text variant="label" tone="muted">
              Skills you grew
            </Text>
            <View style={styles.totalChip}>
              <Text
                variant="caption"
                tone="inverse"
                style={{ fontWeight: '700' }}
              >
                +{total} pts
              </Text>
            </View>
          </View>
          <View style={styles.skillList}>
            {SKILL_ORDER.map((k) => {
              const d = awards[k] ?? 0;
              if (d <= 0) return null;
              const color = SKILL_COLORS[k];
              const meta = SKILL_META[k];
              return (
                <View key={k} style={styles.skillRow}>
                  <View
                    style={[
                      styles.skillIcon,
                      { backgroundColor: `${color}1A` },
                    ]}
                  >
                    <Ionicons name={meta.icon as any} size={18} color={color} />
                  </View>
                  <Text variant="body" style={{ flex: 1 }}>
                    {meta.name}
                  </Text>
                  <Text variant="bodyBold" style={{ color }}>
                    +{d}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <Button
        label={fresh ? 'Great job!' : 'Close'}
        onPress={onClose}
        fullWidth
      />
    </Popup>
  );
}

function friendlyDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${colors.success}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conceptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  skillList: {
    gap: spacing.xs,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  skillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
