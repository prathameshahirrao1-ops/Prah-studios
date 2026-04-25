# Student

The enrolled student account. The Prah app is always shown in the student's voice (e.g. Aarav, age 7); a parent uses the same account.

## Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | e.g. `stu_001` |
| firstName | string | yes | |
| age | number | yes | |
| avatar | string | no | URI; optional |
| course | string | yes | Display name, e.g. `Drawing Foundation` |
| courseId | string | yes | e.g. `course_drawing_foundation_q1_2026` |
| joinedDate | string | yes | Human-readable, e.g. `Joined 21 March 2026` |
| classesAttended | number | yes | |
| classesTotal | number | yes | |
| hwSubmitted | number | yes | |
| hwTotal | number | yes | |
| quizzesDone | number | yes | |
| homeState | enum | yes | `pre_demo` \| `demo_booked` \| `demo_done` \| `enrolled_active` |
| nextClassAt | string (ISO) | no | |
| hwPending | object | no | `{ sessionTitle, dueDate, estimateMin }` |
| venue | Venue | yes | See sub-shape below |

### Venue sub-shape

| Field | Type | Required | Notes |
|---|---|---|---|
| teacherName | string | yes | e.g. `Meera T.` |
| teacherVerified | boolean | yes | |
| area | string | yes | e.g. `Koregaon Park, Pune` |
| line1 | string | yes | Short street line |
| schedule | string | yes | e.g. `Sat + Sun · 10:00 am` |
| directionsUrl | string | no | Maps deep link, not wired in Pass 1 |

## Example
```ts
{
  id: 'stu_001',
  firstName: 'Aarav',
  age: 7,
  course: 'Drawing Foundation',
  courseId: 'course_drawing_foundation_q1_2026',
  joinedDate: 'Joined 21 March 2026',
  classesAttended: 5,
  classesTotal: 24,
  hwSubmitted: 2,
  hwTotal: 4,
  quizzesDone: 3,
  homeState: 'enrolled_active',
  nextClassAt: '2026-04-18T10:00:00+05:30',
  hwPending: {
    sessionTitle: 'Sketching Shapes',
    dueDate: '2026-04-17',
    estimateMin: 20,
  },
  venue: {
    teacherName: 'Meera T.',
    teacherVerified: true,
    area: 'Koregaon Park, Pune',
    line1: 'Lane 5, near Bund Garden Road',
    schedule: 'Sat + Sun · 10:00 am',
  },
}
```

## Source
- `src/data/mockStudent.ts` (line 63: `interface Student`; line 54: `interface Venue`; line 86: `mockStudent` export)

## Used by
- See [ui-map/home-screen.md](../ui-map/home-screen.md), [ui-map/profile-screen.md](../ui-map/profile-screen.md).

## TODO
- TODO: confirm with founder — `homeState` enum has 4 values but only `enrolled_active` is used in mock data. Are the other three (`pre_demo`, `demo_booked`, `demo_done`) still in scope, or has the parked payment flow taken them with it?
- TODO: confirm with founder — counters (`classesAttended`, `hwSubmitted`, `quizzesDone`) are static in the mock. Should they be derived aggregates (from sessions / homework state) or stored fields on the student doc?
