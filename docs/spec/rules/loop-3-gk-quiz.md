# Loop 3 — GK Carousel & Quiz

Daily engagement loops. Both credit small skill points to keep the kid coming back.

## Trigger — GK
Student opens GK carousel (modal from HomeScreen), swipes through all 3 cards, hits the completion CTA. HomeScreen calls `creditGkCompletion(mockGkToday)`.

## Effect — GK
1. Deltas: `observation: +1`, `creativity: +1`, `problem_solving: +1` (3 pts total).
2. `creditPoints` with source `Daily GK · <date>`, `sourceType: 'daily_carousel'`.
3. Returns `CrossedThreshold | null` (currently not surfaced into a popup queue from GK alone — TODO confirm).

## Trigger — Quiz
Student opens `QuizScreen`, answers questions, submits. The screen calls `creditQuizCompletion(quiz, answers)`.

## Effect — Quiz
1. For each question whose chosen option `isCorrect`, add +2 to that question's `skill`.
2. If 0 correct → no-op, return `null`.
3. `creditPoints` with source `Quiz · Session N (X/Y correct)`, `sourceType: 'daily_quiz'`.
4. Returns `CrossedThreshold | null`.

## Source
- `src/data/mockGkCarousel.ts` (line 61: `creditGkCompletion`)
- `src/data/mockQuizzes.ts` (line 98: `creditQuizCompletion`)

## Related
- Schema: [gk-carousel](../schema/gk-carousel.md), [quiz](../schema/quiz.md), [skill](../schema/skill.md)
- UI: [home-screen](../ui-map/home-screen.md) (GK card), [timeline-tab](../ui-map/timeline-tab.md) (quiz/GK tasks), [popups](../ui-map/popups.md) (GkCarouselScreen, QuizScreen)

## TODO
- TODO: confirm with founder — quiz/GK crossings do not flow into a `pending` queue or surface a `LevelUpPopup` automatically the way Loop 1, 2, and Sketchbook do. Is that intentional, or a gap?
- TODO: confirm with founder — daily reset behavior. The carousel is "today's" but there's no rule yet for what triggers a new day's items.
