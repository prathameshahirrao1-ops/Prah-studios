# Loop 5 — Level Up

Whenever any other loop credits points, the same `creditPoints` helper detects sub-level / tier crossings and queues a `CrossedThreshold` for celebration.

## Trigger
Any call into `creditPoints(prev, input)` from:
- Loop 1 — `completeSession` (session attended)
- Loop 2 — `submitHomework` (participation + on-time bonus), `reviewHomework` (review points)
- Loop 3 — `creditQuizCompletion`, `creditGkCompletion`
- Sketchbook — `reviewSketchbook` (up to 15 pts/piece, 2 pieces/week cap)
- Initial assessment seed (`week_4`, `week_12` mock presets)

## Effect (inside `creditPoints`)
1. Compute previous total = sum of all 5 skill points.
2. Resolve `prevLevel = overallLevelFor(prevTotal)`.
3. Apply positive deltas only (negative ignored). Append `SkillEntry` per skill.
4. Recompute `nextLevel`. Detect crossing:
   - If `tierIndex` increased → `crossed = { type: 'tier', previous, next }`.
   - Else if `stepIndex` increased → `crossed = { type: 'sub', previous, next }`.
   - Tier beats sub at the same point.
   - Multiple crossings in one call → highest one wins.
5. Set `hasUnseenSkillGrowth: true` and append crossing (if any) to `pendingCrossings[]`.
6. Return `{ nextState, crossed }`.

## Surfacing the celebration
Each loop captures the returned `crossed` into its own `pendingCrossing` slot:
- Loop 1: `SessionFlags.pendingCrossing` → drained by `drainPendingCrossing()`.
- Loop 2: `HomeworkState.pendingCrossing` → drained by `drainHwCrossing()`.
- Sketchbook: `SketchbookState.pendingCrossing` → drained by `drainSketchbookCrossing()`.

HomeScreen orchestrates the popup chain: the loop's content popup (SessionSummary, HWReview, SketchbookReview) closes first, then `LevelUpPopup` opens for the drained crossing.

## Marking growth seen
`markSkillGrowthSeen(state)` clears `hasUnseenSkillGrowth` and `pendingCrossings[]`. Called when Profile tab is opened and SkillMap animates.

## Source
- `src/data/mockSkills.ts` (line 284: `creditPoints`; line 152: `overallLevelFor`; line 245: `CrossedThreshold`; line 342: `markSkillGrowthSeen`)

## Related
- Schema: [skill](../schema/skill.md)
- UI: [home-screen](../ui-map/home-screen.md) (LevelUpPopup orchestration), [profile-screen](../ui-map/profile-screen.md) (SkillMap, level summary)

## TODO
- TODO: confirm with founder — Quiz and GK both call `creditPoints` (which appends to `pendingCrossings[]` on the skills state) but no UI code currently drains that queue from the global state. Loop 1, 2, sketchbook each maintain their own copy. Is the global `pendingCrossings` array intentional or vestigial?
