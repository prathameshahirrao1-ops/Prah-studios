import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { colors, spacing } from '../theme';
import { STREAK_LABEL, StreakType } from '../data/mockStreaks';

interface Props {
  type: StreakType;
  count: number;
}

/**
 * Thin bottom footer inside a Card. Shows current streak or a prompt to start
 * one. Used on actionable timeline cards only (pending HW / quiz / carousel).
 */
export function StreakFooter({ type, count }: Props) {
  if (count < 2) {
    return (
      <View style={styles.footer}>
        <Text variant="caption" tone="muted">
          Start your {STREAK_LABEL[type].toLowerCase()}!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.footer}>
      <Ionicons name="flame" size={14} color={colors.warning} />
      <Text variant="caption" tone="secondary" style={{ fontWeight: '600' }}>
        {STREAK_LABEL[type]} · {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
