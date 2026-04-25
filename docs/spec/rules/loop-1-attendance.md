# Loop 1 — Class Attendance

When a class flips from `live` to `completed` on the server, the student is auto-credited curriculum skill points and the Home screen surfaces a session-summary popup.

## Trigger
- Server flips `sessions/{id}` from `live` → `completed` (real-time class-end).
- In Pass 1: `DevStateSwitcher` "Complete next session" calls `completeSession(sessionId)` against the next `upcoming` entry in `mockTimeline`.

## Effect
1. Mutate the `TimelineSession` entry: `status` → `'attended'`.
2. `creditPoints()` against `SESSION_SKILL_AWARDS[sessionId]` (curriculum awards, target ~20 pts/session). Source label: `Class attended · Session N`. `sourceType: 'session_attended'`.
3. Set `SessionFlags.unseenCompletedSessionId = sessionId` and `pendingCrossing` (level crossing if any).
4. HomeScreen subscribes via `useSessionFlags`; opens `SessionSummaryPopup` for the unseen session.
5. On popup dismiss → `dismissSessionSummary()` clears `unseenCompletedSessionId` (does NOT clear `pendingCrossing`).
6. `LevelUpPopup` then calls `drainPendingCrossing()` to surface any tier/sub crossing.

## Selectors / actions
- `nextUpcomingSession()` — oldest `upcoming` session.
- `completeSession(id) → CrossedThreshold | null`
- `findSession(id)`, `sessionAwardsFor(id)`
- `dismissSessionSummary()`, `drainPendingCrossing()`

## Source
- `src/data/mockSessions.ts` (line 36: `SESSION_SKILL_AWARDS`; line 107: `completeSession`; line 56: `SessionFlags`; line 134: `dismissSessionSummary`; line 143: `drainPendingCrossing`)

## Related
- Schema: [session](../schema/session.md), [skill](../schema/skill.md)
- UI: [home-screen](../ui-map/home-screen.md), [popups](../ui-map/popups.md)
- Next: [loop-5-level-up](loop-5-level-up.md) drains the crossing into LevelUpPopup.
