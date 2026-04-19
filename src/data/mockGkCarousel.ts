/**
 * Daily Art GK carousel — 3 items per day, admin-approved before going live.
 * Topics rotate through: Indian artists, art history, fundamentals, movements.
 */

export interface GkItem {
  id: string;
  topic: string;         // short tag, e.g. "Indian art"
  title: string;
  body: string;
}

export interface GkCarousel {
  id: string;
  date: string;          // ISO
  items: GkItem[];
}

export const mockGkToday: GkCarousel = {
  id: 'gk_today',
  date: new Date().toISOString().slice(0, 10),
  items: [
    {
      id: 'gk1',
      topic: 'Fundamentals',
      title: 'Light and shadow tell a story',
      body:
        'Light on one side creates shadow on the other. Drawing both sides — not just the outline — is what makes a drawing feel real.',
    },
    {
      id: 'gk2',
      topic: 'Indian art',
      title: "Warli — India's oldest folk style",
      body:
        'Warli uses only circles, triangles, and lines. Every person, animal, and tree is built from these three shapes. Centuries old, still drawn today.',
    },
    {
      id: 'gk3',
      topic: 'Art history',
      title: 'Cave paintings are 40,000 years old',
      body:
        'The oldest drawings in the world are in caves, painted with charcoal. Humans made art long before writing existed.',
    },
  ],
};
