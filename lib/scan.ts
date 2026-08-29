import { randomUUID } from 'node:crypto';

import { hasClaude, judge, runRules, type Judged } from './classify';
import { cluster, rank } from './cluster';
import type { DeskId } from './desks';
import { addMissingImages } from './enrich';
import { screen, type Screened } from './filter';
import { GDELT_QUERIES, fetchGdelt } from './sources/gdelt';
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

async function collect(options: Required<ScanOptions>): Promise<Collected> {
  const warnings: string[] = [];
  const alwaysPositive = new Set(
    FEEDS.filter((feed) => feed.alwaysPositive).map((feed) => feed.name),
  );

  const feedJobs = FEEDS.map(async (feed) => fetchFeed(feed));
  const gdeltJobs = options.includeGdelt
    ? GDELT_QUERIES.map(async (query) => fetchGdelt(query, { timespan: options.gdeltTimespan }))
    : [];

  const labels = [
    ...FEEDS.map((feed) => feed.name),
    ...(options.includeGdelt ? GDELT_QUERIES.map((query) => `GDELT ${query.label}`) : []),
  ];

  const settled = await Promise.allSettled([...feedJobs, ...gdeltJobs]);
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

  const shortlist = shortlistByDesk(screened, 90);

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
