import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { spacing } from '../theme';

export function JourneyScreen() {
  return (
    <Screen>
      <View style={styles.center}>
        <Text variant="label" tone="muted">
          Tab A — coming next
        </Text>
        <Text variant="h1" style={{ marginTop: spacing.xs }}>
          My Journey
        </Text>
        <Text variant="body" tone="secondary" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
          Timeline, peers, and your work for the current course will live here.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
});
