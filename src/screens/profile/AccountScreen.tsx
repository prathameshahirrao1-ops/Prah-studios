import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, radius, spacing } from '../../theme';
import { mockStudent } from '../../data/mockStudent';

// Mock parent account — the real build pulls from /parents/{parentId}.
const MOCK_ACCOUNT = {
  parentName: 'Prathamesh Ahirrao',
  email: 'prathamesh@example.com',
  phone: '+91 98765 43210',
};

export function AccountScreen() {
  const navigation = useNavigation();

  const rows: { label: string; value: string }[] = [
    { label: 'Student name', value: mockStudent.firstName },
    { label: 'Age', value: `${mockStudent.age}` },
    { label: 'Joined', value: mockStudent.joinedDate.replace('Joined ', '') },
    { label: 'Parent name', value: MOCK_ACCOUNT.parentName },
    { label: 'Email', value: MOCK_ACCOUNT.email },
    { label: 'Phone', value: MOCK_ACCOUNT.phone },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h2">Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {rows.map((r, i) => (
            <View
              key={r.label}
              style={[
                styles.row,
                i === rows.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text variant="small" tone="muted">
                {r.label}
              </Text>
              <Text variant="body" tone="primary" style={{ marginTop: 2 }}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text variant="h3">Edit details</Text>
          <Text variant="small" tone="secondary" style={{ marginTop: 4 }}>
            For now, contact the studio to update your email or phone. In-app editing
            comes next.
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <Button
              label="Message the studio"
              size="sm"
              variant="secondary"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={[styles.card, styles.dangerCard]}>
          <Text variant="h3" style={{ color: colors.error }}>
            Delete account
          </Text>
          <Text variant="small" tone="secondary" style={{ marginTop: 4 }}>
            Permanently removes your profile, artworks, and progress. Cannot be
            undone. We keep minimal records for 30 days in case you change your mind.
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <Button
              label="Request account deletion"
              size="sm"
              variant="secondary"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  dangerCard: {
    borderColor: colors.error,
    backgroundColor: 'rgba(217, 69, 63, 0.04)',
  },
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
});
