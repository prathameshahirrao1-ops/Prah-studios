# Prah Studio — Loop Design Doc

Working document for Phase 2 (sketch) of the loop-design process.
Each loop is walked through step-by-step, decisions are recorded here,
and the resulting backend contract is written at the bottom of each section.

**Status legend:**
- 🟡 = questions open, waiting on user decision
- 🟢 = decided
- 🔴 = decided to defer

---

## Loops committed to building (user-selected)

1. **Class Attendance Loop** — currently in Phase 2 walkthrough
2. **Homework Loop** — next
3. **Skill Growth Loop** — shared endpoint; receives from loops 1, 2, and any future loops (Quiz, etc.)

Other loops (Teacher voice, Daily engagement, Parent share, etc.) are deferred
until the user asks. Do not design or build them proactively.

---

## Loop 1 — Class Attendance

**Plain-English summary:** Aarav attends a class → the app knows → skills grow → he sees it.

### Step-by-step walkthrough

| # | Step | Decision | Status |
|---|---|---|---|
| 1 | Pre-class — what does NextClass card do? | Info-only card. No materials list, no warm-up. | 🟢 |
| 2 | During-class — does the app show anything? | Yes — a "Class is live" card (LiveClassCard). Same view for student and parent — the app does **not** branch by viewer role. | 🟢 |
| 3 | Who marks attendance? | **Teacher marks attendance BEFORE class starts** on her own teacher-side dashboard (built later). The mark is invisible to the student's app until class ends. No auto-attendance, no self-report. | 🟢 |
| 4 | Post-class landing moment | Small celebration popup on next app open: "Session complete" + summary of skills gained + session summary. On close → Timeline with the session card marked "Completed." Tapping it re-opens the same summary. | 🟢 |
| 5 | Source of "key concepts" | **Pre-set curriculum** — every Session N has fixed concepts authored with the course. Meera does not customize. | 🟢 |
| 6 | How skill-point update becomes visible | Flying-number animation on SkillMap when Profile opens for the first time after class ("+4 Observation" etc.) **AND** a red dot on the Profile tab icon nudging the user to visit. | 🟢 |
| 7 | Level-up celebration | Two-tier level system: **major levels** (Apprentice → Developing → Accomplished → Master) take 1–2 months to cross. Between each pair of major levels, **2 sub-levels** that are achievable every 1–2 weeks. Small celebration for sub-level crossings, bigger celebration for major-level crossings. | 🟢 |
| 8 | When HW appears after class | **Next morning** (Sunday) — HW card appears on Home after a night's rest. | 🟢 |

### Resulting flow

**Friday evening.** NextClass card on Home shows info only — *"Sat, 25 Apr · 10:00 am · Observation — Still Life · Session 6."*

**Saturday ~9:55 am.** Meera opens her teacher dashboard and marks attendance for the students physically present. This mark is stored on the server but **not yet visible** to the student's app.

**Saturday 10:00 am → 11:00 am (class in session).** Anyone who opens the Prah app during this window sees a **LiveClassCard** on Home — "Class is live." The same card is shown regardless of whether the viewer is Aarav or his parent; the app has one account, one view.

**Saturday 11:00 am (class ends).** Server flips the session from `live` → `completed` and credits skill points based on (a) Meera's pre-class attendance mark and (b) the pre-set curriculum's per-skill award for Session 6.

**Next time Aarav opens the app.** A small celebration popup appears — *"Session 6 complete!"* — showing the session summary (key concepts covered) and the skill points gained. On dismiss, the user lands on Timeline with Session 6 marked "Completed." Tapping that card re-opens the same summary any time.

Meanwhile, a **red dot** appears on the Profile tab icon. When Aarav taps Profile for the first time since class, the SkillMap rings animate with flying "+N" numbers. If a **sub-level threshold** was crossed (common — every 1–2 weeks), a small pip celebration plays. If a **major-level threshold** was crossed (rare — every 1–2 months), a fuller level-up moment plays.

**Sunday morning.** HW card for Session 6 appears on Home. Hand-off to Loop 2.

### Backend contract

Data the server owns and the app fetches/receives:

**Session object**
```
{
  id, number, title, dateIso, durationMin,
  status: "scheduled" | "live" | "completed" | "missed",
  keyConcepts: string[],              // pre-set per curriculum
  skillAwards: { [skillName]: number } // pre-set per curriculum — e.g. { Observation: 4, Structure: 2 }
}
```

