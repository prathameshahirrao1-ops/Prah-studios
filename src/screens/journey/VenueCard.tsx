// Spec:
//   - docs/spec/schema/student.md
//

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { colors, radius, spacing } from '../../theme';
import { Venue } from '../../data/mockStudent';

interface Props {
  venue: Venue;
  onDirections?: () => void;
}

export function VenueCard({ venue, onDirections }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons
          name="person-circle-outline"
          size={20}
          color={colors.textPrimary}
        />
        <Text variant="bodyBold" style={styles.text}>
          {venue.teacherName}
        </Text>
        {venue.teacherVerified && (
          <Ionicons
            name="checkmark-circle"
            size={14}
            color={colors.success}
            style={{ marginLeft: 4 }}
          />
        )}
        <Text variant="small" tone="muted" style={{ marginLeft: 'auto' }}>
          Your teacher
        </Text>
      </View>
      <View style={styles.row}>
        <Ionicons
          name="location-outline"
          size={20}
          color={colors.textPrimary}
        />
        <View style={[styles.text, { flex: 1 }]}>
          <Text variant="small">{venue.area}</Text>
          <Text variant="caption" tone="muted">
            {venue.line1}
          </Text>
        </View>
        <Pressable
          onPress={onDirections ?? (() => {})}
          hitSlop={8}
          style={({ pressed }) => [
            styles.directionsBtn,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Directions"
        >
          <Text variant="small" tone="secondary">
            Directions
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={colors.textMuted}
          />
        </Pressable>
      </View>
      <View style={styles.row}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.textPrimary}
        />
        <Text variant="small" style={styles.text}>
          {venue.schedule}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  text: {
    marginLeft: spacing.sm,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
