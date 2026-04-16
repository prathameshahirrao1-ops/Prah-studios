import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

interface Props {
  height?: number | string;
  aspectRatio?: number;      // width/height
  style?: ViewStyle;
  iconSize?: number;
  rounded?: keyof typeof radius;
}

/**
 * Pass 1 placeholder for images — grey rectangle with a mountain icon.
 * Replaced with real <Image> when assets land.
 */
export function ImagePlaceholder({
  height,
  aspectRatio,
  style,
  iconSize = 22,
  rounded = 'md',
}: Props) {
  const boxStyle: ViewStyle = {
    ...(height !== undefined ? { height: height as any } : {}),
    ...(aspectRatio !== undefined ? { aspectRatio } : {}),
  };
  return (
    <View style={[styles.box, { borderRadius: radius[rounded] }, boxStyle, style]}>
      <Ionicons name="image-outline" size={iconSize} color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
