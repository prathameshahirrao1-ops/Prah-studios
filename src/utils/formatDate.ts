/**
 * Shared date formatters. Keep all date output going through these so that
 * when the format changes once, it changes everywhere.
 */

/** "17 Apr" — most common short form. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

/** "17 Apr 2026" — when the year matters (billing, older artwork). */
export function formatDateWithYear(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "Mon, 17 Apr" — timeline day headers. */
export function formatDateWithWeekday(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** "Today" / "Tomorrow" / "In 3 days" / fallback to "17 Apr". */
export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (d.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return formatDate(iso);
}
