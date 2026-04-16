import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ProgressBar } from '../components/ProgressBar';
import { colors, radius, spacing } from '../theme';
import { mockStudent, mockTimeline } from '../data/mockStudent';
import {
  HwSubmissionPopup,
  HwSubmissionContext,
} from './journey/HwSubmissionPopup';

export function HomeScreen() {
  const s = mockStudent;
  const classPct = s.classesAttended / s.classesTotal;
  const greeting = greet();
  const [hwOpen, setHwOpen] = useState<HwSubmissionContext | null>(null);

  const openHw = () => {
    const pending = mockTimeline.find((t) => t.hw === 'pending');
    if (!pending) return;
    setHwOpen({ session: pending, currentHwStatus: 'pending' });
  };

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="small" tone="muted">
              {greeting}
            </Text>
            <Text variant="h1">{s.firstName}</Text>
          </View>
          <View style={styles.avatar}>
            <Text variant="bodyBold" tone="inverse">
              {s.firstName[0]}
            </Text>
          </View>
        </View>

        {/* Progress strip */}
        <Card style={styles.progressCard} onPress={() => {}}>
          <View style={styles.progressTop}>
            <View>
              <Text variant="label" tone="muted">
                Current journey
              </Text>
              <Text variant="h2" style={{ marginTop: 2 }}>
                {s.course}
              </Text>
              <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
                {s.joinedDate}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <ProgressBar value={classPct} />
            <View style={styles.statsRow}>
              <Stat value={`${s.classesAttended}/${s.classesTotal}`} label="Classes" />
              <Divider />
              <Stat value={`${s.hwSubmitted}/${s.hwTotal}`} label="Homework" />
              <Divider />
              <Stat value={`${s.quizzesDone}`} label="Quizzes" />
            </View>
          </View>
        </Card>

        {/* Priority 1: Homework pending */}
        {s.hwPending && (
          <Card style={styles.prioCard}>
            <View style={styles.prioHeader}>
              <Chip label="Homework" tone="warning" />
              <Text variant="small" tone="muted">
                Due {formatDate(s.hwPending.dueDate)}
              </Text>
            </View>
            <Text variant="h2" style={{ marginTop: spacing.sm }}>
              {s.hwPending.sessionTitle}
            </Text>
            <Text variant="body" tone="secondary" style={{ marginTop: 4 }}>
              Submit a photo of your drawing. Takes about {s.hwPending.estimateMin} minutes.
            </Text>
            <View style={styles.prioActions}>
              <Button label="Submit homework" onPress={openHw} />
            </View>
          </Card>
        )}

        {/* Priority 2: Next class */}
        {s.nextClassAt && (
          <Card onPress={() => {}}>
            <View style={styles.prioHeader}>
              <Chip label="Next class" />
              <Text variant="small" tone="muted">
                {relativeDay(s.nextClassAt)}
              </Text>
            </View>
            <Text variant="h3" style={{ marginTop: spacing.sm }}>
              Session 5 · Observation Basics
            </Text>
            <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
              {formatDateTime(s.nextClassAt)}
            </Text>
          </Card>
        )}

        {/* Engagement zone — placeholder cards */}
        <Text variant="label" tone="muted" style={styles.sectionLabel}>
          Today for you
        </Text>

        <Card compact onPress={() => {}}>
          <View style={styles.engRow}>
            <View style={styles.engIcon}>
              <Ionicons name="bulb-outline" size={20} color={colors.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyBold">Art GK · today</Text>
              <Text variant="small" tone="muted">
                3 new things to learn · swipe through
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>

        <Card compact onPress={() => {}}>
          <View style={styles.engRow}>
            <View style={styles.engIcon}>
              <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyBold">Quick draw</Text>
              <Text variant="small" tone="muted">
                Draw something that makes you feel fast
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <HwSubmissionPopup context={hwOpen} onClose={() => setHwOpen(null)} />
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="h3">{value}</Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return formatDate(iso);
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {},
  progressTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'flex-start',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  },
  prioCard: {},
  prioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prioActions: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: -spacing.xs,
  },
  engRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  engIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
