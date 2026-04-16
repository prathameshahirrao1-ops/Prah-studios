import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  fullWidth,
  style,
}: Props) {
  const variantStyle = variantStyles[variant];
  const textTone = variant === 'primary' ? 'inverse' : 'primary';
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        variantStyle.container,
        fullWidth && { alignSelf: 'stretch' },
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <View>
        <Text
          variant={size === 'sm' ? 'small' : 'bodyBold'}
          tone={textTone}
          style={{ textAlign: 'center' }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
  },
});

const variantStyles: Record<
  Variant,
  { container: ViewStyle }
> = {
  primary: {
    container: {
      backgroundColor: colors.primary,
    },
  },
  secondary: {
    container: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    },
  },
};
