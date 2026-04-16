import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  value: number; // 0..1
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({ value, height = 6, style }: Props) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${pct * 100}%`, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary,
    height: '100%',
  },
});
