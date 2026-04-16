import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { colors, spacing } from '../theme';
import { mockStudent } from '../data/mockStudent';

const ROWS = [
  { key: 'account', label: 'Account details', icon: 'person-circle-outline' as const },
  { key: 'works', label: 'All my works', icon: 'images-outline' as const },
  { key: 'journeys', label: 'Journeys', icon: 'compass-outline' as const },
  { key: 'billing', label: 'Billing history', icon: 'receipt-outline' as const },
  { key: 'support', label: 'Support & feedback', icon: 'help-circle-outline' as const },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' as const },
];

export function ProfileScreen() {
  const s = mockStudent;
  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text variant="h1" tone="inverse">
              {s.firstName[0]}
            </Text>
          </View>
          <Text variant="h1" style={{ marginTop: spacing.md }}>
            {s.firstName}
          </Text>
          <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
            Age {s.age} · {s.joinedDate}
          </Text>
        </View>

        <View style={styles.list}>
          {ROWS.map((r) => (
            <Card key={r.key} compact onPress={() => {}} style={styles.row}>
              <Ionicons name={r.icon} size={22} color={colors.textPrimary} />
              <Text variant="bodyBold" style={{ flex: 1, marginLeft: spacing.md }}>
                {r.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
