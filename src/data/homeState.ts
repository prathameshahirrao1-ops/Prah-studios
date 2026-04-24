/**
 * Home state machine — evaluates the student's current moment and picks
 * what the Home screen should render.
 *
 * The priority stack (see product doc §04):
 *   1  Class ongoing             time-triggered, overrides everything
 *   2  Post-class summary        auto from curriculum, dominant for rest of day
 *   3  Homework pending          priority card when any HW is 'pending'
 *   4  Empty / Enrolled active   default — engagement zone dominant
 */

import { mockTimeline, TimelineSession } from './mockStudent';
import { activeHomework } from './mockHomework';

export type HomeStateKey =
  | 'class_ongoing'
  | 'post_class'
  | 'hw_pending'
  | 'enrolled_idle';

export interface HomeContext {
  state: HomeStateKey;
  liveSession?: TimelineSession;          // for class_ongoing
  justEndedSession?: TimelineSession;     // for post_class
  nextSession?: TimelineSession;          // always useful to surface
}

const CLASS_DURATION_MIN = 60;              // a class is 60 minutes
const POST_CLASS_WINDOW_H = 12;             // summary stays dominant for 12h after class

function isBetween(now: Date, start: Date, end: Date) {
  return now.getTime() >= start.getTime() && now.getTime() < end.getTime();
}

/**
 * Evaluate the home state at a given moment.
 * Used by the dev time-travel chip to force different views.
 */
export function evaluateHomeState(now: Date = new Date()): HomeContext {
  // Find the session whose start-time window the clock is in.
  // Skip already-attended sessions — once Loop 1 flips a session to
  // 'attended' (e.g. via Dev · Complete Session N), it's no longer live.
  for (const s of mockTimeline) {
    if (!s.date) continue;
    if (s.status === 'attended') continue;
    const start = startOfSession(s);
    const end = new Date(start.getTime() + CLASS_DURATION_MIN * 60 * 1000);
    if (isBetween(now, start, end)) {
      return { state: 'class_ongoing', liveSession: s, nextSession: findNext(s) };
    }
  }

  // Within the post-class window of the most recent session?
  const recent = mostRecentAttended(now);
  if (recent) {
    const end = new Date(
      startOfSession(recent).getTime() + CLASS_DURATION_MIN * 60 * 1000,
    );
    const postWindow = new Date(end.getTime() + POST_CLASS_WINDOW_H * 60 * 60 * 1000);
    if (isBetween(now, end, postWindow)) {
      return { state: 'post_class', justEndedSession: recent, nextSession: findNext(recent) };
    }
  }

  // Any HW still pending? Reads the reactive HW store so that after submit
  // the priority moves off hw_pending automatically.
  const hw = activeHomework();
  if (hw && hw.status === 'pending') {
    return { state: 'hw_pending', nextSession: nextUpcoming(now) };
  }

  return { state: 'enrolled_idle', nextSession: nextUpcoming(now) };
}

function startOfSession(s: TimelineSession): Date {
  // Mock: every class starts at 10:00 local on its date.
  const d = new Date(s.date);
  d.setHours(10, 0, 0, 0);
  return d;
}

function findNext(after: TimelineSession): TimelineSession | undefined {
  const idx = mockTimeline.findIndex((s) => s.id === after.id);
  return mockTimeline[idx + 1];
}

function mostRecentAttended(now: Date): TimelineSession | undefined {
  for (let i = mockTimeline.length - 1; i >= 0; i--) {
    const s = mockTimeline[i];
    if (s.status !== 'attended') continue;
    if (startOfSession(s).getTime() <= now.getTime()) return s;
  }
  return undefined;
}

function nextUpcoming(now: Date): TimelineSession | undefined {
  return mockTimeline.find(
    (s) => s.status === 'upcoming' && startOfSession(s).getTime() > now.getTime(),
  );
}

/**
 * Dev presets — snap the clock to a moment that triggers each state.
 */
export const DEV_PRESETS: Record<HomeStateKey, Date> = {
  // 10:30 on Session 5 date (18 Apr) — mid-class window.
  class_ongoing: (() => {
    const d = new Date('2026-04-18T00:00:00+05:30');
    d.setHours(10, 30, 0, 0);
    return d;
  })(),
  // 12:00 on Session 4 date (14 Apr) — just after class ended.
  post_class: (() => {
    const d = new Date('2026-04-14T00:00:00+05:30');
    d.setHours(12, 0, 0, 0);
    return d;
  })(),
  // Any time on 17 Apr (between classes, HW still pending) — real "now"
  hw_pending: new Date('2026-04-17T09:00:00+05:30'),
  // An hour before next class but no HW pending — we'll force this even with mock HW
  enrolled_idle: new Date('2026-04-18T08:00:00+05:30'),
};
