# Prah Studio

Parent-facing mobile app for Prah Studio — a children's offline drawing class platform based in Pune, India.

## Stack

- React Native + Expo (SDK 54)
- TypeScript
- React Navigation (bottom tabs + native stack)
- Built-in `StyleSheet` styling, custom components — no UI library

## Getting started

```bash
npm install
npm start
```

Then scan the QR code with the **Expo Go** app on your phone (iOS App Store / Google Play).

## Folder structure

```
App.tsx                   Entry — NavigationContainer + SafeAreaProvider
src/
├── screens/              One file per screen
├── components/           Reusable primitives (Screen, Card, Button, Text…)
├── navigation/           RootTabs — the 4-tab bottom nav
├── theme/                colors, spacing, typography (neutrals for Pass 1)
└── data/                 Mock data (will be replaced by Firebase later)
```

## Pass 1 vs Pass 2

- **Pass 1 (current):** neutrals only, system fonts. Structure-first.
- **Pass 2:** brand colours (#1A0533 purple, #C9A84C gold, #F5F0FF lavender) + DM Serif Display / DM Sans applied via `src/theme/`.
