# Quiz

Per-session quiz with 3 visual-compare questions. Backend path: `quizzes/{quizId}/questions/{qId}`.

## Fields — Quiz

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | e.g. `q_s3` |
| sessionId | string | yes | Foreign key → Session |
| sessionNumber | number | yes | |
| sessionTitle | string | yes | |
| questions | QuizQuestion[] | yes | Currently 3 per quiz |

## Fields — QuizQuestion

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | |
| text | string | yes | The prompt |
| skill | SkillType | yes | Which skill this question feeds (one of the 5) |
| options | QuizOption[] | yes | |
| explanation | string | yes | Shown after answer |

## Fields — QuizOption

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | e.g. `a`, `b`, `c` |
| label | string | yes | Placeholder caption — real build shows image |
| isCorrect | boolean | yes | |

## Points awarded
- +2 per correct answer, credited to that question's `skill`. 3 questions × 2 = up to 6 pts/quiz.

## Example
```ts
{
  id: 'q_s3',
  sessionId: 's3',
  sessionNumber: 3,
  sessionTitle: 'Shapes to Objects',
  questions: [
    {
      id: 'q1',
      text: 'Which drawing has the correct proportions for a simple mug?',
      skill: 'observation',
      options: [
        { id: 'a', label: 'Option A', isCorrect: false },
        { id: 'b', label: 'Option B', isCorrect: true },
        { id: 'c', label: 'Option C', isCorrect: false },
      ],
      explanation: 'Option B keeps the width-to-height ratio close to 1:1...',
    },
    /* ... */
  ],
}
```

## Source
- `src/data/mockQuizzes.ts` (line 27: `interface Quiz`; line 19: `QuizQuestion`; line 13: `QuizOption`; line 98: `creditQuizCompletion`)

## Used by
- [ui-map/popups.md](../ui-map/popups.md) (QuizScreen — full-screen modal)
- [ui-map/timeline-tab.md](../ui-map/timeline-tab.md) (quiz tasks lead here)

## TODO
- TODO: confirm with founder — `QuizOption.label` is currently text ("Option A/B/C"); the comment says "real build shows image". When does image-based options ship?
- TODO: confirm with founder — only one quiz seeded (`q_s3`). Is there one quiz per session or per N sessions?
