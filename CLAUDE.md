# Prah Studio — Session Context

Visual-heavy art-learning app for kids. Student voice (Aarav, age 7).
RN + Expo SDK 54 + TypeScript. Web preview on port 8082 via `.claude/launch.json`.

## How to run

Expo web preview: use the MCP `Claude_Preview` tool (`preview_start` with name
`expo-web`). Serves at `http://localhost:8082`.

Native via Expo Go is blocked by the user's Wi-Fi — use `--tunnel` if needed.

## Locked decisions — do not re-litigate

- **Stack:** React Native + Expo SDK 54, TypeScript, React Navigation v7.
  No Expo Router. No UI libraries (Tailwind, NativeBase, Paper — all ruled out).
- **Styling:** Built-in `StyleSheet` + custom components. Tokens in `src/theme/`.
  `src/theme/colors.ts` is the single source; Pass 2 swaps values there.
- **State:** Plain `useState` lifted to the nearest parent. No Redux / Zustand /
  Context yet. Revisit only when backend goes in.
- **Navigation:** `RootNavigator` (native stack) → Splash → Welcome →
  ProfileSetup → `RootTabs` (4 tabs: Journey · Home · Community · Profile).
  Profile tab has its own `ProfileStack`. Cross-screen flows (Chat, HW popup,
  GK carousel) are full-screen `Modal`.
- **Popups:** Everything uses `src/components/Popup.tsx` (bottom-sheet Modal).
- **Data:** All mocks in `src/data/*`. Each mock file has a Firestore-path
  comment at top — swap at backend-wiring milestone.
- **No Figma.** Claude builds directly from paper wireframes.
- **Code leads, spec follows.** Don't cross-check against older product docs;
  the code is authoritative.

## Parked / intentionally out of scope

- **Payment flow (screens 5–13):** Trial card, Address popup, ₹200 / ₹4,500
  pay, Confirmation, Enrollment tour. Razorpay needs an Expo dev build —
  deferred to Week 8+.
- **V2 screens:** Milestone (#28), Community tab content (#29–32),
  Notification Center (#42).
- **Brand Pass 2:** Currently neutrals only (grey/black/white). Brand purple
  `#1A0533`, gold `#C9A84C`, lavender `#F5F0FF` applied later via theme swap.
- **Custom fonts:** Currently system + Georgia serif for display. DM Serif
  Display / DM Sans load-in deferred to Pass 2.

## Things to NOT do

- Don't hardcode colors — always go through `src/theme/`.
- Don't add Redux/Zustand/Context/UI-library — locked out until post-backend.
- Don't ship `DevStateSwitcher` (in `HomeScreen.tsx`) to production.
- Don't paste tokens/secrets into chat. Terminal password prompts only.
- Don't commit to git unless explicitly asked — user wants local-only work
  by default.

## Current product north star

The app today is a collection of screens. The active design question is
**connecting it into loops** — starting with the Homework Loop (submit →
teacher feedback → skill points → SkillMap update → level-up). See
`graphify-out/GRAPH_REPORT.md` for the structural map of what's there today.
