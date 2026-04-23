import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { colors, spacing } from '../../theme';
import { TimelineSession } from '../../data/mockStudent';
import { relativeDay } from '../../utils/formatDate';

interface Props {
  session: TimelineSession;
  onNotComing: () => void;
  onOpen: () => void;
}

export function NextClassCard({ session, onNotComing, onOpen }: Props) {
  return (
    <Card onPress={onOpen}>
      <View style={styles.header}>
        <Chip label="Next class" />
        <Text variant="small" tone="muted">
          {relativeDay(session.date)}
        </Text>
      </View>
      <Text variant="h3" style={{ marginTop: spacing.sm }}>
        {session.title}
      </Text>
      <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
        Session {session.sessionNumber} · {formatDateHeuristic(session.date)}
      </Text>
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          onNotComing();
        }}
        style={({ pressed }) => [styles.notComingRow, pressed && { opacity: 0.7 }]}
      >
        <Text variant="small" tone="secondary">
          Not coming today?
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>
    </Card>
  );
}

function formatDateHeuristic(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }) + ' · 10:00 am'
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notComingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
