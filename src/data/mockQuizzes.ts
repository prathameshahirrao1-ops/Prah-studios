/**
 * Mock quiz data. One quiz per session, 3 visual-compare questions each.
 * Backend wiring: `quizzes/{quizId}/questions/{qId}` in Firestore.
 */
import { SkillType } from './mockSkills';

export interface QuizOption {
  id: string;
  label: string;               // placeholder caption; real build shows image
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  skill: SkillType;            // which driver/skill this question feeds
  options: QuizOption[];
  explanation: string;
}

export interface Quiz {
  id: string;
  sessionId: string;
  sessionNumber: number;
  sessionTitle: string;
  questions: QuizQuestion[];
}

export const mockQuizzes: Quiz[] = [
  {
    id: 'q_s3',
    sessionId: 's3',
    sessionNumber: 3,
    sessionTitle: 'Shapes to Objects',
    questions: [
      {
        id: 'q1',
        text: 'Which drawing has the correct proportions for a simple mug?',
        skill: 'observation',
        options: [
          { id: 'a', label: 'Option A', isCorrect: false },
          { id: 'b', label: 'Option B', isCorrect: true },
          { id: 'c', label: 'Option C', isCorrect: false },
        ],
        explanation:
          'Option B keeps the width-to-height ratio close to 1:1 with the handle adding width. A is too narrow; C is too squat.',
      },
      {
        id: 'q2',
        text: 'Which shape best represents this apple seen from slightly above?',
        skill: 'structure',
        options: [
          { id: 'a', label: 'Option A', isCorrect: true },
          { id: 'b', label: 'Option B', isCorrect: false },
          { id: 'c', label: 'Option C', isCorrect: false },
        ],
        explanation:
          'An apple from above flattens slightly at top and bottom — Option A captures that. B and C ignore the viewing angle.',
      },
      {
        id: 'q3',
        text: 'Which drawing uses overlap to show depth correctly?',
        skill: 'problem_solving',
        options: [
          { id: 'a', label: 'Option A', isCorrect: false },
          { id: 'b', label: 'Option B', isCorrect: false },
          { id: 'c', label: 'Option C', isCorrect: true },
        ],
        explanation:
          'Overlap is the simplest depth cue: the closer object covers part of the further one. Only Option C shows this.',
      },
    ],
  },
];

export function findQuizForTask(
  taskSessionId: string | undefined,
): Quiz | null {
  if (!taskSessionId) {
    // fall back to first quiz for any quiz task without an explicit sessionId
    return mockQuizzes[0] ?? null;
  }
  return mockQuizzes.find((q) => q.sessionId === taskSessionId) ?? mockQuizzes[0] ?? null;
}
