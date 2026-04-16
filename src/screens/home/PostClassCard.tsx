import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Text } from '../../components/Text';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { colors, spacing } from '../../theme';
import { mockStudent, TimelineSession } from '../../data/mockStudent';

/**
 * Post-class summary card — auto-generated from the curriculum mapping.
 * Fires right after class ends and stays dominant for ~12 hours.
 */
export function PostClassCard({
  session,
  onSubmitHw,
}: {
  session: TimelineSession;
  onSubmitHw: () => void;
}) {
  const name = mockStudent.firstName;

  return (
    <Card>
      <View style={styles.topRow}>
        <Chip label="Class done" tone="success" />
        <Text variant="small" tone="muted">
          Just now
        </Text>
      </View>

      <Text variant="h2" style={{ marginTop: spacing.sm }}>
        What {name} worked on today
      </Text>
      <Text variant="label" tone="muted" style={{ marginTop: spacing.md }}>
        Session {session.sessionNumber} · {session.title}
      </Text>

      <View style={{ marginTop: spacing.sm }}>
        {session.keyConcepts.map((k) => (
          <View key={k} style={styles.row}>
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={colors.success}
              style={{ marginRight: spacing.sm, marginTop: 2 }}
            />
            <Text variant="body" tone="secondary" style={{ flex: 1 }}>
              {k}
            </Text>
          </View>
        ))}
      </View>

      {/* Homework unlocks */}
      <View style={styles.hwUnlock}>
        <View style={styles.hwHeader}>
          <Ionicons name="bookmark-outline" size={16} color={colors.textSecondary} />
          <Text variant="bodyBold" style={{ marginLeft: spacing.xs }}>
            Homework unlocked
          </Text>
        </View>
        <Text variant="small" tone="secondary" style={{ marginTop: 4 }}>
          Upload a photo of what {name} draws at home to finish today's session.
        </Text>
        <View style={{ marginTop: spacing.md }}>
          <Button label="Submit homework" size="sm" onPress={onSubmitHw} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  hwUnlock: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  hwHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
