# Skill / Level

5 skills accumulate raw points. The sum across all 5 drives a single overall level on a 10-tier × 3-sub-level ladder (plus Grandmaster).

## SkillType (enum)

| Key | Display name | Icon | Color |
|---|---|---|---|
| observation | Observation | eye-outline | #4A8FD9 |
| structure | Structure | cube-outline | #D18D1E |
| expression | Expression | color-palette-outline | #9B5DB8 |
| creativity | Creativity | sparkles-outline | #4EAD7A |
| problem_solving | Problem Solving | bulb-outline | #D9715A |

`SKILL_ORDER` = `[observation, structure, expression, creativity, problem_solving]` — used everywhere a stable order matters.

## Level ladder (overall only)

Per-skill has NO sub-levels — it shows raw points only. Sub-levels exist only on the overall sum.

| Tier | Sub-levels | Sub-level cost | Cumulative range |
|---|---|---|---|
| Doodler | 3 | 100 | 0 – 300 |
| Sketcher | 3 | 150 | 300 – 750 |
| Apprentice | 3 | 200 | 750 – 1350 |
| Creator | 3 | 300 | 1350 – 2250 |
| Artisan | 3 | 400 | 2250 – 3450 |
| Refiner | 3 | 500 | 3450 – 4950 |
| Skilled | 3 | 700 | 4950 – 7050 |
| Expert | 3 | 900 | 7050 – 9750 |
| Master | 3 | 1100 | 9750 – 13050 |
| Grandmaster | 0 | — | 13050 – ∞ |

`overallLevelFor(totalPoints)` resolves a point total to an `OverallLevel`:
- `tier`, `tierIndex` (0..9), `subLevel` (1..3 or null at Grandmaster), `stepIndex` (0..28)
- `displayName` e.g. `Apprentice · 3` or `Grandmaster`
- progress fields: `pointsIntoTier`, `pointsIntoSub`, `pointsToNextSub`, `pointsToNextTier`, `subStart`, `subEnd`

## Fields — SkillState

| Field | Type | Required | Notes |
|---|---|---|---|
| points | `Record<SkillType, number>` | yes | Per-skill totals |
| history | SkillEntry[] | yes | Append-only log of credits |
| hasUnseenSkillGrowth | boolean | yes | Drives Profile-tab dot |
| pendingCrossings | CrossedThreshold[] | yes | Celebration queue |

## Fields — SkillEntry

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | |
| skill | SkillType | yes | |
| amount | number | yes | Positive only — points never decrease |
| source | string | yes | Human-readable, e.g. `HW: Session 2 evaluated` |
| sourceType | PointSource | no | See list below |
| date | string (ISO) | yes | |

`PointSource` = `session_attended` \| `hw_participation` \| `hw_on_time_bonus` \| `hw_review` \| `sketchbook_review` \| `daily_quiz` \| `week_recap` \| `daily_carousel` \| `initial_assessment`

## Fields — CrossedThreshold

| Field | Type | Required | Notes |
|---|---|---|---|
| type | `'sub' \| 'tier'` | yes | A tier crossing beats a sub crossing at the same point |
| previous | OverallLevel | yes | |
| next | OverallLevel | yes | |

## creditPoints rules
- Positive deltas only — negative ignored.
- Multiple sub-levels crossed in one credit → highest one wins.
- Tier crossing takes precedence over sub crossing at the same total.
- Returns `{ nextState, crossed | null }`.

## Per-skill level descriptions (legacy)
`SKILL_LEVEL_DESCRIPTIONS` exposes 5 levels × 5 skills of parent-readable text. Code comment marks this as legacy — new model has no per-skill sub-levels. `SkillDetailScreen` still reads it.

## Source
- `src/data/mockSkills.ts` (line 22: `SkillType`; line 79: `LEVEL_LADDER`; line 130: `OverallLevel`; line 152: `overallLevelFor`; line 251: `SkillState`; line 245: `CrossedThreshold`; line 284: `creditPoints`; line 485: `SKILL_LEVEL_DESCRIPTIONS`)

## Used by
- [ui-map/profile-screen.md](../ui-map/profile-screen.md) (SkillMap, level summary, skill detail, level detail)

## TODO
- TODO: confirm with founder — `SKILL_LEVEL_DESCRIPTIONS` is marked legacy in code; `SkillDetailScreen` still uses it. Should it be replaced (with what?) or kept as parent-facing copy?
- TODO: confirm with founder — `week_recap` PointSource is declared but no loop currently emits it. Is a weekly recap loop planned?
