/**
 * Pass 1 — mixed system: Georgia (serif) for display + numbers, default sans
 * for UI. Pass 2 will load a proper display serif + UI sans via expo-font.
 */
export const typography = {
  // Display — reserved for emotional moments (celebration, welcome).
  displayLg: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700' as const,
    fontFamily: 'Georgia',
  },
  displayMd: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    fontFamily: 'Georgia',
  },

  // Display serif — student name, editorial moments.
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600' as const,
    fontFamily: 'Georgia',
  },

  // Serif numbers — skill points, streak counts, stat values.
  number: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '500' as const,
    fontFamily: 'Georgia',
  },
  numberLg: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '500' as const,
    fontFamily: 'Georgia',
  },

  // Headings
  h1: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  h3: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },

  // Body
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },

  // Meta — section labels, field labels. Sentence case by default; hierarchy
  // comes from weight + size, not caps. (Pass 1: reserve uppercase for true
  // system labels like "LIVE", not every sub-section.)
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;

export type TypographyKey = keyof typeof typography;
