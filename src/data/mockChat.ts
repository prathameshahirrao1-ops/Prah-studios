// Spec:
//   - docs/spec/schema/chat.md
//

/**
 * Mock chat data for the in-app chat (one chat per enrolled student,
 * shared between parent, teacher, and admin).
 *
 * Replaced with Firestore `chats/{chatId}/messages/{msgId}` reads in the
 * backend wiring phase.
 */

export type Sender = 'parent' | 'teacher' | 'admin' | 'system';

export interface ChatMessage {
  id: string;
  sender: Sender;
  authorName?: string;        // teacher or admin display name
  text: string;
  sentAt: string;             // ISO
}

export interface ChatThread {
  teacherName: string;
  teacherRole: string;
  /** Whether today is one of the student's class days — drives quick-action chips. */
  isClassDay: boolean;
  messages: ChatMessage[];
}

export const mockChat: ChatThread = {
  teacherName: 'Meera T.',
  teacherRole: 'Your teacher',
  isClassDay: true,
  messages: [
    {
      id: 'm1',
      sender: 'teacher',
      authorName: 'Meera',
      text: 'Hi Prathamesh! Aarav did a great job with the shapes today.',
      sentAt: '2026-04-14T11:32:00+05:30',
    },
    {
      id: 'm2',
      sender: 'parent',
      text: 'Thank you Meera! He was excited to tell me.',
      sentAt: '2026-04-14T15:08:00+05:30',
    },
    {
      id: 'm3',
      sender: 'teacher',
      authorName: 'Meera',
      text: 'Homework is to redraw the same shapes from memory. Any photo angle works.',
      sentAt: '2026-04-14T15:10:00+05:30',
    },
    {
      id: 'm4',
      sender: 'admin',
      authorName: 'Studio',
      text: 'Reminder — Session 5 is on Saturday 18 Apr at 10:00 am.',
      sentAt: '2026-04-16T09:00:00+05:30',
    },
    {
      id: 'm5',
      sender: 'parent',
      text: 'Got it, we will be there.',
      sentAt: '2026-04-16T10:15:00+05:30',
    },
  ],
};
