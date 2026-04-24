import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Popup } from './Popup';
import { Text } from './Text';
import { Button } from './Button';
import { colors, radius, spacing } from '../theme';
import type { Homework } from '../data/mockHomework';
import {
  SKILL_COLORS,
  SKILL_META,
  SKILL_ORDER,
  SkillType,
} from '../data/mockSkills';

/**
 * Loop 2 — Homework review celebration.
 *
 * Fires on Home when `unseenReviewHwId` is set (i.e. the teacher just
 * returned the HW). Shows:
 *   1. The student's photo with numbered circle overlays the teacher drew.
 *   2. Per-circle notes (list beneath the photo, keyed by number).
 *   3. Overall teacher note.
 *   4. Star ratings per skill.
 *   5. Total points gained — participation + on-time + review, broken out
 *      so the student can see where each bump came from.
 *
 * Mirrors SessionSummaryPopup visual language (hero, section labels,
 * total-chip, per-skill list). Close chains into LevelUpPopup via
 * drainHwCrossing (handled by caller in HomeScreen).
 *
 * Currently the photo is a mock placeholder block (same treatment as
 * HwSubmissionPopup — we don't have real image storage wired yet) so
 * the annotation dots sit on a predictable backdrop. Swap for an Image
 * source when backend is live.
 */
interface Props {
  hw: Homework | null;
  onClose: () => void;
}

export function HWReviewPopup({ hw, onClose }: Props) {
  if (!hw || !hw.review) {
    return (
      <Popup visible={false} title="" onClose={onClose}>
        <View />
      </Popup>
    );
  }

  const { review } = hw;
  const { participation, onTimeBonus, reviewPoints } = review.pointsAwarded;

  const totals: Partial<Record<SkillType, number>> = {};
  SKILL_ORDER.forEach((k) => {
    const sum =
      (participation[k] ?? 0) + (onTimeBonus[k] ?? 0) + (reviewPoints[k] ?? 0);
    if (sum > 0) totals[k] = sum;
  });
  const grandTotal = SKILL_ORDER.reduce((s, k) => s + (totals[k] ?? 0), 0);

  const participationTotal = SKILL_ORDER.reduce(
    (s, k) => s + (participation[k] ?? 0),
    0,
  );
  const onTimeTotal = SKILL_ORDER.reduce(
    (s, k) => s + (onTimeBonus[k] ?? 0),
    0,
  );
  const reviewTotal = SKILL_ORDER.reduce(
    (s, k) => s + (reviewPoints[k] ?? 0),
    0,
  );

  return (
    <Popup visible onClose={onClose} title="Teacher reviewed your homework" fullHeight>
      {/* Hero */}
      <View style={styles.heroRow}>
        <View style={styles.heroIcon}>
          <Ionicons name="ribbon" size={36} color={colors.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="h3">{hw.title}</Text>
          <Text variant="small" tone="muted">
            Session {hw.sessionNumber} · Reviewed{' '}
            {friendlyDate(review.reviewedAt)}
          </Text>
        </View>
      </View>

      {/* Annotated photo */}
      <View style={styles.photoWrap}>
        <View style={styles.photoMock}>
          <Ionicons name="image" size={44} color={colors.textMuted} />
          <Text variant="small" tone="muted" style={{ marginTop: spacing.xs }}>
            Your drawing
          </Text>
          {/* Overlay numbered circles from annotations */}
          {review.annotations.map((a) => (
            <View
              key={a.id}
              style={[
                styles.annotDot,
                {
                  left: `${a.x * 100}%`,
                  top: `${a.y * 100}%`,
                },
              ]}
            >
              <Text variant="caption" tone="inverse" style={styles.annotNum}>
                {a.id}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Teacher notes, keyed to numbers */}
      {review.annotations.length > 0 && (
        <View>
          <Text variant="label" tone="muted" style={{ marginBottom: spacing.sm }}>
            Teacher notes
          </Text>
          {review.annotations.map((a) => (
            <View key={a.id} style={styles.noteRow}>
              <View style={styles.noteBadge}>
                <Text variant="caption" tone="inverse" style={styles.annotNum}>
                  {a.id}
                </Text>
              </View>
              <Text
                variant="body"
                tone="secondary"
                style={{ flex: 1, marginLeft: spacing.sm }}
              >
                {a.note}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Overall note */}
      {review.overallNote.length > 0 && (
        <View style={styles.overallBox}>
          <Ionicons
            name="chatbubble-ellipses"
            size={18}
            color={colors.textPrimary}
          />
          <Text variant="body" style={{ flex: 1, marginLeft: spacing.sm }}>
            {review.overallNote}
          </Text>
        </View>
      )}

      {/* Star ratings */}
      {Object.keys(review.skillRatings).length > 0 && (
        <View>
          <Text variant="label" tone="muted" style={{ marginBottom: spacing.sm }}>
            Teacher's ratings
          </Text>
          <View style={styles.ratingList}>
            {SKILL_ORDER.map((k) => {
              const stars = review.skillRatings[k] ?? 0;
              if (stars <= 0) return null;
              const color = SKILL_COLORS[k];
              const meta = SKILL_META[k];
              return (
                <View key={k} style={styles.ratingRow}>
                  <View
                    style={[
                      styles.skillIcon,
                      { backgroundColor: `${color}1A` },
                    ]}
                  >
                    <Ionicons name={meta.icon as any} size={16} color={color} />
                  </View>
                  <Text variant="body" style={{ flex: 1 }}>
                    {meta.name}
                  </Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Ionicons
                        key={n}
                        name={n <= stars ? 'star' : 'star-outline'}
                        size={14}
                        color={colors.warning}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Points gained */}
      {grandTotal > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <Text variant="label" tone="muted">
              Skill points gained
            </Text>
            <View style={styles.totalChip}>
              <Text
                variant="caption"
                tone="inverse"
                style={{ fontWeight: '700' }}
              >
                +{grandTotal} pts
              </Text>
            </View>
          </View>

          {/* Breakdown chips */}
          <View style={styles.breakdownRow}>
            {participationTotal > 0 && (
              <BreakdownPill
                icon="checkmark-circle-outline"
                label="Participation"
                value={participationTotal}
              />
            )}
            {onTimeTotal > 0 && (
              <BreakdownPill
                icon="time-outline"
                label="On time"
                value={onTimeTotal}
              />
            )}
            {reviewTotal > 0 && (
              <BreakdownPill
                icon="ribbon-outline"
                label="Review"
                value={reviewTotal}
              />
            )}
          </View>

          <View style={styles.skillList}>
            {SKILL_ORDER.map((k) => {
              const d = totals[k] ?? 0;
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

      <Button label="Awesome!" onPress={onClose} fullWidth />
    </Popup>
  );
}

function BreakdownPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon as any} size={14} color={colors.textPrimary} />
      <Text variant="caption" style={{ marginLeft: 4 }}>
        {label}
      </Text>
      <Text variant="caption" style={{ marginLeft: 4, fontWeight: '700' }}>
        +{value}
      </Text>
    </View>
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.warning}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    aspectRatio: 4 / 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoMock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  annotDot: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -13,
    marginTop: -13,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  annotNum: {
    fontWeight: '700',
    lineHeight: 14,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  noteBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  overallBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  ratingList: {
    gap: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
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
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
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
