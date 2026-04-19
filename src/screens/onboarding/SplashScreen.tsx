import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { colors, spacing } from '../../theme';
import type { RootNavigatorParamList } from '../../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootNavigatorParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Welcome'), 1400);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.logoMark}>
          <Text variant="h1" tone="inverse" style={styles.logoLetter}>
            P
          </Text>
        </View>
        <Text variant="h1" style={styles.wordmark}>
          Prah Studio
        </Text>
        <Text variant="body" tone="muted" style={styles.tagline}>
          Art for young minds
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoLetter: {
    lineHeight: 80,
    fontSize: 36,
  },
  wordmark: {
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: spacing.xs,
  },
});
