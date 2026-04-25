# Firestore schema — Phase 2 (data-first migration)

One student, one Firestore root under `students/{studentId}`. Peers + shared
curriculum data is parked on mocks for now — when multi-student scope lands
those will move to top-level collections.

## Path layout

```
students/{studentId}                              (single doc: profile)
students/{studentId}/skills/state                 (single doc: SkillState)
students/{studentId}/sessions/{sessionId}         (one doc per session)
students/{studentId}/homework/{hwId}              (one doc per HW)
students/{studentId}/sketchbook/{pieceId}         (one doc per sketchbook piece)
```

Rationale for keeping everything scoped under the student:
- No cross-student reads in the current product (peers is a mock list, not a
  live feed). This would change when Community is built.
- Security rules collapse to one check: `uid == studentId` or admin claim.
- Offline persistence (Firestore's built-in) is per-collection; nesting under
  the student means the full "my data" cache is coherent.

## Doc shapes

### `students/{studentId}` — profile

Mirrors `mockStudent` minus computed fields.

```ts
{
  id: string;
  firstName: string;
  age: number;
  course: string;
  courseId: string;
  joinedDate: string;       // human string for now; ISO later
  homeState: 'pre_demo' | 'demo_booked' | 'demo_done' | 'enrolled_active';
  venue: { ... };
  // Computed stats — classesAttended, hwSubmitted, quizzesDone — NOT stored
  // here. Derived from sub-collection counts via aggregate queries.
}
```

### `students/{studentId}/skills/state` — single doc

One doc (ID: `state`). Matches `SkillState` from `src/data/mockSkills.ts`.

```ts
{
  points: { observation: 3, structure: 2, expression: 0, creativity: 1, problem_solving: 3 },
  history: [ SkillEntry, SkillEntry, ... ],
  hasUnseenSkillGrowth: true,
  pendingCrossings: [ CrossedThreshold, ... ],
}
```

**Why one doc, not `history/{entryId}` sub-collection:**
- History is append-only but bounded (~200 entries over a year).
- We always want the full history when rendering SkillDetail — no pagination.
- Atomic credit-and-crossing-check is easier in one doc (single transaction).

When history grows past 500 entries we'll graduate to a sub-collection.

### `students/{studentId}/sessions/{sessionId}`

```ts
{
  id: string;
  sessionNumber: number;
  date: string;             // ISO
  title: string;
  status: 'attended' | 'missed' | 'upcoming';
  keyConcepts: string[];
  hw?: 'pending' | 'under_review' | 'reviewed';
  yourWorkId?: string;
  skills?: [ { name, stars } ],
  // Curriculum-awarded points at completion time, mirrored into skill history
  awards?: { observation: 4, structure: 2, ... };
}
```

### `students/{studentId}/homework/{hwId}`

Mirrors `Homework` from `src/data/mockHomework.ts`. Plus:

```ts
{
  ...all Homework fields,
  // timestamps for server-side createdAt/updatedAt
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### `students/{studentId}/sketchbook/{pieceId}`

Mirrors `SketchbookPiece` from `src/data/mockSketchbook.ts`. Plus timestamps.

## Security rules (dev — test-mode default)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 5, 25);
    }
  }
}
```

Test mode auto-locks after 30 days. Before that expires, tighten to:

```
match /students/{studentId}/{document=**} {
  allow read, write: if request.auth.uid == studentId;
}
```

(Requires auth — wired in a later pass.)

## Seeding strategy

First time the app opens with Firebase configured:
1. Check if `students/stu_001` exists.
2. If not, write it + seed sub-collections from the current mock data.
3. From then on, Firestore is source of truth.

Seeding happens once, from `src/firebase/seed.ts`, triggered on app boot
when the student doc is missing.

## Migration pattern per module

Each mock module under `src/data/` keeps its public API (the `useXxxState()`
hook, the action functions) unchanged. Internally it swaps from:

```ts
let _state = _initialState();
const _subs = new Set();
```

to:

```ts
function useXxxState() {
  const [state, setState] = useState(initialMockSeed);  // seed while loading
  useEffect(() => {
    if (!isFirebaseConfigured()) return;  // fall back to mocks in dev
    return onSnapshot(doc(db, path), (snap) => {
      if (snap.exists()) setState(snap.data() as XxxState);
    });
  }, []);
  return state;
}

export async function submitXxx(...) {
  if (!isFirebaseConfigured()) {
    // legacy in-memory path (unchanged)
    setInMemoryState(next);
    return;
  }
  await updateDoc(doc(db, path), { ... });
}
```

This means:
- Web preview keeps working without env vars (falls back to mocks).
- Once env vars land, every screen reads/writes live.
- Screens consuming `useXxxState()` don't change at all.
