/**
 * Skill map mock data.
 *
 * 5 skills × 5 levels of 100 points each (max 500/skill).
 * Points come from HW teacher eval, quizzes, class attendance, and an initial
 * assessment performed on the first class.
 *
 * Backend wiring: each entry is a Firestore `skillEntries` doc; the `points`
 * totals are derived aggregates.
 */

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

export interface Level {
  index: number;      // 0..4
  name: string;
  min: number;
  max: number;
}

const LEVEL_BANDS: Omit<Level, 'index'>[] = [
  { name: 'Starting',   min: 0,   max: 100 },
  { name: 'Developing', min: 100, max: 200 },
  { name: 'Growing',    min: 200, max: 300 },
  { name: 'Strong',     min: 300, max: 400 },
  { name: 'Confident',  min: 400, max: 500 },
];

export const LEVELS: Level[] = LEVEL_BANDS.map((l, i) => ({ index: i, ...l }));

/**
 * Parent-facing description for each level of each skill.
 * Index 0..4 matches LEVELS (Starting..Confident).
 * Keep lines concrete: a parent should be able to point at the child's work
 * and see why the level label fits.
 */
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

export function levelFor(points: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export interface SkillEntry {
  id: string;
  skill: SkillType;
  amount: number;
  source: string;           // parent-visible, e.g. "HW: Basic Shapes evaluated"
  date: string;             // ISO date
}

export interface SkillState {
  points: Record<SkillType, number>;
  history: SkillEntry[];    // any order; UI sorts newest-first
}

export const mockSkills: SkillState = {
  points: {
    observation: 60,
    structure: 42,
    expression: 38,
    creativity: 22,
    problem_solving: 18,
  },
  history: [
    // Session 3 HW evaluated (13 Apr)
    { id: 'sh1',  skill: 'observation',     amount: 6, source: 'HW: Shapes to Objects evaluated', date: '2026-04-13' },
    { id: 'sh2',  skill: 'structure',       amount: 6, source: 'HW: Shapes to Objects evaluated', date: '2026-04-13' },
    { id: 'sh3',  skill: 'expression',      amount: 4, source: 'HW: Shapes to Objects evaluated', date: '2026-04-13' },
    { id: 'sh4',  skill: 'creativity',      amount: 3, source: 'HW: Shapes to Objects evaluated', date: '2026-04-13' },
    { id: 'sh5',  skill: 'problem_solving', amount: 4, source: 'HW: Shapes to Objects evaluated', date: '2026-04-13' },

    // Class attended · Session 3
    { id: 'sh6',  skill: 'structure',       amount: 2, source: 'Class attended · Session 3', date: '2026-04-11' },

    // Quiz: Session 2 (5 Apr)
    { id: 'sh7',  skill: 'observation',     amount: 3, source: 'Quiz: Session 2',     date: '2026-04-05' },
    { id: 'sh8',  skill: 'creativity',      amount: 2, source: 'Quiz: Session 2',     date: '2026-04-05' },

    // Session 2 HW evaluated (5 Apr)
    { id: 'sh9',  skill: 'observation',     amount: 5, source: 'HW: Basic Shapes evaluated', date: '2026-04-05' },
    { id: 'sh10', skill: 'structure',       amount: 7, source: 'HW: Basic Shapes evaluated', date: '2026-04-05' },
    { id: 'sh11', skill: 'expression',      amount: 3, source: 'HW: Basic Shapes evaluated', date: '2026-04-05' },
    { id: 'sh12', skill: 'creativity',      amount: 2, source: 'HW: Basic Shapes evaluated', date: '2026-04-05' },
    { id: 'sh13', skill: 'problem_solving', amount: 3, source: 'HW: Basic Shapes evaluated', date: '2026-04-05' },

    // Class attended · Session 2
    { id: 'sh14', skill: 'structure',       amount: 2, source: 'Class attended · Session 2', date: '2026-04-04' },

    // Quiz: Session 1 (29 Mar)
    { id: 'sh15', skill: 'observation',     amount: 2, source: 'Quiz: Session 1',     date: '2026-03-29' },
    { id: 'sh16', skill: 'structure',       amount: 3, source: 'Quiz: Session 1',     date: '2026-03-29' },

    // Initial assessment on first class (28 Mar)
    { id: 'sh17', skill: 'observation',     amount: 44, source: 'Initial assessment · teacher eval', date: '2026-03-28' },
    { id: 'sh18', skill: 'structure',       amount: 22, source: 'Initial assessment · teacher eval', date: '2026-03-28' },
    { id: 'sh19', skill: 'expression',      amount: 31, source: 'Initial assessment · teacher eval', date: '2026-03-28' },
    { id: 'sh20', skill: 'creativity',      amount: 15, source: 'Initial assessment · teacher eval', date: '2026-03-28' },
    { id: 'sh21', skill: 'problem_solving', amount: 11, source: 'Initial assessment · teacher eval', date: '2026-03-28' },
  ],
};
