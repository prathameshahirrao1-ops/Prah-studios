import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

type Nav = NativeStackNavigationProp<RootNavigatorParamList, 'ProfileSetup'>;

const AGE_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export function ProfileSetupScreen() {
  const navigation = useNavigation<Nav>();
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [parentName, setParentName] = useState('');

  const canSubmit = childName.trim().length > 0 && age !== null && parentName.trim().length > 0;

  const handleCreate = () => {
    navigation.navigate('MainApp');
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
            <Text variant="h1">Tell us about{'\n'}your child</Text>
            <Text variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
              We'll personalise their journey from day one.
            </Text>
          </View>

          {/* Child name */}
          <View style={styles.fieldBlock}>
            <Text variant="label" tone="muted" style={styles.fieldLabel}>
              Child's name
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aarav"
              placeholderTextColor={colors.textMuted}
              value={childName}
              onChangeText={setChildName}
              returnKeyType="next"
              autoCapitalize="words"
            />
          </View>

          {/* Age picker */}
          <View style={styles.fieldBlock}>
            <Text variant="label" tone="muted" style={styles.fieldLabel}>
              Age
            </Text>
            <View style={styles.agePills}>
              {AGE_OPTIONS.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => setAge(a)}
                  style={[styles.agePill, age === a && styles.agePillActive]}
                >
                  <Text
                    variant="small"
                    style={{
                      fontWeight: '600',
                      color: age === a ? colors.primaryText : colors.textPrimary,
                    }}
                  >
                    {a}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Parent name */}
          <View style={styles.fieldBlock}>
            <Text variant="label" tone="muted" style={styles.fieldLabel}>
              Your name (parent / guardian)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Prathamesh"
              placeholderTextColor={colors.textMuted}
              value={parentName}
              onChangeText={setParentName}
              returnKeyType="done"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.actions}>
            <Button
              label="Create profile"
              onPress={handleCreate}
              disabled={!canSubmit}
            />
            <Pressable
              onPress={() => navigation.navigate('MainApp')}
              style={styles.skipRow}
              hitSlop={8}
            >
              <Text variant="small" tone="muted">
                Skip for now
              </Text>
            </Pressable>
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
  agePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  agePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  agePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  skipRow: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
});
