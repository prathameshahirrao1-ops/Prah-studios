/**
 * Mock enrolled-student data for Pass 1.
 * Replaced with Firestore reads in Phase "Backend wiring" (weeks 5–7).
 */

export type HwStatus = 'pending' | 'under_review' | 'reviewed';
export type SessionStatus = 'attended' | 'missed' | 'upcoming';

export interface TimelineSession {
  id: string;
  date: string;              // ISO
  sessionNumber: number;
  title: string;
  status: SessionStatus;
  keyConcepts: string[];
  hw?: HwStatus;
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

export const mockTimeline: TimelineSession[] = [
  {
    id: 's1',
    sessionNumber: 1,
    date: '2026-03-28',
    title: 'Lines & Strokes',
    status: 'attended',
    keyConcepts: ['Line types', 'Grip & pressure', 'Straight vs curved'],
    hw: 'reviewed',
  },
  {
    id: 's2',
    sessionNumber: 2,
    date: '2026-04-04',
    title: 'Basic Shapes',
    status: 'attended',
    keyConcepts: ['Circle', 'Square', 'Triangle', 'Combining shapes'],
    hw: 'reviewed',
  },
  {
    id: 's3',
    sessionNumber: 3,
    date: '2026-04-11',
    title: 'Shapes to Objects',
    status: 'attended',
    keyConcepts: ['Breaking objects into shapes', 'Overlap', 'Simple still life'],
    hw: 'under_review',
  },
  {
    id: 's4',
    sessionNumber: 4,
    date: '2026-04-14',
    title: 'Sketching Shapes',
    status: 'attended',
    keyConcepts: ['Light construction lines', 'Proportion', 'Clean up'],
    hw: 'pending',
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
