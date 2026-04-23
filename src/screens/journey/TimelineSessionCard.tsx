import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { colors, radius, spacing } from '../../theme';
import { TimelineSession } from '../../data/mockStudent';

interface Props {
  session: TimelineSession;
  isPast: boolean;
  isToday: boolean;
  onPress: () => void;
  onPressNotThere?: () => void;
}

export function TimelineSessionCard({
  session,
  isPast,
  isToday,
  onPress,
  onPressNotThere,
}: Props) {
  if (session.status === 'upcoming') {
    return (
      <Card style={[styles.card, !isToday && styles.cardFuture]}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text variant="bodyBold" tone={isToday ? 'primary' : 'secondary'}>
              {session.title}
            </Text>
            <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
              Session {session.sessionNumber}
              {isToday ? ' · Starts today' : ' · Details on class day'}
            </Text>
          </View>
          <SessionTypeIcon />
        </View>
        <Pressable
          onPress={onPressNotThere}
          disabled={!onPressNotThere}
          style={({ pressed }) => [styles.notHereRow, pressed && { opacity: 0.7 }]}
        >
          <Text variant="small" tone="secondary">
            Not there on this day?
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </Card>
    );
  }
  if (session.status === 'missed') {
    return (
      <Card style={[styles.card, styles.cardMissed]}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Chip label="Missed" tone="error" />
            <Text variant="bodyBold" style={{ marginTop: spacing.sm }} tone="secondary">
              {session.title}
            </Text>
            <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
              Session {session.sessionNumber}
            </Text>
          </View>
          <SessionTypeIcon />
        </View>
      </Card>
    );
  }
  // attended
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1, paddingRight: spacing.sm }}>
          <View style={styles.attendedHeaderRow}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text variant="caption" tone="muted" style={{ marginLeft: 4 }}>
              Attended · Session {session.sessionNumber}
            </Text>
          </View>
          <Text variant="bodyBold" style={{ marginTop: 2 }}>
            {session.title}
          </Text>
        </View>
        <SessionTypeIcon />
      </View>
      <Text variant="label" tone="muted" style={{ marginTop: spacing.sm }}>
        Key concepts
      </Text>
      <View style={{ marginTop: 4 }}>
        {session.keyConcepts.slice(0, 3).map((k) => (
          <View key={k} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text variant="small" tone="secondary" style={{ flex: 1 }}>
              {k}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.viewMore}>
        <Text variant="small" tone="muted">
          View more
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>
    </Card>
  );
}

function SessionTypeIcon() {
  return (
    <View style={styles.typeIcon}>
      <Ionicons name="brush-outline" size={18} color={colors.textPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xs,
  },
  cardFuture: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  cardMissed: {
    opacity: 0.65,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginTop: 9,
    marginRight: spacing.sm,
  },
  viewMore: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  notHereRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
