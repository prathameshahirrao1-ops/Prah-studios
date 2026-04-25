// Spec:
//   - docs/spec/schema/skill.md
//   - docs/spec/rules/loop-5-level-up.md
//

/**
 * Skill map — Loop 3 (shared endpoint).
 *
 * 5 skills accumulate raw points. Points SUM into one overall level
 * on a 10-tier × 3-sub-level ladder (plus Grandmaster).
 *
 * See docs/loops.md §"Loop 3 — Skill Growth" for the full design.
 *
 * Point sources (all call `creditPoints`):
 *   - Loop 1 (Class Attendance): pre-set curriculum awards on session-completed
 *   - Loop 2 (Homework): 5 participation on submit + 5 on-time bonus + teacher review
 *   - Loop 4 (Sketchbook): up to 15 pts per reviewed piece, 2 per week
 *
 * Backend wiring: each entry in `history` is a Firestore `skillEntries` doc;
 * `points` totals are derived aggregates.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Skill identity (unchanged from Pass 1)
// ─────────────────────────────────────────────────────────────────────────────

export type SkillType =
  | 'observation'
  | 'structure'
  | 'expression'
  | 'creativity'
  | 'problem_solving';

export const SKILL_ORDER: SkillType[] = [
  'observation',
  'structure',
  'expression',
  'creativity',
  'problem_solving',
];

export const SKILL_META: Record<SkillType, { name: string; icon: string }> = {
  observation: { name: 'Observation', icon: 'eye-outline' },
  structure: { name: 'Structure', icon: 'cube-outline' },
  expression: { name: 'Expression', icon: 'color-palette-outline' },
  creativity: { name: 'Creativity', icon: 'sparkles-outline' },
  problem_solving: { name: 'Problem Solving', icon: 'bulb-outline' },
};

export const SKILL_COLORS: Record<SkillType, string> = {
  observation: '#4A8FD9',
  structure: '#D18D1E',
  expression: '#9B5DB8',
  creativity: '#4EAD7A',
  problem_solving: '#D9715A',
};

// ─────────────────────────────────────────────────────────────────────────────
// 10-tier level ladder — OVERALL only (sum of all 5 skills)
// Per-skill has NO sub-levels; it shows raw points only.
// See docs/loops.md §"Level ladder".
// ─────────────────────────────────────────────────────────────────────────────

export type Tier =
  | 'Doodler'
  | 'Sketcher'
  | 'Apprentice'
  | 'Creator'
  | 'Artisan'
  | 'Refiner'
  | 'Skilled'
  | 'Expert'
  | 'Master'
  | 'Grandmaster';

export interface TierConfig {
  tier: Tier;
  subLevelCost: number; // 0 for Grandmaster
  subLevels: number;    // 3 for tiers 1-9, 0 for Grandmaster
  cumulativeStart: number;
  cumulativeEnd: number; // Infinity for Grandmaster
}

export const LEVEL_LADDER: TierConfig[] = [
  { tier: 'Doodler',     subLevelCost: 100,  subLevels: 3, cumulativeStart: 0,     cumulativeEnd: 300 },
  { tier: 'Sketcher',    subLevelCost: 150,  subLevels: 3, cumulativeStart: 300,   cumulativeEnd: 750 },
  { tier: 'Apprentice',  subLevelCost: 200,  subLevels: 3, cumulativeStart: 750,   cumulativeEnd: 1350 },
  { tier: 'Creator',     subLevelCost: 300,  subLevels: 3, cumulativeStart: 1350,  cumulativeEnd: 2250 },
  { tier: 'Artisan',     subLevelCost: 400,  subLevels: 3, cumulativeStart: 2250,  cumulativeEnd: 3450 },
  { tier: 'Refiner',     subLevelCost: 500,  subLevels: 3, cumulativeStart: 3450,  cumulativeEnd: 4950 },
  { tier: 'Skilled',     subLevelCost: 700,  subLevels: 3, cumulativeStart: 4950,  cumulativeEnd: 7050 },
  { tier: 'Expert',      subLevelCost: 900,  subLevels: 3, cumulativeStart: 7050,  cumulativeEnd: 9750 },
  { tier: 'Master',      subLevelCost: 1100, subLevels: 3, cumulativeStart: 9750,  cumulativeEnd: 13050 },
  { tier: 'Grandmaster', subLevelCost: 0,    subLevels: 0, cumulativeStart: 13050, cumulativeEnd: Infinity },
];

/**
 * Backward-compat export. Old screens iterate `LEVELS` expecting
 * { index, name, min, max }. We project the 10-tier ladder onto that shape.
 * LevelDetailScreen and SkillDetailScreen will need rework to show
 * sub-levels + power-curve story — tracked as follow-up.
 */
