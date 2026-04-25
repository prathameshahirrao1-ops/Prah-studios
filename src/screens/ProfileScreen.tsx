// Spec:
//   - docs/spec/ui-map/profile-screen.md
//

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { colors, radius, spacing } from '../theme';
import { mockArtworks, mockStudent } from '../data/mockStudent';
import { STREAK_LABEL, StreakType, useStreaksData } from '../data/mockStreaks';
import { explorerJourneys, currentJourney } from '../data/mockJourneys';
import {
  SKILL_ORDER,
  overallLevelFor,
  totalPoints,
  useSkillsState,
} from '../data/mockSkills';
import type { ProfileStackParamList } from '../navigation/ProfileStack';
import { FullImagePopover } from './profile/FullImageView';
import { SkillMap, segmentedRingStyle } from './profile/SkillMap';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen() {
  const s = mockStudent;
  const navigation = useNavigation<Nav>();
  const [openArtworkId, setOpenArtworkId] = useState<string | null>(null);
  const [referralDismissed, setReferralDismissed] = useState(false);

  const skills = useSkillsState();
  const total = totalPoints(skills);
  const overall = overallLevelFor(total);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              style={({ pressed }) => [styles.gearBtn, pressed && { opacity: 0.7 }]}
              accessibilityLabel="Settings"
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
            </Pressable>
          </View>
          <View style={styles.headerContent}>
            <Pressable
              onPress={() => navigation.navigate('LevelDetail')}
              style={[styles.avatarRing, segmentedRingStyle(skills.points, total)]}
            >
              <View style={styles.avatar}>
                <Text variant="display" tone="inverse">
                  {s.firstName[0]}
                </Text>
              </View>
            </Pressable>
            <View style={styles.headerText}>
              <Text variant="display">{s.firstName}</Text>
              <Text variant="body" tone="secondary" style={{ marginTop: 2 }}>
                {overall.displayName}
              </Text>
              <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                {s.joinedDate}
              </Text>
            </View>
          </View>
        </View>

        {!referralDismissed && (
          <ReferralCard
            onPress={() => navigation.navigate('Referral')}
            onDismiss={() => setReferralDismissed(true)}
          />
        )}

        <SkillMap
          onTapSkill={() => navigation.navigate('LevelDetail')}
        />

        <StreaksBlock />

        <AllMyWorksBlock
          onViewAll={() => navigation.navigate('AllMyWorks')}
          onTapArtwork={(id) => setOpenArtworkId(id)}
        />

        <JourneysBlock onViewAll={() => navigation.navigate('Journeys')} />
      </ScrollView>

      <FullImagePopover
        artworkId={openArtworkId}
        onClose={() => setOpenArtworkId(null)}
      />
    </Screen>
  );
}

function StreaksBlock() {
  const streaks = useStreaksData();
  const items: { type: StreakType; count: number }[] = [
    { type: 'hw', count: streaks.hw },
    { type: 'quiz', count: streaks.quiz },
    { type: 'gk', count: streaks.gk },
  ];
  return (
    <View style={styles.block}>
      <Text variant="label" tone="muted" style={{ marginBottom: spacing.sm }}>
        Streaks
      </Text>
      {items.map((it, i) => (
        <View
          key={it.type}
          style={[
            styles.streakRow,
            i === items.length - 1 && { borderBottomWidth: 0, marginBottom: 0 },
          ]}
        >
          <View style={styles.streakFlameChip}>
            <Ionicons name="flame" size={13} color={colors.warning} />
            <Text variant="caption" style={{ fontWeight: '700', color: colors.warning, marginLeft: 3 }}>
              {it.count}
            </Text>
          </View>
          <Text variant="small" style={{ flex: 1, fontWeight: '500' }}>
            {STREAK_LABEL[it.type]}
          </Text>
          <Text variant="caption" tone="muted">
            {it.count} {it.count === 1 ? 'day' : 'days'}
          </Text>
        </View>
      ))}
    </View>
  );
}

