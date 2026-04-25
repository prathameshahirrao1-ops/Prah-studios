// Spec:
//   - docs/spec/ui-map/profile-screen.md
//   - docs/spec/schema/skill.md
//

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { colors, radius, spacing } from '../../theme';
import {
  SKILL_COLORS,
  SKILL_META,
  SKILL_ORDER,
  overallLevelFor,
  useSkillsState,
} from '../../data/mockSkills';

interface Props {
  onTapSkill: () => void;
}

export function SkillMap({ onTapSkill }: Props) {
  const skills = useSkillsState();

  // Compute 14-day gain per skill to find the top gainer. Keeps the badge
  // meaningful on demo data where the latest evaluation may be ~10 days old.
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const gains: Record<string, number> = {};
  for (const e of skills.history) {
    if (new Date(e.date).getTime() < cutoff) continue;
    gains[e.skill] = (gains[e.skill] ?? 0) + e.amount;
  }
  const topEntry = Object.entries(gains).sort((a, b) => b[1] - a[1])[0];
  const topGainerSkill = topEntry && topEntry[1] > 0 ? topEntry[0] : null;
  const topGainerAmount = topEntry?.[1] ?? 0;

  return (
    <Pressable
      onPress={onTapSkill}
      style={({ pressed }) => [styles.block, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.blockHeader}>
        <Text variant="label" tone="muted">Skills</Text>
        <Text variant="caption" tone="muted">Tap for details</Text>
      </View>
      <View style={styles.grid}>
        {SKILL_ORDER.map((skill) => (
          <SkillCircle
            key={skill}
            skill={skill}
            points={skills.points[skill]}
            recentGain={skill === topGainerSkill ? topGainerAmount : 0}
          />
        ))}
      </View>
    </Pressable>
  );
}

function SkillCircle({
  skill,
  points,
  recentGain,
}: {
  skill: string;
  points: number;
  recentGain: number;
}) {
  const meta = SKILL_META[skill as keyof typeof SKILL_META];
  const color = SKILL_COLORS[skill as keyof typeof SKILL_COLORS];
  return (
    <View style={styles.cell}>
      <View style={[styles.tile, { backgroundColor: `${color}18` }]}>
        <Ionicons name={meta.icon as any} size={36} color={color} />
        <Text variant="caption" style={{ color, fontWeight: '700', marginTop: 6, fontSize: 15 }}>{points}</Text>
        {recentGain > 0 && (
          <View style={[styles.gainChip, { backgroundColor: color }]}>
            <Text variant="caption" style={styles.gainChipText}>
              +{recentGain}
            </Text>
          </View>
        )}
      </View>
      <Text variant="caption" style={{ fontWeight: '600', textAlign: 'center', marginTop: 6 }} numberOfLines={2}>
        {meta.name}
      </Text>
    </View>
  );
}

/**
 * Segmented progress ring:
 *  - The TOTAL arc reflects progress through the current OVERALL SUB-LEVEL
 *    (e.g. Doodler · 2 → filled sweep = pointsIntoSub / subLevelCost × 360°).
 *  - Inside the filled sweep, each skill gets a sector proportional to its
 *    point contribution, so you can see which skills are pushing growth.
 *  - At Grandmaster (no sub-levels), the ring is fully filled.
 *
 * Takes `total` so callers can avoid recomputing — it must equal the sum of
 * `points`. When omitted, it is derived.
 */
export function segmentedRingStyle(
  points: Record<string, number>,
  total?: number,
): object {
  const totalPts =
    total ?? SKILL_ORDER.reduce((s, k) => s + (points[k] ?? 0), 0);
  if (totalPts === 0) return { backgroundColor: colors.border };
  const overall = overallLevelFor(totalPts);
  const subSpan = overall.subEnd - overall.subStart;
  const subProgress =
    !isFinite(subSpan) || subSpan <= 0 ? 1 : overall.pointsIntoSub / subSpan;
  const filledDeg = Math.max(12, Math.min(360, subProgress * 360));
  let deg = 0;
  const stops: string[] = [];
  for (const skill of SKILL_ORDER) {
    const share = (points[skill] ?? 0) / totalPts;
    const end = deg + share * filledDeg;
    stops.push(`${SKILL_COLORS[skill]} ${deg.toFixed(2)}deg ${end.toFixed(2)}deg`);
    deg = end;
  }
  if (filledDeg < 360) {
    stops.push(`${colors.border} ${filledDeg.toFixed(2)}deg 360deg`);
  }
  return {
    // @ts-ignore — web-only CSS property
    backgroundImage: `conic-gradient(${stops.join(', ')})`,
  } as object;
}

const styles = StyleSheet.create({
  block: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  cell: {
    width: '33.33%',
    alignItems: 'center',
  },
  tile: {
    width: 88,
    height: 96,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  gainChip: {
    position: 'absolute',
    top: -6,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    minWidth: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  gainChipText: {
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 11,
    lineHeight: 14,
  },
});
