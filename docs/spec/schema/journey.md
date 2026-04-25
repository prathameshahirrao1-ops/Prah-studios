# Journey (course)

A course or workshop offering. The student has one `current` journey at a time; others are `available` or `completed`.

## Fields — JourneyCourse

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | e.g. `master_drawing_foundation` |
| title | string | yes | |
| category | enum | yes | `explorer` (1-day workshops) \| `master` (3-month / 1-month courses) |
| duration | string | yes | e.g. `3 Months`, `1 Day`, `2 Days` |
| sessions | number | no | Only for master courses |
| price | number | yes | INR |
| dateAvailable | string | no | Display-only date string |
| description | string | yes | Long-form |
| keyConcepts | string[] | yes | Module list |
| skillsGained | SkillType[] | yes | One or more of the 5 skills |
| status | enum | yes | `current` \| `completed` \| `available` |

## Categories

- **`master`** — multi-week, includes `sessions` count. Examples: Drawing Foundation, Colour & Painting, Sketching Intensive.
- **`explorer`** — single-day or weekend workshops. Examples: Watercolour Splash, Mandala Art, Portrait Basics.

## Convenience exports

- `explorerJourneys` — filtered by `category === 'explorer'`
- `masterJourneys` — filtered by `category === 'master'`
- `currentJourney` — first with `status === 'current'`, else `null`

## Example — current master journey
```ts
{
  id: 'master_drawing_foundation',
  title: 'Drawing Foundation',
  category: 'master',
  duration: '3 Months',
  sessions: 24,
  price: 4500,
  description: 'The complete foundation course...',
  keyConcepts: [
    'Shapes & Forms', 'Observation', 'Object Construction',
    'Light & Shadow', 'Composition', 'Creative Drawing',
  ],
  skillsGained: ['observation', 'structure', 'expression', 'creativity', 'problem_solving'],
  status: 'current',
}
```

## Source
- `src/data/mockJourneys.ts` (line 6: `interface JourneyCourse`; line 4: `JourneyCategory`, `JourneyStatus`; line 20: `mockJourneys`)

## Used by
- [ui-map/profile-screen.md](../ui-map/profile-screen.md) (current journey card, Explorer journeys block, JourneysScreen)
- [ui-map/home-screen.md](../ui-map/home-screen.md) (ExplorerJourneysBlock)

## TODO
- TODO: confirm with founder — only one `current` journey at a time? Mock has exactly one but the type doesn't enforce.
- TODO: confirm with founder — `dateAvailable` is a free string ("Sat, 3 May 2026", "Jun 2026"). Should this be ISO + formatted in UI?
