import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, radius, spacing } from '../../theme';
import type { RootNavigatorParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../auth/AuthContext';

type Nav = NativeStackNavigationProp<RootNavigatorParamList, 'ProfileSetup'>;

export function ProfileSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { saveProfile, user } = useAuth();
  const [name, setName] = useState('');
  const [ageText, setAgeText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ageNum = parseInt(ageText, 10);
  const ageValid = !isNaN(ageNum) && ageNum > 0 && ageNum < 100;
  const canSubmit = name.trim().length > 0 && ageValid && !busy;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setError(null);
    if (!user) {
      navigation.navigate('MainApp');
      return;
    }
    setBusy(true);
    try {
      await saveProfile({
        childName: name.trim(),
        age: ageNum,
        parentName: name.trim(),
      });
    } catch (e: any) {
      setError("Couldn't save profile. Please try again.");
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headingBlock}>
            <Text variant="h1">Let's set up{'\n'}your profile</Text>
            <Text variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
              A couple of quick details to get you started.
            </Text>
          </View>

          {/* Name */}
          <View style={styles.fieldBlock}>
            <Text variant="label" tone="muted" style={styles.fieldLabel}>
              Your name
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aarav"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              autoCapitalize="words"
            />
          </View>

          {/* Age */}
          <View style={styles.fieldBlock}>
            <Text variant="label" tone="muted" style={styles.fieldLabel}>
              Age
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 7"
              placeholderTextColor={colors.textMuted}
              value={ageText}
              onChangeText={(t) => setAgeText(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
              returnKeyType="done"
            />
          </View>

          {error && (
            <Text variant="small" style={{ color: '#B3261E' }}>
              {error}
            </Text>
          )}

          <View style={styles.actions}>
            <Button
              label={busy ? 'Saving…' : 'Create profile'}
              onPress={handleCreate}
              disabled={!canSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
    gap: spacing['2xl'],
  },
  headingBlock: {
    paddingTop: spacing.xl,
  },
  fieldBlock: {
    gap: spacing.sm,
  },
  fieldLabel: {
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
