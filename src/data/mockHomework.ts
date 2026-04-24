/**
 * Loop 2 — Homework.
 *
 * Server-side ownership: each session has one HW. States flow:
 *   pending → submitted (on photo submit)
 *   submitted → reviewed (teacher feedback)
 * Points split:
 *   - On submit: +1 per skill participation (5 total) + +1 per skill on-time
 *     bonus if submitted before the next session (5 total).
 *   - On review: +N per skill from teacher ratings (1★→0, 5★→4).
 *
 * See docs/loops.md §"Loop 2 — Homework" for the full backend contract.
 *
 * In Pass 1 we fake that here. DevStateSwitcher triggers `submitHomework` and
 * `reviewHomework` on the active HW. Both call `creditPoints` and set reactive
 * flags so HomeScreen can open the celebration popups.
 *
 * Firestore wiring: swap the `_state` module with a subscription on
 * `homework/{hwId}` + aggregate `students/{id}.hasUnseenHWReview`; the per-HW
 * templates below become `homework/*` documents seeded by curriculum.
 */

import { useEffect, useReducer } from 'react';
import {
  creditPoints,
  CrossedThreshold,
  getSkillsState,
  setSkillsState,
  SkillType,
} from './mockSkills';
import { mockTimeline } from './mockStudent';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type HomeworkStatus =
  | 'pending'
  | 'submitted'
  | 'reviewed'
  | 'overdue_pending';

export interface HwAnnotation {
  id: number;
  /** 0-1 relative coords inside the annotated photo */
  x: number;
  y: number;
  note: string;
}

export interface HwReview {
  reviewedAt: string; // ISO
  annotations: HwAnnotation[];
  overallNote: string;
  /** 1–5 stars per skill */
  skillRatings: Partial<Record<SkillType, number>>;
  pointsAwarded: {
    participation: Partial<Record<SkillType, number>>;
    onTimeBonus: Partial<Record<SkillType, number>>;
    reviewPoints: Partial<Record<SkillType, number>>;
  };
}

export interface HwSubmission {
  photoUri: string;
  submittedAt: string;
  wasOnTime: boolean;
}

