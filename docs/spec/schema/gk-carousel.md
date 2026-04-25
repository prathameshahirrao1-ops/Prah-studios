# GK Carousel

Daily Art GK — 3 cards a day, admin-approved before going live. Topics rotate (Indian artists, art history, fundamentals, movements).

## Fields — GkCarousel

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | e.g. `gk_today` |
| date | string (ISO date) | yes | |
| items | GkItem[] | yes | Currently 3 |

## Fields — GkItem

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string | yes | |
| topic | string | yes | Short tag, e.g. `Indian art`, `Fundamentals`, `Art history` |
| title | string | yes | |
| body | string | yes | Long-form blurb |

## Points awarded
- Completing the carousel credits +1 to `observation`, +1 to `creativity`, +1 to `problem_solving` (3 pts total).

## Example
```ts
{
  id: 'gk_today',
  date: '2026-04-25',
  items: [
    {
      id: 'gk1',
      topic: 'Fundamentals',
      title: 'Light and shadow tell a story',
      body: 'Light on one side creates shadow on the other...',
    },
    /* ... */
  ],
}
```

## Source
- `src/data/mockGkCarousel.ts` (line 21: `interface GkCarousel`; line 14: `GkItem`; line 27: `mockGkToday`; line 61: `creditGkCompletion`)

## Used by
- [ui-map/home-screen.md](../ui-map/home-screen.md) (GK card → opens GkCarouselScreen modal)
- [ui-map/timeline-tab.md](../ui-map/timeline-tab.md) (GK task entries)

## TODO
- TODO: confirm with founder — is `topic` a free-string or should it be an enum (Indian artists / art history / fundamentals / movements)?
