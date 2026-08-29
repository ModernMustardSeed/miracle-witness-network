export function timeAgo(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return 'just in';
  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 2) return 'just in';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return weeks === 1 ? 'last week' : `${weeks} weeks ago`;
  return new Date(then).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function editionDate(date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function shortDate(iso: string): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return '';
  return new Date(at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const COMPACT = new Intl.NumberFormat('en-US');

export function count(value: number): string {
  return COMPACT.format(value);
}

/**
 * What to print where a place would go. An underground story never carries one,
 * and this is the only function allowed to decide that, so no page can leak a
 * location by rendering `story.place` directly.
 */
export function placeLabel(story: { place: string | null; locationSensitive: boolean }): string | null {
  if (story.locationSensitive) return story.place ?? 'Location withheld';
  return story.place;
}

/** "the Christian Post" reads wrong mid-sentence; outlets keep their own case. */
export function outlet(name: string): string {
  return name.replace(/\.(com|org|net|co\.uk|news|info|ng|pk|in|ph|za)$/i, '');
}
