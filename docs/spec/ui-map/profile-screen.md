# Profile Screen

Path: `src/screens/ProfileScreen.tsx`

The student's own account view — counters, level, skills, journeys, streaks, recent works.

## Sections (top to bottom)
1. **Header / identity** — `firstName`, `age`, avatar from [student](../schema/student.md) (`mockStudent`).
2. **Level summary** — derives overall level via `overallLevelFor(totalPoints(skills))` from `useSkillsState()` — see [skill](../schema/skill.md). Tap → `LevelDetailScreen`.
3. **SkillMap** (`./profile/SkillMap.tsx`) — segmented ring per skill, animates on growth. Tap a skill → `SkillDetailScreen`. See [skill](../schema/skill.md).
4. **Streak chips** — `useStreaksData()`, `STREAK_LABEL[type]`, counters for `hw` / `quiz` / `gk` — see [streak](../schema/streak.md).
5. **Counters card** — `classesAttended/classesTotal`, `hwSubmitted/hwTotal`, `quizzesDone` — from [student](../schema/student.md).
6. **Recent works** — `mockArtworks.slice(0, 4)` — see [artwork](../schema/artwork.md). "See all" → `AllMyWorksScreen`. Tap a tile → `FullImagePopover`.
7. **Current journey card** — `currentJourney` from `mockJourneys` — see [journey](../schema/journey.md). Tap → `JourneysScreen`.
8. **Next available journey** — first non-current entry — see [journey](../schema/journey.md).
9. **Footer / settings entry points** — `AccountScreen`, `BillingScreen`, `SettingsScreen`, `ReferralScreen`, `NotificationsScreen` (sibling routes in `ProfileStack`).

## Stack siblings (`src/navigation/ProfileStack`)
- `AllMyWorksScreen` — full grid of `mockArtworks`
- `LevelDetailScreen` — overall level breakdown ([skill](../schema/skill.md))
- `SkillDetailScreen` — per-skill detail; reads legacy `SKILL_LEVEL_DESCRIPTIONS`
- `JourneysScreen` — `explorerJourneys` + `masterJourneys`
- `AccountScreen`, `BillingScreen`, `SettingsScreen`, `ReferralScreen`, `NotificationsScreen`
- `FullImageView` — shared image viewer

## Triggers (interactions that fire rules)
- None directly — Profile is read-only. Side-effects (skill animation, growth dot clear) come from `markSkillGrowthSeen()` on tab open.

## Source
- `src/screens/ProfileScreen.tsx`
- `src/screens/profile/SkillMap.tsx`
- `src/screens/profile/*` (sibling stack screens)
- Reads: `useSkillsState`, `useStreaksData`, `mockStudent`, `mockArtworks`, `currentJourney`, `explorerJourneys`
