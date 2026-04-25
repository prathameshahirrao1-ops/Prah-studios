# Homework

One HW per session. Photo-submit; teacher reviews with annotations + per-skill stars.

## State machine

```
pending → submitted → reviewed
                 ↘ overdue_pending  (TODO: confirm — declared in enum but no transition writes it)
```

`onTimeBonusAvailable` decides the on-time-bonus on submit.

## Fields — Homework

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | e.g. `hw_s1` |
| sessionId | string | yes | Foreign key → Session |
| sessionNumber | number | yes | |
| title | string | yes | e.g. `Lines & Strokes HW` |
| description | string | yes | What the kid is told to do |
| referenceImageUrl | string \| null | yes | |
| dueDate | string (ISO date) | yes | Start of day |
| estimateMin | number | yes | |
| status | enum | yes | `pending` \| `submitted` \| `reviewed` \| `overdue_pending` |
| onTimeBonusAvailable | boolean | yes | True until consumed by submit |
| submission | HwSubmission \| null | yes | |
| review | HwReview \| null | yes | |
| plannedRatings | `Partial<Record<SkillType, 1..5>>` | yes | Pre-baked teacher stars used by the dev "simulate review" action |
| plannedAnnotations | HwAnnotation[] | yes | Pre-baked annotations |
| plannedOverallNote | string | yes | Pre-baked overall note |

## Fields — HwSubmission

| Field | Type | Required | Notes |
|---|---|---|---|
| photoUri | string | yes | |
| submittedAt | string (ISO) | yes | |
| wasOnTime | boolean | yes | Captured at submit time |

## Fields — HwReview

| Field | Type | Required | Notes |
|---|---|---|---|
| reviewedAt | string (ISO) | yes | |
| annotations | HwAnnotation[] | yes | `{ id, x: 0..1, y: 0..1, note }` (relative coords on the photo) |
| overallNote | string | yes | |
| skillRatings | `Partial<Record<SkillType, 1..5>>` | yes | |
| pointsAwarded | object | yes | `{ participation, onTimeBonus, reviewPoints }`, each a `Partial<Record<SkillType, number>>` |

## Points awarded (per Loop 2)

- **Participation** (on submit): +1 to each of the 5 skills (+5 total)
- **On-time bonus** (on submit, if `onTimeBonusAvailable`): +1 to each of the 5 skills (+5 total)
- **Review points** (on teacher review): per skill `pts = max(0, stars − 1)` so 1★→0, 5★→4

## Example (in-flight)
```ts
{
  id: 'hw_s4',
  sessionId: 's4',
  sessionNumber: 4,
  title: 'Sketching Shapes HW',
  description: 'Pick one object from your home (a cup, a toy, anything). Break it into basic shapes...',
  referenceImageUrl: null,
  dueDate: '2026-04-17',
  estimateMin: 20,
  status: 'pending',
  onTimeBonusAvailable: true,
  submission: null,
  review: null,
  plannedRatings: { observation: 4, structure: 5, expression: 3, creativity: 3, problem_solving: 3 },
  plannedAnnotations: [
    { id: 1, x: 0.28, y: 0.35, note: 'Good light construction — shapes show through.' },
    /* ... */
  ],
  plannedOverallNote: 'Nicely built up from simple shapes...',
}
```

## Source
- `src/data/mockHomework.ts` (line 70: `interface Homework`; line 64: `HwSubmission`; line 51: `HwReview`; line 43: `HwAnnotation`; line 37: `HomeworkStatus`)

## Used by
- [ui-map/home-screen.md](../ui-map/home-screen.md) (HW card)
- [ui-map/popups.md](../ui-map/popups.md) (HwSubmissionPopup, HWReviewPopup)
- [ui-map/timeline-tab.md](../ui-map/timeline-tab.md) (per-session HW chip mirrored via `TimelineSession.hw`)

## TODO
- TODO: confirm with founder — `overdue_pending` status is declared but no code path transitions into it. Should an overdue rule be specced?
- TODO: confirm with founder — only 2 sessions (`s1`, `s4`) are seeded with HW. Is HW intended for *every* session, or only specific ones? Code comment says "one HW per session" but seed disagrees.
