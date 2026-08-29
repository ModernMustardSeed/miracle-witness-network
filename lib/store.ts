import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { rank, score } from './cluster';
import { DESK_IDS, type DeskId } from './desks';
import { runScan } from './scan';
import type { NewsroomStats, ScanRun, Story, Submission } from './types';

/**
 * The newsroom archive.
 *
 * With Supabase configured every scan is persisted, the archive grows, reader
 * testimonies land in a table, and the site reads from Postgres. With nothing
 * configured the site still runs: it scans the fast RSS lane on demand, holds
 * the result in the running instance for fifteen minutes, and says so on the
 * How We Verify page. What it never does is invent a story to fill the page.
 */

export class NotPersisted extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotPersisted';
  }
}

export interface StoryQuery {
  desk?: DeskId;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface Store {
  kind: 'supabase' | 'live';
  listStories(query?: StoryQuery): Promise<Story[]>;
  getStory(slug: string): Promise<Story | null>;
  saveStories(stories: Story[]): Promise<number>;
  saveRun(run: ScanRun): Promise<void>;
  lastRun(): Promise<ScanRun | null>;
  stats(): Promise<NewsroomStats>;
  saveSubmission(input: Omit<Submission, 'id' | 'createdAt' | 'status'>): Promise<void>;
}

const url = () => process.env.SUPABASE_URL?.trim() ?? process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export function isPersisted(): boolean {
  return Boolean(url() && serviceKey());
}

/* ------------------------------------------------------------------ */
/* Shared shaping                                                      */
/* ------------------------------------------------------------------ */

function applyQuery(stories: Story[], query: StoryQuery = {}): Story[] {
  const { desk, search, limit = 40, offset = 0 } = query;
  let out = stories;
  if (desk) out = out.filter((story) => story.desk === desk);
  if (search) {
    const needle = search.toLowerCase().trim();
    if (needle) {
      out = out.filter((story) =>
        `${story.headline} ${story.summary} ${story.place ?? ''} ${story.sourceName}`
          .toLowerCase()
          .includes(needle),
      );
    }
  }
  return out.slice(offset, offset + limit);
}

function statsFrom(stories: Story[], lastScanAt: string | null): NewsroomStats {
  const dayAgo = Date.now() - 86_400_000;
  return {
    storiesAllTime: stories.length,
    storiesLast24h: stories.filter((story) => Date.parse(story.scannedAt) >= dayAgo).length,
    countries: new Set(
      stories
        .map((story) => story.place?.split(',').pop()?.trim())
        .filter((place): place is string => Boolean(place)),
    ).size,
    outlets: new Set(stories.map((story) => story.sourceName)).size,
    lastScanAt,
  };
}

/* ------------------------------------------------------------------ */
/* Live store: no database, real stories, fifteen minute memory        */
/* ------------------------------------------------------------------ */

interface LiveCache {
  stories: Story[];
  run: ScanRun | null;
  at: number;
  inflight: Promise<void> | null;
}

const CACHE_MS = 15 * 60 * 1000;

const globalCache = globalThis as typeof globalThis & { __mwnCache?: LiveCache };
const cache: LiveCache = (globalCache.__mwnCache ??= {
  stories: [],
  run: null,
  at: 0,
  inflight: null,
});

async function hydrate(): Promise<void> {
  const fresh = Date.now() - cache.at < CACHE_MS && cache.stories.length > 0;
  if (fresh) return;
  if (cache.inflight) return cache.inflight;

  cache.inflight = (async () => {
    try {
      const result = await runScan({ includeGdelt: false });
      // A scan that comes back empty must not blank a page that already has
      // stories on it; keep the last good edition instead.
      if (result.stories.length > 0 || cache.stories.length === 0) {
        cache.stories = result.stories;
      }
      cache.run = result.run;
      cache.at = Date.now();
    } finally {
      cache.inflight = null;
    }
  })();

  return cache.inflight;
}

const liveStore: Store = {
  kind: 'live',
  async listStories(query) {
    await hydrate();
    return applyQuery(rank(cache.stories), query);
  },
  async getStory(slug) {
    await hydrate();
    return cache.stories.find((story) => story.slug === slug) ?? null;
  },
  async saveStories(stories) {
    const byId = new Map(cache.stories.map((story) => [story.id, story]));
    for (const story of stories) byId.set(story.id, story);
    cache.stories = rank([...byId.values()]);
    cache.at = Date.now();
    return stories.length;
  },
  async saveRun(run) {
    cache.run = run;
  },
  async lastRun() {
    await hydrate();
    return cache.run;
  },
  async stats() {
    await hydrate();
    return statsFrom(cache.stories, cache.run?.finishedAt ?? null);
  },
  async saveSubmission() {
    throw new NotPersisted(
      'Testimonies need the newsroom database. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  },
};

/* ------------------------------------------------------------------ */
/* Supabase store                                                      */
/* ------------------------------------------------------------------ */

interface StoryRow {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  desk: string;
  place: string | null;
  source_name: string;
  source_url: string;
  image_url: string | null;
  published_at: string;
  scanned_at: string;
  weight: number;
  confidence: number;
  reviewed_by: string;
  corroborations: number;
  location_sensitive: boolean | null;
}

function toStory(row: StoryRow): Story {
  const desk = (DESK_IDS as readonly string[]).includes(row.desk)
    ? (row.desk as DeskId)
    : 'kindness';
  return {
    id: row.id,
    slug: row.slug,
    headline: row.headline,
    summary: row.summary,
    desk,
    place: row.place,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
    scannedAt: row.scanned_at,
    weight: row.weight,
    confidence: row.confidence,
    reviewedBy: row.reviewed_by === 'claude' ? 'claude' : 'rules',
    corroborations: row.corroborations,
    locationSensitive: Boolean(row.location_sensitive),
  };
}

function toRow(story: Story): StoryRow {
  return {
    id: story.id,
    slug: story.slug,
    headline: story.headline,
    summary: story.summary,
    desk: story.desk,
    place: story.place,
    source_name: story.sourceName,
    source_url: story.sourceUrl,
    image_url: story.imageUrl,
    published_at: story.publishedAt,
    scanned_at: story.scannedAt,
    weight: story.weight,
    confidence: story.confidence,
    reviewed_by: story.reviewedBy,
    corroborations: story.corroborations,
    location_sensitive: story.locationSensitive,
  };
}

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!client) {
    client = createClient(url()!, serviceKey()!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

const supabaseStore: Store = {
  kind: 'supabase',
  async listStories(query = {}) {
    const { desk, search, limit = 40, offset = 0 } = query;
    let request = db()
      .from('stories')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(Math.min(400, (limit + offset) * 3 + 60));

    if (desk) request = request.eq('desk', desk);
    if (search?.trim()) {
      const needle = search.trim().replace(/[%,()]/g, ' ');
      request = request.or(`headline.ilike.%${needle}%,summary.ilike.%${needle}%`);
    }

    const { data, error } = await request;
    if (error) throw new Error(`Reading stories failed: ${error.message}`);

    const stories = rank((data ?? []).map((row) => toStory(row as StoryRow)));
    return stories.slice(offset, offset + limit);
  },

  async getStory(slug) {
    const { data, error } = await db().from('stories').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`Reading that story failed: ${error.message}`);
    return data ? toStory(data as StoryRow) : null;
  },

  async saveStories(stories) {
    if (stories.length === 0) return 0;
    const { error } = await db()
      .from('stories')
      .upsert(stories.map(toRow), { onConflict: 'id', ignoreDuplicates: false });
    if (error) throw new Error(`Saving stories failed: ${error.message}`);
    return stories.length;
  },

  async saveRun(run) {
    const { error } = await db().from('scan_runs').insert({
      id: run.id,
      started_at: run.startedAt,
      finished_at: run.finishedAt,
      items_seen: run.itemsSeen,
      items_kept: run.itemsKept,
      sources_ok: run.sourcesOk,
      sources_failed: run.sourcesFailed,
      reviewer: run.reviewer,
      notes: run.notes,
    });
    if (error) throw new Error(`Recording the run failed: ${error.message}`);
  },

  async lastRun() {
    const { data, error } = await db()
      .from('scan_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    return {
      id: String(row.id),
      startedAt: String(row.started_at),
      finishedAt: row.finished_at ? String(row.finished_at) : null,
      itemsSeen: Number(row.items_seen ?? 0),
      itemsKept: Number(row.items_kept ?? 0),
      sourcesOk: Number(row.sources_ok ?? 0),
      sourcesFailed: Number(row.sources_failed ?? 0),
      reviewer: (row.reviewer as ScanRun['reviewer']) ?? 'rules',
      notes: row.notes ? String(row.notes) : null,
    };
  },

  async stats() {
    const [total, recent, run] = await Promise.all([
      db().from('stories').select('id', { count: 'exact', head: true }),
      db()
        .from('stories')
        .select('place, source_name')
        .gte('scanned_at', new Date(Date.now() - 86_400_000).toISOString()),
      supabaseStore.lastRun(),
    ]);

    const rows = (recent.data ?? []) as Array<{ place: string | null; source_name: string }>;
    const { data: facets } = await db().from('stories').select('place, source_name').limit(2000);
    const all = (facets ?? []) as Array<{ place: string | null; source_name: string }>;

    return {
      storiesAllTime: total.count ?? all.length,
      storiesLast24h: rows.length,
      countries: new Set(
        all.map((row) => row.place?.split(',').pop()?.trim()).filter(Boolean) as string[],
      ).size,
      outlets: new Set(all.map((row) => row.source_name)).size,
      lastScanAt: run?.finishedAt ?? null,
    };
  },

  async saveSubmission(input) {
    const { error } = await db().from('submissions').insert({
      name: input.name,
      email: input.email,
      place: input.place,
      desk: input.desk,
      story: input.story,
      status: 'new',
    });
    if (error) throw new Error(`Saving your testimony failed: ${error.message}`);
  },
};

export function store(): Store {
  return isPersisted() ? supabaseStore : liveStore;
}

/**
 * What earns the lead slot.
 *
 * Raw score alone put a sleep study above a man pulled alive out of a cave, and
 * led the paper with an empty grey box because that story's feed carried no
 * photograph. A front page is chosen, not sorted. Two rules do it: the lead
 * must have a picture if any strong candidate has one, and the desks this
 * newsroom exists for outrank the ones it merely also covers.
 */
const LEAD_BIAS: Record<DeskId, number> = {
  rescue: 26,
  underground: 24,
  revival: 22,
  reunion: 18,
  justice: 14,
  kindness: 8,
  provision: 6,
  healing: 2,
  renewal: 0,
};

export function pickLead(ordered: Story[]): Story | null {
  const pool = ordered.slice(0, 14);
  if (pool.length === 0) return null;
  const illustrated = pool.filter((story) => story.imageUrl);
  const candidates = illustrated.length > 0 ? illustrated : pool;
  return (
    [...candidates].sort(
      (a, b) => score(b) + LEAD_BIAS[b.desk] - (score(a) + LEAD_BIAS[a.desk]),
    )[0] ?? null
  );
}

/** Front page shape: one lead, two seconds, the rest as the wire. */
export interface Edition {
  lead: Story | null;
  seconds: Story[];
  wire: Story[];
  byDesk: Array<{ desk: DeskId; stories: Story[] }>;
  stats: NewsroomStats;
  persisted: boolean;
}

export async function edition(): Promise<Edition> {
  const active = store();
  const [stories, stats] = await Promise.all([
    active.listStories({ limit: 90 }),
    active.stats().catch(() => statsFrom([], null)),
  ]);

  const ordered = rank(stories);
  const lead = pickLead(ordered);
  const rest = ordered.filter((story) => story.id !== lead?.id);
  const seconds = rest.slice(0, 3);
  const wire = rest.slice(3, 15);

  const byDesk = DESK_IDS.map((id) => ({
    desk: id,
    stories: ordered
      .filter((story) => story.desk === id)
      .sort((a, b) => score(b) - score(a))
      .slice(0, 3),
  })).filter((group) => group.stories.length > 0);

  return { lead, seconds, wire, byDesk, stats, persisted: active.kind === 'supabase' };
}