function AllMyWorksBlock({
  onViewAll,
  onTapArtwork,
}: {
  onViewAll: () => void;
  onTapArtwork: (id: string) => void;
}) {
  const works = mockArtworks.slice(0, 4);
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <Text variant="label" tone="muted">
          All my works
        </Text>
        <Pressable
          onPress={onViewAll}
          accessibilityLabel="View all works"
          hitSlop={8}
        >
          <Text variant="small" tone="secondary" style={{ fontWeight: '600' }}>
            View all ›
          </Text>
        </Pressable>
      </View>
      <View style={styles.worksGrid}>
        {works.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => onTapArtwork(a.id)}
            style={({ pressed }) => [
              styles.workTile,
              pressed && { opacity: 0.85 },
            ]}
          >
            <ImagePlaceholder aspectRatio={1} rounded="md" />
            <Text
              variant="caption"
              tone="muted"
              style={{ marginTop: 4 }}
              numberOfLines={1}
            >
              {a.sessionTitle}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function JourneysBlock({ onViewAll }: { onViewAll: () => void }) {
  const nextAvailable = explorerJourneys.find((j) => j.status === 'available');
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <Text variant="label" tone="muted">Journeys</Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text variant="small" tone="secondary" style={{ fontWeight: '600' }}>
            Explore all ›
          </Text>
        </Pressable>
      </View>

      {/* Current enrolled course */}
      {currentJourney && (
        <Pressable onPress={onViewAll} style={styles.journeyRow}>
          <View style={[styles.journeyIcon, { backgroundColor: `${colors.warning}15` }]}>
            <Ionicons name="trail-sign-outline" size={18} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyBold">{currentJourney.title}</Text>
            <Text variant="caption" tone="muted">{currentJourney.duration} · {currentJourney.sessions} sessions</Text>
          </View>
          <View style={styles.journeyChip}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.warning }}>Enrolled</Text>
          </View>
        </Pressable>
      )}

      {/* Divider */}
      {currentJourney && nextAvailable && (
        <View style={styles.journeyDividerLine} />
      )}

      {/* Next available */}
      {nextAvailable && (
        <Pressable onPress={onViewAll} style={styles.journeyRow}>
          <View style={[styles.journeyIcon, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="sparkles-outline" size={18} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyBold">{nextAvailable.title}</Text>
            <Text variant="caption" tone="muted">{nextAvailable.duration} · {nextAvailable.dateAvailable}</Text>
          </View>
          <View style={styles.journeyChipNeutral}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.textSecondary }}>
              Upcoming
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

function ReferralCard({ onPress, onDismiss }: { onPress: () => void; onDismiss: () => void }) {
  return (
    <Card style={styles.referralCard}>
      <View style={styles.referralRow}>
        <View style={styles.referralIcon}>
          <Ionicons name="gift-outline" size={20} color={colors.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold">Referral</Text>
          <Text variant="small" tone="secondary" style={{ marginTop: 2 }}>
            Get ₹200 off your next renewal for every friend who joins.
          </Text>
        </View>
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          style={({ pressed }) => [styles.referralClose, pressed && { opacity: 0.6 }]}
          accessibilityLabel="Dismiss referral"
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>
      <Button
        label="Share link"
        variant="secondary"
        size="sm"
        onPress={onPress}
        style={{ marginTop: spacing.md }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Header
  header: {
    marginBottom: spacing.xl,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Block wrappers — bento cards
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

  // Journey stats
  journeyStats: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  journeyStat: {
    flex: 1,
    alignItems: 'center',
  },
  journeyDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginVertical: 2,
  },

  // Streaks
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: 2,
  },
  streakFlameChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209,141,30,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // All my works
  worksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  workTile: {
    width: '48%',
  },

  // Journeys block
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  journeyIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  journeyChip: {
    backgroundColor: `${colors.warning}18`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  journeyChipNeutral: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  journeyDividerLine: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 2,
  },

  // Referral
  referralCard: {
    marginBottom: spacing.xl,
    borderColor: colors.warning,
    borderWidth: 1,
    backgroundColor: 'rgba(209, 141, 30, 0.06)',
  },
  referralRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  referralClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(209, 141, 30, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

});
