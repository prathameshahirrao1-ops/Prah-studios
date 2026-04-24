import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Text } from '../../components/Text';
import { colors, radius, spacing } from '../../theme';
import { formatDate } from '../../utils/formatDate';
import {
  SKILL_COLORS,
  SKILL_LEVEL_DESCRIPTIONS,
  SKILL_META,
  SKILL_ORDER,
  totalPoints,
  useSkillsState,
} from '../../data/mockSkills';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';

/**
 * Per-skill detail page.
 *
 * Loop 3 model change: per-skill has NO sub-levels — only the OVERALL total
 * is tiered (Doodler → Grandmaster). This screen shows raw points the skill
 * has accumulated, its share of overall growth, the skill-behaviour ladder
 * (read-only reference from SKILL_LEVEL_DESCRIPTIONS), and recent gains.
 */
export function SkillDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ProfileStackParamList, 'SkillDetail'>>();
  const skill = route.params.skill;

  const skills = useSkillsState();
  const meta = SKILL_META[skill];
  const color = SKILL_COLORS[skill];
  const points = skills.points[skill];
  const total = totalPoints(skills);
  const sharePct = total > 0 ? Math.round((points / total) * 100) : 0;

  // Reference ladder of what the skill looks like at different stages.
  // Pure copy — no tier math tied to per-skill points.
  const stages = SKILL_LEVEL_DESCRIPTIONS[skill];

  const entries = skills.history
    .filter((e) => e.skill === skill)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h2">{meta.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero — raw points + share of overall growth */}
        <View style={[styles.card, styles.heroCard]}>
          <View style={[styles.iconTile, { backgroundColor: `${color}18` }]}>
            <Ionicons name={meta.icon as any} size={40} color={color} />
          </View>
          <Text variant="numberLg" style={{ marginTop: spacing.md, color }}>
            {points}
          </Text>
          <Text variant="small" tone="muted">
            {meta.name} points earned
          </Text>

          {/* Share-of-overall bar */}
          <View style={styles.shareWrap}>
            <View style={styles.shareRow}>
              <Text variant="caption" tone="muted">
                Share of overall growth
              </Text>
              <Text variant="caption" style={{ fontWeight: '700', color }}>
                {sharePct}%
              </Text>
            </View>
            <View style={styles.shareTrack}>
              <View
                style={[
                  styles.shareFill,
                  { width: `${sharePct}%` as any, backgroundColor: color },
                ]}
              />
            </View>
            <Text variant="caption" tone="muted" style={{ marginTop: spacing.xs }}>
              Out of {total} total pts across all five skills.
            </Text>
          </View>
        </View>

        {/* What this skill looks like — reference ladder */}
        <View style={styles.card}>
          <Text variant="h3" style={{ marginBottom: 2 }}>
            What {meta.name.toLowerCase()} looks like
          </Text>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing.md }}>
            A progression guide — not a per-skill level. Raw points grow with every class, HW, and sketchbook piece.
          </Text>
          <View style={styles.stagesList}>
            {stages.map((desc, i) => (
              <View
                key={i}
                style={[
                  styles.stageRow,
                  i === stages.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View
                  style={[
                    styles.stageDot,
                    { backgroundColor: `${color}28`, borderColor: color },
                  ]}
                >
                  <Text
                    variant="caption"
                    style={{ fontWeight: '700', color }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text variant="small" tone="secondary" style={{ flex: 1, lineHeight: 20 }}>
                  {desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent gains */}
        <View style={styles.card}>
          <Text variant="h3" style={{ marginBottom: spacing.sm }}>
            Recent gains
          </Text>
          {entries.length === 0 ? (
            <Text variant="small" tone="muted" style={{ paddingVertical: spacing.sm }}>
              No {meta.name.toLowerCase()} points yet. Attend a class, submit homework, or upload a sketchbook piece to start earning.
            </Text>
          ) : (
            entries.map((e, i) => (
              <View
                key={e.id}
                style={[
                  styles.historyRow,
                  i === entries.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View
                  style={[
                    styles.gainPill,
                    { backgroundColor: `${color}22` },
                  ]}
                >
                  <Text
                    variant="caption"
                    style={{ fontWeight: '700', color }}
                  >
                    +{e.amount}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="small" tone="primary">
                    {e.source}
                  </Text>
                </View>
                <Text variant="caption" tone="muted">
                  {formatDate(e.date)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },

  iconTile: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  shareWrap: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  shareTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  shareFill: {
    height: 8,
    borderRadius: 4,
  },

  stagesList: {
    gap: 0,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  stageDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  gainPill: {
    minWidth: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