**Attendance endpoint (teacher-side, deferred build)**
```
POST /sessions/:id/attendance
body: { studentId, attended: boolean, markedAt }
```
Not exposed to the student's app. Consumed server-side when the session auto-transitions to `completed`.

**Session state machine (server-driven, time-based)**
- `scheduled` → `live` at session start time
- `live` → `completed` at session end time, at which point:
  - Skill points are credited to each attending student
  - A notification/flag is set on their account (`hasUnseenSessionSummary`, `hasUnseenSkillGrowth`)
  - An HW record is scheduled to become visible the next morning (`hw.availableAt = next-day 06:00 local`)

**Student home payload (fetched on app open)**
```
{
  nextSession,                // scheduled
  liveSession,                // status=live, if any
  lastCompletedSession,       // most recent attended session
  hasUnseenSessionSummary: bool,   // drives celebration popup on open
  hasUnseenSkillGrowth:   bool,    // drives red dot on Profile tab
  skills: { [skillName]: { points, level, subLevel } },
  hw: { ... }                 // defined in Loop 2
}
```

**Session summary payload** (returned when popup opens OR Timeline card tapped)
```
{
  title, keyConcepts,
  skillsGained: [
    { name, points, newTotal, crossedThreshold: "sub" | "major" | null }
  ]
}
```

**Level model (replaces current flat LEVELS array)**
- Major levels: `Apprentice`, `Developing`, `Accomplished`, `Master` (4 bands).
- Between each pair of major levels: 2 sub-levels.
- Concretely: Apprentice → sub-1 → sub-2 → Developing → sub-3 → sub-4 → Accomplished → sub-5 → sub-6 → Master.
- Each sub-level threshold is 1–2 weeks of expected earning; each major-level threshold is 1–2 months.
- The server is the source of truth for thresholds; client reads them from config.

### Implementation notes for Phase 3 (mock mode)

- `mockSkills.ts` needs the two-tier level structure (major + sub-levels). The current `LEVELS` array is flat — needs to be replaced.
- `homeState.ts` already has a `liveSession` branch — keep, but also add a transition: after session `endTime + 1 minute`, flip the home state so the LiveClassCard becomes the PostClassCard (which already exists).
- Session summary popup can reuse `Popup.tsx`. Needs new component: `SessionSummaryPopup.tsx`.
- Profile tab red dot: small visual state on `RootTabs.tsx` driven by a `hasUnseenSkillGrowth` flag.
- Flying-number animation on SkillMap: entering animation that plays once per Profile mount if the flag is set. Uses `Animated` from RN (no Reanimated needed for Pass 1).

---

## Loop 2 — Homework

**Plain-English summary:** Sunday morning HW appears → Aarav draws on paper → uploads photo → teacher reviews later → feedback + skill points come back → SkillMap updates → Timeline marks HW done.

### Step-by-step walkthrough

| # | Step | Decision | Status |
|---|---|---|---|
| 1 | What's on the HW card on Home? | **Full card**: title + due date + thumbnail + reference image (when applicable) + description of what to do + direct upload area on the card itself (same pattern as Pass 1). HW varies per session — some have a reference image to copy, some are prompt-only ("draw a square and build a scene from it"). Layout stays the same; the reference image slot is optional. | 🟢 |
| 2 | When is HW due? | **Before the next class.** Strict deadline — instils discipline. No leniency. | 🟢 |
| 3 | Multiple photos? | **Single photo, replaceable before submit.** Student can re-upload to swap the photo any number of times pre-submit. | 🟢 |
| 4 | Edit/delete after submit? | **Locked on submit.** Technically feasible to allow replacement post-submit, but teacher may have started reviewing — swapping photos mid-review breaks integrity. Keep Pass 1 behaviour. | 🟢 |
| 5 | How Aarav knows teacher reviewed it | **Push notification + celebration popup on next app open** showing teacher's feedback (annotated photo + note + star ratings) and skill points gained. On popup close → HW card state flips to "Reviewed / Completed." Tapping it re-opens the same feedback view anytime. | 🟢 |
| 6 | Feedback format | **Star rating per skill + written note + annotated photo.** Teacher places numbered circles (1, 2, 3…) on the photo; each circle has a note shown below the photo. Star ratings and overall note sit below the annotations. | 🟢 |
| 7 | When do skill points land? | **Split award.** On submit: 1 participation point per skill (5 pts total). On teacher review: the rest, based on her ratings per skill. **Bonus:** 5-point on-time submission bonus — shown on the HW card ("+5 on time") and awarded only if submitted before the next class. Late submissions forfeit the 5-point bonus (but still get participation + review points). | 🟢 |
| 8 | Unsubmitted HW after next class | **Never disappears.** The newest session's HW takes the Home slot. Older pending HW rolls into the Timeline's "Today" section in a **pending / dimmed state** — visually de-emphasised vs. the active HW, but persistently visible so Aarav knows it's still owed. | 🟢 |

