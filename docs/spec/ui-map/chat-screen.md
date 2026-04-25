# Chat Screen

Path: `src/screens/ChatScreen.tsx`

Full-screen modal — one chat thread shared between parent, teacher, admin.

## Sections (top to bottom)
1. **Header** — teacher avatar (initial), `mockChat.teacherName`, `mockChat.teacherRole · Studio`.
2. **Quick-action chips** — shown when `mockChat.isClassDay` is true. (TODO: confirm chip set.)
3. **Message list** — `mockChat.messages` rendered by `sender` (`parent` / `teacher` / `admin` / `system`). See [chat](../schema/chat.md).
4. **Composer** — local `useState<ChatMessage[]>` seeded from `mockChat.messages`; sends append locally in Pass 1.

## Triggers (interactions that fire rules)
- None — chat is independent of the skill/streak/HW loops.

## Source
- `src/screens/ChatScreen.tsx`
- Reads: `mockChat` (`src/data/mockChat.ts`)

## TODO
- TODO: confirm with founder — do chat messages have any side effect on streaks (e.g. teacher post → reply streak)? Today: no.
- TODO: confirm with founder — quick-action chips inventory (the file references `mockChat.isClassDay` to gate them but the chip definitions are inline in the screen).
