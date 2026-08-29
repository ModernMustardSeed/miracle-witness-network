import { createHash } from 'node:crypto';

import type { Judged } from './classify';
import { normaliseTitle } from './filter';
import type { Story } from './types';

/** Strip tracking, fragments and the `www.` so the same article hashes once. */
export function canonicalUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.hash = '';
    url.hostname = url.hostname.replace(/^www\./, '');
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_|ref|source)/i.test(key)) url.searchParams.delete(key);
    }
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch {
    return raw.trim();
  }
}

export function storyId(url: string): string {
  return createHash('sha1').update(canonicalUrl(url)).digest('hex').slice(0, 16);
}

export function slugify(headline: string, id: string): string {
  const base = headline
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 10)
    .join('-');
  return `${base || 'story'}-${id.slice(0, 6)}`;
}

const STOP = new Set([
  'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'but', 'with', 'after',
  'from', 'by', 'as', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'it', 'its', 'his',
  'her', 'their', 'this', 'that', 'over', 'into', 'out', 'up', 'down', 'new', 'says', 'said',
]);

export function tokens(title: string): Set<string> {
  return new Set(
    normaliseTitle(title)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP.has(word)),
  );
}

export function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

/**
 * Two outlets carrying the same rescue is corroboration, not clutter. We keep
 * the best-told version and record how many independent outlets we saw, which
 * is the only "verification" number on the site that means anything.
 */
export function cluster(judged: Judged[], now = new Date()): Story[] {
  const byUrl = new Map<string, Judged>();
  for (const entry of judged) {
    const key = canonicalUrl(entry.screened.item.url);
    const existing = byUrl.get(key);
    if (!existing || entry.weight > existing.weight) byUrl.set(key, entry);
  }

  const groups: Array<{ members: Judged[]; tokens: Set<string> }> = [];

  for (const entry of byUrl.values()) {
    const entryTokens = tokens(entry.headline);
    const home = groups.find((group) => similarity(group.tokens, entryTokens) >= 0.62);
    if (home) {
      home.members.push(entry);
      for (const token of entryTokens) home.tokens.add(token);
    } else {
      groups.push({ members: [entry], tokens: entryTokens });
    }
  }

  const scannedAt = now.toISOString();

  return groups.map((group) => {
    const outlets = new Set(group.members.map((m) => m.screened.item.sourceName));
    const lead = [...group.members].sort((a, b) => {
      const image = Number(Boolean(b.screened.item.imageUrl)) - Number(Boolean(a.screened.item.imageUrl));
      if (image !== 0) return image;
      return b.weight - a.weight;
    })[0]!;

    const id = storyId(lead.screened.item.url);
    const corroborations = outlets.size;
    const publishedAt = lead.screened.item.publishedAt ?? scannedAt;

    return {
      id,
      slug: slugify(lead.headline, id),
      headline: lead.headline,
      summary: lead.summary,
      desk: lead.desk,
      place: lead.place,
      sourceName: lead.screened.item.sourceName,
      sourceUrl: canonicalUrl(lead.screened.item.url),
      imageUrl: lead.screened.item.imageUrl,
      publishedAt,
      scannedAt,
      weight: Math.min(100, lead.weight + (corroborations - 1) * 6),
      confidence: Math.min(100, lead.confidence + (corroborations - 1) * 4),
      reviewedBy: lead.reviewedBy,
      corroborations,
      // One sensitive member makes the whole cluster sensitive. Merging a
      // withheld story with a named one must never reveal the location.
      locationSensitive: group.members.some((member) => member.locationSensitive),
    } satisfies Story;
  });
}

/**
 * Front-page order. Recency matters, but a big story from this morning should
 * still outrank a small one from ten minutes ago, so weight decays by the hour
 * rather than being replaced by it.
 */
export function rank(stories: Story[], now = Date.now()): Story[] {
  return [...stories].sort((a, b) => score(b, now) - score(a, now));
}

export function score(story: Story, now = Date.now()): number {
  const hours = Math.max(0, (now - Date.parse(story.publishedAt)) / 3_600_000);
  const freshness = 100 / (1 + hours / 14);
  return story.weight * 0.62 + freshness * 0.38;
}
