/**
 * Formats date object or string into standard clean date string.
 * Example output: "Aug 26, 2026"
 */
export function formatDate(dateStr: string | Date): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}
