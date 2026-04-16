import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Text } from './Text';

type Tone = 'neutral' | 'success' | 'warning' | 'error';

interface Props {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}

const toneMap: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary },
  success: { bg: '#E6F4EC', fg: '#1F7A50' },
  warning: { bg: '#FAEFD6', fg: '#8A5E10' },
  error: { bg: '#FBE7E6', fg: '#9A2A26' },
};

export function Chip({ label, tone = 'neutral', style }: Props) {
  const c = toneMap[tone];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }, style]}>
      <Text variant="label" style={{ color: c.fg }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
