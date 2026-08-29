import type { RawItem } from '../types';
import { getTextViaFetch, getTextViaNode } from './http';

/**
 * GDELT indexes news from every country in 100+ languages and updates every
 * fifteen minutes. It is the only free source that reaches a building collapse
 * in Kubwa or a flood rescue in Kathmandu the hour it is reported, which is
 * exactly the reporting no curated good-news feed ever carries.
 *
 * It is a keyword index, not an editor: these queries pull the tragedy along
 * with the rescue. Everything it returns goes through the filter and the
 * classifier before it is allowed near the front page.
 */

export interface GdeltQuery {
  label: string;
  query: string;
}

export const GDELT_QUERIES: GdeltQuery[] = [
  { label: 'rescue', query: '("rescued alive" OR "pulled from the rubble" OR "found alive")' },
  { label: 'survival', query: '("miraculous escape" OR "survived against all odds" OR "sole survivor rescued")' },
  { label: 'reunion', query: '("reunited after" OR "missing person found safe" OR "returned home after years")' },
  { label: 'revival', query: '("mass baptism" OR "baptisms" OR "church revival" OR "packed church")' },
  { label: 'salvation', query: '("professions of faith" OR "gave their lives to Christ" OR "came to faith" OR "baptized in a single day")' },
  { label: 'underground', query: '("house church" OR "underground church" OR "secret believers" OR "church grows despite")' },
  { label: 'healing', query: '("cancer free" OR "declared in remission" OR "woke from a coma" OR "walks again after")' },
  { label: 'provision', query: '("donated to" OR "raised for" OR "paid off the debt" OR "anonymous donor gave")' },
  { label: 'justice', query: '("exonerated after" OR "wrongfully convicted freed" OR "hostages released" OR "trafficking victims rescued")' },
  { label: 'renewal', query: '("species rediscovered" OR "no longer endangered" OR "river restored")' },
];

const ENDPOINT = 'https://api.gdeltproject.org/api/v2/doc/doc';
const USER_AGENT =
  'MiracleWitnessNetwork/2.0 (+https://miraclewitness.network; newsroom scanner)';

interface GdeltArticle {
  url?: string;
  title?: string;
  seendate?: string;
  socialimage?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
}

/** GDELT stamps `20260829T084500Z`, which `new Date()` will not parse. */
export function parseSeenDate(value: string | undefined): string | null {
  if (!value) return null;
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value.trim());
  if (!m) {
    const loose = new Date(value);
    return Number.isNaN(loose.valueOf()) ? null : loose.toISOString();
  }
  const [, y, mo, d, h, mi, s] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}.000Z`;
}

/** `abc7news.com` reads better on a card than a bare hostname with `www.`. */
export function outletFromDomain(domain: string | undefined): string {
  if (!domain) return 'Wire report';
  return domain.replace(/^www\./, '');
}

/**
 * GDELT sits behind a slow, intermittent front door: measured, it answers three
 * requests in five and takes 22 to 39 seconds to do it, and `fetch` takes a
 * connection reset on calls where a different transport succeeds. So each query
 * gets three attempts that alternate transports, inside a budget that leaves
 * room for the editor to run afterwards.
 *
 * The lane is never fatal. Ten queries run in parallel, each one settles on its
 * own, and How We Verify prints how many of the day's sources actually answered.
 */
export async function fetchGdelt(
  q: GdeltQuery,
  options: { maxRecords?: number; timespan?: string; timeoutMs?: number; attempts?: number } = {},
): Promise<RawItem[]> {
  const { attempts = 3 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fetchGdeltOnce(q, { ...options, transport: attempt % 2 === 0 ? 'fetch' : 'node' });
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function fetchGdeltOnce(
  q: GdeltQuery,
  {
    maxRecords = 30,
    timespan = '3d',
    timeoutMs = 42_000,
    transport = 'fetch',
  }: { maxRecords?: number; timespan?: string; timeoutMs?: number; transport?: 'fetch' | 'node' } = {},
): Promise<RawItem[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set('query', `${q.query} sourcelang:english`);
  url.searchParams.set('mode', 'ArtList');
  url.searchParams.set('maxrecords', String(maxRecords));
  url.searchParams.set('format', 'json');
  url.searchParams.set('timespan', timespan);
  url.searchParams.set('sort', 'DateDesc');

  const headers = { 'user-agent': USER_AGENT, accept: '*/*' };
  const get = transport === 'node' ? getTextViaNode : getTextViaFetch;
  const { status, body } = await get(url.toString(), headers, timeoutMs);

  if (status < 200 || status >= 300) {
    throw new Error(`GDELT ${q.label} answered ${status} over ${transport}`);
  }

  // GDELT answers an over-rate-limited or malformed query with plain text,
  // not JSON, and still sends a 200.
  if (!body.trimStart().startsWith('{')) {
    throw new Error(`GDELT ${q.label} returned no JSON: ${body.slice(0, 120).trim()}`);
  }

  const parsed = JSON.parse(body) as { articles?: GdeltArticle[] };
  const articles = parsed.articles ?? [];

  return articles.flatMap<RawItem>((article) => {
    if (!article.url || !article.title) return [];
    const title = article.title.replace(/s+/g, ' ').trim();
    if (title.length < 12) return [];
    return [
      {
        title,
        url: article.url,
        summary: null,
        imageUrl: article.socialimage?.startsWith('https://') ? article.socialimage : null,
        publishedAt: parseSeenDate(article.seendate),
        sourceName: outletFromDomain(article.domain),
        sourceKind: 'gdelt',
        country: article.sourcecountry ?? null,
      },
    ];
  });
}