### Resulting flow

**Sunday morning.** HW card appears on Home — *"Session 6 Homework · Due Sat 2 May (before Session 7) · [reference image thumbnail] · Draw the still-life we set up in class · +5 on-time bonus"*. Upload area sits directly on the card.

**Aarav draws on paper during the week.** Opens app, taps upload on the HW card → picks photo → preview shows on the card → he can reupload to replace as many times as he wants. Once happy, taps Submit → confirmation → **submitted**. Small glow celebration. Server credits **5 participation points (1 per skill) + 5 on-time bonus** (since it's before Session 7). Timeline card flips to "Submitted, awaiting review."

**Teacher reviews on her dashboard.** She annotates the photo with numbered circles, writes a note per circle, gives a star rating per skill, and submits. Server credits the review-based skill points on top of the participation points.

**Next time Aarav opens the app.** Push notification fired + celebration popup appears — *"Session 6 HW reviewed!"* — showing the annotated photo, circle notes, star ratings, and skill points gained. On close → HW card state flips to **Reviewed / Completed**. Tapping it anytime re-opens the same feedback view.

**If HW is not submitted before Session 7.** Session 7 opens → new HW card takes the Home slot. Session 6's unsubmitted HW drops into the Timeline's "Today" section in a **dimmed pending state** — still openable, still submittable, but de-emphasised. On late submit: 5 participation points awarded, on-time bonus (5) forfeit, review points awarded normally after teacher feedback.

### Backend contract

**Homework object**
```
{
  id, sessionId, studentId,
  title, description,
  referenceImageUrl: string | null,   // optional — some HW is prompt-only
  dueAt,                               // = next session start time
  availableAt,                         // = session end + 1 day @ 06:00 local
  status: "pending" | "submitted" | "reviewed" | "overdue_pending",
  onTimeBonusAvailable: boolean,       // true until dueAt passes
  submission: {
    photoUrl, submittedAt, wasOnTime: boolean
  } | null,
  review: {
    reviewedAt,
    annotations: [                      // numbered circles on photo
      { id: 1, x, y, radius, note: string }
    ],
    overallNote: string,
    skillRatings: { [skillName]: number },  // 1–5 stars per skill
    pointsAwarded: {
      participation: { [skillName]: 1 },    // 1 pt per skill on submit
      onTimeBonus:   { [skillName]: 1 },    // 1 pt per skill if wasOnTime
      reviewPoints:  { [skillName]: number } // from teacher ratings
    }
  } | null
}
```

**Submit endpoint**
```
POST /homework/:id/submit
body: { photoUrl }
→ server sets submittedAt, wasOnTime = (now < dueAt)
→ credits 5 participation points (1 per skill)
→ credits 5 on-time bonus (1 per skill) if wasOnTime
→ sets status = "submitted"
```

**Reupload endpoint (pre-submit only)**
```
PUT /homework/:id/photo
body: { photoUrl }
→ replaces draft photo; no points awarded
→ fails if status != "pending"
```

**Teacher review (teacher-side, deferred build)**
```
POST /homework/:id/review
body: { annotations, overallNote, skillRatings }
→ credits review points per skill based on ratings
→ sets hasUnseenHWReview = true on student account
→ fires push notification
→ sets status = "reviewed"
```

**State machine**
- `pending` → `submitted` (on submit)
- `pending` → `overdue_pending` (when next session starts and still not submitted)
- `overdue_pending` → `submitted` (late submit; no on-time bonus)
- `submitted` → `reviewed` (teacher reviews)

**Home payload addition** (extends Loop 1's payload)
```
hw: {
  latest: HomeworkObject,              // drives the Home HW card
  overduePending: HomeworkObject[],    // drives Timeline dimmed cards
  hasUnseenHWReview: boolean           // drives review celebration popup
}
```

**HW review payload** (returned when review popup opens OR timeline card tapped)
```
{
  title, photoUrl,
  annotations: [{ id, x, y, radius, note }],
  overallNote,
  skillRatings,
  skillsGained: [
    { name, points, newTotal, crossedThreshold: "sub" | "major" | null }
  ]
}
```

### Implementation notes for Phase 3 (mock mode)

- `mockHomework.ts` needs the new fields: `referenceImageUrl`, `description`, `availableAt`, `dueAt`, `onTimeBonusAvailable`, `review.annotations[]`.
- HW card on Home — extend existing card to show reference image thumbnail + description + "+5 on-time" bonus chip.
- HW submission popup already exists (`HWSubmissionPopup` or similar) — keep; just wire the points-on-submit animation (+5 participation, +5 on-time) as a micro-celebration.
- New component: `HWReviewPopup.tsx` — full-screen or bottom-sheet showing annotated photo (image with numbered circle overlays), circle notes list, star ratings per skill, skill points gained. Reuses `SessionSummaryPopup` visual language.
- Timeline dimmed "overdue pending" state — new visual state on existing timeline HW node: opacity ~0.5, pending-tone dot, persistent "Still owed" label.
- Participation points math lives in mock state: on submit, mutate `skills[x].points += 1` for each of 5 skills; if `wasOnTime`, +1 more each; set `hasUnseenHWReview = false` until teacher review is simulated.
- Annotation overlay on photo: absolute-positioned numbered circles (x/y percentages) over the image; tap a circle to highlight its matching note in the list below.

---

---

## Loop 3 — Skill Growth (shared endpoint)

**Plain-English summary:** Every point from every source (sessions, HW, Sketchbook, quizzes, carousel) lands in this shared skill system. Points accumulate across 5 skills and sum into one overall level. Overall level has a 10-tier ladder with 3 sub-levels per tier — a 28-step climb from Doodler 1 to Grandmaster.

### Locked decisions

| # | Decision | Status |
|---|---|---|
| 1 | 5 skills tracked: Observation, Structure, Expression, Creativity, Problem Solving (from v7 §11) | 🟢 |
| 2 | **Only one level ladder — OVERALL** (sum of all 5 skills). Individual skills show raw point totals only, no per-skill sub-levels. | 🟢 |
| 3 | SkillMap on Profile = existing Olympics layout (5 circles: 3 top + 2 bottom) — already built | 🟢 |
| 4 | Red dot on Profile tab when new points are unseen | 🟢 |
| 5 | Flying "+N" animation on SkillMap when Profile opens for the first time after a point gain | 🟢 |
| 6 | Sub-level crossing → small pip celebration (inline) | 🟢 |
| 7 | Tier crossing (Doodler → Sketcher etc.) → fuller celebration popup | 🟢 |
| 8 | Initial assessment: teacher rates each skill 1–5 after first class; server converts to starting points. Not a "test" — just first-class observation. | 🟢 |
| 9 | Cross-course carryover: skill points are permanent artistic record; persist across enrolments | 🟢 |

### Point earning — weekly structure

Max weekly earning = 168 pts (with Sketchbook).

| Source | Per event | Weekly max |
|---|---|---|
| Drawing session (2/week, Sat + Sun) | 20 pts | 40 |
| Weekly HW | 20 pts total (5 participation + 5 on-time + 10 review) | 20 |
| Daily Quiz (3 questions × 2 pts, 7 days) | 6 pts | 42 |
| Week Recap Challenge | 15 pts | 15 |
| Daily Carousel (3 cards × 1 pt, 7 days) | 3 pts | 21 |
| Sketchbook (2 pieces × 15 pts, points-earning) | 15 pts | 30 |
| **Total weekly max** | | **168** |

Minimum guaranteed (sessions + HW only) = 60 pts/week.

### Level ladder — 10 tiers × 3 sub-levels + Grandmaster

| Tier | Sub-level cost | Tier total | Cumulative end |
|---|---|---|---|
| Doodler 1 / 2 / 3 | 100 | 300 | 300 |
| Sketcher 1 / 2 / 3 | 150 | 450 | 750 |
| Apprentice 1 / 2 / 3 | 200 | 600 | 1,350 |
| Creator 1 / 2 / 3 | 300 | 900 | 2,250 |
| Artisan 1 / 2 / 3 | 400 | 1,200 | 3,450 |
| Refiner 1 / 2 / 3 | 500 | 1,500 | 4,950 |
| Skilled 1 / 2 / 3 | 700 | 2,100 | 7,050 |
| Expert 1 / 2 / 3 | 900 | 2,700 | 9,750 |
| Master 1 / 2 / 3 | 1,100 | 3,300 | 13,050 |
| **Grandmaster** | — (single step) | — | **13,050+** |

Power curve: early tiers fast (hook), later tiers slow (earned mastery).

### Reach projections (after initial assessment = 0 pts)

| Effort | Weekly earn | End Foundation (12 wks) | Master 1 | Grandmaster |
|---|---|---|---|---|
| Maximum | 168 | Creator 3 | Week 58 (~1.1 yrs) | **Week 78 (~1.5 yrs)** |
| Diligent | 140 | Creator 2 | ~1.3 yrs | ~1.8 yrs |
| Typical | 90 | **Apprentice 2** | ~2.1 yrs | ~2.8 yrs |
| Minimum | 60 | Sketcher 2 | ~3.1 yrs | ~4.2 yrs |

### Sub-level pacing (max kid)

- Doodler sub: ~0.6 wks (multiple pops in Week 1 — huge early hook)
- Sketcher sub: ~0.9 wks
- Apprentice sub: ~1.2 wks
- Creator sub: ~1.8 wks
- Artisan sub: ~2.4 wks
- Refiner sub: ~3 wks
- Skilled sub: ~4.2 wks
- Expert sub: ~5.4 wks
- Master sub: ~6.5 wks

Climb visibly steepens. Matches real mastery arc.

### Initial assessment starting points

Teacher rates each of 5 skills 1–5 after first class. Per-skill starting points:

| Teacher rating | Starting pts per skill |
|---|---|
| 1 — Absolute beginner | 0 |
| 2 — Basic familiarity | 50 |
| 3 — Some experience | 150 |
| 4 — Clearly practised | 300 |
| 5 — Advanced for age | 500 |

Example: talented 10-year-old rated 4/4/3/4/3 → 300 + 300 + 150 + 300 + 150 = **1,200 pts → Apprentice 3.** First app open after Class 1 shows: *"Your teacher has placed you at Apprentice 3. Let's grow from here."*

### Backend contract — skill growth endpoint

**Skills state on student account**
```
skills: {
  Observation:     { points: number },
  Structure:       { points: number },
  Expression:      { points: number },
  Creativity:      { points: number },
  ProblemSolving:  { points: number }
},
totalPoints: number,                  // sum of all 5
overallLevel: {
  tier: "Doodler" | "Sketcher" | "Apprentice" | "Creator" | "Artisan" | "Refiner" | "Skilled" | "Expert" | "Master" | "Grandmaster",
  subLevel: 1 | 2 | 3 | null,          // null for Grandmaster
  pointsIntoTier: number,
  pointsToNextSub: number
},
hasUnseenSkillGrowth: boolean,         // red dot on Profile tab
lastCrossedThreshold: {                // drives next-open celebration
  type: "sub" | "tier" | null,
  newTier: string | null,
  newSubLevel: number | null
}
```

**Points-credit endpoint (server-side, called by every source loop)**
```
INTERNAL: creditPoints(studentId, source, pointsPerSkill: {[skill]: number})

1. Add points to each skill.
2. Recompute totalPoints.
3. Recompute overallLevel from LEVEL_THRESHOLDS config.
4. If tier or sub-level crossed: set lastCrossedThreshold.
5. Set hasUnseenSkillGrowth = true.
6. Append to gains log: { source, ts, deltas: {[skill]: number} }.
```

Called from:
- Loop 1 session-completed job (pre-set curriculum awards)
- Loop 2 HW submit (participation + on-time bonus) and Loop 2 HW review (teacher ratings)
- Loop 4 Sketchbook review (up to 15 pts across skills)
- (future) Quiz + Carousel + Week Recap

### Phase 3 implementation notes

- `mockSkills.ts` replaces flat LEVELS array with tier/sub-level config. Add `creditPoints(source, deltas)` helper that mutates skill state and computes level transitions.
- Level ladder config = single exported const `LEVEL_LADDER` with tier names + thresholds.
- Only compute ONE level (overall). Per-skill shows raw points only.
- SkillMap circles already built — just wire to new point state + flying-number Animated entrance.
- `hasUnseenSkillGrowth` flag drives red dot on `RootTabs.tsx`.
- Sub-level pip = small inline animation on level pill. Tier crossing = full `LevelUpPopup.tsx` with confetti.

---

## Loop 4 — Sketchbook (NEW)

**Plain-English summary:** Student uploads self-driven artwork from the Journey tab → teacher reviews → up to 15 skill points awarded → appears in Profile > My Works permanently. Only 2 uploads per week earn points; unlimited uploads for portfolio.

### Locked decisions

| # | Decision | Status |
|---|---|---|
| 1 | Name: **Sketchbook** — works for kids and adults | 🟢 |
| 2 | Entry point: **"+ Add to Sketchbook" CTA in My Journey header** (new card below teacher row). Shows "N reviews left this week" counter. | 🟢 |
| 3 | Upload: same pattern as HW — popup → single photo → replace until submit → submit locks | 🟢 |
| 4 | Points: **up to 15 per reviewed piece**, distributed across skills by teacher | 🟢 |
| 5 | Weekly cap: **first 2 pieces/week earn points**; extras still upload to portfolio with 0 pts | 🟢 |
| 6 | Teacher review returns star ratings per skill + optional text remarks (no photo annotation — lighter than HW review) | 🟢 |
| 7 | Review surfaces as celebration popup on next app open (like HW review) | 🟢 |
| 8 | Timeline gets its own "Sketchbook submitted" → "Sketchbook reviewed" state | 🟢 |
| 9 | Every Sketchbook piece appears in Profile → All My Works alongside class/HW work | 🟢 |

### Resulting flow

**CTA state on Journey header:**
- Fresh week: "+ Add to Sketchbook · 2 reviews left this week"
- After 1 piece submitted & awaiting review: "+ Add to Sketchbook · 1 review left this week"
- After 2 pieces submitted: "+ Add to Sketchbook · For portfolio only — points used up this week"

**Submit flow.** Tap CTA → popup opens with intro line *"Teacher reviews up to 2 pieces per week for skill points (up to 15 per piece). Others stay in your portfolio."* + upload area. Pick photo → preview → Submit → glow celebration. Timeline gets new card: *"Sketchbook · Submitted [date] · awaiting review"*. Profile → My Works gets the artwork tile immediately.

**Teacher review.** Teacher opens her dashboard, sees the submission, rates each skill 1–5, optionally writes a remark, submits. Server credits points per skill (capped at 15 total), sets `hasUnseenSketchbookReview = true`.

**Next app open.** Celebration popup fires: *"Your Sketchbook piece was reviewed!"* — shows the artwork + skill ratings + teacher's remark + skill points gained. On close → Timeline card updates to *"Sketchbook · Reviewed"*. Tapping it re-opens the same view.

**If points cap already used.** User can still upload — submits goes to portfolio only, no "awaiting review" state, no timeline card (or a dimmed one), 0 pts.

### Backend contract

**Sketchbook piece object**
```
{
  id, studentId, weekOfYear,
  photoUrl, uploadedAt,
  status: "submitted_pending_review" | "reviewed" | "portfolio_only",
  eligibleForPoints: boolean,         // false once 2 already reviewed this week at upload time
  review: {
    reviewedAt,
    skillRatings: { [skillName]: 1..5 },
    remark: string | null,
    pointsAwarded: { [skillName]: number }  // totals ≤ 15
  } | null
}
```

**Submit endpoint**
```
POST /sketchbook/submit
body: { photoUrl }
→ server checks weeklyReviewedCount for current week
→ if < 2: eligibleForPoints = true, status = "submitted_pending_review"
→ else: eligibleForPoints = false, status = "portfolio_only"
→ appears in Profile > My Works regardless
```

**Teacher review (deferred teacher-side build)**
```
POST /sketchbook/:id/review
body: { skillRatings, remark }
→ server computes pointsAwarded = normalized sum capped at 15
→ creditPoints(studentId, "sketchbook", pointsAwarded)
→ status = "reviewed"
→ set hasUnseenSketchbookReview = true
```

**Journey payload additions**
```
sketchbook: {
  reviewsUsedThisWeek: number,         // 0, 1, or 2
  reviewsLeftThisWeek: number,
  hasUnseenSketchbookReview: boolean
}
```

### Phase 3 implementation notes

- New component: `SketchbookCTA.tsx` — card under teacher row on Journey header. Shows counter + upload icon.
- New popup: `SketchbookUploadPopup.tsx` — reuses HW-submit visual language, adds intro line about 15 pts / 2 reviews.
- New popup: `SketchbookReviewPopup.tsx` — lighter than HW review (no photo annotation): artwork + ratings table + remark + skill points gained.
- New timeline card state: `sketchbook_submitted` and `sketchbook_reviewed`.
- `mockSketchbook.ts` data module with weekly counter logic.
- Profile → My Works already shows all artworks — just extend the source to include sketchbook items.

---

## Phase 3 — Build Plan

Pass 1 = mock mode. No real backend. All logic in `src/data/*`. Dev tools to fake time + teacher actions.

### Build order

1. **Loop 3 (plumbing) first** — two-tier level config, `creditPoints()` helper, SkillMap wiring, red-dot state, level-up popup shell
2. **Loop 1 (Attendance)** — live card, session state machine, session summary popup, flying numbers on SkillMap
3. **Loop 2 (Homework)** — extend HW card with reference image + description + on-time bonus chip, HW review popup with annotated photo, Sunday-morning HW appearance
4. **Loop 4 (Sketchbook)** — Journey CTA, upload popup, review popup, timeline states, weekly counter

### Mock-mode rules

| Aspect | Rule |
|---|---|
| **Time** | Real time with a Dev "Advance 1 week" button. Each advance simulates a full week passing: fires session-completed jobs, advances dates, rolls HW, refills Sketchbook weekly counter. |
| **Teacher reviews** | **Instant.** Submit HW or Sketchbook → 2–3 seconds later the review is ready and the next app-open popup fires. Feels like a real teacher turnaround during a demo. |
| **Starting state** | **Empty by default.** No history, 0 pts, Starter 1, brand new. |
| **Dev state toggles** | DevStateSwitcher supports 3 presets: **Empty · Week 4 state · Week 12 state** (end of Foundation). No other fake states. |
| **Celebrations** | Simple: text popup + confetti for level-ups. No per-tier custom illustration in Pass 1. |
| **Level model** | Only the OVERALL level has tier/sub-level. Per-skill shows raw points only. |

### DevStateSwitcher — final scope

Keep as dev-only (removed before production). Controls:
- State preset: Empty | Week 4 | Week 12
- "Advance 1 week" button
- "Simulate teacher review now" button (for pending HW/Sketchbook)

Nothing more.

### Component deltas

**New components:**
- `LevelUpPopup.tsx` — tier and sub-level crossing (shared across loops)
- `SessionSummaryPopup.tsx` — Loop 1 post-class celebration
- `HWReviewPopup.tsx` — Loop 2 teacher feedback with annotated photo
- `SketchbookCTA.tsx` — Journey header button + counter
- `SketchbookUploadPopup.tsx` — upload flow
- `SketchbookReviewPopup.tsx` — lighter review popup (no annotations)

**Extended components:**
- `RootTabs.tsx` — red-dot state on Profile tab
- Existing HW card — add reference image, description, "+5 on-time" chip
- `DevStateSwitcher.tsx` — add week-advance + simulate-review controls
- SkillMap — flying "+N" Animated entrance on Profile mount when flag set

**New data modules:**
- `mockSkills.ts` (rewrite) — 10-tier ladder, `creditPoints()` helper
- `mockHomework.ts` (extend) — reference image, description, review annotations
- `mockSketchbook.ts` (new) — weekly counter, pieces list
- `mockSessions.ts` (extend if needed) — state machine fields

### Locked "not doing in Pass 1"
- Real backend / Firebase wiring
- Teacher-side dashboard (attendance marking, HW review UI, Sketchbook review UI)
- Push notifications (use in-app popups only)
- Custom illustration per tier
- Per-skill sub-level ladder (only overall)
- Community/Quiz/Carousel loops (deferred until Loops 1–4 feel right)

---
