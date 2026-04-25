import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Popup } from './Popup';
import { Text } from './Text';
import { Button } from './Button';
import { colors, radius, spacing } from '../theme';
import type { SketchbookPiece } from '../data/mockSketchbook';
import {
  SKILL_COLORS,
  SKILL_META,
  SKILL_ORDER,
  SkillType,
} from '../data/mockSkills';

/**
 * Loop 4 — Sketchbook review celebration.
 *
 * Fires on Home when `unseenReviewId` is set on the sketchbook store.
 * Lighter than HWReviewPopup: no photo annotations (teacher doesn't draw
 * circles on free-form sketchbook pieces). Shows:
 *   1. The uploaded artwork (placeholder in Pass 1).
 *   2. Optional text remark from teacher.
 *   3. Per-skill star ratings.
 *   4. Skill points gained — capped at 15 total.
 *
 * Mirrors SessionSummaryPopup / HWReviewPopup visual language for
 * consistency. Close chains into LevelUpPopup via drainSketchbookCrossing
 * (handled by the caller in HomeScreen).
 */
interface Props {
  piece: SketchbookPiece | null;
  onClose: () => void;
}

export function SketchbookReviewPopup({ piece, onClose }: Props) {
  if (!piece || !piece.review) {
    return (
      <Popup visible={false} title="" onClose={onClose}>
        <View />
      </Popup>
    );
  }

  const { review } = piece;
  const grandTotal = SKILL_ORDER.reduce(
    (s, k) => s + (review.pointsAwarded[k] ?? 0),
    0,
  );

  return (
    <Popup
      visible
      onClose={onClose}
      title="Teacher reviewed your sketchbook"
      fullHeight
    >
      {/* Hero */}
      <View style={styles.heroRow}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={32} color={colors.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="h3">{piece.title}</Text>
          <Text variant="small" tone="muted">
            Reviewed {friendlyDate(review.reviewedAt)}
          </Text>
        </View>
      </View>

      {/* Artwork */}
      <View style={styles.photoWrap}>
        <View style={styles.photoMock}>
          <Ionicons name="image" size={44} color={colors.textMuted} />
          <Text variant="small" tone="muted" style={{ marginTop: spacing.xs }}>
            Your sketchbook piece
          </Text>
        </View>
      </View>

      {/* Teacher remark */}
      {review.remark && review.remark.length > 0 && (
        <View style={styles.remarkBox}>
          <Ionicons
            name="chatbubble-ellipses"
            size={18}
            color={colors.textPrimary}
          />
          <Text variant="body" style={{ flex: 1, marginLeft: spacing.sm }}>
            {review.remark}
          </Text>
        </View>
      )}

      {/* Skills gained — points only, no stars. Chip shows X/15 (max review). */}
      {grandTotal > 0 && (
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
                {grandTotal}/15
              </Text>
            </View>
          </View>
          <View style={styles.skillList}>
            {SKILL_ORDER.map((k: SkillType) => {
              const d = review.pointsAwarded[k] ?? 0;
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
                  <Text variant="bodyBold" style={[styles.skillPts, { color }]}>
                    +{d}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.totalRow}>
            <Text variant="small" tone="muted" style={{ flex: 1 }}>
              Total awarded
            </Text>
            <Text variant="bodyBold">+{grandTotal} pts</Text>
          </View>
        </View>
      )}

      <Button label="Awesome!" onPress={onClose} fullWidth />
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
  },
  remarkBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
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
  skillPts: {
    minWidth: 32,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
