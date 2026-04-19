import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../components/Text';
import { Button } from '../../components/Button';
import { colors, radius, spacing } from '../../theme';
import { mockStudent } from '../../data/mockStudent';

const WHATSAPP_MESSAGE_TEMPLATE = (studentName: string) =>
  `Hi! We've been sending ${studentName} to Prah Studio for drawing classes in Pune and honestly the progress has been wonderful. If you're looking for something like that for your kid, here's the link to book a trial class — they do it at ₹200 and the location is shared after booking. Let me know if you want the teacher's contact.`;

// Mock "earnings" — once backend wiring lands, pull from /referrals/{parentId}.
const MOCK_EARNINGS = {
  referred: 2,
  enrolled: 1,
  saved: 200,
};

export function ReferralScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim().length > 1 && phone.trim().length >= 8 && !submitted;

  const onSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    // In the real build this would POST to /referrals.
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
        <Text variant="h2">Refer a friend</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={[styles.card, styles.heroCard]}>
          <View style={styles.heroIcon}>
            <Ionicons name="gift-outline" size={22} color={colors.warning} />
          </View>
          <Text variant="h2" style={{ textAlign: 'center' }}>
            Get ₹200 off every time a friend joins
          </Text>
          <Text
            variant="small"
            tone="secondary"
            style={{ textAlign: 'center', marginTop: 4 }}
          >
            Rs.200 off your next renewal for every family that enrolls through you.
          </Text>
          <View style={{ marginTop: spacing.md, width: '100%' }}>
            <Button
              label="Share WhatsApp link"
              size="sm"
              onPress={() => {
                // In real build: Share.share with the pre-filled message + studio link.
              }}
            />
          </View>
        </View>

        {/* Pre-filled message preview */}
        <View style={styles.card}>
          <Text variant="h3" style={{ marginBottom: 4 }}>
            Pre-filled message
          </Text>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing.sm }}>
            Goes out when you tap Share.
          </Text>
          <View style={styles.messageBox}>
            <Text variant="small" tone="secondary">
              {WHATSAPP_MESSAGE_TEMPLATE(mockStudent.firstName)}
            </Text>
          </View>
        </View>

        {/* Referral form */}
        <View style={styles.card}>
          <Text variant="h3" style={{ marginBottom: 4 }}>
            Know someone already?
          </Text>
          <Text variant="small" tone="muted" style={{ marginBottom: spacing.md }}>
            Share their name and we'll reach out directly. You still get the ₹200
            when they enroll.
          </Text>

          <Text variant="caption" tone="muted" style={styles.fieldLabel}>
            Parent's name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Priya Shah"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            editable={!submitted}
          />

          <Text
            variant="caption"
            tone="muted"
            style={[styles.fieldLabel, { marginTop: spacing.md }]}
          >
            Phone number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit Indian number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            style={styles.input}
            editable={!submitted}
          />

          <View style={{ marginTop: spacing.md }}>
            <Button
              label={submitted ? 'Submitted — we\'ll call them' : 'Submit'}
              onPress={onSubmit}
              size="sm"
              variant={submitted ? 'secondary' : 'primary'}
            />
          </View>
        </View>

        {/* How it works */}
        <View style={styles.card}>
          <Text variant="h3" style={{ marginBottom: spacing.md }}>
            How it works
          </Text>
          <Step n={1} text="Share your link or add a friend's details here." />
          <Step n={2} text="They book a ₹200 demo class and attend." />
          <Step n={3} text="Once they enroll, ₹200 comes off your next renewal." />
        </View>

        {/* Earnings */}
        <View style={styles.card}>
          <Text variant="h3" style={{ marginBottom: spacing.md }}>
            Your referrals
          </Text>
          <View style={styles.earningsRow}>
            <Stat label="Referred" value={`${MOCK_EARNINGS.referred}`} />
            <Stat label="Enrolled" value={`${MOCK_EARNINGS.enrolled}`} />
            <Stat label="Saved" value={`₹${MOCK_EARNINGS.saved}`} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNum}>
        <Text variant="caption" style={{ fontWeight: '700' }}>
          {n}
        </Text>
      </View>
      <Text variant="body" tone="secondary" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="number">{value}</Text>
      <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
        {label}
      </Text>
    </View>
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
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: 'rgba(209, 141, 30, 0.06)',
    borderColor: colors.warning,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(209, 141, 30, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  messageBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  fieldLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
    marginBottom: 4,
  } as any,
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 44,
    outlineWidth: 0,
  } as any,

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
});
