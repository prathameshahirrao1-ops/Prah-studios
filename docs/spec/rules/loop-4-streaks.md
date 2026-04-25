# Loop 4 — Streaks

Counters across HW, Quiz, and Daily GK that earn badges and named titles at milestones.

> **Note:** Code today contains the **state shape** (`StreakData`, `StreakBadge`, `useStreaksData`) and seeded values, but does **NOT** contain a function that increments counters or awards badges. The reactive store is read-only from the UI's perspective.

## Trigger
TODO: confirm with founder — the increment trigger is unspecified in code. Plausible candidates:
- HW streak: HW submitted on the day it became active? On time?
- Quiz streak: any session quiz completed?
- GK streak: full GK carousel viewed today?

## Effect (intended, per code comments and seed)
1. Increment the matching counter (`hw` / `quiz` / `gk`).
2. At milestones (3, 7, 21, 50) push a `StreakBadge` to `badges[]`.
3. At certain milestones, set a named title on `titles[streakType]` (e.g. `Daily Draw Cadet` at gk=5).

## Display
- `STREAK_LABEL` provides display strings: `HW streak`, `Quiz streak`, `Daily streak`.
- Profile screen and Timeline footer subscribe via `useStreaksData()`.

## Source (state-only)
- `src/data/mockStreaks.ts` (line 21: `StreakData`; line 30: `mockStreaks` seed; line 56–75: store + hook)

## Related
- Schema: [streak](../schema/streak.md)
- UI: [profile-screen](../ui-map/profile-screen.md), [timeline-tab](../ui-map/timeline-tab.md)

## TODO
- TODO: confirm with founder — increment trigger per streak type.
- TODO: confirm with founder — break rule (missed day vs missed event vs grace period).
- TODO: confirm with founder — full milestone → badge → title map.
- TODO: implement (post-spec) — an increment/award helper analogous to `creditPoints`, with a `pendingBadges` celebration queue.
