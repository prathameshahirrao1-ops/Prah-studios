import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Chip } from '../components/Chip';
import { colors, spacing } from '../theme';

export function CommunityScreen() {
  return (
    <Screen>
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={32} color={colors.textMuted} />
        <Chip label="Phase 2" style={{ marginTop: spacing.md }} />
        <Text variant="h2" style={{ marginTop: spacing.md }}>
          Community
        </Text>
        <Text variant="body" tone="secondary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
          Posts, peers, and journey discovery will live here. Parked for V2.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
});
