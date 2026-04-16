/**
 * Mock enrolled-student data for Pass 1.
 * Replaced with Firestore reads in Phase "Backend wiring" (weeks 5–7).
 */

export type HwStatus = 'pending' | 'under_review' | 'reviewed';
export type SessionStatus = 'attended' | 'missed' | 'upcoming';
export type TaskKind = 'quiz' | 'gk' | 'hw';

export interface SkillRating {
  name: string;              // e.g. "Observation"
  stars: number;             // 0..5
}

export interface Artwork {
  id: string;
  sessionNumber: number;
  sessionTitle: string;
  date: string;              // ISO
  // image: omitted for Pass 1 — placeholder rendered in UI
}

export interface TimelineSession {
  id: string;
  date: string;              // ISO
  sessionNumber: number;
  title: string;
  status: SessionStatus;
  keyConcepts: string[];
  skills?: SkillRating[];    // present when status === 'attended'
  hw?: HwStatus;
  yourWorkId?: string;       // links to Artwork
}

export interface TimelineTask {
  id: string;
  date: string;              // ISO
  kind: TaskKind;
  title: string;
  meta?: string;
  done?: boolean;            // HW submitted / quiz attempted
}

export interface Peer {
  id: string;
  firstName: string;
  lastName: string;          // only initial is shown
  memberSince: string;       // human-readable
  currentJourney: string;
  artworks: Artwork[];
}

export interface Student {
  id: string;
  firstName: string;
  age: number;
  avatar?: string;
  course: string;
  courseId: string;
  joinedDate: string;        // human-readable
  classesAttended: number;
  classesTotal: number;
  hwSubmitted: number;
  hwTotal: number;
  quizzesDone: number;
  homeState: 'pre_demo' | 'demo_booked' | 'demo_done' | 'enrolled_active';
  nextClassAt?: string;      // ISO
  hwPending?: {
    sessionTitle: string;
    dueDate: string;
    estimateMin: number;
  };
}

export const mockStudent: Student = {
  id: 'stu_001',
  firstName: 'Aarav',
  age: 7,
  course: 'Drawing Foundation',
  courseId: 'course_drawing_foundation_q1_2026',
  joinedDate: 'Joined 21 March 2026',
  classesAttended: 4,
  classesTotal: 24,
  hwSubmitted: 2,
  hwTotal: 4,
  quizzesDone: 3,
  homeState: 'enrolled_active',
  nextClassAt: '2026-04-18T10:00:00+05:30',
  hwPending: {
    sessionTitle: 'Sketching Shapes',
    dueDate: '2026-04-17',
    estimateMin: 20,
  },
};

export const mockArtworks: Artwork[] = [
  { id: 'aw1', sessionNumber: 1, sessionTitle: 'Lines & Strokes', date: '2026-03-28' },
  { id: 'aw2', sessionNumber: 2, sessionTitle: 'Basic Shapes', date: '2026-04-04' },
  { id: 'aw3', sessionNumber: 3, sessionTitle: 'Shapes to Objects', date: '2026-04-11' },
  { id: 'aw4', sessionNumber: 4, sessionTitle: 'Sketching Shapes', date: '2026-04-14' },
];

