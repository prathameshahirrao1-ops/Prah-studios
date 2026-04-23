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
import { colors, radius, spacing } from '../theme';
import { mockStudent, mockTimeline } from '../data/mockStudent';
import { formatHwDue } from '../utils/formatHw';
import {
  HwSubmissionPopup,
  HwSubmissionContext,
} from './journey/HwSubmissionPopup';
import { LiveClassCard } from './home/LiveClassCard';
import { PostClassCard } from './home/PostClassCard';
import { DevStateSwitcher } from './home/DevStateSwitcher';
import { NextClassCard } from './home/NextClassCard';
import { TeacherBlock } from './home/TeacherBlock';
import { RecentWorkBlock } from './home/RecentWorkBlock';
import { ExplorerJourneysBlock } from './home/ExplorerJourneysBlock';
import { GkCarouselScreen } from './journey/GkCarouselScreen';
import { mockGkToday } from '../data/mockGkCarousel';
import { ChatScreen } from './ChatScreen';
import { FullImagePopover } from './profile/FullImageView';
import {
  DEV_PRESETS,
  evaluateHomeState,
  HomeStateKey,
} from '../data/homeState';

export function HomeScreen() {
  const s = mockStudent;
  const greeting = greet();
  const [hwOpen, setHwOpen] = useState<HwSubmissionContext | null>(null);
  const [forcedState, setForcedState] = useState<HomeStateKey | 'auto'>('auto');
  const [gkOpen, setGkOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [openArtworkId, setOpenArtworkId] = useState<string | null>(null);
  const rootNav = useNavigation<NavigationProp<RootTabParamList>>();

  const homeCtx = useMemo(() => {
    if (forcedState === 'auto') return evaluateHomeState();
    const ctx = evaluateHomeState(DEV_PRESETS[forcedState]);
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
        <DevStateSwitcher active={forcedState} onPick={setForcedState} />

        {/* Header: greeting + name (left) · chat + avatar (right) */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="small" tone="muted">
              {greeting}
            </Text>
            <Text variant="h1">{s.firstName}</Text>
          </View>
          <Pressable
            onPress={() => setChatOpen(true)}
            style={({ pressed }) => [
              styles.chatBtn,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel="Chat"
            hitSlop={8}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color={colors.textPrimary}
            />
            <View style={styles.chatDot} />
          </Pressable>
          <View style={styles.avatar}>
            <Text variant="bodyBold" tone="inverse">
              {s.firstName[0]}
            </Text>
          </View>
        </View>

        {/* ── Priority card ───────────────────────────────────────────── */}
        {homeCtx.state === 'class_ongoing' && homeCtx.liveSession && (
          <LiveClassCard session={homeCtx.liveSession} startTimeLabel="10:00 am" />
        )}

        {homeCtx.state === 'post_class' && homeCtx.justEndedSession && (
          <PostClassCard
            session={homeCtx.justEndedSession}
            onSubmitHw={() => openHwForSession(homeCtx.justEndedSession!.id)}
          />
        )}

        {homeCtx.state === 'hw_pending' && s.hwPending && (
          <Card style={styles.prioCard}>
            <View style={styles.prioHeader}>
              <Chip label="Homework" tone="warning" />
              <Text variant="small" tone="muted">
                {formatHwDue(s.hwPending.dueDate, s.hwPending.estimateMin)}
              </Text>
            </View>
            <Text variant="h2" style={{ marginTop: spacing.sm }}>
              {s.hwPending.sessionTitle}
            </Text>
            <Text variant="body" tone="secondary" style={{ marginTop: 4 }}>
              Submit a photo of your drawing.
            </Text>
            <View style={styles.prioActions}>
              <Button label="Submit homework" onPress={openHwPending} />
            </View>
          </Card>
        )}

        {/* ── Next class (always-on, not during class_ongoing) ───────── */}
        {homeCtx.state !== 'class_ongoing' && homeCtx.nextSession && (
          <NextClassCard
            session={homeCtx.nextSession}
            onNotComing={() => setChatOpen(true)}
            onOpen={() =>
              rootNav.navigate('Journey' as any)
            }
          />
        )}

        {/* ── HW inline nudge (only when HW is NOT the priority) ─────── */}
        {homeCtx.state !== 'hw_pending' &&
          homeCtx.state !== 'class_ongoing' &&
          s.hwPending && (
            <Pressable onPress={openHwPending}>
              <Card compact>
                <View style={styles.inlineHwRow}>
                  <View style={styles.hwDot} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyBold">
                      Homework pending · {s.hwPending.sessionTitle}
                    </Text>
                    <Text variant="small" tone="muted">
                      {formatHwDue(s.hwPending.dueDate, s.hwPending.estimateMin)}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textMuted}
                  />
                </View>
              </Card>
            </Pressable>
          )}

        {/* ── Teacher block ──────────────────────────────────────────── */}
        {homeCtx.state !== 'class_ongoing' && (
          <TeacherBlock onTap={() => setChatOpen(true)} />
        )}

        {/* ── Recent work / proof of learning ────────────────────────── */}
        {homeCtx.state !== 'class_ongoing' && (
          <RecentWorkBlock
            onTapArtwork={(id) => setOpenArtworkId(id)}
            onTapJourney={() => rootNav.navigate('Journey' as any)}
          />
        )}

        {/* ── Explorer journeys (cover-image cards) ──────────────────── */}
        {homeCtx.state !== 'class_ongoing' && (
          <ExplorerJourneysBlock
            onViewAll={() =>
              rootNav.navigate('Profile', { screen: 'Journeys' } as any)
            }
          />
        )}

        {/* ── Today for you ──────────────────────────────────────────── */}
        {homeCtx.state !== 'class_ongoing' && (
          <View style={styles.todayWrap}>
            <Text variant="label" tone="muted">
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
          </View>
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

      <Modal
        visible={chatOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setChatOpen(false)}
      >
        <ChatScreen onClose={() => setChatOpen(false)} />
      </Modal>

      <FullImagePopover
        artworkId={openArtworkId}
        onClose={() => setOpenArtworkId(null)}
      />
    </Screen>
  );
}

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
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
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.surface,
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
  inlineHwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hwDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  todayWrap: {
    gap: spacing.sm,
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
