import React from 'react';
import { Text as RNText, StyleSheet, TextProps, TextStyle } from 'react-native';
import { colors, typography } from '../theme';

type Variant =
  | 'displayLg'
  | 'displayMd'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyBold'
  | 'small'
  | 'label'
  | 'caption';

type Tone = 'primary' | 'secondary' | 'muted' | 'inverse';

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
  style?: TextStyle | TextStyle[];
}

const toneColor: Record<Tone, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  inverse: colors.textInverse,
};

export function Text({ variant = 'body', tone = 'primary', style, children, ...rest }: Props) {
  const variantStyle = typography[variant] as TextStyle;
  return (
    <RNText
      {...rest}
      style={[styles.base, variantStyle, { color: toneColor[tone] }, style as TextStyle]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
  },
});
