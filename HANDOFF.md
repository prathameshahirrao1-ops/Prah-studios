# Prah Studio · Handoff Note

_Last updated: 22 April 2026 · Session 2 complete_

Read this first when starting a new Claude Code session on this repo. Pair it
with `~/Downloads/Prah-Studio/Prah_Studio_Build_Context.docx` (the authoritative
product + tech decisions doc) and `Prah_Studio_Product_Document_v6.docx` (full
screen list + IA).

---

## 1. Where to find everything

| Thing | Path |
|---|---|
| **This codebase** | `~/Downloads/Prah-Studio/repos/Prah-studios/` |
| **GitHub** | https://github.com/prathameshahirrao1-ops/Prah-studios |
| **Interactive IA (status + flow canvas)** | `~/Downloads/Prah-Studio/repos/Prah-studios-Prah_studios_V1/ia.html` |
| **Product doc v6** | `~/Downloads/Prah_Studio_Product_Document_v6.docx` |
| **Build context (tech + scope)** | `~/Downloads/Prah-Studio/Prah_Studio_Build_Context.docx` |
| **Paper wireframe photos** | `~/Downloads/Prah-Studio/WhatsApp Unknown 2026-04-13 at 9.10.53 PM/` |

---

## 2. Current state — what's built

### Working and in git (`main` branch pushed to GitHub)

| # | Screen / feature | Status |
|---|---|---|
| — | Expo SDK 54 + TypeScript scaffold | ✅ Done |
| — | 4-tab bottom nav (Journey · Home · Community · Profile) | ✅ Done |
| — | Reusable components (Screen, Card, Button, Text, Chip, ProgressBar, SubTabs, Popup, Stars, ImagePlaceholder) | ✅ Done |
| — | Neutrals-only theme (`src/theme/`) ready for Pass 2 brand swap | ✅ Done |
| — | Mock student: Aarav, age 7, Drawing Foundation, 4/24 classes done | ✅ Done |
| 17 | Home — enrolled active | ✅ Full |
| 14 | Home — class ongoing (LIVE card, pulsing dot) | ✅ Full |
| 15 | Home — post-class summary (auto from curriculum) | ✅ Full |
| 16 | Home — homework pending card | ✅ Full |
| 18 | Home — empty/idle state ("Up next" dominant) | ✅ Full |
| — | Dev time-travel chip to demo all 4 home states | ✅ Temp dev tool |
| 19 | My Journey — main (course header + stats + sub-tabs) | ✅ Full |
| 20 | Timeline view — attended / missed / upcoming / task nodes | ✅ Full |
| 21 | Session card popup (key concepts · your work · skills · peers) | ✅ Full |
| 22 | Peers sub-tab | ✅ Full |
| 23 | Peer popup (artwork grouped by session) | ✅ Full |
| 24 | This Journey's Work sub-tab (grid) | ✅ Full |
| 25 | HW submission popup (4 states: empty/preview/confirm/done + view-only) | ✅ Full |
| — | HW submission celebration (green glow halo + checkmark pop-in + auto-close) | ✅ Full |
| C | In-app Chat (text only, day dividers, quick-action chips on class days) | ✅ Full |
| 33 | Profile — bento dashboard (skills, streaks, works, journeys) | ✅ Full |
| 34 | Account details | ✅ Full |
| 35 | All My Works | ✅ Full |
| 36/37 | Journeys list + Journey detail popup | ✅ Full (Explorer-first tabs, Master + Explorer courses, skills-gained, enroll CTA) |
| 38 | Referral | ✅ Full |
| 39 | Billing history | ✅ Full |
| 40 | Settings + Notifications | ✅ Full |
| 26 | Quiz (3 questions, per-skill points) | ✅ Full |
| 27 | GK Carousel (3 slides/day) | ✅ Full |
| 1 | Onboarding — Splash | ✅ Full (auto-advance 1.4s) |
| 2 | Onboarding — Welcome carousel (3 slides) | ✅ Full |
| 3 | Onboarding — Profile setup (child + parent + age) | ✅ Full |
| — | Home "Your journeys" block (current + next Explorer workshop) | ✅ Full |

### Parked / intentionally skipped

- **V2 screens:** Milestone (28), Community tab (29–32), Notification Center (42)
- **Payment flow (5–13):** Trial card, Address popup, Payment ₹200/₹4,500, Confirmation, Celebration, Enrollment tour — deferred till after enrolled experience is locked
- **Brand Pass 2:** Everything is currently in neutrals (grey/black/white). Brand purple `#1A0533`, gold `#C9A84C`, lavender `#F5F0FF` will be applied by swapping values in `src/theme/colors.ts` only.

---

## 3. Git / push workflow

Local commits auto-push using the token cached in macOS Keychain. If a push
fails with auth:

```bash
cd ~/Downloads/Prah-Studio/repos/Prah-studios
git push
# If it prompts, user pastes a fresh GitHub PAT with `repo` scope
```

Never have the user paste a token into the chat — they paste directly into the
Terminal password prompt.

Latest commit on `main`: `fc9502d Journeys: Home block + Explorer-first on Profile & Journeys tabs`

