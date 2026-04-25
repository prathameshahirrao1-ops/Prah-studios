// Spec:
//   - docs/spec/schema/artwork.md
//

/**
 * Loop 4 — Sketchbook.
 *
 * Student-driven artwork uploads from Journey tab. Teacher reviews up to
 * **2 pieces per week** for skill points (up to 15 pts per piece), split
 * across skills by teacher star ratings. Extra pieces upload fine — they
 * just go straight to portfolio with 0 pts.
 *
 * State flow:
 *   (none) → submitted_pending_review → reviewed       (eligible for points)
 *   (none) → portfolio_only                            (weekly cap used)
 *
 * See docs/loops.md §"Loop 4 — Sketchbook" for the full backend contract.
 *
 * In Pass 1 we fake it here. DevStateSwitcher triggers `submitSketchbook`
 * and `reviewSketchbook`. Firestore wiring: swap `_state` with a
 * subscription on `sketchbook/{id}` + aggregate
 * `students/{id}.hasUnseenSketchbookReview`.
 */

import { useEffect, useReducer } from 'react';
import {
  creditPoints,
  CrossedThreshold,
  getSkillsState,
  setSkillsState,
  SkillType,
} from './mockSkills';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SketchbookStatus =
  | 'submitted_pending_review'
  | 'reviewed'
  | 'portfolio_only';

export interface SketchbookReview {
  reviewedAt: string;
  /** 1–5 stars per skill */
  skillRatings: Partial<Record<SkillType, number>>;
  /** Optional free-text remark from teacher. */
  remark: string | null;
  /** Final awarded points per skill — sum capped at 15. */
  pointsAwarded: Partial<Record<SkillType, number>>;
}

