import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../components/Text';
import { colors, radius, spacing } from '../../theme';

interface Toggle {
  key: string;
  label: string;
  help: string;
}

const TOGGLES: Toggle[] = [
  { key: 'classReminders', label: 'Class reminders', help: 'One day before and one hour before each class.' },
  { key: 'liveClass',      label: 'Class started / ended', help: 'A gentle ping when class starts, and the summary when it ends.' },
  { key: 'hwUpdates',      label: 'Homework reviewed', help: 'When the teacher leaves feedback on a submitted drawing.' },
  { key: 'skillReport',    label: 'Monthly skill report', help: 'Sent at the end of each calendar month.' },
  { key: 'artGk',          label: 'Art GK daily', help: 'Today\'s 3 new things — keeps the daily streak alive.' },
  { key: 'badges',         label: 'Badges & milestones', help: 'When Aarav earns a streak badge or crosses a level.' },
  { key: 'payments',       label: 'Payment reminders', help: 'Renewal due dates and receipt confirmations.' },
];

export function NotificationsScreen() {
  const navigation = useNavigation();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(TOGGLES.map((t) => [t.key, true])),
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
        <Text variant="h2">Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="small" tone="muted" style={{ marginBottom: spacing.md }}>
          Pick what you'd like to hear about. Class reminders stay on by default.
        </Text>

        <View style={styles.list}>
          {TOGGLES.map((t, i) => (
            <View
              key={t.key}
              style={[
                styles.row,
                i === TOGGLES.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text variant="bodyBold">{t.label}</Text>
                <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
                  {t.help}
                </Text>
              </View>
              <Switch
                value={prefs[t.key]}
                onValueChange={(v) =>
                  setPrefs((prev) => ({ ...prev, [t.key]: v }))
                }
                trackColor={{ false: colors.border, true: colors.warning }}
                thumbColor={colors.surface}
              />
            </View>
          ))}
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
  },
  list: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
});