---

## 4. How to run the app

### Browser preview (current approach — Wi-Fi independent)

Expo web runs on port 8082, served via `.claude/launch.json`. To start / resume:

```bash
# From the Prah-studios-Prah_studios_V1 folder (that's where launch.json lives
# for the MCP preview tool):
# preview_start with name "expo-web"
```

Then open:
- Local: **http://localhost:8082**
- On phone (same Wi-Fi): **http://192.168.0.152:8082**  ← Mac's LAN IP, may change

The MCP `Claude_Preview` server config `expo-web` in
`~/Downloads/Prah-Studio/repos/Prah-studios-Prah_studios_V1/.claude/launch.json`
runs `npx expo start --web --port 8082 --non-interactive`.

### Native via Expo Go (blocked by user's Wi-Fi)

```bash
cd ~/Downloads/Prah-Studio/repos/Prah-studios
npx expo start --tunnel   # bypasses LAN issues, needs ngrok (first run installs)
```

Then scan QR with Expo Go app on the phone.

---

## 5. Architecture decisions (don't re-litigate)

These are locked — see Build Context §02 and §11 for reasoning.

- **React Native + Expo SDK 54, TypeScript.** No Expo Router, plain React Navigation v7.
- **Built-in StyleSheet + custom components.** No Tailwind, NativeBase, Paper.
- **Pass 1 = neutrals only.** `src/theme/colors.ts` has all brand-agnostic values. Pass 2 swaps this file and it propagates.
- **No Figma.** Claude builds high-fi directly from paper mocks. There are paper wireframes for the major screens (see WhatsApp Unknown 2026-04-13 folder).
- **Mock data lives in `src/data/`.** Everything in `mockStudent.ts`, `mockChat.ts`, `homeState.ts`. Replaced with Firestore reads at the "Backend wiring" milestone (weeks 5–7 per Build Context §07).
- **All popups use the shared `<Popup>` component** (`src/components/Popup.tsx`) — bottom-sheet-style Modal wrapper with X close, scrollable body.
- **Navigation:** `RootNavigator` (native stack) wraps `Splash → Welcome → ProfileSetup → MainApp`. `MainApp` is the 4-tab `RootTabs`. The Profile tab is its own native stack (`ProfileStack`) so sub-screens (Account, Journeys, Billing, Settings, etc.) push/pop with headers. Cross-screen flows (Chat, HW popup, GK carousel) remain full-screen `Modal` from `react-native` to keep the tree shallow.
- **State:** Plain React `useState` for Pass 1. No Redux, Zustand, Context yet. Cross-screen state (e.g. HW submitted → timeline celebrates) is lifted to the nearest parent (`JourneyScreen`).

---

## 6. Folder structure

```
Prah-studios/
├── App.tsx                          NavigationContainer + SafeAreaProvider + RootNavigator
├── app.json                         Expo config · name "Prah Studio"
├── HANDOFF.md                       ← this file
├── README.md
├── .claude/launch.json              Expo web preview config
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx           ⭐ state-driven, 4 variants + "Your journeys" block
│   │   ├── JourneyScreen.tsx        ⭐ shell with 3 sub-tabs + popups
│   │   ├── CommunityScreen.tsx      V2 stub (locked)
│   │   ├── ProfileScreen.tsx       Bento dashboard (skills, streaks, works, journeys, referral)
│   │   ├── ChatScreen.tsx           In-app chat
│   │   ├── onboarding/
│   │   │   ├── SplashScreen.tsx          auto-advance to Welcome
│   │   │   ├── WelcomeScreen.tsx         3-slide paging carousel
│   │   │   └── ProfileSetupScreen.tsx    child + parent + age form
│   │   ├── home/
│   │   │   ├── LiveClassCard.tsx
│   │   │   ├── PostClassCard.tsx
│   │   │   └── DevStateSwitcher.tsx       ← remove before production
│   │   ├── journey/
│   │   │   ├── TimelineTab.tsx       Nodes, cards, celebration wrapper
│   │   │   ├── PeersTab.tsx
│   │   │   ├── MyWorkTab.tsx
│   │   │   ├── SessionPopup.tsx
│   │   │   ├── PeerPopup.tsx
│   │   │   ├── HwSubmissionPopup.tsx
│   │   │   ├── QuizScreen.tsx        3Q per-skill points
│   │   │   └── GkCarouselScreen.tsx  3 daily slides
│   │   └── profile/
│   │       ├── JourneysScreen.tsx    Explorer-first tabs, Master + Explorer courses
│   │       ├── AccountScreen.tsx
│   │       ├── AllMyWorksScreen.tsx
│   │       ├── BillingScreen.tsx
│   │       ├── SettingsScreen.tsx
│   │       ├── NotificationsScreen.tsx
│   │       ├── ReferralScreen.tsx
│   │       ├── LevelDetailScreen.tsx
│   │       └── FullImageView.tsx
│   ├── components/
│   │   ├── Screen.tsx               safe-area wrapper
│   │   ├── Text.tsx                 H1/H2/body/label/caption + Georgia serif for display
│   │   ├── Card.tsx
│   │   ├── Button.tsx               primary/secondary/ghost
│   │   ├── Chip.tsx                 neutral/success/warning/error tones
│   │   ├── ProgressBar.tsx
│   │   ├── SubTabs.tsx
│   │   ├── Popup.tsx                bottom-sheet modal
│   │   ├── Stars.tsx
│   │   └── ImagePlaceholder.tsx     grey box with image icon (Pass 1)
│   ├── navigation/
│   │   ├── RootNavigator.tsx        Splash → Welcome → ProfileSetup → MainApp
│   │   ├── RootTabs.tsx             4-tab bottom nav (Journey · Home · Community · Profile)
│   │   └── ProfileStack.tsx         Profile + sub-screens (native stack)
│   ├── theme/
│   │   ├── colors.ts                🎯 swap values here for Pass 2 brand
│   │   ├── spacing.ts               4pt scale
│   │   ├── typography.ts            Georgia serif display + variants
│   │   └── index.ts
│   └── data/
│       ├── mockStudent.ts           student, timeline, tasks, peers, artworks
│       ├── mockChat.ts              chat thread + messages
│       ├── homeState.ts             home-state evaluator + dev presets
│       ├── mockSkills.ts            5-skill system + colors + level curve
│       ├── mockStreaks.ts           HW / Quiz / GK streak counts
│       ├── mockJourneys.ts          Master + Explorer courses (currentJourney helper)
│       ├── mockGkCarousel.ts
│       ├── mockBilling.ts
│       └── mockNotifications.ts
└── assets/
    └── (icon, splash, adaptive icon placeholders)
```

