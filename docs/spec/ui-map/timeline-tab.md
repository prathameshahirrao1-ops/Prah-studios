# Timeline Tab

Path: `src/screens/journey/TimelineTab.tsx`

A merged feed of [sessions](../schema/session.md) and tasks ([quiz](../schema/quiz.md) / [gk-carousel](../schema/gk-carousel.md) / [homework](../schema/homework.md)) on the Journey screen.

## Sections (top to bottom)
1. **Streak footer / chips** — reads `useStreaksData()` — see [streak](../schema/streak.md).
2. **Mixed timeline list** — interleaves:
   - Session cards (`TimelineSessionCard`) from `mockTimeline`
   - Task rows from `mockTasks` (`kind: 'quiz' | 'gk' | 'hw'`)
3. **Sketchbook CTA / My Work tab / Peers tab** — sibling tabs in the parent `JourneyScreen`.

## Triggers (interactions that fire rules)
- Tap an `attended` session → opens `SessionPopup` (read-only; can re-open SessionSummaryPopup)
- Tap an HW task → opens `HwSubmissionPopup` for that session's HW → [loop-2](../rules/loop-2-homework.md)
- Tap a quiz task → opens `QuizScreen` → on submit `creditQuizCompletion()` → [loop-3](../rules/loop-3-gk-quiz.md)
- Tap a GK task → opens `GkCarouselScreen` → on completion `creditGkCompletion()` → [loop-3](../rules/loop-3-gk-quiz.md)

## Source
- `src/screens/journey/TimelineTab.tsx`
- `src/screens/journey/TimelineSessionCard.tsx`
- `src/screens/JourneyScreen.tsx` (tab host)
- Reads: `mockTimeline`, `mockTasks` (`src/data/mockStudent.ts`), `useStreaksData()` (`src/data/mockStreaks.ts`)

## TODO
- TODO: confirm with founder — `TimelineSessionCard` displays `session.skills` (free-form names like "Line control"); reconcile with [schema/session.md](../schema/session.md) TODO.
