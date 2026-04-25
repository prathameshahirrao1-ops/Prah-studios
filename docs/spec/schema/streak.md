# Streak

Per-student streak counters and earned badges. One doc at `students/{uid}/streaks/current`.

## Fields — StreakData

| Field | Type | Required | Notes |
|---|---|---|---|
| hw | number | yes | HW streak count |
| quiz | number | yes | Quiz streak count |
| gk | number | yes | Daily GK streak count |
| badges | StreakBadge[] | yes | Earned badges, in order |
| titles | `Partial<Record<StreakType, string>>` | yes | Highest-tier title currently held per streak type |

`StreakType = 'hw' | 'quiz' | 'gk'`

## Fields — StreakBadge

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | e.g. `b_quiz_3` |
| streakType | StreakType | yes | |
| milestone | number | yes | 3, 7, 21, 50 |
| earnedAt | string (ISO date) | yes | |
| title | string | no | Set when this badge unlocks a named title |

## Labels (display)

| Type | Label |
|---|---|
| hw | `HW streak` |
| quiz | `Quiz streak` |
| gk | `Daily streak` |

## Example
```ts
{
  hw: 2,
  quiz: 3,
  gk: 5,
  badges: [
    { id: 'b_quiz_3', streakType: 'quiz', milestone: 3, earnedAt: '2026-04-12' },
    { id: 'b_gk_3',   streakType: 'gk',   milestone: 3, earnedAt: '2026-04-01' },
  ],
  titles: {
    gk: 'Daily Draw Cadet',  // 5-day starter title
  },
}
```

## Source
- `src/data/mockStreaks.ts` (line 21: `interface StreakData`; line 13: `StreakBadge`; line 11: `StreakType`; line 30: `mockStreaks`)

## Used by
- [ui-map/profile-screen.md](../ui-map/profile-screen.md) (streak chips)
- [ui-map/timeline-tab.md](../ui-map/timeline-tab.md) (StreakFooter)

## TODO
- TODO: confirm with founder — milestone tiers (3, 7, 21, 50) are documented in the comment but no rule file specs how the counters increment, when a badge is earned, or what triggers a title unlock. See `rules/loop-4-streaks.md` for the placeholder.
- TODO: confirm with founder — when does a streak break? On a missed day, missed class, missed HW deadline?
