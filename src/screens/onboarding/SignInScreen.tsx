/**
 * Single screen handling Sign In + Sign Up via toggle.
 *
 * - Sign In: existing user (concierge OR self-serve) → MainApp / ProfileSetup
 * - Sign Up: new self-serve user → ProfileSetup
 *
 * Routing after auth happens in RootNavigator (auth state drives screens).
 */
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
import { useAuth } from '../../auth/AuthContext';

type Nav = NativeStackNavigationProp<RootNavigatorParamList, 'SignIn'>;
type Mode = 'sign-in' | 'sign-up';

export function SignInScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isSignUp = mode === 'sign-up';
  const canSubmit = email.trim().length > 3 && password.length >= 6 && !busy;

  const friendlyError = (code: string): string => {
    if (code.includes('user-not-found') || code.includes('invalid-credential'))
      return 'No account with that email and password. Try again or sign up.';
    if (code.includes('wrong-password')) return 'Wrong password. Try again or reset it.';
    if (code.includes('email-already-in-use'))
      return 'This email is already registered. Try signing in instead.';
    if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
    if (code.includes('invalid-email')) return 'That email looks invalid.';
    if (code.includes('network')) return 'Network problem. Check your connection.';
    return 'Something went wrong. Please try again.';
  };

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // RootNavigator will auto-redirect based on auth state.
    } catch (e: any) {
      setError(friendlyError(e?.code ?? ''));
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setInfo(null);
    if (email.trim().length < 3) {
      setError('Enter your email above first.');
      return;
    }
    try {
      await resetPassword(email);
      setInfo("Password reset email sent. Check your inbox.");
    } catch (e: any) {
      setError(friendlyError(e?.code ?? ''));
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
            <Text variant="h1">{isSignUp ? 'Create account' : 'Welcome back'}</Text>
            <Text variant="body" tone="secondary" style={{ marginTop: spacing.sm }}>
              {isSignUp
                ? "Sign up to start your child's art journey."
                : 'Sign in to continue.'}
            </Text>
          </View>

          <View style={styles.fieldBlock}>
            <Text variant="label" tone="muted" style={styles.fieldLabel}>
              Email
            </Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text variant="label" tone="muted" style={styles.fieldLabel}>
              Password
            </Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={canSubmit ? handleSubmit : undefined}
            />
          </View>

          {error && (
            <Text variant="small" style={styles.errorText}>
              {error}
            </Text>
          )}
          {info && (
            <Text variant="small" style={styles.infoText}>
              {info}
            </Text>
          )}

          <View style={styles.actions}>
            <Button
              label={busy ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
              onPress={handleSubmit}
              disabled={!canSubmit}
            />

            {!isSignUp && (
              <Pressable onPress={handleReset} hitSlop={8} style={styles.linkRow}>
                <Text variant="small" tone="muted">
                  Forgot password?
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                setMode(isSignUp ? 'sign-in' : 'sign-up');
                setError(null);
                setInfo(null);
              }}
              hitSlop={8}
              style={styles.linkRow}
            >
              <Text variant="small" tone="muted">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text
                  variant="small"
                  style={{ fontWeight: '700', color: colors.textPrimary }}
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing['5xl'],
    gap: spacing['2xl'],
  },
  headingBlock: { paddingTop: spacing.xl },
  fieldBlock: { gap: spacing.sm },
  fieldLabel: { marginBottom: spacing.xs },
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
  errorText: { color: '#B3261E' },
  infoText: { color: colors.textPrimary },
  actions: { gap: spacing.md, marginTop: spacing.sm },
  linkRow: { alignSelf: 'center', paddingVertical: spacing.xs },
});
