import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../components/Text';
import { ImagePlaceholder } from '../../components/ImagePlaceholder';
import { colors, radius, spacing } from '../../theme';
import {
  LEVEL_DESCRIPTIONS,
  LEVELS,
  SKILL_COLORS,
  SKILL_META,
  SKILL_ORDER,
  levelFor,
  mockSkills,
} from '../../data/mockSkills';

const GAINS_INITIAL = 6;

export function LevelDetailScreen() {
  const navigation = useNavigation();
  const [gainsSheetOpen, setGainsSheetOpen] = useState(false);

  const total = SKILL_ORDER.reduce((sum, k) => sum + mockSkills.points[k], 0);
  const level = levelFor(total);
  const toNext = level.max - total;
  const inLevel = total - level.min;
  const levelSpan = level.max - level.min;
  const fillPct = Math.min(100, Math.round((inLevel / levelSpan) * 100));

  const allEntries = [...mockSkills.history].sort((a, b) => b.date.localeCompare(a.date));
  const visibleEntries = allEntries.slice(0, GAINS_INITIAL);
  const remainingEntries = allEntries.slice(GAINS_INITIAL);
  const hasMore = remainingEntries.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pageHeader}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h2">Your Level</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero — storage-style card */}
        <View style={styles.card}>
          <View style={styles.heroTopRow}>
            <View>
              <Text variant="label" tone="muted">
                Level {level.index + 1} · {level.name} Artist
              </Text>
              <Text variant="numberLg" style={{ marginTop: 4 }}>{total}</Text>
              <Text variant="small" tone="muted">
                {toNext > 0
                  ? `${toNext} pts to ${LEVELS[level.index + 1]?.name ?? 'max'}`
                  : 'Highest level reached'}
              </Text>
            </View>
            <View style={styles.levelBadgeLg}>
              <Text variant="h2" style={{ color: colors.warning }}>L{level.index + 1}</Text>
            </View>
          </View>

          {/* Progress bar for current level */}
          <View style={styles.segBar}>
            <View style={[styles.segBarFilled, { width: `${fillPct}%` as any }]}>
              {SKILL_ORDER.map((skill) => {
                const pct = total > 0 ? (mockSkills.points[skill] / total) * 100 : 0;
                return (
                  <View
                    key={skill}
                    style={[styles.segBarChunk, { width: `${pct}%` as any, backgroundColor: SKILL_COLORS[skill] }]}
                  />
                );
              })}
            </View>
          </View>

          {/* Skill breakdown list */}
          <View style={styles.skillList}>
            {SKILL_ORDER.map((skill, i) => (
              <View
                key={skill}
                style={[styles.skillListRow, i === SKILL_ORDER.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={[styles.skillIconTile, { backgroundColor: `${SKILL_COLORS[skill]}22` }]}>
                  <Ionicons name={SKILL_META[skill].icon as any} size={14} color={SKILL_COLORS[skill]} />
                </View>
                <Text variant="small" style={{ flex: 1, fontWeight: '500' }}>
                  {SKILL_META[skill].name}
                </Text>
                <Text variant="small" style={{ fontWeight: '700', color: SKILL_COLORS[skill] }}>
                  {mockSkills.points[skill]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent gains */}
        <View>
          <Text variant="h3" style={{ marginBottom: spacing.sm }}>Recent gains</Text>
          {visibleEntries.map((e) => (
            <View key={e.id} style={styles.gainCard}>
              <View style={[styles.gainIcon, { backgroundColor: `${SKILL_COLORS[e.skill]}22` }]}>
                <Text variant="small" style={{ fontWeight: '700', color: SKILL_COLORS[e.skill] }}>
                  +{e.amount}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="small" style={{ fontWeight: '500' }}>{e.source}</Text>
                <View style={styles.skillTag}>
                  <View style={[styles.miniDot, { backgroundColor: SKILL_COLORS[e.skill] }]} />
                  <Text variant="caption" tone="muted">{SKILL_META[e.skill].name}</Text>
                </View>
              </View>
              <Text variant="caption" tone="muted">{formatDate(e.date)}</Text>
            </View>
          ))}
          {hasMore && (
            <Pressable
              onPress={() => setGainsSheetOpen(true)}
              style={({ pressed }) => [styles.loadMoreBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="chevron-up" size={14} color={colors.warning} style={{ marginRight: 4 }} />
              <Text variant="small" style={{ fontWeight: '600', color: colors.warning }}>
                {remainingEntries.length} more gains
              </Text>
            </Pressable>
          )}
        </View>

        {/* All gains bottom sheet */}
        <Modal
          visible={gainsSheetOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setGainsSheetOpen(false)}
        >
          <Pressable style={styles.sheetOverlay} onPress={() => setGainsSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text variant="h3">All gains</Text>
              <Pressable onPress={() => setGainsSheetOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {allEntries.map((e) => (
                <View key={e.id} style={styles.gainCard}>
                  <View style={[styles.gainIcon, { backgroundColor: `${SKILL_COLORS[e.skill]}22` }]}>
                    <Text variant="small" style={{ fontWeight: '700', color: SKILL_COLORS[e.skill] }}>
                      +{e.amount}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="small" style={{ fontWeight: '500' }}>{e.source}</Text>
                    <View style={styles.skillTag}>
                      <View style={[styles.miniDot, { backgroundColor: SKILL_COLORS[e.skill] }]} />
                      <Text variant="caption" tone="muted">{SKILL_META[e.skill].name}</Text>
                    </View>
                  </View>
                  <Text variant="caption" tone="muted">{formatDate(e.date)}</Text>
                </View>
              ))}
              <View style={{ height: spacing.xl }} />
            </ScrollView>
          </View>
        </Modal>

        {/* Story: levels with examples */}
        <View style={styles.storySection}>
          <Text variant="h3" style={{ marginBottom: 4 }}>Your artist journey</Text>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing.lg }}>
            Each level unlocks deeper skills and more expressive work.
          </Text>

          {LEVELS.map((l, i) => {
            const isActive = level.index === l.index;
            const isPast = l.index < level.index;
            return (
              <View key={l.name} style={styles.storyItem}>
                {/* Level header */}
                <View style={styles.storyLevelHeader}>
                  <View style={[styles.storyBadge, isActive && styles.storyBadgeActive, isPast && styles.storyBadgePast]}>
                    {isPast
                      ? <Ionicons name="checkmark" size={14} color={colors.textMuted} />
                      : <Text variant="caption" style={{ fontWeight: '700', color: isActive ? colors.warning : colors.textMuted }}>
                          L{i + 1}
                        </Text>
                    }
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.storyLevelNameRow}>
                      <Text
                        variant="small"
                        style={{ fontWeight: '700', color: isActive ? colors.textPrimary : isPast ? colors.textMuted : colors.textSecondary }}
                      >
                        {l.name} Artist
                      </Text>
                      {isActive && (
                        <View style={styles.youAreHereChip}>
                          <Text variant="caption" style={{ color: colors.warning, fontWeight: '600' }}>
                            You're here
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text variant="small" tone="muted" style={{ marginTop: 2, lineHeight: 18 }}>
                      {LEVEL_DESCRIPTIONS[i]}
                    </Text>
                  </View>
                </View>

                {/* Example drawings for this level */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.storyExamplesRow}
                >
                  {[0, 1, 2].map((idx) => (
                    <View key={idx} style={[styles.storyExampleTile, isActive && styles.storyExampleTileActive]}>
                      <ImagePlaceholder aspectRatio={1} rounded="md" />
                      <Text
                        variant="caption"
                        tone="muted"
                        style={{ textAlign: 'center', marginTop: 4 }}
                        numberOfLines={1}
                      >
                        Example {idx + 1}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Connector line between levels (except last) */}
                {i < LEVELS.length - 1 && (
                  <View style={styles.storyConnector}>
                    <View style={[styles.storyConnectorLine, isPast && styles.storyConnectorLinePast]} />
                    <Text variant="caption" tone="muted" style={styles.storyConnectorLabel}>
                      +{LEVELS[i + 1].min - l.min} pts to unlock
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  levelBadgeLg: {
    width: 52, height: 52,
    borderRadius: radius.md,
    backgroundColor: 'rgba(209,141,30,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  segBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.border,
    marginBottom: spacing.md,
    gap: 2,
  },
  segBarFilled: {
    height: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 6,
    gap: 2,
  },
  segBarChunk: {
    height: 10,
    borderRadius: 5,
  },
  skillList: {
    marginTop: spacing.sm,
  },
  skillListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  skillIconTile: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },

  gainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  gainIcon: {
    width: 48, height: 48,
    borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  skillTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2,
  },
  miniDot: { width: 6, height: 6, borderRadius: 3 },

  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },

  // Bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetScroll: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },

  // Story section
  storySection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  storyItem: {
    marginBottom: spacing.sm,
  },
  storyLevelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  storyBadge: {
    width: 28, height: 28, borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  storyBadgeActive: { backgroundColor: 'rgba(209,141,30,0.15)' },
  storyBadgePast: { backgroundColor: colors.surfaceAlt },
  storyLevelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  youAreHereChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(209,141,30,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(209,141,30,0.3)',
  },
  storyExamplesRow: {
    gap: spacing.sm,
    paddingLeft: 40,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  storyExampleTile: {
    width: 120,
    opacity: 0.6,
  },
  storyExampleTileActive: {
    opacity: 1,
  },
  storyConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: 13,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  storyConnectorLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    borderRadius: 1,
  },
  storyConnectorLinePast: {
    backgroundColor: colors.warning,
  },
  storyConnectorLabel: {
    opacity: 0.6,
  },
});
