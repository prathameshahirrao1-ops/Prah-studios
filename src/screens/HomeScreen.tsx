// Spec:
//   - docs/spec/ui-map/home-screen.md
//

import React, { useState } from 'react';
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
import { RecentWorkBlock } from './home/RecentWorkBlock';
import { ExplorerJourneysBlock } from './home/ExplorerJourneysBlock';
import { GkCarouselScreen } from './journey/GkCarouselScreen';
import { creditGkCompletion, mockGkToday } from '../data/mockGkCarousel';
import { ChatScreen } from './ChatScreen';
import { FullImagePopover } from './profile/FullImageView';
import {
  DEV_PRESETS,
  evaluateHomeState,
  HomeStateKey,
} from '../data/homeState';
import { SessionSummaryPopup } from '../components/SessionSummaryPopup';
import { LevelUpPopup } from '../components/LevelUpPopup';
import { HWReviewPopup } from '../components/HWReviewPopup';
import { SketchbookReviewPopup } from '../components/SketchbookReviewPopup';
import {
  dismissSketchbookReview,
  drainSketchbookCrossing,
  sketchbookById,
  useSketchbookState,
} from '../data/mockSketchbook';
import {
  dismissSessionSummary,
  drainPendingCrossing,
  findSession,
  sessionAwardsFor,
  useSessionFlags,
} from '../data/mockSessions';
import {
  activeHomework,
  dismissHwReview,
  drainHwCrossing,
  homeworkById,
  submitHomework,
  useHomeworkState,
} from '../data/mockHomework';
import type { CrossedThreshold } from '../data/mockSkills';

export function HomeScreen() {
  const s = mockStudent;
  const greeting = greet();
  const [hwOpen, setHwOpen] = useState<HwSubmissionContext | null>(null);
  const [forcedState, setForcedState] = useState<HomeStateKey | 'auto'>('auto');
  const [gkOpen, setGkOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [openArtworkId, setOpenArtworkId] = useState<string | null>(null);
  const rootNav = useNavigation<NavigationProp<RootTabParamList>>();

  // Loop 1: post-class celebration. When DevStateSwitcher (or a server cron)
  // flips a session to completed, `unseenCompletedSessionId` wakes us up and
  // we open the SessionSummaryPopup. On close we drain any overall-level
  // crossing and chain into LevelUpPopup.
  const sessionFlags = useSessionFlags();
  const unseenSession = sessionFlags.unseenCompletedSessionId
    ? findSession(sessionFlags.unseenCompletedSessionId) ?? null
    : null;
  const [levelUp, setLevelUp] = useState<CrossedThreshold | null>(null);

  // Loop 2: HW review celebration. When DevStateSwitcher (or the server)
  // flips a submitted HW to reviewed, `unseenReviewHwId` is set and we open
  // HWReviewPopup. On close we drain the HW-specific crossing and chain to
  // LevelUpPopup (same pattern as the session-summary → level-up chain).
  const hwState = useHomeworkState();
  const unseenReviewHw = hwState.unseenReviewHwId
    ? homeworkById(hwState.unseenReviewHwId) ?? null
    : null;
  const hwCard = activeHomework(hwState);

  const handleSessionSummaryClose = () => {
    dismissSessionSummary();
    const crossed = drainPendingCrossing();
    if (crossed) setLevelUp(crossed);
  };

  const handleHwReviewClose = () => {
    dismissHwReview();
    const crossed = drainHwCrossing();
    if (crossed) setLevelUp(crossed);
  };

  // Loop 4: Sketchbook review celebration — same pattern.
  const sbState = useSketchbookState();
  const unseenSbPiece = sbState.unseenReviewId
    ? sketchbookById(sbState.unseenReviewId) ?? null
    : null;

  const handleSketchbookReviewClose = () => {
    dismissSketchbookReview();
    const crossed = drainSketchbookCrossing();
    if (crossed) setLevelUp(crossed);
  };

  const handleHwSubmitted = (payload: {
    sessionId: string;
    imageUri: string;
    pushToCommunity: boolean;
  }) => {
    // Find the HW for this session and call the store. LevelUp chaining on
    // submit is rare (participation only nets 10 pts) but we handle it anyway.
    const hw = Object.values(hwState.hwById).find(
      (h) => h.sessionId === payload.sessionId,
    );
    if (!hw) return;
    const crossed = submitHomework(hw.id, payload.imageUri);
    if (crossed) setLevelUp(crossed);
  };

  // Recompute on every render — cheap, and ensures session-store mutations
  // (status flip via completeSession) are reflected without stale memo.
  // `sessionFlags` is referenced so React knows Home re-renders when the
  // session store changes.
  void sessionFlags;
  const homeCtx = (() => {
    if (forcedState === 'auto') return evaluateHomeState();
    const ctx = evaluateHomeState(DEV_PRESETS[forcedState]);
    return { ...ctx, state: forcedState };
  })();

  const openHwPending = () => {
    if (!hwCard) return;
    const session = mockTimeline.find((t) => t.id === hwCard.sessionId);
    if (!session) return;
    setHwOpen({ session, currentHwStatus: session.hw ?? 'pending' });
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

        {homeCtx.state === 'hw_pending' && hwCard && hwCard.status === 'pending' && (
          <Card style={styles.prioCard}>
            <View style={styles.prioHeader}>
              <Chip label="Homework" tone="warning" />
              <Text variant="small" tone="muted">
                {formatHwDue(hwCard.dueDate, hwCard.estimateMin)}
              </Text>
            </View>
            <Text variant="h2" style={{ marginTop: spacing.sm }}>
              {hwCard.title}
            </Text>
            <Text variant="body" tone="secondary" style={{ marginTop: 4 }}>
              {hwCard.description}
            </Text>
            {hwCard.onTimeBonusAvailable && (
              <View style={styles.bonusChip}>
                <Ionicons name="flash" size={14} color={colors.warning} />
                <Text
                  variant="caption"
                  style={{ marginLeft: 4, fontWeight: '700' }}
                >
                  +5 on-time bonus
                </Text>
              </View>
            )}
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
          homeCtx.state !== 'post_class' &&
          hwCard &&
          hwCard.status === 'pending' && (
            <Pressable onPress={openHwPending}>
              <Card compact>
                <View style={styles.inlineHwRow}>
                  <View style={styles.hwDot} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyBold">
                      Homework pending · {hwCard.title}
                    </Text>
                    <Text variant="small" tone="muted">
                      {formatHwDue(hwCard.dueDate, hwCard.estimateMin)}
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

      <HwSubmissionPopup
        context={hwOpen}
        onClose={() => setHwOpen(null)}
        onSubmitted={handleHwSubmitted}
      />

      <Modal
        visible={gkOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setGkOpen(false)}
      >
        <GkCarouselScreen
          carousel={mockGkToday}
          onClose={() => setGkOpen(false)}
          onComplete={() => {
            // Loop 3: credit +3 split across observation/creativity/problem_solving.
            creditGkCompletion(mockGkToday);
          }}
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

      <SessionSummaryPopup
        session={unseenSession}
        awards={
          unseenSession ? sessionAwardsFor(unseenSession.id) : {}
        }
        fresh
        onClose={handleSessionSummaryClose}
      />

      <HWReviewPopup hw={unseenReviewHw} onClose={handleHwReviewClose} />

      <SketchbookReviewPopup
        piece={unseenSbPiece}
        onClose={handleSketchbookReviewClose}
      />

      <LevelUpPopup crossing={levelUp} onClose={() => setLevelUp(null)} />
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
  bonusChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: `${colors.warning}1A`,
  },
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
