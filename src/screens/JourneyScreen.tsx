import React, { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { SubTabs } from '../components/SubTabs';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { colors, radius, spacing } from '../theme';
import {
  mockStudent,
  mockTasks,
  mockTimeline,
  Peer,
  TimelineSession,
  TimelineTask,
} from '../data/mockStudent';
import { TimelineTab } from './journey/TimelineTab';
import { PeersTab } from './journey/PeersTab';
import { MyWorkTab } from './journey/MyWorkTab';
import { SessionPopup } from './journey/SessionPopup';
import { PeerPopup } from './journey/PeerPopup';
import { SessionSummaryPopup } from '../components/SessionSummaryPopup';
import { sessionAwardsFor } from '../data/mockSessions';
import {
  HwSubmissionPopup,
  HwSubmissionContext,
} from './journey/HwSubmissionPopup';
import { QuizScreen } from './journey/QuizScreen';
import { GkCarouselScreen } from './journey/GkCarouselScreen';
import { VenueCard } from './journey/VenueCard';
import { FullImagePopover } from './profile/FullImageView';
import { creditQuizCompletion, findQuizForTask, Quiz } from '../data/mockQuizzes';
import { creditGkCompletion, mockGkToday } from '../data/mockGkCarousel';
import { ChatScreen } from './ChatScreen';
import { SketchbookCTA } from './journey/SketchbookCTA';
import { SketchbookUploadPopup } from './journey/SketchbookUploadPopup';
import {
  reviewsLeftThisWeek,
  submitSketchbook,
  useSketchbookState,
} from '../data/mockSketchbook';

type SubKey = 'timeline' | 'peers' | 'mywork';

const SUB_TABS: { key: SubKey; label: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'peers', label: 'Peers' },
  { key: 'mywork', label: 'My work' },
];