export const mockTimeline: TimelineSession[] = [
  {
    id: 's1',
    sessionNumber: 1,
    date: '2026-03-28',
    title: 'Lines & Strokes',
    status: 'attended',
    keyConcepts: ['Line types', 'Grip & pressure', 'Straight vs curved'],
    hw: 'reviewed',
    yourWorkId: 'aw1',
    skills: [
      { name: 'Observation', stars: 3 },
      { name: 'Line control', stars: 4 },
      { name: 'Hand drawing', stars: 3 },
    ],
  },
  {
    id: 's2',
    sessionNumber: 2,
    date: '2026-04-04',
    title: 'Basic Shapes',
    status: 'attended',
    keyConcepts: ['Circle', 'Square', 'Triangle', 'Combining shapes'],
    hw: 'reviewed',
    yourWorkId: 'aw2',
    skills: [
      { name: 'Observation', stars: 4 },
      { name: 'Imagination', stars: 2 },
      { name: 'Hand drawing', stars: 3 },
    ],
  },
  {
    id: 's3',
    sessionNumber: 3,
    date: '2026-04-11',
    title: 'Shapes to Objects',
    status: 'attended',
    keyConcepts: ['Breaking objects into shapes', 'Overlap', 'Simple still life'],
    hw: 'under_review',
    yourWorkId: 'aw3',
    skills: [
      { name: 'Observation', stars: 4 },
      { name: 'Imagination', stars: 3 },
      { name: 'Hand drawing', stars: 4 },
    ],
  },
  {
    id: 's4',
    sessionNumber: 4,
    date: '2026-04-14',
    title: 'Sketching Shapes',
    status: 'attended',
    keyConcepts: [
      'Light construction lines',
      'Proportion between parts',
      'Clean-up & final strokes',
    ],
    hw: 'pending',
    yourWorkId: 'aw4',
    skills: [
      { name: 'Observation', stars: 4 },
      { name: 'Imagination', stars: 2 },
      { name: 'Hand drawing', stars: 3 },
    ],
  },
  {
    id: 's5',
    sessionNumber: 5,
    date: '2026-04-18',
    title: 'Observation Basics',
    status: 'upcoming',
    keyConcepts: [],
  },
  {
    id: 's6',
    sessionNumber: 6,
    date: '2026-04-25',
    title: 'Observation — Still Life',
    status: 'upcoming',
    keyConcepts: [],
  },
];

export const mockTasks: TimelineTask[] = [
  { id: 't1', date: '2026-03-29', kind: 'gk', title: "Today's GK", meta: 'swipe through', done: true },
  { id: 't2', date: '2026-04-05', kind: 'quiz', title: 'Session 2 Quiz', meta: '3 questions', done: true },
  { id: 't3', date: '2026-04-05', kind: 'gk', title: "Today's GK", meta: 'swipe through', done: true },
  { id: 't4', date: '2026-04-12', kind: 'quiz', title: 'Session 3 Quiz', meta: '3 questions', done: false },
  { id: 't5', date: '2026-04-15', kind: 'hw', title: 'Sketching Shapes HW', meta: 'Due 17 Apr · 20 min' },
  { id: 't6', date: '2026-04-15', kind: 'gk', title: "Today's GK", meta: '3 new items' },
];

export const mockPeers: Peer[] = [
  {
    id: 'p1',
    firstName: 'Aisha',
    lastName: 'Khanna',
    memberSince: '18 March 2026',
    currentJourney: 'Drawing Foundation',
    artworks: [
      { id: 'p1a1', sessionNumber: 1, sessionTitle: 'Lines & Strokes', date: '2026-03-28' },
      { id: 'p1a2', sessionNumber: 2, sessionTitle: 'Basic Shapes', date: '2026-04-04' },
      { id: 'p1a3', sessionNumber: 3, sessionTitle: 'Shapes to Objects', date: '2026-04-11' },
    ],
  },
  {
    id: 'p2',
    firstName: 'Rohan',
    lastName: 'Desai',
    memberSince: '20 March 2026',
    currentJourney: 'Drawing Foundation',
    artworks: [
      { id: 'p2a1', sessionNumber: 1, sessionTitle: 'Lines & Strokes', date: '2026-03-28' },
      { id: 'p2a2', sessionNumber: 2, sessionTitle: 'Basic Shapes', date: '2026-04-04' },
    ],
  },
  {
    id: 'p3',
    firstName: 'Myra',
    lastName: 'Patel',
    memberSince: '22 March 2026',
    currentJourney: 'Drawing Foundation',
    artworks: [
      { id: 'p3a1', sessionNumber: 1, sessionTitle: 'Lines & Strokes', date: '2026-03-28' },
      { id: 'p3a2', sessionNumber: 2, sessionTitle: 'Basic Shapes', date: '2026-04-04' },
      { id: 'p3a3', sessionNumber: 3, sessionTitle: 'Shapes to Objects', date: '2026-04-11' },
      { id: 'p3a4', sessionNumber: 4, sessionTitle: 'Sketching Shapes', date: '2026-04-14' },
    ],
  },
  {
    id: 'p4',
    firstName: 'Kabir',
    lastName: 'Shah',
    memberSince: '24 March 2026',
    currentJourney: 'Drawing Foundation',
    artworks: [],
  },
];