export interface Level {
  index: number;
  name: string;
  min: number;
  max: number;
}

export const LEVELS: Level[] = LEVEL_LADDER.map((t, i) => ({
  index: i,
  name: t.tier,
  min: t.cumulativeStart,
  max: t.cumulativeEnd,
}));

/** Parent-readable per-tier descriptions (10 entries, matches LEVELS). */
export const LEVEL_DESCRIPTIONS: string[] = [
  'Casual, spontaneous drawing — exploring marks and shapes without much intent yet.',
  'Practicing with purpose. Building basic structure and the habit of drawing often.',
  'Learning the craft and fundamentals. Gaining confidence with proportions and form.',
  'Making their own things. Ideas come from inside, not just from prompts.',
  'Creating with care and refinement. Style and intention start to show.',
  'Improving and polishing work with clear intent. Technical choices are deliberate.',
  'Showing solid technical ability across observation, structure, and expression.',
  'Confident and reliable in execution. Handles most drawing challenges with ease.',
  'Rare level of excellence and control. Compositions feel deliberate and mature.',
  'Lifetime peak. Exceptional mastery — a grandmaster of their craft.',
];

// ─────────────────────────────────────────────────────────────────────────────
// Overall-level resolution from a total point count
// ─────────────────────────────────────────────────────────────────────────────

export interface OverallLevel {
  tier: Tier;
  tierIndex: number;            // 0..9
  subLevel: number | null;      // 1..3 for tiers 0..8; null for Grandmaster
  stepIndex: number;            // 0..27 (0=Doodler 1, 27=Master 3); 28=Grandmaster
  displayName: string;          // e.g. "Doodler · 1", "Apprentice · 3", "Grandmaster"

  // progress fields
  pointsIntoTier: number;       // total − cumulativeStart
  pointsIntoSub: number;        // progress within current sub-level
  pointsToNextSub: number;      // 0 if at Grandmaster
  pointsToNextTier: number;     // 0 if at Grandmaster

  // boundaries for the CURRENT sub-level (drives progress rings, etc.)
  subStart: number;
  subEnd: number;               // Infinity for Grandmaster
}

/**
 * Resolve an OverallLevel from a total point count.
 * Pure function — safe to call from render.
 */
export function overallLevelFor(totalPoints: number): OverallLevel {
  const clamped = Math.max(0, Math.floor(totalPoints));

  // Find tier
  let tierIndex = 0;
  for (let i = LEVEL_LADDER.length - 1; i >= 0; i--) {
    if (clamped >= LEVEL_LADDER[i].cumulativeStart) {
      tierIndex = i;
      break;
    }
  }
  const tierCfg = LEVEL_LADDER[tierIndex];
  const pointsIntoTier = clamped - tierCfg.cumulativeStart;

  // Grandmaster has no sub-levels
  if (tierCfg.subLevels === 0) {
    return {
      tier: tierCfg.tier,
      tierIndex,
      subLevel: null,
      stepIndex: 28,
      displayName: tierCfg.tier,
      pointsIntoTier,
      pointsIntoSub: pointsIntoTier,
      pointsToNextSub: 0,
      pointsToNextTier: 0,
      subStart: tierCfg.cumulativeStart,
      subEnd: Infinity,
    };
  }

  // Sub-level within tier (1..subLevels)
  const subIdx = Math.min(
    tierCfg.subLevels - 1,
    Math.floor(pointsIntoTier / tierCfg.subLevelCost),
  );
  const subLevel = subIdx + 1;
  const subStart = tierCfg.cumulativeStart + subIdx * tierCfg.subLevelCost;
  const subEnd = subStart + tierCfg.subLevelCost;
  const pointsIntoSub = clamped - subStart;
  const pointsToNextSub = subEnd - clamped;
  const pointsToNextTier = tierCfg.cumulativeEnd - clamped;
  const stepIndex = tierIndex * 3 + subIdx;

  return {
    tier: tierCfg.tier,
    tierIndex,
    subLevel,
    stepIndex,
    displayName: `${tierCfg.tier} · ${subLevel}`,
    pointsIntoTier,
    pointsIntoSub,
    pointsToNextSub,
    pointsToNextTier,
    subStart,
    subEnd,
  };
}

