# Session (TimelineSession)

A single class on the student's curriculum timeline. One row in the Timeline tab.

## Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | e.g. `s1` |
| date | string (ISO) | yes | |
| sessionNumber | number | yes | 1-based |
| title | string | yes | e.g. `Lines & Strokes` |
| status | enum | yes | `attended` \| `missed` \| `upcoming` |
| keyConcepts | string[] | yes | 3-ish bullet points shown on the card |
| skills | SkillRating[] | no | Present when `status === 'attended'`. `{ name: string; stars: 0..5 }` |
| hw | enum | no | `pending` \| `under_review` \| `reviewed` (legacy mirror of homework status) |
| yourWorkId | string | no | Links to an `Artwork.id` |

## Per-session skill awards (curriculum)

A separate map credits points to the 5 skills when a session flips to `attended`. Not stored on the session itself in Pass 1.

| Session | observation | structure | expression | creativity | problem_solving | total |
|---|---|---|---|---|---|---|
| s1 | 4 | 6 | 4 | 3 | 3 | 20 |
| s2 | 4 | 8 | 3 | 3 | 2 | 20 |
| s3 | 5 | 7 | 3 | 3 | 2 | 20 |
| s4 | 5 | 6 | 4 | 3 | 2 | 20 |
| s5 | 7 | 5 | 4 | 2 | 2 | 20 |
| s6 | 8 | 5 | 3 | 2 | 2 | 20 |

Target ~20 pts/session, weighted toward what that session teaches.

## Example
```ts
{
  id: 's1',
  sessionNumber: 1,
  date: '2026-03-28',
  title: 'Lines & Strokes',
  status: 'attended',
  keyConcepts: ['Line types', 'Grip & pressure', 'Straight vs curved'],
  hw: 'pending',
  yourWorkId: 'aw1',
  skills: [
    { name: 'Observation', stars: 3 },
    { name: 'Line control', stars: 4 },
    { name: 'Hand drawing', stars: 3 },
  ],
}
```

## Source
- `src/data/mockStudent.ts` (line 23: `interface TimelineSession`; line 10: `interface SkillRating`; line 138: `mockTimeline`)
- `src/data/mockSessions.ts` (line 36: `SESSION_SKILL_AWARDS`)

## Used by
- [ui-map/timeline-tab.md](../ui-map/timeline-tab.md)
- [ui-map/home-screen.md](../ui-map/home-screen.md) (next class card, post-class summary)
- [ui-map/popups.md](../ui-map/popups.md) (SessionPopup, SessionSummaryPopup)

## TODO
- TODO: confirm with founder — per-session `skills` field uses free-text names like `"Line control"`, `"Hand drawing"`, `"Structure"`, `"Expression"` — these don't match the canonical 5-skill `SkillType` enum. Is this an intentional "skills *demonstrated this session*" view (free-form), or a bug where the names should be normalised?
- TODO: confirm with founder — `missed` status is in the enum but no mock entry uses it. Is missed-class handling actually in scope for Phase 1?