export interface SketchbookPiece {
  id: string;
  photoUri: string;
  title: string;
  submittedAt: string;
  /** Monday-based ISO week key, e.g. "2026-W17". Used for the weekly cap. */
  weekKey: string;
  status: SketchbookStatus;
  /** True only if eligible for points at submit time. */
  eligibleForPoints: boolean;
  review: SketchbookReview | null;
  /** Pre-baked ratings used when review is simulated via dev action. */
  plannedRatings: Partial<Record<SkillType, number>>;
  plannedRemark: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Week helpers
// ─────────────────────────────────────────────────────────────────────────────

/** ISO week key (Mon-starting). "2026-W17". */
export function weekKeyForDate(d: Date = new Date()): string {
  // Copy date, shift to Thursday of same week (ISO rule), then weeks from Jan 1.
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week =
    1 +
    Math.round(
      (date.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed — one already-reviewed piece from an earlier week so MyWork shows
// something; one portfolio-only piece to demonstrate the cap. Current week
// starts at 0 used so the student can submit a fresh one via the CTA.
// ─────────────────────────────────────────────────────────────────────────────

const PREV_WEEK = weekKeyForDate(
  new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
);

const _seed: SketchbookPiece[] = [
  {
    id: 'sb_seed_1',
    photoUri: '__mock_photo__',
    title: 'My cat in the morning',
    submittedAt: '2026-04-12T09:00:00+05:30',
    weekKey: PREV_WEEK,
    status: 'reviewed',
    eligibleForPoints: true,
    review: {
      reviewedAt: '2026-04-13T18:00:00+05:30',
      skillRatings: {
        observation: 4,
        structure: 3,
        expression: 4,
        creativity: 5,
        problem_solving: 3,
      },
      remark: 'Loved the way you caught the sleepy eyes. Keep experimenting with fur texture.',
      pointsAwarded: {
        observation: 3,
        structure: 2,
        expression: 3,
        creativity: 4,
        problem_solving: 2,
      },
    },
    plannedRatings: {
      observation: 4,
      structure: 3,
      expression: 4,
      creativity: 5,
      problem_solving: 3,
    },
    plannedRemark:
      'Loved the way you caught the sleepy eyes. Keep experimenting with fur texture.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Points calc — normalize star ratings into a total capped at 15, per skill.
// Formula: raw per skill = max(0, stars - 1). Then scale so grand total ≤ 15.
// ─────────────────────────────────────────────────────────────────────────────

const POINTS_CAP = 15;

function ratingsToAwards(
  r: Partial<Record<SkillType, number>>,
): Partial<Record<SkillType, number>> {
  const raw: Partial<Record<SkillType, number>> = {};
  (Object.keys(r) as SkillType[]).forEach((k) => {
    const stars = r[k] ?? 0;
    const pts = Math.max(0, stars - 1);
    if (pts > 0) raw[k] = pts;
  });
  const rawTotal = Object.values(raw).reduce((s, n) => s + (n ?? 0), 0);
  if (rawTotal <= POINTS_CAP) return raw;
  // Scale down proportionally, rounding, then fix any drift on the largest skill.
  const scaled: Partial<Record<SkillType, number>> = {};
  const keys = Object.keys(raw) as SkillType[];
  keys.forEach((k) => {
    scaled[k] = Math.round(((raw[k] ?? 0) * POINTS_CAP) / rawTotal);
  });
  let total = Object.values(scaled).reduce((s, n) => s + (n ?? 0), 0);
  // Adjust any rounding drift on the biggest skill.
  while (total !== POINTS_CAP && keys.length > 0) {
    const biggestKey = keys.reduce((best, k) =>
      (scaled[k] ?? 0) > (scaled[best] ?? 0) ? k : best,
    );
    if (total < POINTS_CAP) scaled[biggestKey] = (scaled[biggestKey] ?? 0) + 1;
    else scaled[biggestKey] = Math.max(0, (scaled[biggestKey] ?? 0) - 1);
    total = Object.values(scaled).reduce((s, n) => s + (n ?? 0), 0);
  }
  return scaled;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reactive store
// ─────────────────────────────────────────────────────────────────────────────

export interface SketchbookState {
  byId: Record<string, SketchbookPiece>;
  /** Drives celebration popup when teacher has reviewed a piece. */
  unseenReviewId: string | null;
  /** Captured at review time — drained by LevelUpPopup after review popup. */
  pendingCrossing: CrossedThreshold | null;
}

function _initialState(): SketchbookState {
  const byId: Record<string, SketchbookPiece> = {};
  _seed.forEach((sb) => {
    byId[sb.id] = sb;
  });
  return { byId, unseenReviewId: null, pendingCrossing: null };
}

let _state: SketchbookState = _initialState();
const _subs = new Set<() => void>();

function setState(next: SketchbookState) {
  _state = next;
  _subs.forEach((fn) => fn());
}

export function getSketchbookState(): SketchbookState {
  return _state;
}

export function useSketchbookState(): SketchbookState {
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

export function sketchbookById(id: string): SketchbookPiece | undefined {
  return _state.byId[id];
}

export function allSketchbookPieces(
  state: SketchbookState = _state,
): SketchbookPiece[] {
  return Object.values(state.byId).sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

/** Pieces belonging to the current week (counted against the cap). */
export function currentWeekPieces(
  state: SketchbookState = _state,
): SketchbookPiece[] {
  const wk = weekKeyForDate();
  return allSketchbookPieces(state).filter((sb) => sb.weekKey === wk);
}

/**
 * How many of this week's 2 point-eligible slots have been spent.
 * Both "submitted_pending_review" and "reviewed" count — either one uses
 * a slot.
 */
export function reviewsUsedThisWeek(state: SketchbookState = _state): number {
  return currentWeekPieces(state).filter((sb) => sb.eligibleForPoints).length;
}

export function reviewsLeftThisWeek(state: SketchbookState = _state): number {
  return Math.max(0, 2 - reviewsUsedThisWeek(state));
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new sketchbook piece. Eligibility decided at submit time based
 * on the weekly cap (2 point-earning pieces per week).
 */
export function submitSketchbook(input: {
  photoUri: string;
  title?: string;
}): SketchbookPiece {
  const id = `sb_${Date.now()}`;
  const wk = weekKeyForDate();
  const used = reviewsUsedThisWeek();
  const eligible = used < 2;

  const piece: SketchbookPiece = {
    id,
    photoUri: input.photoUri,
    title: input.title?.trim() || 'Untitled sketch',
    submittedAt: new Date().toISOString(),
    weekKey: wk,
    status: eligible ? 'submitted_pending_review' : 'portfolio_only',
    eligibleForPoints: eligible,
    review: null,
    // Pre-bake some ratings for the dev "review" action; teacher would
    // actually generate these in production.
    plannedRatings: {
      observation: 4,
      structure: 3,
      expression: 4,
      creativity: 4,
      problem_solving: 3,
    },
    plannedRemark: eligible
      ? 'Nice composition! Try varying your line weight next time.'
      : '',
  };

  setState({
    ..._state,
    byId: { ..._state.byId, [id]: piece },
  });
  return piece;
}

/**
 * Simulate the teacher returning a review. Credits points (capped at 15
 * total across skills) and sets the unseen-review flag so HomeScreen (or
 * JourneyScreen) can fire the celebration popup.
 */
export function reviewSketchbook(id: string): CrossedThreshold | null {
  const sb = _state.byId[id];
  if (!sb) return null;
  if (sb.status !== 'submitted_pending_review') return null;

  const ratings = sb.plannedRatings;
  const awards = ratingsToAwards(ratings);

  const { nextState: nextSkills, crossed } = creditPoints(getSkillsState(), {
    source: `Sketchbook reviewed · ${sb.title}`,
    sourceType: 'sketchbook_review',
    deltas: awards,
    date: new Date().toISOString().slice(0, 10),
    entryIdPrefix: `sb-${id}-review`,
  });
  setSkillsState(nextSkills);

  const review: SketchbookReview = {
    reviewedAt: new Date().toISOString(),
    skillRatings: ratings,
    remark: sb.plannedRemark || null,
    pointsAwarded: awards,
  };

  const next: SketchbookPiece = { ...sb, status: 'reviewed', review };

  setState({
    ..._state,
    byId: { ..._state.byId, [id]: next },
    unseenReviewId: id,
    pendingCrossing: crossed,
  });
  return crossed;
}

/** Clears the unseen-review flag. Does NOT clear pending crossing. */
export function dismissSketchbookReview(): void {
  if (_state.unseenReviewId === null) return;
  setState({ ..._state, unseenReviewId: null });
}

/** Drain (+clear) the pending crossing so LevelUpPopup can fire after review. */
export function drainSketchbookCrossing(): CrossedThreshold | null {
  const c = _state.pendingCrossing;
  if (c) setState({ ..._state, pendingCrossing: null });
  return c;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dev helpers — surfaced in DevStateSwitcher.
// ─────────────────────────────────────────────────────────────────────────────

/** The next sketchbook piece that can be reviewed. */
export function nextReviewableSketchbook(): SketchbookPiece | null {
  const all = allSketchbookPieces();
  return all.find((sb) => sb.status === 'submitted_pending_review') ?? null;
}
