// Spec:
//   - docs/spec/schema/session.md
//   - docs/spec/rules/loop-1-attendance.md
//

/**
 * Loop 1 — Class Attendance.
 *
 * Server-side ownership: when a session flips `live` → `completed` the server
 * credits pre-set curriculum skill points and sets `hasUnseenSessionSummary`
 * on the student account (see docs/loops.md §"Loop 1 — Backend contract").
 *
 * In Pass 1 we fake that here. DevStateSwitcher's "Complete next session"
 * calls `completeSession()`, which:
 *   - mutates mockTimeline entry status → 'attended'
 *   - calls `creditPoints` with the session's curriculum awards
 *   - sets `unseenCompletedSessionId` so HomeScreen opens the summary popup
 *   - captures the overall-level crossing (if any) so the popup chain can
 *     hand off to LevelUpPopup
 *
 * Firestore wiring: swap `SESSION_SKILL_AWARDS` for reads from
 * `sessions/{id}.skillAwards`; replace `_flags` with a Firestore subscription
 * on `students/{id}.hasUnseenSessionSummary` + `lastCompletedSessionId`.
 */

import { useEffect, useReducer } from 'react';
import {
  creditPoints,
  CrossedThreshold,
  getSkillsState,
  setSkillsState,
  SkillType,
} from './mockSkills';
import { mockTimeline, TimelineSession } from './mockStudent';

// ─────────────────────────────────────────────────────────────────────────────
// Per-session curriculum awards — pre-set per docs/loops.md §"Loop 3 — Point
// earning". Target ~20 pts/session, weighted toward what that session teaches.
// ─────────────────────────────────────────────────────────────────────────────

export const SESSION_SKILL_AWARDS: Record<
  string,
  Partial<Record<SkillType, number>>
> = {
  s1: { observation: 4, structure: 6, expression: 4, creativity: 3, problem_solving: 3 }, // Lines & Strokes · 20
  s2: { observation: 4, structure: 8, expression: 3, creativity: 3, problem_solving: 2 }, // Basic Shapes · 20
  s3: { observation: 5, structure: 7, expression: 3, creativity: 3, problem_solving: 2 }, // Shapes to Objects · 20
  s4: { observation: 5, structure: 6, expression: 4, creativity: 3, problem_solving: 2 }, // Sketching Shapes · 20
  s5: { observation: 7, structure: 5, expression: 4, creativity: 2, problem_solving: 2 }, // Observation Basics · 20
  s6: { observation: 8, structure: 5, expression: 3, creativity: 2, problem_solving: 2 }, // Observation — Still Life · 20
};

// ─────────────────────────────────────────────────────────────────────────────
// Reactive session-completion flags.
//
// Tiny pub-sub (same pattern as mockSkills' `useSkillsState`) — not a state
// library, just the minimum needed to wake HomeScreen up when the simulated
// server completes a session.
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionFlags {
  /** Non-null when a just-completed session is waiting for the student to open its summary. */
  unseenCompletedSessionId: string | null;
  /** Captured at completion-time; drained by LevelUpPopup after summary close. */
  pendingCrossing: CrossedThreshold | null;
}

const _initial: SessionFlags = {
  unseenCompletedSessionId: null,
  pendingCrossing: null,
};

let _flags: SessionFlags = _initial;
const _subs = new Set<() => void>();

function setFlags(next: SessionFlags) {
  _flags = next;
  _subs.forEach((fn) => fn());
}

export function getSessionFlags(): SessionFlags {
  return _flags;
}

export function useSessionFlags(): SessionFlags {
  const [, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    _subs.add(force);
    return () => {
      _subs.delete(force);
    };
  }, []);
  return _flags;
}

// ─────────────────────────────────────────────────────────────────────────────
// Completion mechanics — called from DevStateSwitcher (and, eventually, a
// real-time timer that triggers on session endTime).
// ─────────────────────────────────────────────────────────────────────────────

/** The next session eligible for completion — oldest upcoming one. */
export function nextUpcomingSession(): TimelineSession | undefined {
  return mockTimeline.find((s) => s.status === 'upcoming');
}

/**
 * Simulate the server flipping a session live→completed:
 *   1. Mutate timeline entry status → 'attended'
 *   2. creditPoints() against curriculum awards
 *   3. Flag unseen summary + crossing so UI can react
 */
export function completeSession(sessionId: string): CrossedThreshold | null {
  const session = mockTimeline.find((s) => s.id === sessionId);
  if (!session) return null;
  if (session.status === 'attended') return null;
  const awards = SESSION_SKILL_AWARDS[sessionId];
  if (!awards) return null;

  session.status = 'attended';

  const { nextState, crossed } = creditPoints(getSkillsState(), {
    source: `Class attended · Session ${session.sessionNumber}`,
    sourceType: 'session_attended',
    deltas: awards,
    date: session.date,
    entryIdPrefix: `session-${sessionId}`,
  });
  setSkillsState(nextState);

  setFlags({
    unseenCompletedSessionId: sessionId,
    pendingCrossing: crossed,
  });

  return crossed;
}

/** Clears the session summary flag. Does NOT clear the pending crossing. */
export function dismissSessionSummary(): void {
  if (_flags.unseenCompletedSessionId === null) return;
  setFlags({ ..._flags, unseenCompletedSessionId: null });
}

/**
 * Drain the pending crossing (return + clear). Call after LevelUpPopup closes
 * so the next tier/sub crossing can surface cleanly.
 */
export function drainPendingCrossing(): CrossedThreshold | null {
  const c = _flags.pendingCrossing;
  if (c) setFlags({ ..._flags, pendingCrossing: null });
  return c;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers — used by SessionSummaryPopup whether opened fresh or via
// Timeline re-tap on an already-attended session.
// ─────────────────────────────────────────────────────────────────────────────

export function findSession(id: string): TimelineSession | undefined {
  return mockTimeline.find((s) => s.id === id);
}

export function sessionAwardsFor(
  sessionId: string,
): Partial<Record<SkillType, number>> {
  return SESSION_SKILL_AWARDS[sessionId] ?? {};
}
