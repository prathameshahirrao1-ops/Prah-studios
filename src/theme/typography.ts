/**
 * Pass 1 — system fonts only.
 * Pass 2 will swap fontFamily to DM Serif Display / DM Sans via expo-font.
 */
export const typography = {
  // Display — reserved for emotional moments (celebration, welcome).
  displayLg: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  displayMd: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },

  // Headings
  h1: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  h3: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },

  // Body
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },

  // Meta — labels, captions, timestamps
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;

export type TypographyKey = keyof typeof typography;