---

## 7. Key behaviors / things to test when picking up

1. **HW celebration:** Journey → tap "Submit homework" on Lines & Strokes HW (29 Mar card) → upload photo → Submit → Yes, submit → popup auto-closes → **green glow halo pulses around the card** → checkmark pops in → card stays "Completed" permanently.
2. **Chat class-day quick actions:** Profile → Chat with teacher → "Coming to class today" chip → posts a parent message, both chips lock.
3. **Home state switcher:** top-left "Dev · Real time" chip → pick "Class ongoing" → red-bordered LIVE card with pulsing dot.
4. **View-only HW:** After submitting once, tap the Completed HW card again → opens in "UNDER REVIEW" read-only state.
5. **Timeline "Not there on this day?":** Journey → scroll to an upcoming session (18 Apr or 25 Apr) → tap the link → opens Chat.

---

## 8. What to build next (suggested order)

### Fastest "looks done" path
1. **Pass 2 brand application** — swap `src/theme/colors.ts` to brand values, add `expo-font` with DM Serif Display + DM Sans. All screens transform at once. **~1 session.**
2. **Remove DevStateSwitcher** before merging Pass 2 (one-line change — delete the `<DevStateSwitcher>` JSX in `HomeScreen.tsx`).
3. **Demo + Enrollment payment flow** (Trial card, Address popup, Pay ₹200, Confirmation, Course page, Enrollment card, Pay ₹4,500, Celebration, Tour). Razorpay integration needs an Expo development build — defer until Week 8 per Build Context §07. **~2 sessions + Razorpay setup.**
4. **Milestone celebration (#28)** — resolve design, then wire into timeline.
5. **Community tab** — deferred V2 scope per product doc.

### Backend wiring (weeks 5–7 of Build Context)
After all UI is done, swap every `mockXxx` import for Firestore reads. Each mock file has a comment at the top pointing to the Firestore path.

---

## 9. Open questions / known gaps

- **Timeline visual language** — dots currently use neutral colors. V6 doc flags this as an open item; final treatment (animations, milestone node design) pending user decision.
- **Milestone celebration (#28)** — the celebration system design is unresolved in v6 doc. Not started.
- **`expo-image-picker` on native** — HW submission popup uses a stub `__mock_photo__` path on native. Web works via `<input type="file">`. Real camera access needs the Expo development build (Week 8+).
- **Tab icons chosen from `@expo/vector-icons/Ionicons`.** Journey uses `trail-sign` — can swap once brand icon set is decided.
- **Share-to-community toggle** default-off in HW popup, matches product doc rule "always opt-in".

---

## 10. Things to NOT do

- Don't push a token into chat. Only into Terminal password prompts.
- Don't skip the `src/theme/` file and hardcode colors — the whole Pass 1 → Pass 2 plan depends on theme being the single source.
- Don't add Redux / Zustand / Context for state — app is still small enough that `useState` at the right level is fine.
- Don't add a UI library (Paper, NativeBase). Build Context §11 locks it out.
- Don't commit the `DevStateSwitcher` visible in production — flag it for removal at Pass 2 cutover.

---

## 11. Quick-start for next session

Paste this at the top of the next Claude Code session:

> "Read `HANDOFF.md` in `~/Downloads/Prah-Studio/repos/Prah-studios/`. We were building the Prah Studio parent app. Last commit was `fc9502d` (Journeys home block + Explorer-first). Let's continue — tell me the current state and propose the next block."

Claude will read this file, confirm status, and be back on track within one turn.
