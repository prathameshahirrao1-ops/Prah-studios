/**
 * Pass 1 — NEUTRALS ONLY.
 * Brand colours (#1A0533 purple, #C9A84C gold, #F5F0FF lavender) will replace
 * these values in Pass 2. Keep every component referencing this file —
 * changing a colour then is a single-file swap.
 */
export const colors = {
  // surfaces
  bg: '#F6F6F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F1F4',

  // borders + dividers
  border: '#E5E5E9',
  divider: '#EDEDF1',

  // text
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4D',
  textMuted: '#8A8A92',
  textInverse: '#FFFFFF',

  // interactive
  primary: '#1A1A1A',
  primaryText: '#FFFFFF',
  secondary: '#FFFFFF',
  secondaryText: '#1A1A1A',

  // status (kept generic, not brand)
  success: '#2F9E6A',
  warning: '#D18D1E',
  error: '#D9453F',
  info: '#4A4A4D',
} as const;

export type ColorKey = keyof typeof colors;
