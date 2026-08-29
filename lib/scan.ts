import { randomUUID } from 'node:crypto';

import { hasClaude, judge, runRules, type Judged } from './classify';
import { canonicalUrl, cluster, rank, storyId } from './cluster';
import type { DeskId } from './desks';
import { addMissingImages } from './enrich';
import { screen, type Screened } from './filter';
import { GDELT_QUERIES, fetchGdelt, type GdeltQuery } from './sources/gdelt';
import { FEEDS, fetchFeed } from './sources/rss';
import type { RawItem, ScanRun, Story } from './types';

export interface ScanOptions {
  /** GDELT is the global lane and takes up to 45s a query, so the fast read
   *  path leaves it off and the hourly cron turns it on. */
  includeGdelt?: boolean;
  /** Set false to prove the keyword pass on its own without spending tokens. */
  useClaude?: boolean;
  gdeltTimespan?: string;
  /** How many picture-less stories to go and find a social card for. */
  enrichImages?: number;
  /** Size of the rotating GDELT window this pass runs. */
  gdeltQueries?: number;
  /**
   * Asks the archive which candidates it already carries and drops them before
   * the editor is paid to read them again.
   */
  skipKnown?: (ids: string[]) => Promise<Set<string>>;
}

export interface ScanResult {
  stories: Story[];
  run: ScanRun;
  warnings: string[];
}

interface Collected {
  items: RawItem[];
  alwaysPositive: Set<string>;
  ok: number;
  failed: number;
  warnings: string[];
}

/**
 * GDELT throttles. Ten queries fired at once came back with one answer; the
 * same queries run two at a time answer far more often, and the service is a
 * free public good we would rather not hammer.
 *
 * So each pass takes a window of five queries and the window walks forward by
 * the hour. Every query still runs several times a day, no pass spends more
 * than about a minute in this lane, and the editor keeps the rest of the
 * function's budget.
 */
export function gdeltWindow(hour: number, size = 5): GdeltQuery[] {
  const total = GDELT_QUERIES.length;
  const start = ((hour % total) + total) % total;
  return Array.from({ length: Math.min(size, total) }, (_, i) => GDELT_QUERIES[(start + i) % total]!);
}

async function pool<T, R>(
  items: T[],
  concurrency: number,
  work: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      const item = items[index]!;
      try {
        results[index] = { status: 'fulfilled', value: await work(item) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  });

  await Promise.all(runners);
  return results;
}

async function collect(options: Required<ScanOptions>): Promise<Collected> {
  const warnings: string[] = [];
  const alwaysPositive = new Set(
    FEEDS.filter((feed) => feed.alwaysPositive).map((feed) => feed.name),
  );

  const queries = options.includeGdelt
    ? gdeltWindow(new Date().getUTCHours(), options.gdeltQueries)
    : [];

  const labels = [
    ...FEEDS.map((feed) => feed.name),
    ...queries.map((query) => `GDELT ${query.label}`),
  ];

  // The feeds are fast and independent, so they all go at once. GDELT goes two
  // at a time or it answers nothing.
  const [feedResults, gdeltResults] = await Promise.all([
    Promise.allSettled(FEEDS.map(async (feed) => fetchFeed(feed))),
    pool(queries, 2, (query) => fetchGdelt(query, { timespan: options.gdeltTimespan })),
  ]);
  const settled = [...feedResults, ...gdeltResults];
  const items: RawItem[] = [];
  let ok = 0;
  let failed = 0;

  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      ok += 1;
      items.push(...result.value);
      return;
    }
    failed += 1;
    const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
    warnings.push(`${labels[index] ?? 'source'} did not answer: ${reason}`);
  });

  return { items, alwaysPositive, ok, failed, warnings };
}

/** Drops anything older than the window so a stale feed cannot re-lead the page. */
function withinWindow(item: RawItem, days: number, now: number): boolean {
  if (!item.publishedAt) return true;
  const at = Date.parse(item.publishedAt);
  if (Number.isNaN(at)) return true;
  if (at > now + 36 * 3_600_000) return false; // a future date is a broken feed
  return now - at <= days * 86_400_000;
}

