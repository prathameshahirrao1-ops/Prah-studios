import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { Text } from './Text';
import { Button } from './Button';
import type { CrossedThreshold } from '../data/mockSkills';
import { LEVEL_DESCRIPTIONS } from '../data/mockSkills';

interface Props {
  crossing: CrossedThreshold | null;
  onClose: () => void;
}

/**
 * Shared level-up celebration. Pass 1 — simple styling:
 *   - sub-level crossing  → small accent card, quick read
 *   - tier crossing       → bigger moment, tier name + description
 *
 * Called from:
 *   - Post-class Session Summary popup close (Loop 1)
 *   - HW Review popup close (Loop 2)
 *   - Sketchbook Review popup close (Loop 4)
 *
 * When multiple crossings queue (rare), UI drains them one at a time
 * (see SkillState.pendingCrossings in mockSkills.ts).
 */
export function LevelUpPopup({ crossing, onClose }: Props) {
  const visible = crossing !== null;
  const isTier = crossing?.type === 'tier';
  const next = crossing?.next;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          {next && (
            <>
              {/* Badge area — larger for tier crossings */}
              <View style={[styles.badge, isTier && styles.badgeTier]}>
                <Ionicons
                  name={isTier ? 'trophy' : 'star'}
                  size={isTier ? 52 : 36}
                  color={colors.warning}
                />
              </View>

              {/* Eyebrow line */}
              <Text variant="label" tone="secondary" style={styles.eyebrow}>
                {isTier ? 'New Tier Unlocked' : 'Level Up'}
              </Text>

              {/* Headline — tier name big, sub-level smaller */}
              {isTier ? (
                <>
                  <Text variant="displayLg" style={styles.headline}>
                    {next.tier}
                  </Text>
                  <Text
                    variant="body"
                    tone="secondary"
                    style={styles.description}
                  >
                    {LEVEL_DESCRIPTIONS[next.tierIndex]}
                  </Text>
                </>
              ) : (
                <>
                  <Text variant="displayMd" style={styles.headline}>
                    {next.displayName}
                  </Text>
                  <Text
                    variant="body"
                    tone="secondary"
                    style={styles.subCopy}
                  >
                    {next.pointsToNextSub > 0
                      ? `${next.pointsToNextSub} pts to your next level`
                      : 'Keep drawing!'}
                  </Text>
                </>
              )}

              <View style={styles.cta}>
                <Button
                  label={isTier ? 'See my progress' : 'Keep going'}
                  onPress={onClose}
                  fullWidth
                />
              </View>
            </>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 400,
    width: '100%',
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  badgeTier: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  subCopy: {
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
});
