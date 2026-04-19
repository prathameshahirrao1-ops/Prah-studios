import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { colors, spacing } from '../../theme';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

const ROWS: {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: keyof ProfileStackParamList;
  danger?: boolean;
}[] = [
  { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', route: 'SettingsNotifications' },
  { key: 'account',       label: 'Profile · Account details', icon: 'person-circle-outline', route: 'SettingsAccount' },
  { key: 'billing',       label: 'Billing history', icon: 'receipt-outline', route: 'SettingsBilling' },
  { key: 'logout',        label: 'Logout', icon: 'log-out-outline', danger: true },
];

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();

  const onRowPress = (key: string, route?: keyof ProfileStackParamList) => {
    if (key === 'logout') {
      confirmLogout();
      return;
    }
    if (route) {
      navigation.navigate(route as any);
    }
  };

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
        <Text variant="h2">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {ROWS.map((r) => (
          <Card
            key={r.key}
            compact
            onPress={() => onRowPress(r.key, r.route)}
            style={styles.row}
          >
            <Ionicons
              name={r.icon}
              size={22}
              color={r.danger ? colors.error : colors.textPrimary}
            />
            <Text
              variant="bodyBold"
              style={{
                flex: 1,
                marginLeft: spacing.md,
                color: r.danger ? colors.error : colors.textPrimary,
              }}
            >
              {r.label}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function confirmLogout() {
  // web Alert.alert is sync — we keep it simple for both platforms.
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    const ok = typeof window !== 'undefined' && window.confirm('Log out of Prah Studio?');
    if (ok) {
      // real build: clear storage + navigate to onboarding
    }
    return;
  }
  Alert.alert('Logout', 'Log out of Prah Studio?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Logout', style: 'destructive', onPress: () => {} },
  ]);
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
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