/**
 * The shortlist the editor actually reads.
 *
 * Sorting the whole pile by weight and taking the top 90 sounds right and is
 * wrong: the four dedicated good-news wires publish far more per hour than the
 * faith and persecution desks do, so a straight cut buries revival, rescue and
 * underground candidates under a run of conservation stories and the model
 * never sees them. This deals one candidate to each desk in turn, strongest
 * first, so every desk gets looked at before any desk gets seconds.
 */
export function shortlistByDesk(screened: Screened[], limit: number): Screened[] {
  const queues = new Map<DeskId, Screened[]>();
  for (const entry of screened) {
    const queue = queues.get(entry.desk);
    if (queue) queue.push(entry);
    else queues.set(entry.desk, [entry]);
  }
  for (const queue of queues.values()) queue.sort((a, b) => b.weight - a.weight);

  const out: Screened[] = [];
  let dealt = true;
  while (out.length < limit && dealt) {
    dealt = false;
    for (const queue of queues.values()) {
      const next = queue.shift();
      if (!next) continue;
      out.push(next);
      dealt = true;
      if (out.length >= limit) break;
    }
  }
  return out;
}

export async function runScan(options: ScanOptions = {}): Promise<ScanResult> {
  const resolved: Required<ScanOptions> = {
    includeGdelt: options.includeGdelt ?? false,
    useClaude: options.useClaude ?? hasClaude(),
    gdeltTimespan: options.gdeltTimespan ?? '3d',
    // The read path dresses only what lands above the fold, because a reader is
    // waiting on it. The hourly cron has time to dress the whole edition.
    enrichImages: options.enrichImages ?? (options.includeGdelt ? 30 : 8),
    gdeltQueries: options.gdeltQueries ?? 5,
    skipKnown: options.skipKnown ?? (async () => new Set<string>()),
  };

  const startedAt = new Date();
  const now = startedAt.valueOf();
  const collected = await collect(resolved);
  const warnings = [...collected.warnings];

  const seen = new Set<string>();
  const screened: Screened[] = [];

  for (const item of collected.items) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    if (!withinWindow(item, 21, now)) continue;
    const result = screen(item, collected.alwaysPositive.has(item.sourceName));
    if (result) screened.push(result);
  }

  // An hourly scan re-reads the same feeds, so most of what it collects is
  // already published. Judging it again would cost real money every hour and
  // would also let a story's headline drift between passes. Only what the
  // archive has never seen reaches the editor.
  let fresh = screened;
  try {
    const known = await resolved.skipKnown(
      screened.map((entry) => storyId(canonicalUrl(entry.item.url))),
    );
    if (known.size > 0) {
      fresh = screened.filter((entry) => !known.has(storyId(canonicalUrl(entry.item.url))));
      warnings.push(`Skipped ${known.size} candidates the archive already carries.`);
    }
  } catch (error) {
    warnings.push(
      `Could not check the archive, so everything was judged: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const shortlist = shortlistByDesk(fresh, 90);

  let judged: Judged[];
  if (resolved.useClaude) {
    judged = await judge(shortlist, (message) => warnings.push(message));
  } else {
    judged = runRules(shortlist);
  }

  const stories = rank(cluster(judged, startedAt), now);

  if (resolved.enrichImages > 0) {
    const filled = await addMissingImages(stories, { limit: resolved.enrichImages });
    if (filled > 0) {
      warnings.push(`Found photography for ${filled} stories whose feed carried none.`);
    }
  }

  const finishedAt = new Date();

  const reviewers = new Set(stories.map((story) => story.reviewedBy));
  const reviewer: ScanRun['reviewer'] =
    reviewers.size > 1 ? 'mixed' : (reviewers.values().next().value ?? 'rules');

  return {
    stories,
    warnings,
    run: {
      id: randomUUID(),
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      itemsSeen: collected.items.length,
      itemsKept: stories.length,
      sourcesOk: collected.ok,
      sourcesFailed: collected.failed,
      reviewer,
      notes: warnings.length > 0 ? warnings.slice(0, 8).join(' | ') : null,
    },
  };
}
