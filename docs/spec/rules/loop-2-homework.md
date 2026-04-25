# Loop 2 — Homework

Submit a photo → get participation + on-time points. Teacher reviews → annotated feedback + per-skill stars → review points.

## Trigger
**Submit:** student taps "Submit homework" on `HwSubmissionPopup`. Calls `submitHomework(hwId, photoUri)`.

**Review:** teacher reviews on the back-end. In Pass 1: `DevStateSwitcher` "Simulate teacher review" calls `reviewHomework(hwId)`.

## Effect — Submit
1. Guard: skip if HW status is already `submitted` or `reviewed`.
2. Capture `wasOnTime = onTimeBonusAvailable` (true while undue).
3. Compute deltas:
   - **Participation**: +1 to each of the 5 skills (always).
   - **On-time bonus**: +1 to each of the 5 skills (only if `wasOnTime`).
   - Combined into a single `creditPoints` call so a level crossing here is attributed to the submit event.
4. Source label: `HW submitted · Session N (on time)?`. `sourceType: 'hw_on_time_bonus'` if on-time, else `'hw_participation'`.
5. Update HW: `status: 'submitted'`, `onTimeBonusAvailable: false`, `submission = { photoUri, submittedAt, wasOnTime }`.
6. Mirror to legacy `TimelineSession.hw`: set to `'under_review'`.
7. Returns `CrossedThreshold | null`.

## Effect — Review
1. Guard: skip unless HW status is `submitted`.
2. Compute review points from `plannedRatings`: per skill `pts = max(0, stars − 1)` (1★→0, 5★→4).
3. `creditPoints` with source `HW reviewed · Session N`, `sourceType: 'hw_review'`.
4. Build `HwReview` with `annotations: plannedAnnotations`, `overallNote: plannedOverallNote`, `skillRatings: plannedRatings`, full `pointsAwarded` breakdown.
5. Update HW: `status: 'reviewed'`, `review` set, mirror `TimelineSession.hw = 'reviewed'`.
6. Set `unseenReviewHwId = hwId` and `pendingCrossing`.
7. HomeScreen subscribes; opens `HWReviewPopup` for unseen review.
8. On dismiss → `dismissHwReview()`; then `LevelUpPopup` drains via `drainHwCrossing()`.

## Selectors / actions
- `activeHomework(state?)` — newest `pending`/`submitted`, else newest `reviewed`.
- `homeworkForSession(sessionId)`, `homeworkById(id)`
- `nextSubmittableHw()`, `nextReviewableHw()` — for dev switcher.
- `submitHomework`, `reviewHomework`, `dismissHwReview`, `drainHwCrossing`.

## Source
- `src/data/mockHomework.ts` (line 259: `submitHomework`; line 332: `reviewHomework`; line 231: `activeHomework`; line 389: `dismissHwReview`; line 395: `drainHwCrossing`)

## Related
- Schema: [homework](../schema/homework.md), [skill](../schema/skill.md)
- UI: [home-screen](../ui-map/home-screen.md) (HW card), [popups](../ui-map/popups.md) (HwSubmissionPopup, HWReviewPopup)
- Next: [loop-5-level-up](loop-5-level-up.md) drains the crossing into LevelUpPopup.
