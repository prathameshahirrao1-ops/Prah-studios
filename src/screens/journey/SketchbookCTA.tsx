import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { colors, radius, spacing } from '../../theme';

/**
 * Loop 4 — Sketchbook CTA card on the Journey header.
 *
 * Three copy states depending on reviewsLeftThisWeek:
 *   2 → "Teacher reviews 2 pieces per week — add your first"
 *   1 → "1 review left this week"
 *   0 → "Points used up this week — add to portfolio only"
 *
 * Tap opens SketchbookUploadPopup. Eligibility (point-earning vs
 * portfolio-only) is decided at submit time server-side; we just show
 * the right copy here.
 */
interface Props {
  reviewsLeftThisWeek: number;
  onPress: () => void;
}

export function SketchbookCTA({ reviewsLeftThisWeek, onPress }: Props) {
  const eligible = reviewsLeftThisWeek > 0;

  const { primary, secondary } = copyFor(reviewsLeftThisWeek);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.iconWrap, !eligible && styles.iconWrapMuted]}>
        <Ionicons
          name="color-palette-outline"
          size={22}
          color={eligible ? colors.warning : colors.textMuted}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyBold">{primary}</Text>
        <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
          {secondary}
        </Text>
      </View>
      <Ionicons name="add" size={22} color={colors.textPrimary} />
    </Pressable>
  );
}

function copyFor(left: number): { primary: string; secondary: string } {
  if (left >= 2) {
    return {
      primary: '+ Add to Sketchbook',
      secondary: 'Teacher reviews 2 pieces a week · up to 15 pts each',
    };
  }
  if (left === 1) {
    return {
      primary: '+ Add to Sketchbook',
      secondary: '1 review left this week',
    };
  }
  return {
    primary: '+ Add to Sketchbook',
    secondary: 'Points used up this week — portfolio only',
  };
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.warning}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapMuted: {
    backgroundColor: colors.surfaceAlt,
  },
});
