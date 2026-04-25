// Spec:
//   - docs/spec/schema/journey.md
//

import type { SkillType } from './mockSkills';

export type JourneyCategory = 'explorer' | 'master';
export type JourneyStatus = 'current' | 'completed' | 'available';

export interface JourneyCourse {
  id: string;
  title: string;
  category: JourneyCategory;
  duration: string;
  sessions?: number;
  price: number;
  dateAvailable?: string;
  description: string;
  keyConcepts: string[];
  skillsGained: SkillType[];
  status: JourneyStatus;
}

export const mockJourneys: JourneyCourse[] = [
  // ── Master courses (3-month / 1-month) ─────────────────────────────────
  {
    id: 'master_drawing_foundation',
    title: 'Drawing Foundation',
    category: 'master',
    duration: '3 Months',
    sessions: 24,
    price: 4500,
    description:
      'The complete foundation course — from basic shapes to confident freehand drawing. Covers all 6 core modules: Shapes & Forms, Observation, Object Construction, Light & Shadow, Composition, and Creative Drawing.',
    keyConcepts: [
      'Shapes & Forms',
      'Observation',
      'Object Construction',
      'Light & Shadow',
      'Composition',
      'Creative Drawing',
    ],
    skillsGained: ['observation', 'structure', 'expression', 'creativity', 'problem_solving'],
    status: 'current',
  },
  {
    id: 'master_colour_painting',
    title: 'Colour & Painting',
    category: 'master',
    duration: '3 Months',
    sessions: 24,
    price: 4500,
    dateAvailable: 'Jun 2026',
    description:
      'Introduces colour theory, brush techniques, and painting on canvas. Builds directly on Drawing Foundation — form and observation skills carry over into the colour medium.',
    keyConcepts: [
      'Colour theory',
      'Mixing & blending',
      'Brush control',
      'Wet-on-wet',
      'Composition in colour',
    ],
    skillsGained: ['expression', 'creativity', 'observation'],
    status: 'available',
  },
  {
    id: 'master_sketching_intensive',
    title: 'Sketching Intensive',
    category: 'master',
    duration: '1 Month',
    sessions: 8,
    price: 2000,
    dateAvailable: 'May 2026',
    description:
      'A focused 1-month sprint for students who want to level up their sketching speed and confidence. Ideal as a bridge between foundation and advanced courses.',
    keyConcepts: [
      'Gesture drawing',
      'Speed sketching',
      'Line economy',
      'Figure basics',
    ],
    skillsGained: ['expression', 'structure', 'problem_solving'],
    status: 'available',
  },

  // ── Explorer courses (1-day workshops) ─────────────────────────────────
  {
    id: 'explorer_watercolour',
    title: 'Watercolour Splash',
    category: 'explorer',
    duration: '1 Day',
    price: 499,
    dateAvailable: 'Sat, 3 May 2026',
    description:
      'A fun one-day workshop introducing watercolours — wet-on-wet blending, colour bleeding, and simple landscapes. No prior experience needed.',
    keyConcepts: ['Wet-on-wet technique', 'Colour bleeding', 'Simple landscapes'],
    skillsGained: ['expression', 'creativity'],
    status: 'available',
  },
  {
    id: 'explorer_mandala',
    title: 'Mandala Art',
    category: 'explorer',
    duration: '1 Day',
    price: 399,
    dateAvailable: 'Sun, 11 May 2026',
    description:
      'Learn the geometry of mandala patterns — symmetry, repetition, and fine detail work. Students take home a completed A3 mandala.',
    keyConcepts: ['Symmetry', 'Pattern repetition', 'Fine detail', 'Pen control'],
    skillsGained: ['structure', 'expression'],
    status: 'available',
  },
  {
    id: 'explorer_portrait',
    title: 'Portrait Basics',
    category: 'explorer',
    duration: '2 Days',
    price: 799,
    dateAvailable: 'Sat–Sun, 17–18 May 2026',
    description:
      'A 2-session workshop on proportions of the face, capturing expression, and adding depth to portraits. Suitable for students who have completed at least 8 classes.',
    keyConcepts: ['Face proportions', 'Eye & nose placement', 'Expression', 'Light on face'],
    skillsGained: ['observation', 'structure', 'expression'],
    status: 'available',
  },
];

export const explorerJourneys = mockJourneys.filter((j) => j.category === 'explorer');
export const masterJourneys   = mockJourneys.filter((j) => j.category === 'master');
export const currentJourney   = mockJourneys.find((j) => j.status === 'current') ?? null;
