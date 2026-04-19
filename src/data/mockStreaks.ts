/**
 * Streak + reward mock data.
 * Replaced with Firestore reads at the backend-wiring milestone.
 */

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
