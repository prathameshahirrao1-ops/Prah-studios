# Chat

One chat thread per enrolled student, shared between parent, teacher, admin. Backend path: `chats/{chatId}/messages/{msgId}`.

## Fields — ChatThread

| Field | Type | Required | Notes |
|---|---|---|---|
| teacherName | string | yes | e.g. `Meera T.` |
| teacherRole | string | yes | e.g. `Your teacher` |
| isClassDay | boolean | yes | Drives quick-action chips |
| messages | ChatMessage[] | yes | Time-ordered |

## Fields — ChatMessage

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | |
| sender | enum | yes | `parent` \| `teacher` \| `admin` \| `system` |
| authorName | string | no | Set on teacher / admin messages |
| text | string | yes | |
| sentAt | string (ISO) | yes | |

## Example
```ts
{
  teacherName: 'Meera T.',
  teacherRole: 'Your teacher',
  isClassDay: true,
  messages: [
    {
      id: 'm1',
      sender: 'teacher',
      authorName: 'Meera',
      text: 'Hi Prathamesh! Aarav did a great job with the shapes today.',
      sentAt: '2026-04-14T11:32:00+05:30',
    },
    /* ... */
  ],
}
```

## Source
- `src/data/mockChat.ts` (line 19: `interface ChatThread`; line 11: `ChatMessage`; line 9: `Sender`; line 27: `mockChat`)

## Used by
- [ui-map/chat-screen.md](../ui-map/chat-screen.md)

## TODO
- TODO: confirm with founder — chat is a single thread per student today. Is multi-thread (e.g. teacher vs admin separate) ever expected?
- TODO: confirm with founder — how is `isClassDay` derived? Today it's a static boolean on the thread object.
- TODO: confirm with founder — first message addresses the parent by name (`Hi Prathamesh!`) but the app voice is the student's. Is the chat a parent-channel exception, or should it speak to the student?
