import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../components/Text';
import { Chip } from '../../components/Chip';
import { colors, radius, spacing } from '../../theme';

interface Txn {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;        // ISO
  status: 'paid' | 'refunded';
  method: string;
  refNumber: string;
}

// Mock billing history.
const MOCK_TXNS: Txn[] = [
  {
    id: 't1',
    title: 'Drawing Foundation · 3 months',
    subtitle: 'Course fee · Q1 2026',
    amount: 4500,
    date: '2026-03-21',
    status: 'paid',
    method: 'UPI · PhonePe',
    refNumber: 'RZP_8421AE',
  },
  {
    id: 't2',
    title: 'Trial class',
    subtitle: 'Demo · 1 session',
    amount: 200,
    date: '2026-03-18',
    status: 'paid',
    method: 'UPI · Google Pay',
    refNumber: 'RZP_7612BD',
  },
];

export function BillingScreen() {
  const navigation = useNavigation();
  const totalPaid = MOCK_TXNS.filter((t) => t.status === 'paid').reduce(
    (sum, t) => sum + t.amount,
    0,
  );

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
        <Text variant="h2">Billing history</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.summaryCard}>
          <Text variant="small" tone="muted">
            Total paid
          </Text>
          <Text variant="numberLg" style={{ marginTop: 4 }}>
            ₹{totalPaid.toLocaleString('en-IN')}
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
            Across {MOCK_TXNS.length} transactions
          </Text>
        </View>

        {MOCK_TXNS.map((t) => (
          <View key={t.id} style={styles.txnCard}>
            <View style={styles.txnHead}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold" numberOfLines={1}>
                  {t.title}
                </Text>
                <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
                  {t.subtitle}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="number">₹{t.amount.toLocaleString('en-IN')}</Text>
                <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                  {formatDate(t.date)}
                </Text>
              </View>
            </View>

            <View style={styles.txnFoot}>
              <Chip
                label={t.status === 'paid' ? 'Paid' : 'Refunded'}
                tone={t.status === 'paid' ? 'success' : 'neutral'}
              />
              <Text variant="caption" tone="muted">
                {t.method} · {t.refNumber}
              </Text>
            </View>
          </View>
        ))}

        <Text variant="caption" tone="muted" style={styles.footer}>
          Need a GST invoice? Message the studio and we'll email it within a day.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  txnCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  txnHead: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  txnFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footer: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
