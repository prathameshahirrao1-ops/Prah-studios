/**
 * Unified homework due-date formatter. Used by Home (priority card + inline
 * nudge), Journey timeline HW cards, and HW submission popup so every surface
 * reads the same way:  "Due 17 Apr · 20 min"  or  "Due 17 Apr" if no estimate.
 */
export function formatHwDue(dueDateIso: string, estimateMin?: number): string {
  const d = new Date(dueDateIso);
  const date = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  return estimateMin ? `Due ${date} · ${estimateMin} min` : `Due ${date}`;
}
