import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { colors, radius, spacing } from '../theme';
import { mockArtworks, mockStudent } from '../data/mockStudent';
import { mockStreaks, STREAK_LABEL, StreakType } from '../data/mockStreaks';
import {
  SKILL_META,
  SKILL_ORDER,
  SkillType,
  levelFor,
  mockSkills,
} from '../data/mockSkills';
import type { ProfileStackParamList } from '../navigation/ProfileStack';
import { FullImagePopover } from './profile/FullImageView';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen() {
  const s = mockStudent;
  const navigation = useNavigation<Nav>();
  const [openArtworkId, setOpenArtworkId] = useState<string | null>(null);

  // Overall level = average of all 5 skill points.
  const total = SKILL_ORDER.reduce((sum, k) => sum + mockSkills.points[k], 0);
  const avg = total / SKILL_ORDER.length;
  const overall = levelFor(avg);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text variant="caption" tone="muted">
              {s.joinedDate}
            </Text>
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
            <View style={styles.avatar}>
              <Text variant="display" tone="inverse">
                {s.firstName[0]}
              </Text>
            </View>
            <Text variant="display" style={{ marginTop: spacing.md }}>
              {s.firstName}
            </Text>
            <Text variant="body" tone="secondary" style={{ marginTop: 4 }}>
              {overall.name} Artist · Level {overall.index + 1}
            </Text>
          </View>
        </View>

        <SkillMap
          onTapSkill={(skill) => navigation.navigate('SkillDetail', { skill })}
        />

        <StreaksBlock />

        <AllMyWorksBlock
          onViewAll={() => navigation.navigate('AllMyWorks')}
          onTapArtwork={(id) => setOpenArtworkId(id)}
        />

        <ReferralCard onPress={() => navigation.navigate('Referral')} />
      </ScrollView>

      <FullImagePopover
        artworkId={openArtworkId}
        onClose={() => setOpenArtworkId(null)}
      />
    </Screen>
  );
}

function SkillMap({ onTapSkill }: { onTapSkill: (s: SkillType) => void }) {
  const topRow = SKILL_ORDER.slice(0, 3);
  const bottomRow = SKILL_ORDER.slice(3, 5);
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <Text variant="label" tone="muted">
          Skills
        </Text>
        <Text variant="caption" tone="muted">
          Tap for details
        </Text>
      </View>
      <View style={styles.olympicTop}>
        {topRow.map((skill) => (
          <SkillCircle
            key={skill}
            skill={skill}
            points={mockSkills.points[skill]}
            onPress={() => onTapSkill(skill)}
          />
        ))}
      </View>
      <View style={styles.olympicBottom}>
        {bottomRow.map((skill) => (
          <SkillCircle
            key={skill}
            skill={skill}
            points={mockSkills.points[skill]}
            onPress={() => onTapSkill(skill)}
          />
        ))}
      </View>
    </View>
  );
}

function SkillCircle({
  skill,
  points,
  onPress,
}: {
  skill: SkillType;
  points: number;
  onPress: () => void;
}) {
  const meta = SKILL_META[skill];
  const level = levelFor(points);
  const inLevel = points - level.min;
  const levelSpan = level.max - level.min;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.skillCell, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.miniRing, webArcStyle(inLevel / levelSpan)]}>
        <View style={styles.miniRingInner}>
          <Text variant="number">{points}</Text>
        </View>
      </View>
      <Text
        variant="caption"
        style={{ fontWeight: '600', textAlign: 'center', marginTop: 6 }}
        numberOfLines={2}
      >
        {meta.name}
      </Text>
      <Text
        variant="caption"
        tone="muted"
        style={{ textAlign: 'center', marginTop: 2 }}
        numberOfLines={1}
      >
        {level.name}
      </Text>
    </Pressable>
  );
}

function StreaksBlock() {
  const items: { type: StreakType; count: number }[] = [
    { type: 'hw', count: mockStreaks.hw },
    { type: 'quiz', count: mockStreaks.quiz },
    { type: 'gk', count: mockStreaks.gk },
  ];
  return (
    <View style={styles.block}>
      <Text variant="label" tone="muted" style={{ marginBottom: spacing.sm }}>
        Streaks
      </Text>
      <View style={styles.streaksRow}>
        {items.map((it) => (
          <View key={it.type} style={styles.skillCell}>
            <View style={[styles.miniRing, webArcStyle(1)]}>
              <View style={styles.miniRingInner}>
                <Ionicons name="flame" size={12} color={colors.warning} />
                <Text variant="number" style={{ marginTop: 1 }}>
                  {it.count}
                </Text>
              </View>
            </View>
            <Text
              variant="caption"
              style={{ fontWeight: '600', textAlign: 'center', marginTop: 6 }}
              numberOfLines={1}
            >
              {STREAK_LABEL[it.type]}
            </Text>
            <Text
              variant="caption"
              tone="muted"
              style={{ textAlign: 'center', marginTop: 2 }}
              numberOfLines={1}
            >
              {it.count} {it.count === 1 ? 'day' : 'days'}
            </Text>
          </View>
        ))}
      </View>
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

function ReferralCard({ onPress }: { onPress: () => void }) {
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

function webArcStyle(progress: number): object {
  const p = Math.max(0, Math.min(1, progress));
  const deg = Math.round(p * 360);
  return {
    // @ts-ignore — react-native-web passes this through as CSS
    backgroundImage: `conic-gradient(${colors.warning} 0deg ${deg}deg, ${colors.border} ${deg}deg 360deg)`,
  } as object;
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
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

  // Skills — Olympics
  olympicTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  olympicBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '66.67%',
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  skillCell: {
    alignItems: 'center',
    width: 96,
  },
  miniRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRingInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Streaks
  streaksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(209, 141, 30, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

});
