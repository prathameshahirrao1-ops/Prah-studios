# Prah Studio — Product Spec

Single source of truth for what this app does and how. Code follows this file, not the other way around.

## How to use
1. Got an idea / decision? Edit the relevant file FIRST.
2. Then tell Claude to wire it.
3. Add a line to the change log below.

## Topic index

| Topic | Schema | Rules | UI |
|---|---|---|---|
| Sessions | [session](schema/session.md) | [loop-1](rules/loop-1-attendance.md) | [timeline](ui-map/timeline-tab.md) |
| Homework | [homework](schema/homework.md) | [loop-2](rules/loop-2-homework.md) | [popups](ui-map/popups.md) |
| GK / Quiz | [gk-carousel](schema/gk-carousel.md), [quiz](schema/quiz.md) | [loop-3](rules/loop-3-gk-quiz.md) | [home-screen](ui-map/home-screen.md) |
| Streaks | [streak](schema/streak.md) | [loop-4](rules/loop-4-streaks.md) | [profile-screen](ui-map/profile-screen.md) |
| Skills / Levels | [skill](schema/skill.md) | [loop-5](rules/loop-5-level-up.md) | [profile-screen](ui-map/profile-screen.md) |
| Student | [student](schema/student.md) | — | all screens |
| Artwork | [artwork](schema/artwork.md) | — | various |
| Chat | [chat](schema/chat.md) | — | [chat-screen](ui-map/chat-screen.md) |
| Journeys | [journey](schema/journey.md) | — | [profile-screen](ui-map/profile-screen.md) |

## Locked decisions
See `/CLAUDE.md` (project root). Don't duplicate here.

## Change log
- 2026-04-25 — First draft generated from code. Founder to review and correct.
