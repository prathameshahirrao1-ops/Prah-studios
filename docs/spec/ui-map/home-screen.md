# Home Screen

Path: `src/screens/HomeScreen.tsx`

The default landing surface. Renders one of 4 home states picked by `evaluateHomeState()`:
`class_ongoing` · `post_class` · `hw_pending` · `enrolled_idle`.

## Sections (top to bottom)
1. **Header** — student greeting (`firstName`) and avatar — reads from [student](../schema/student.md) (`mockStudent`).
2. **State-driven hero card** — one of:
   - `LiveClassCard` (`class_ongoing`) — live `TimelineSession`.
   - `PostClassCard` (`post_class`) — just-ended session, links to summary.
   - `NextClassCard` (else) — next upcoming session + venue line.
   See [session](../schema/session.md).
3. **HW card** — driven by `activeHomework(useHomeworkState())` — see [homework](../schema/homework.md). Shows `pending` / `submitted` / `reviewed` state.
4. **Daily GK card** — opens `GkCarouselScreen` modal — see [gk-carousel](../schema/gk-carousel.md).
5. **RecentWorkBlock** — recent artworks — see [artwork](../schema/artwork.md).
6. **TeacherBlock** — opens `ChatScreen` modal — see [chat](../schema/chat.md).
7. **ExplorerJourneysBlock** — explorer journey cards — see [journey](../schema/journey.md) (`explorerJourneys`).
8. **DevStateSwitcher** — dev-only; do NOT ship.

## Modals shown over Home
- **SessionSummaryPopup** — when `unseenCompletedSessionId` is set ([loop-1](../rules/loop-1-attendance.md))
- **HwSubmissionPopup** — when student opens HW submit ([loop-2](../rules/loop-2-homework.md))
- **HWReviewPopup** — when `unseenReviewHwId` is set ([loop-2](../rules/loop-2-homework.md))
- **SketchbookReviewPopup** — when `unseenReviewId` is set on sketchbook state
- **LevelUpPopup** — drains pending crossing after any of the above ([loop-5](../rules/loop-5-level-up.md))
- **GkCarouselScreen** — full-screen modal
- **ChatScreen** — full-screen modal
- **FullImagePopover** — shared image viewer

## Triggers (interactions that fire rules)
- "Submit homework" inside `HwSubmissionPopup` → `submitHomework()` → [loop-2](../rules/loop-2-homework.md)
- GK carousel completion → `creditGkCompletion()` → [loop-3](../rules/loop-3-gk-quiz.md)
- Dev: "Complete next session" → `completeSession()` → [loop-1](../rules/loop-1-attendance.md)
- Dev: "Simulate teacher review" → `reviewHomework()` → [loop-2](../rules/loop-2-homework.md)

## Source
- `src/screens/HomeScreen.tsx`
- Sub-blocks: `src/screens/home/*` (LiveClassCard, NextClassCard, PostClassCard, RecentWorkBlock, TeacherBlock, ExplorerJourneysBlock, DevStateSwitcher)
- State machine: `src/data/homeState.ts` (line 39: `evaluateHomeState`)
