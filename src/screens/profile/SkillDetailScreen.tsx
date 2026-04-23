import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { colors, radius, spacing } from '../../theme';
import { formatDate } from '../../utils/formatDate';
import {
  LEVELS,
  SKILL_LEVEL_DESCRIPTIONS,
  SKILL_META,
  SkillType,
  levelFor,
  mockSkills,
} from '../../data/mockSkills';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';

export function SkillDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ProfileStackParamList, 'SkillDetail'>>();
  const skill = route.params.skill;

  const meta = SKILL_META[skill];
  const points = mockSkills.points[skill];
  const level = levelFor(points);
  const inLevel = points - level.min;
  const levelSpan = level.max - level.min;
  const toNext = level.max - points;
  const currentDescription = SKILL_LEVEL_DESCRIPTIONS[skill][level.index];

  const entries = mockSkills.history
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
        {/* Hero card — big ring + level */}
        <View style={[styles.card, styles.heroCard]}>
          <View style={[styles.bigRing, webArcStyle(inLevel / levelSpan)]}>
            <View style={styles.bigRingInner}>
              <Ionicons name={meta.icon as any} size={22} color={colors.textSecondary} />
              <Text variant="numberLg" style={{ marginTop: 2 }}>
                {points}
              </Text>
              <Text variant="caption" tone="muted">
                / 500
              </Text>
            </View>
          </View>
          <Text variant="display" style={{ marginTop: spacing.md, fontSize: 22, lineHeight: 28 }}>
            Level {level.index + 1} · {level.name}
          </Text>
          <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
            {toNext > 0
              ? `${toNext} points to ${nextLevelName(level.index)}`
              : 'Highest level reached'}
          </Text>

          {/* Tier bar */}
          <View style={styles.tierBar}>
            {LEVELS.map((l) => {
              const active = points >= l.min && points < l.max;
              return (
                <View
                  key={l.name}
                  style={[styles.tierSeg, active && styles.tierActive]}
                >
                  <Text
                    variant="caption"
                    tone={active ? 'primary' : 'muted'}
                    style={{ fontWeight: active ? '600' : '400' }}
                    numberOfLines={1}
                  >
                    {l.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Examples at each level */}
        <View style={styles.card}>
          <Text variant="h3" style={{ marginBottom: 2 }}>
            Examples at each level
          </Text>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing.md }}>
            Reference drawings for {meta.name.toLowerCase()} at each tier.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.examplesRow}
          >
            {LEVELS.map((l) => {
              const isCurrent = l.index === level.index;
              return (
                <View
                  key={l.name}
                  style={[
                    styles.exampleTile,
                    isCurrent && styles.exampleTileCurrent,
                  ]}
                >
                  <ImagePlaceholder aspectRatio={1} rounded="md" />
                  <Text
                    variant="caption"
                    style={{
                      fontWeight: isCurrent ? '700' : '600',
                      marginTop: 6,
                      textAlign: 'center',
                      color: isCurrent ? colors.warning : colors.textPrimary,
                    }}
                  >
                    L{l.index + 1} · {l.name}
                  </Text>
                  <Text
                    variant="caption"
                    tone="muted"
                    style={{ textAlign: 'center', marginTop: 2 }}
                    numberOfLines={3}
                  >
                    {SKILL_LEVEL_DESCRIPTIONS[skill][l.index]}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Recent gains */}
        <View style={styles.card}>
          <Text variant="h3" style={{ marginBottom: spacing.sm }}>
            Recent gains
          </Text>
          {entries.map((e, i) => (
            <View
              key={e.id}
              style={[
                styles.historyRow,
                i === entries.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.gainPill}>
                <Text
                  variant="caption"
                  style={{ fontWeight: '700', color: colors.warning }}
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
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function nextLevelName(currentIndex: number): string {
  const next = LEVELS[currentIndex + 1];
  return next ? next.name : 'max';
}

function webArcStyle(progress: number): object {
  const p = Math.max(0, Math.min(1, progress));
  const deg = Math.round(p * 360);
  return {
    // @ts-ignore — react-native-web passes this through as CSS
    backgroundImage: `conic-gradient(${colors.warning} 0deg ${deg}deg, ${colors.border} ${deg}deg 360deg)`,
  } as object;
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

  bigRing: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigRingInner: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tierBar: {
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  tierSeg: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  tierActive: {
    backgroundColor: colors.warning,
  },

  examplesRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  exampleTile: {
    width: 140,
  },
  exampleTileCurrent: {
    // visual accent handled via text styling; keep wrapper minimal
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
    backgroundColor: 'rgba(209, 141, 30, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
