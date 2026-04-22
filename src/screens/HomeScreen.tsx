import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootTabParamList } from '../navigation/RootTabs';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ProgressBar } from '../components/ProgressBar';
import { colors, radius, spacing } from '../theme';
import { mockStudent, mockTimeline } from '../data/mockStudent';
import { currentJourney, explorerJourneys } from '../data/mockJourneys';
import {
  HwSubmissionPopup,
  HwSubmissionContext,
} from './journey/HwSubmissionPopup';
import { LiveClassCard } from './home/LiveClassCard';
import { PostClassCard } from './home/PostClassCard';
import { DevStateSwitcher } from './home/DevStateSwitcher';
import { GkCarouselScreen } from './journey/GkCarouselScreen';
import { mockGkToday } from '../data/mockGkCarousel';
import {
  DEV_PRESETS,
  evaluateHomeState,
  HomeStateKey,
} from '../data/homeState';

export function HomeScreen() {
  const s = mockStudent;
  const classPct = s.classesAttended / s.classesTotal;
  const greeting = greet();
  const [hwOpen, setHwOpen] = useState<HwSubmissionContext | null>(null);
  const [forcedState, setForcedState] = useState<HomeStateKey | 'auto'>('auto');
  const [gkOpen, setGkOpen] = useState(false);
  const rootNav = useNavigation<NavigationProp<RootTabParamList>>();

  const homeCtx = useMemo(() => {
    if (forcedState === 'auto') return evaluateHomeState();
    // For forced states, pick the context matching the preset moment.
    const ctx = evaluateHomeState(DEV_PRESETS[forcedState]);
    // If the forced key differs (e.g. enrolled_idle still says hw_pending because
    // mock has HW), override the state explicitly so the demo works.
    return { ...ctx, state: forcedState };
  }, [forcedState]);

  const openHwPending = () => {
    const pending = mockTimeline.find((t) => t.hw === 'pending');
    if (!pending) return;
    setHwOpen({ session: pending, currentHwStatus: 'pending' });
  };

  const openHwForSession = (sessionId: string) => {
    const session = mockTimeline.find((t) => t.id === sessionId);
    if (!session) return;
    setHwOpen({ session, currentHwStatus: session.hw ?? 'pending' });
  };

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Dev switcher */}
        <DevStateSwitcher active={forcedState} onPick={setForcedState} />

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

        {/* Progress strip — always present */}
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

        {/* ── State-driven priority card ─────────────────────────── */}
        {homeCtx.state === 'class_ongoing' && homeCtx.liveSession && (
          <LiveClassCard
            session={homeCtx.liveSession}
            startTimeLabel="10:00 am"
          />
        )}

        {homeCtx.state === 'post_class' && homeCtx.justEndedSession && (
          <PostClassCard
            session={homeCtx.justEndedSession}
            onSubmitHw={() =>
              openHwForSession(homeCtx.justEndedSession!.id)
            }
          />
        )}

        {homeCtx.state === 'hw_pending' && s.hwPending && (
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
              <Button label="Submit homework" onPress={openHwPending} />
            </View>
          </Card>
        )}

        {homeCtx.state === 'enrolled_idle' && homeCtx.nextSession && (
          <Card style={styles.prioCard}>
            <View style={styles.prioHeader}>
              <Chip label="Up next" />
              <Text variant="small" tone="muted">
                {relativeDay(homeCtx.nextSession.date)}
              </Text>
            </View>
            <Text variant="h2" style={{ marginTop: spacing.sm }}>
              Session {homeCtx.nextSession.sessionNumber} · {homeCtx.nextSession.title}
            </Text>
            <Text variant="body" tone="secondary" style={{ marginTop: 4 }}>
              We'll send a reminder a day before. Until then — warm up with
              today's art GK or a quick draw.
            </Text>
          </Card>
        )}

        {/* ── Always-on: next class summary (when not already the priority) ─── */}
        {homeCtx.state !== 'enrolled_idle' &&
          homeCtx.state !== 'class_ongoing' &&
          homeCtx.nextSession && (
            <Card onPress={() => {}}>
              <View style={styles.prioHeader}>
                <Chip label="Next class" />
                <Text variant="small" tone="muted">
                  {relativeDay(homeCtx.nextSession.date)}
                </Text>
              </View>
              <Text variant="h3" style={{ marginTop: spacing.sm }}>
                Session {homeCtx.nextSession.sessionNumber} · {homeCtx.nextSession.title}
              </Text>
              <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
                {formatDateHeuristic(homeCtx.nextSession.date)}
              </Text>
            </Card>
          )}

        {/* Your journeys — hidden during class, otherwise always present */}
        {homeCtx.state !== 'class_ongoing' && (
          <JourneysHomeBlock
            onViewAll={() =>
              rootNav.navigate('Profile', { screen: 'Journeys' } as any)
            }
          />
        )}

        {/* Engagement zone — hidden during class, otherwise always present */}
        {homeCtx.state !== 'class_ongoing' && (
          <>
            <Text variant="label" tone="muted" style={styles.sectionLabel}>
              Today for you
            </Text>

            <Card compact onPress={() => setGkOpen(true)}>
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
          </>
        )}

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      <HwSubmissionPopup context={hwOpen} onClose={() => setHwOpen(null)} />

      <Modal
        visible={gkOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setGkOpen(false)}
      >
        <GkCarouselScreen
          carousel={mockGkToday}
          onClose={() => setGkOpen(false)}
          onComplete={() => {}}
        />
      </Modal>
    </Screen>
  );
}

function JourneysHomeBlock({ onViewAll }: { onViewAll: () => void }) {
  const nextAvailable = explorerJourneys.find((j) => j.status === 'available');
  return (
    <Card>
      <View style={styles.jHeader}>
        <Text variant="label" tone="muted">
          Your journeys
        </Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text variant="small" tone="secondary" style={{ fontWeight: '600' }}>
            Explore all ›
          </Text>
        </Pressable>
      </View>

      {currentJourney && (
        <Pressable onPress={onViewAll} style={styles.jRow}>
          <View style={[styles.jIcon, { backgroundColor: `${colors.warning}15` }]}>
            <Ionicons name="trail-sign-outline" size={18} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyBold">{currentJourney.title}</Text>
            <Text variant="caption" tone="muted">
              {currentJourney.duration} · {currentJourney.sessions} sessions
            </Text>
          </View>
          <View style={styles.jChip}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.warning }}>
              Enrolled
            </Text>
          </View>
        </Pressable>
      )}

      {currentJourney && nextAvailable && <View style={styles.jDivider} />}

      {nextAvailable && (
        <Pressable onPress={onViewAll} style={styles.jRow}>
          <View style={[styles.jIcon, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="sparkles-outline" size={18} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyBold">{nextAvailable.title}</Text>
            <Text variant="caption" tone="muted">
              {nextAvailable.duration} · {nextAvailable.dateAvailable}
            </Text>
          </View>
          <View style={styles.jChipNeutral}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.textSecondary }}>
              Upcoming
            </Text>
          </View>
        </Pressable>
      )}
    </Card>
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

function formatDateHeuristic(iso: string): string {
  const d = new Date(iso);
  // Session dates don't carry a time — show the date + class time (10:00 am).
  return (
    d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }) + ' · 10:00 am'
  );
}

function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (d.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
  );
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

  // Journeys block
  jHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  jRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  jIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  jChip: {
    backgroundColor: `${colors.warning}18`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  jChipNeutral: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  jDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 2,
  },
});
