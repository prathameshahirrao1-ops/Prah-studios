# Popups

All bottom-sheet popups go through `src/components/Popup.tsx` (see CLAUDE.md). Cross-screen flows use full-screen `Modal`.

## SessionSummaryPopup
- File: `src/components/SessionSummaryPopup.tsx`
- Trigger: `SessionFlags.unseenCompletedSessionId` set by [loop-1](../rules/loop-1-attendance.md), or re-tap on an `attended` session in Timeline.
- Reads: [session](../schema/session.md), [skill](../schema/skill.md) (curriculum awards).
- Closes via `dismissSessionSummary()`. Then `LevelUpPopup` may open.

## SessionPopup
- File: `src/screens/journey/SessionPopup.tsx`
- Trigger: tap a session card in Timeline.
- Reads: [session](../schema/session.md). Read-only.

## HwSubmissionPopup
- File: `src/screens/journey/HwSubmissionPopup.tsx`
- Trigger: HW card on Home, or HW task in Timeline.
- Reads: [homework](../schema/homework.md).
- Action: "Submit homework" → `submitHomework(hwId, photoUri)` → [loop-2](../rules/loop-2-homework.md).

## HWReviewPopup
- File: `src/components/HWReviewPopup.tsx`
- Trigger: `HomeworkState.unseenReviewHwId` set by [loop-2](../rules/loop-2-homework.md) review action.
- Shows: per-skill star ratings, annotated photo, overall note, points awarded breakdown.
- Closes via `dismissHwReview()`. Then `LevelUpPopup` may open via `drainHwCrossing()`.

## SketchbookUploadPopup
- File: `src/screens/journey/SketchbookUploadPopup.tsx`
- Trigger: SketchbookCTA on Journey/MyWork.
- Action: `submitSketchbook({ photoUri, title })`. Eligibility for points decided at submit time (2-per-week cap).

## SketchbookReviewPopup
- File: `src/components/SketchbookReviewPopup.tsx`
- Trigger: `SketchbookState.unseenReviewId`.
- Reads: SketchbookPiece review (`skillRatings`, `pointsAwarded`, `remark`).
- Closes via `dismissSketchbookReview()`. Then `LevelUpPopup` may open via `drainSketchbookCrossing()`.

## LevelUpPopup
- File: `src/components/LevelUpPopup.tsx`
- Trigger: a `CrossedThreshold` drained from one of the three loop slots after its content popup closes.
- Shows: tier vs sub crossing, prev → next display.

## GkCarouselScreen (full-screen modal)
- File: `src/screens/journey/GkCarouselScreen.tsx`
- Trigger: GK card on Home or GK task in Timeline.
- Reads: [gk-carousel](../schema/gk-carousel.md).
- Action: completion → `creditGkCompletion(mockGkToday)` → [loop-3](../rules/loop-3-gk-quiz.md).

## QuizScreen (full-screen modal)
- File: `src/screens/journey/QuizScreen.tsx`
- Trigger: quiz task in Timeline.
- Reads: [quiz](../schema/quiz.md) via `findQuizForTask(sessionId)`.
- Action: submit → `creditQuizCompletion(quiz, answers)` → [loop-3](../rules/loop-3-gk-quiz.md).

## PeerPopup
- File: `src/screens/journey/PeerPopup.tsx`
- Trigger: tap a peer in Peers tab.
- Reads: `Peer` (`mockPeers` in `mockStudent.ts`) — `firstName`, `memberSince`, `currentJourney`, `artworks`.

## FullImagePopover
- File: `src/screens/profile/FullImageView.tsx`
- Trigger: tap any artwork tile (Profile, AllMyWorks, MyWork, SessionPopup, PeerPopup).
- Reads: artwork lookup via `findArtworkById(id)` (own + peer works).

## TODO
- TODO: confirm with founder — does Quiz/GK completion intentionally NOT fire `LevelUpPopup`? See [loop-3 TODO](../rules/loop-3-gk-quiz.md).
