/**
 * Streak + reward state.
 *
 * Path: students/{uid}/streaks/current  (single doc, like skillState)
 *
 * Pub-sub store mirroring `mockSkills` so screens can subscribe via
 * `useStreaksData()` and re-render when the bridge hydrates from Firestore.
 */
import { useEffect, useReducer } from 'react';

export type StreakType = 'hw' | 'quiz' | 'gk';

export interface StreakBadge {
  id: string;
  streakType: StreakType;
  milestone: number;         // 3, 7, 21, 50
  earnedAt: string;          // ISO date
  title?: string;            // set when this badge unlocks a named title
}

export interface StreakData {
  hw: number;
  quiz: number;
  gk: number;
  badges: StreakBadge[];
  /** Highest-tier title currently held per streak type, if any. */
  titles: Partial<Record<StreakType, string>>;
}

export const mockStreaks: StreakData = {
  hw: 2,
  quiz: 3,
  gk: 5,
  badges: [
    { id: 'b_quiz_3', streakType: 'quiz', milestone: 3, earnedAt: '2026-04-12' },
    { id: 'b_gk_3', streakType: 'gk', milestone: 3, earnedAt: '2026-04-01' },
  ],
  titles: {
    gk: 'Daily Draw Cadet',   // 5-day starter title
  },
};

export const STREAK_LABEL: Record<StreakType, string> = {
  hw: 'HW streak',
  quiz: 'Quiz streak',
  gk: 'Daily streak',
};

// ─────────────────────────────────────────────────────────────────────────────
// Live store + subscription hook (same pattern as mockSkills).
// ─────────────────────────────────────────────────────────────────────────────

let _streaksState: StreakData = mockStreaks;
const _streaksSubscribers = new Set<() => void>();

export function getStreaksData(): StreakData {
  return _streaksState;
}

export function setStreaksData(next: StreakData) {
  _streaksState = next;
  _streaksSubscribers.forEach((fn) => fn());
}

/** Reactive read — re-renders the caller on every setStreaksData. */
export function useStreaksData(): StreakData {
  const [, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    _streaksSubscribers.add(force);
    return () => {
      _streaksSubscribers.delete(force);
    };
  }, []);
  return _streaksState;
}
