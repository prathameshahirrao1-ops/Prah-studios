# Artwork

A finished piece tied to a session. Used in MyWork, peer profiles, and the FullImageView popover.

## Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | e.g. `aw1`, `p1a1` |
| sessionNumber | number | yes | |
| sessionTitle | string | yes | |
| date | string (ISO date) | yes | |

> Image field is intentionally omitted in Pass 1 — UI renders a placeholder (per `mockStudent.ts` comment, line 20).

## Sketchbook piece (separate, related)

Sketchbook pieces are user-uploaded artworks (not class output). Distinct shape:

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | |
| photoUri | string | yes | |
| title | string | yes | |
| submittedAt | string (ISO) | yes | |
| weekKey | string | yes | ISO week, e.g. `2026-W17` |
| status | enum | yes | `submitted_pending_review` \| `reviewed` \| `portfolio_only` |
| eligibleForPoints | boolean | yes | Only if within the 2-per-week cap at submit time |
| review | SketchbookReview \| null | yes | |
| plannedRatings | `Partial<Record<SkillType, 1..5>>` | yes | For dev-action review |
| plannedRemark | string | yes | |

`SketchbookReview` = `{ reviewedAt, skillRatings, remark, pointsAwarded }`. Total `pointsAwarded` capped at 15 across skills.

## Lookup
`findArtworkById(id)` searches own artworks AND peer artworks — used by the shared `FullImagePopover`.

## Example — Artwork
```ts
{ id: 'aw1', sessionNumber: 1, sessionTitle: 'Lines & Strokes', date: '2026-03-28' }
```

## Example — SketchbookPiece (reviewed)
```ts
{
  id: 'sb_seed_1',
  photoUri: '__mock_photo__',
  title: 'My cat in the morning',
  submittedAt: '2026-04-12T09:00:00+05:30',
  weekKey: '2026-W15',
  status: 'reviewed',
  eligibleForPoints: true,
  review: {
    reviewedAt: '2026-04-13T18:00:00+05:30',
    skillRatings: { observation: 4, structure: 3, expression: 4, creativity: 5, problem_solving: 3 },
    remark: 'Loved the way you caught the sleepy eyes...',
    pointsAwarded: { observation: 3, structure: 2, expression: 3, creativity: 4, problem_solving: 2 },
  },
}
```

## Source
- `src/data/mockStudent.ts` (line 15: `interface Artwork`; line 114: `mockArtworks`; line 128: `findArtworkById`)
- `src/data/mockSketchbook.ts` (line 49: `interface SketchbookPiece`; line 39: `SketchbookReview`; line 34: `SketchbookStatus`)

## Used by
- [ui-map/profile-screen.md](../ui-map/profile-screen.md) (Recent works, AllMyWorks, FullImageView)
- [ui-map/timeline-tab.md](../ui-map/timeline-tab.md) (My Work tab, session "your work" tile)
- [ui-map/popups.md](../ui-map/popups.md) (SketchbookUploadPopup, SketchbookReviewPopup)

## TODO
- TODO: confirm with founder — Artwork has no `imageUri` in Pass 1. When does a real photo land — same milestone as Firestore wiring, or before?
- TODO: confirm with founder — Sketchbook cap is 2 reviewable pieces per week. Extras become `portfolio_only` (0 pts). Confirm copy/UX for users hitting the cap.