/**
 * Backward-compat shim. Old callers invoked `levelFor(total)` expecting
 * a Level-shaped object for the TIER name band. We return the tier entry.
 * Existing screens use `.name` (tier name), `.index`, `.min`, `.max`.
 */
export function levelFor(points: number): Level {
  const lv = overallLevelFor(points);
  return LEVELS[lv.tierIndex];
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill state shape + point sources
// ─────────────────────────────────────────────────────────────────────────────

export type PointSource =
  | 'session_attended'
  | 'hw_participation'
  | 'hw_on_time_bonus'
  | 'hw_review'
  | 'sketchbook_review'
  | 'daily_quiz'
  | 'week_recap'
  | 'daily_carousel'
  | 'initial_assessment';

export interface SkillEntry {
  id: string;
  skill: SkillType;
  amount: number;
  source: string;       // human-readable, e.g. "HW: Session 2 evaluated"
  sourceType?: PointSource;
  date: string;         // ISO
}

export interface CrossedThreshold {
  type: 'sub' | 'tier';
  previous: OverallLevel;
  next: OverallLevel;
}

export interface SkillState {
  points: Record<SkillType, number>;
  history: SkillEntry[];
  hasUnseenSkillGrowth: boolean;
  // Celebration queue: crossings since last viewed. UI drains these on popup.
  pendingCrossings: CrossedThreshold[];
}

// ─────────────────────────────────────────────────────────────────────────────
// creditPoints — shared entry point for every loop that awards points
// ─────────────────────────────────────────────────────────────────────────────

export interface CreditPointsInput {
  source: string;                                  // human-readable
  sourceType?: PointSource;
  deltas: Partial<Record<SkillType, number>>;      // points added per skill
  date?: string;                                   // ISO; defaults to today
  entryIdPrefix?: string;                          // for stable mock IDs
}

export interface CreditPointsResult {
  nextState: SkillState;
  crossed: CrossedThreshold | null;  // most-recent crossing (tier beats sub)
}

/**
 * Pure helper. Returns the new skill state + any level crossing info.
 *
 * Rules:
 *  - Positive deltas only (negative is ignored — points never decrease).
 *  - If multiple sub-levels are crossed in one credit, the highest one wins.
 *  - A tier crossing takes precedence over a sub crossing at the same total.
 */
export function creditPoints(
  prev: SkillState,
  input: CreditPointsInput,
): CreditPointsResult {
  const { source, sourceType, deltas, date, entryIdPrefix } = input;
  const now = date ?? new Date().toISOString().slice(0, 10);
  const idBase = entryIdPrefix ?? `${sourceType ?? 'pt'}-${Date.now()}`;

  // 1. Compute prev total for level comparison
  const prevTotal = SKILL_ORDER.reduce((sum, k) => sum + prev.points[k], 0);
  const prevLevel = overallLevelFor(prevTotal);

  // 2. Apply deltas
  const nextPoints = { ...prev.points };
  const newEntries: SkillEntry[] = [];
  let seq = 0;
  for (const skill of SKILL_ORDER) {
    const d = deltas[skill];
    if (!d || d <= 0) continue;
    nextPoints[skill] = (nextPoints[skill] ?? 0) + d;
    newEntries.push({
      id: `${idBase}-${skill}-${seq++}`,
      skill,
      amount: d,
      source,
      sourceType,
      date: now,
    });
  }
  // No-op
  if (newEntries.length === 0) {
    return { nextState: prev, crossed: null };
  }

  // 3. Recompute level, detect crossing
  const nextTotal = SKILL_ORDER.reduce((sum, k) => sum + nextPoints[k], 0);
  const nextLevel = overallLevelFor(nextTotal);
  let crossed: CrossedThreshold | null = null;
  if (nextLevel.tierIndex > prevLevel.tierIndex) {
    crossed = { type: 'tier', previous: prevLevel, next: nextLevel };
  } else if (nextLevel.stepIndex > prevLevel.stepIndex) {
    crossed = { type: 'sub', previous: prevLevel, next: nextLevel };
  }

  // 4. Build next state
  const nextState: SkillState = {
    points: nextPoints,
    history: [...newEntries, ...prev.history],
    hasUnseenSkillGrowth: true,
    pendingCrossings: crossed
      ? [...prev.pendingCrossings, crossed]
      : prev.pendingCrossings,
  };

  return { nextState, crossed };
}

/** Marks growth as "seen" (called when Profile tab is opened & SkillMap animates). */
export function markSkillGrowthSeen(state: SkillState): SkillState {
  if (!state.hasUnseenSkillGrowth && state.pendingCrossings.length === 0) {
    return state;
  }
  return { ...state, hasUnseenSkillGrowth: false, pendingCrossings: [] };
}

/** Sum of all 5 skill points. Convenience. */
export function totalPoints(state: SkillState): number {
  return SKILL_ORDER.reduce((sum, k) => sum + state.points[k], 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock state presets — DevStateSwitcher selects one of these
//   empty     — brand-new Aarav, 0 pts (default)
//   week_4    — 4 weeks in, typical-kid ~360 pts (Sketcher 1)
//   week_12   — end of Foundation, typical-kid ~1080 pts (Apprentice 2)
// ─────────────────────────────────────────────────────────────────────────────

const emptyPoints: Record<SkillType, number> = {
  observation: 0,
  structure: 0,
  expression: 0,
  creativity: 0,
  problem_solving: 0,
};

export const MOCK_SKILLS_EMPTY: SkillState = {
  points: { ...emptyPoints },
  history: [],
  hasUnseenSkillGrowth: false,
  pendingCrossings: [],
};

export const MOCK_SKILLS_WEEK_4: SkillState = {
  // Typical 4-week student: ~360 pts total → Sketcher 1 (300-449)
  points: {
    observation: 82,
    structure: 78,
    expression: 68,
    creativity: 65,
    problem_solving: 60,
  },
  history: [
    { id: 'w4-s4-hw-obs',  skill: 'observation',     amount: 4, source: 'HW: Session 4 reviewed',      sourceType: 'hw_review',        date: '2026-04-18' },
    { id: 'w4-s4-hw-str',  skill: 'structure',       amount: 5, source: 'HW: Session 4 reviewed',      sourceType: 'hw_review',        date: '2026-04-18' },
    { id: 'w4-s4-hw-exp',  skill: 'expression',      amount: 3, source: 'HW: Session 4 reviewed',      sourceType: 'hw_review',        date: '2026-04-18' },
    { id: 'w4-s4-hw-ot',   skill: 'observation',     amount: 1, source: 'HW: on-time bonus',           sourceType: 'hw_on_time_bonus', date: '2026-04-18' },
    { id: 'w4-s4-att',     skill: 'structure',       amount: 4, source: 'Class attended · Session 4',  sourceType: 'session_attended', date: '2026-04-18' },
    { id: 'w4-init-obs',   skill: 'observation',     amount: 50, source: 'Initial assessment',         sourceType: 'initial_assessment', date: '2026-04-04' },
    { id: 'w4-init-str',   skill: 'structure',       amount: 50, source: 'Initial assessment',         sourceType: 'initial_assessment', date: '2026-04-04' },
    { id: 'w4-init-exp',   skill: 'expression',      amount: 50, source: 'Initial assessment',         sourceType: 'initial_assessment', date: '2026-04-04' },
    { id: 'w4-init-cre',   skill: 'creativity',      amount: 50, source: 'Initial assessment',         sourceType: 'initial_assessment', date: '2026-04-04' },
    { id: 'w4-init-ps',    skill: 'problem_solving', amount: 50, source: 'Initial assessment',         sourceType: 'initial_assessment', date: '2026-04-04' },
  ],
  hasUnseenSkillGrowth: false,
  pendingCrossings: [],
};

export const MOCK_SKILLS_WEEK_12: SkillState = {
  // Typical end-of-Foundation: ~1080 pts → Apprentice 2 (950-1150)
  points: {
    observation: 240,
    structure: 228,
    expression: 210,
    creativity: 205,
    problem_solving: 197,
  },
  history: [
    { id: 'w12-s12-hw-obs', skill: 'observation',     amount: 5, source: 'HW: Session 12 reviewed',      sourceType: 'hw_review',        date: '2026-06-20' },
    { id: 'w12-s12-hw-str', skill: 'structure',       amount: 4, source: 'HW: Session 12 reviewed',      sourceType: 'hw_review',        date: '2026-06-20' },
    { id: 'w12-s12-hw-exp', skill: 'expression',      amount: 4, source: 'HW: Session 12 reviewed',      sourceType: 'hw_review',        date: '2026-06-20' },
    { id: 'w12-s12-ot',     skill: 'observation',     amount: 1, source: 'HW: on-time bonus',            sourceType: 'hw_on_time_bonus', date: '2026-06-20' },
    { id: 'w12-s12-sub',    skill: 'observation',     amount: 8, source: 'HW: participation',            sourceType: 'hw_participation', date: '2026-06-20' },
    { id: 'w12-sk5-obs',    skill: 'observation',     amount: 5, source: 'Sketchbook piece reviewed',    sourceType: 'sketchbook_review', date: '2026-06-18' },
    { id: 'w12-sk5-cre',    skill: 'creativity',      amount: 7, source: 'Sketchbook piece reviewed',    sourceType: 'sketchbook_review', date: '2026-06-18' },
    { id: 'w12-sk5-exp',    skill: 'expression',      amount: 3, source: 'Sketchbook piece reviewed',    sourceType: 'sketchbook_review', date: '2026-06-18' },
    // ... many more entries would exist in a real week-12 state; kept brief for mock
  ],
  hasUnseenSkillGrowth: false,
  pendingCrossings: [],
};

/** Default export — matches the "empty" preset. */
export const mockSkills: SkillState = MOCK_SKILLS_EMPTY;

// ─────────────────────────────────────────────────────────────────────────────
// Reactive mock-state store
//
// Pass 1 has no Redux/Zustand/Context. This tiny pub-sub lives in the module
// and lets any screen subscribe to skill-state changes via `useSkillsState`.
// When a loop calls `setSkillsState(creditPoints(...))`, every subscribed
// screen re-renders.
//
// Kept deliberately small: no action types, no selectors. Replace with a
// real store (or a backend hook) when Firestore lands.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useReducer } from 'react';

let _skillsState: SkillState = mockSkills;
const _skillsSubscribers = new Set<() => void>();

export function getSkillsState(): SkillState {
  return _skillsState;
}

/**
 * Replace the current skills state and notify subscribers.
 * Use with `creditPoints`:
 *   const { nextState, crossed } = creditPoints(getSkillsState(), input);
 *   setSkillsState(nextState);
 *   if (crossed) { showLevelUpPopup(crossed); }
 */
export function setSkillsState(next: SkillState) {
  _skillsState = next;
  _skillsSubscribers.forEach((fn) => fn());
}

/** Reset to a preset — used by DevStateSwitcher. */
export function resetSkillsState(preset: SkillState) {
  setSkillsState(preset);
}

/** Reactive read. Re-renders the caller on every setSkillsState. */
export function useSkillsState(): SkillState {
  const [, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    _skillsSubscribers.add(force);
    return () => {
      _skillsSubscribers.delete(force);
    };
  }, []);
  return _skillsState;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy: per-skill level descriptions (5 levels × 5 skills)
// NOTE: new Loop 3 model has NO per-skill sub-levels — per-skill shows raw
// points only. SkillDetailScreen still reads this; it needs rework. Keeping
// the export so the screen compiles. See docs/loops.md §"Phase 3".
// ─────────────────────────────────────────────────────────────────────────────

export const SKILL_LEVEL_DESCRIPTIONS: Record<SkillType, string[]> = {
  observation: [
    'Notices basic shapes and big differences between objects.',
    'Catches proportions on simple objects with guidance.',
    'Captures proportions accurately in still life and spots subtle details.',
    'Sees relationships between objects and nuance without prompting.',
    'Observes with precision — anticipates visual clues and composes from what they see.',
  ],
  structure: [
    'Draws basic shapes — circle, square, triangle.',
    'Builds simple objects from combined shapes.',
    'Constructs 3D-feeling forms and handles overlap.',
    'Handles perspective and light construction lines naturally.',
    'Builds complex scenes with consistent spatial logic.',
  ],
  expression: [
    'Draws controlled straight and curved lines.',
    'Varies line weight intentionally.',
    'Adds shading and texture to bring surfaces to life.',
    'Creates mood and depth through line and tone choices.',
    'Communicates visually through deliberate stylistic choices.',
  ],
  creativity: [
    'Copies prompts faithfully.',
    'Adds personal touches to given prompts.',
    'Invents characters, scenes, and combinations from imagination.',
    'Builds original worlds and stories visually.',
    'Produces original concepts that surprise and delight.',
  ],
  problem_solving: [
    'Follows step-by-step guidance.',
    'Notices their own mistakes when pointed out.',
    'Spots errors and corrects them mid-drawing.',
    'Simplifies complex forms and plans before drawing.',
    'Anticipates challenges and tries multiple approaches.',
  ],
};