export function JourneyScreen() {
  const s = mockStudent;
  const [active, setActive] = useState<SubKey>('timeline');
  const [sessionOpen, setSessionOpen] = useState<TimelineSession | null>(null);
  // Post-class summary popup — Loop 1 re-open flow. Tapping any attended
  // timeline session card opens the same summary the student saw post-class.
  const [sessionSummaryOpen, setSessionSummaryOpen] =
    useState<TimelineSession | null>(null);
  const [peerOpen, setPeerOpen] = useState<Peer | null>(null);
  const [hwOpen, setHwOpen] = useState<HwSubmissionContext | null>(null);
  // HW tasks (and their owning sessions) submitted during this browsing session.
  const [submittedSessionIds, setSubmittedSessionIds] = useState<Set<string>>(new Set());
  // The task ID to celebrate (just submitted) — cleared after the animation finishes.
  const [celebrateTaskId, setCelebrateTaskId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  // Quiz state — active quiz + task id + set of completed task ids so the
  // timeline checkmark sticks after the user finishes the quiz.
  const [activeQuiz, setActiveQuiz] = useState<{ quiz: Quiz; taskId: string } | null>(null);
  const [completedQuizTaskIds, setCompletedQuizTaskIds] = useState<Set<string>>(new Set());
  // GK carousel state — active task id + set of completed GK task ids.
  const [activeGkTaskId, setActiveGkTaskId] = useState<string | null>(null);
  const [completedGkTaskIds, setCompletedGkTaskIds] = useState<Set<string>>(new Set());
  // Artwork popover state — shared across MyWorkTab, SessionPopup, PeerPopup.
  const [openArtworkId, setOpenArtworkId] = useState<string | null>(null);
  // Outer scroll ref — timeline auto-scrolls to today's row on first mount.
  const scrollRef = useRef<ScrollView>(null);

  // Loop 4 — Sketchbook.
  const sbState = useSketchbookState();
  const sbReviewsLeft = reviewsLeftThisWeek(sbState);
  const [sbUploadOpen, setSbUploadOpen] = useState(false);

  const openHwForTask = (t: TimelineTask) => {
    // Prefer the task's explicit sessionId; otherwise match by same-date attended session.
    const session =
      (t.sessionId && mockTimeline.find((s) => s.id === t.sessionId)) ||
      mockTimeline.find((s) => s.date === t.date && s.status === 'attended');
    if (!session) return;
    const alreadySubmitted = submittedSessionIds.has(session.id);
    setHwOpen({
      session,
      currentHwStatus: alreadySubmitted ? 'under_review' : session.hw,
    });
  };

  const onHwSubmitted = ({ sessionId }: { sessionId: string }) => {
    setSubmittedSessionIds((prev) => {
      const next = new Set(prev);
      next.add(sessionId);
      return next;
    });
    // Start the celebration after the popup has auto-closed (~1.4s) so the user
    // actually sees the glow appear on the timeline card, not while the sheet
    // is still covering it.
    const task = mockTasks.find((t) => t.kind === 'hw' && t.sessionId === sessionId);
    if (task) {
      // Start celebration after the popup finishes auto-closing (~1.4s).
      setTimeout(() => setCelebrateTaskId(task.id), 1500);
      // Animation ~2.22s (glow 320 + hold 1400 + fade 500). Clear a bit after that.
      setTimeout(() => setCelebrateTaskId(null), 4000);
    }
  };

  // Task IDs whose owning session was just submitted — show them as Completed in timeline.
  // Also include quizzes completed this session.
  const completedTaskIds = new Set<string>([
    ...mockTasks
      .filter((t) => t.kind === 'hw' && t.sessionId && submittedSessionIds.has(t.sessionId))
      .map((t) => t.id),
    ...Array.from(completedQuizTaskIds),
    ...Array.from(completedGkTaskIds),
  ]);

  const openQuizForTask = (t: TimelineTask) => {
    const quiz = findQuizForTask(t.sessionId);
    if (!quiz) return;
    setActiveQuiz({ quiz, taskId: t.id });
  };

  const openGkForTask = (t: TimelineTask) => {
    setActiveGkTaskId(t.id);
  };

  return (
    <Screen padded={false}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.courseRow}>
            <ImagePlaceholder
              style={{ width: 56, height: 56 }}
              rounded="lg"
              iconSize={22}
            />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text variant="h2">{s.course}</Text>
            </View>
            <Pressable
              onPress={() => setChatOpen(true)}
              style={({ pressed }) => [
                styles.chatBtn,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel="Chat"
              accessibilityRole="button"
              hitSlop={8}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color={colors.textPrimary}
              />
              <View style={styles.chatDot} />
            </Pressable>
          </View>

          <View style={styles.stats}>
            <Stat value={`${s.classesAttended}`} label="Classes done" />
            <Divider />
            <Stat value={`${s.hwSubmitted}/${s.hwTotal}`} label="HW submitted" />
            <Divider />
            <Stat value={`${s.quizzesDone}`} label="Quizzes" />
          </View>

          <VenueCard venue={s.venue} />

          <SketchbookCTA
            reviewsLeftThisWeek={sbReviewsLeft}
            onPress={() => setSbUploadOpen(true)}
          />
        </View>

        {/* Sticky sub-tabs */}
        <View style={styles.subTabsWrap}>
          <SubTabs tabs={SUB_TABS} active={active} onChange={setActive} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {active === 'timeline' && (
            <TimelineTab
              scrollRef={scrollRef}
              onTapSession={(sess) => {
                // Loop 1: re-open the post-class summary for completed
                // sessions. Upcoming/missed still open the legacy
                // SessionPopup (peer works + concepts view) for now.
                if (sess.status === 'attended') {
                  setSessionSummaryOpen(sess);
                } else {
                  setSessionOpen(sess);
                }
              }}
              onTapHwTask={openHwForTask}
              onTapQuizTask={openQuizForTask}
              onTapGkTask={openGkForTask}
              extraCompletedTaskIds={completedTaskIds}
              justSubmittedHwTaskId={celebrateTaskId}
              onTapNotThere={() => setChatOpen(true)}
            />
          )}
          {active === 'peers' && <PeersTab onTapPeer={(p) => setPeerOpen(p)} />}
          {active === 'mywork' && (
            <MyWorkTab onTapArtwork={(id) => setOpenArtworkId(id)} />
          )}
        </View>
      </ScrollView>

      <SessionPopup
        session={sessionOpen}
        onClose={() => setSessionOpen(null)}
        onTapArtwork={(id) => setOpenArtworkId(id)}
      />
      <SessionSummaryPopup
        session={sessionSummaryOpen}
        awards={
          sessionSummaryOpen ? sessionAwardsFor(sessionSummaryOpen.id) : {}
        }
        fresh={false}
        onClose={() => setSessionSummaryOpen(null)}
      />
      <PeerPopup
        peer={peerOpen}
        onClose={() => setPeerOpen(null)}
        onTapArtwork={(id) => setOpenArtworkId(id)}
      />
      <HwSubmissionPopup
        context={hwOpen}
        onClose={() => setHwOpen(null)}
        onSubmitted={onHwSubmitted}
      />

      <Modal
        visible={chatOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setChatOpen(false)}
      >
        <ChatScreen onClose={() => setChatOpen(false)} />
      </Modal>

      <Modal
        visible={!!activeQuiz}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveQuiz(null)}
      >
        {activeQuiz && (
          <QuizScreen
            quiz={activeQuiz.quiz}
            onClose={() => setActiveQuiz(null)}
            onComplete={(answers) => {
              // Loop 3: credit points for correct answers.
              creditQuizCompletion(activeQuiz.quiz, answers);
              setCompletedQuizTaskIds((prev) => {
                const next = new Set(prev);
                next.add(activeQuiz.taskId);
                return next;
              });
            }}
          />
        )}
      </Modal>

      <FullImagePopover
        artworkId={openArtworkId}
        onClose={() => setOpenArtworkId(null)}
      />

      <SketchbookUploadPopup
        visible={sbUploadOpen}
        reviewsLeftThisWeek={sbReviewsLeft}
        onClose={() => setSbUploadOpen(false)}
        onSubmit={({ photoUri, title }) => {
          submitSketchbook({ photoUri, title });
        }}
      />

      <Modal
        visible={!!activeGkTaskId}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setActiveGkTaskId(null)}
      >
        {activeGkTaskId && (
          <GkCarouselScreen
            carousel={mockGkToday}
            onClose={() => setActiveGkTaskId(null)}
            onComplete={() => {
              // Loop 3: credit +3 split across observation/creativity/problem_solving.
              creditGkCompletion(mockGkToday);
              setCompletedGkTaskIds((prev) => {
                const next = new Set(prev);
                next.add(activeGkTaskId);
                return next;
              });
            }}
          />
        )}
      </Modal>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="h3">{value}</Text>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.bg,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: spacing.sm,
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
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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
  subTabsWrap: {
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
});