export interface Homework {
  id: string;
  sessionId: string;
  sessionNumber: number;
  title: string;
  description: string;
  referenceImageUrl: string | null;
  dueDate: string; // ISO date (start of day)
  estimateMin: number;
  status: HomeworkStatus;
  onTimeBonusAvailable: boolean;
  submission: HwSubmission | null;
  review: HwReview | null;
  /** Pre-baked teacher ratings used when review is simulated. */
  plannedRatings: Partial<Record<SkillType, number>>;
  /** Pre-baked annotations + overall note for the review popup. */
  plannedAnnotations: HwAnnotation[];
  plannedOverallNote: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed — one HW per session. Mirrors mockTimeline entries. In production these
// come from the curriculum template per `courseId`.
// ─────────────────────────────────────────────────────────────────────────────

const RATINGS_DEFAULT: Partial<Record<SkillType, number>> = {
  observation: 4,
  structure: 4,
  expression: 3,
  creativity: 3,
  problem_solving: 3,
};

function ratingsToReviewPoints(
  r: Partial<Record<SkillType, number>>,
): Partial<Record<SkillType, number>> {
  const out: Partial<Record<SkillType, number>> = {};
  (Object.keys(r) as SkillType[]).forEach((k) => {
    const stars = r[k] ?? 0;
    const pts = Math.max(0, stars - 1); // 1★=0, 5★=4
    if (pts > 0) out[k] = pts;
  });
  return out;
}

const _seed: Homework[] = [
  {
    id: 'hw_s1',
    sessionId: 's1',
    sessionNumber: 1,
    title: 'Lines & Strokes HW',
    description:
      'Fill one page with 20 different kinds of lines — short, long, curvy, zig-zag. Try not to repeat.',
    referenceImageUrl: null,
    dueDate: '2026-04-04',
    estimateMin: 20,
    status: 'reviewed',
    onTimeBonusAvailable: false,
    submission: {
      photoUri: '__mock_photo__',
      submittedAt: '2026-03-30T10:00:00+05:30',
      wasOnTime: true,
    },
    review: {
      reviewedAt: '2026-04-02T18:00:00+05:30',
      annotations: [
        { id: 1, x: 0.22, y: 0.3, note: 'Nice steady straight lines here.' },
        { id: 2, x: 0.6, y: 0.55, note: 'Try pressing lighter on curvy lines.' },
      ],
      overallNote:
        'Great variety! Keep practising loose wrist on the curved ones.',
      skillRatings: { observation: 3, structure: 4, expression: 3, creativity: 3, problem_solving: 3 },
      pointsAwarded: {
        participation: { observation: 1, structure: 1, expression: 1, creativity: 1, problem_solving: 1 },
        onTimeBonus: { observation: 1, structure: 1, expression: 1, creativity: 1, problem_solving: 1 },
        reviewPoints: { observation: 2, structure: 3, expression: 2, creativity: 2, problem_solving: 2 },
      },
    },
    plannedRatings: { observation: 3, structure: 4, expression: 3, creativity: 3, problem_solving: 3 },
    plannedAnnotations: [],
    plannedOverallNote: '',
  },
  {
    id: 'hw_s4',
    sessionId: 's4',
    sessionNumber: 4,
    title: 'Sketching Shapes HW',
    description:
      'Pick one object from your home (a cup, a toy, anything). Break it into basic shapes and draw it lightly, then clean it up with a darker stroke.',
    referenceImageUrl: null,
    dueDate: '2026-04-17',
    estimateMin: 20,
    status: 'pending',
    onTimeBonusAvailable: true,
    submission: null,
    review: null,
    plannedRatings: {
      observation: 4,
      structure: 5,
      expression: 3,
      creativity: 3,
      problem_solving: 3,
    },
    plannedAnnotations: [
      { id: 1, x: 0.28, y: 0.35, note: 'Good light construction — shapes show through.' },
      { id: 2, x: 0.62, y: 0.42, note: 'Proportion looks right; handle a touch long.' },
      { id: 3, x: 0.5, y: 0.78, note: 'Clean final stroke — try to ease off at the ends.' },
    ],
    plannedOverallNote:
      'Nicely built up from simple shapes. Your structure is really coming together!',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Reactive store
// ─────────────────────────────────────────────────────────────────────────────

export interface HomeworkState {
  hwById: Record<string, Homework>;
  /** Drives celebration popup when teacher just finished review. */
  unseenReviewHwId: string | null;
  /** Captured at review time — drained by LevelUpPopup after review popup closes. */
  pendingCrossing: CrossedThreshold | null;
}

function _initialState(): HomeworkState {
  const hwById: Record<string, Homework> = {};
  _seed.forEach((hw) => {
    hwById[hw.id] = hw;
  });
  return { hwById, unseenReviewHwId: null, pendingCrossing: null };
}

let _state: HomeworkState = _initialState();
const _subs = new Set<() => void>();

function setState(next: HomeworkState) {
  _state = next;
  _subs.forEach((fn) => fn());
}

export function getHomeworkState(): HomeworkState {
  return _state;
}

export function useHomeworkState(): HomeworkState {
  const [, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    _subs.add(force);
    return () => {
      _subs.delete(force);
    };
  }, []);
  return _state;
}

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────────────────────

/** The single HW that drives the Home HW card — the newest pending or submitted one. */
export function activeHomework(state: HomeworkState = _state): Homework | null {
  // Order by sessionNumber desc — newest first.
  const ordered = Object.values(state.hwById).sort(
    (a, b) => b.sessionNumber - a.sessionNumber,
  );
  for (const hw of ordered) {
    if (hw.status === 'pending' || hw.status === 'submitted') return hw;
  }
  // Fallback to the most-recently-reviewed so the card still links to feedback.
  return ordered.find((hw) => hw.status === 'reviewed') ?? null;
}

export function homeworkForSession(sessionId: string): Homework | undefined {
  return Object.values(_state.hwById).find((hw) => hw.sessionId === sessionId);
}

export function homeworkById(id: string): Homework | undefined {
  return _state.hwById[id];
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simulate the student tapping Submit. Credits participation + on-time bonus
 * and flips status → 'submitted'. Returns the captured level crossing (or null).
 */
export function submitHomework(
  hwId: string,
  photoUri: string,
): CrossedThreshold | null {
  const hw = _state.hwById[hwId];
  if (!hw) return null;
  if (hw.status === 'submitted' || hw.status === 'reviewed') return null;

  const wasOnTime = hw.onTimeBonusAvailable;
  const participation: Partial<Record<SkillType, number>> = {
    observation: 1,
    structure: 1,
    expression: 1,
    creativity: 1,
    problem_solving: 1,
  };
  const onTime: Partial<Record<SkillType, number>> = wasOnTime
    ? {
        observation: 1,
        structure: 1,
        expression: 1,
        creativity: 1,
        problem_solving: 1,
      }
    : {};

  // Credit participation + on-time in one pass so the +10 lands as a single
  // celebration (if a crossing happens, it's attributed to the submit event).
  const deltas: Partial<Record<SkillType, number>> = { ...participation };
  if (wasOnTime) {
    (Object.keys(onTime) as SkillType[]).forEach((k) => {
      deltas[k] = (deltas[k] ?? 0) + (onTime[k] ?? 0);
    });
  }
  const { nextState: nextSkills, crossed } = creditPoints(getSkillsState(), {
    source: `HW submitted · Session ${hw.sessionNumber}${
      wasOnTime ? ' (on time)' : ''
    }`,
    sourceType: wasOnTime ? 'hw_on_time_bonus' : 'hw_participation',
    deltas,
    date: new Date().toISOString().slice(0, 10),
    entryIdPrefix: `hw-${hwId}-submit`,
  });
  setSkillsState(nextSkills);

  // Mutate HW status + stash submission
  const next: Homework = {
    ...hw,
    status: 'submitted',
    onTimeBonusAvailable: false, // consumed
    submission: {
      photoUri,
      submittedAt: new Date().toISOString(),
      wasOnTime,
    },
  };
  // Also sync the legacy timeline `hw` field so TimelineTab / SessionPopup
  // show a consistent "under_review" state on the session card.
  const session = mockTimeline.find((s) => s.id === hw.sessionId);
  if (session) session.hw = 'under_review';

  setState({
    ..._state,
    hwById: { ..._state.hwById, [hwId]: next },
  });
  return crossed;
}

/**
 * Simulate the teacher reviewing the HW. Credits review points (from planned
 * ratings), flips status → 'reviewed', flags the unseen-review so HomeScreen
 * opens HWReviewPopup on next render.
 */
export function reviewHomework(hwId: string): CrossedThreshold | null {
  const hw = _state.hwById[hwId];
  if (!hw) return null;
  if (hw.status !== 'submitted') return null;

  const ratings = hw.plannedRatings ?? RATINGS_DEFAULT;
  const reviewPoints = ratingsToReviewPoints(ratings);

  const { nextState: nextSkills, crossed } = creditPoints(getSkillsState(), {
    source: `HW reviewed · Session ${hw.sessionNumber}`,
    sourceType: 'hw_review',
    deltas: reviewPoints,
    date: new Date().toISOString().slice(0, 10),
    entryIdPrefix: `hw-${hwId}-review`,
  });
  setSkillsState(nextSkills);

  const review: HwReview = {
    reviewedAt: new Date().toISOString(),
    annotations: hw.plannedAnnotations,
    overallNote: hw.plannedOverallNote,
    skillRatings: ratings,
    pointsAwarded: {
      participation: {
        observation: 1,
        structure: 1,
        expression: 1,
        creativity: 1,
        problem_solving: 1,
      },
      onTimeBonus: hw.submission?.wasOnTime
        ? {
            observation: 1,
            structure: 1,
            expression: 1,
            creativity: 1,
            problem_solving: 1,
          }
        : {},
      reviewPoints,
    },
  };

  const next: Homework = { ...hw, status: 'reviewed', review };
  const session = mockTimeline.find((s) => s.id === hw.sessionId);
  if (session) session.hw = 'reviewed';

  setState({
    ..._state,
    hwById: { ..._state.hwById, [hwId]: next },
    unseenReviewHwId: hwId,
    pendingCrossing: crossed,
  });
  return crossed;
}

/** Clears the unseen-review flag. Does NOT clear pending crossing. */
export function dismissHwReview(): void {
  if (_state.unseenReviewHwId === null) return;
  setState({ ..._state, unseenReviewHwId: null });
}

/** Drain (+clear) the pending crossing so LevelUpPopup can fire after review. */
export function drainHwCrossing(): CrossedThreshold | null {
  const c = _state.pendingCrossing;
  if (c) setState({ ..._state, pendingCrossing: null });
  return c;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dev helpers — surfaced in DevStateSwitcher.
// ─────────────────────────────────────────────────────────────────────────────

/** The next HW that can be submitted (for "Simulate submit" action). */
export function nextSubmittableHw(): Homework | null {
  const hw = activeHomework();
  return hw && hw.status === 'pending' ? hw : null;
}

/** The next HW that can be reviewed (for "Simulate teacher review"). */
export function nextReviewableHw(): Homework | null {
  const hw = activeHomework();
  return hw && hw.status === 'submitted' ? hw : null;
}
