import type { RawItem } from '../types';

export interface FeedDef {
  name: string;
  url: string;
  /** Feeds whose whole output is already good news skip the positive-signal gate. */
  alwaysPositive?: boolean;
  country?: string;
}

/**
 * Every feed here was probed for a 200 and a parseable `<item>` list before it
 * was added. `pnpm sources:check` re-probes them; a feed that stops answering
 * is dropped from a scan without taking the scan down.
 */
export const FEEDS: FeedDef[] = [
  { name: 'Good News Network', url: 'https://www.goodnewsnetwork.org/feed/', alwaysPositive: true },
  { name: 'Positive News', url: 'https://www.positive.news/feed/', alwaysPositive: true },
  {
    name: 'Reasons to be Cheerful',
    url: 'https://reasonstobecheerful.world/feed/',
    alwaysPositive: true,
  },
  { name: 'Optimist Daily', url: 'https://www.optimistdaily.com/feed/', alwaysPositive: true },
  { name: 'The Christian Post', url: 'https://www.christianpost.com/rss/' },
  { name: 'Religion News Service', url: 'https://religionnews.com/feed/' },
  { name: 'Mission Network News', url: 'https://www.mnnonline.org/feed/' },
  { name: 'Aleteia', url: 'https://aleteia.org/feed/' },
  { name: 'Vatican News', url: 'https://www.vaticannews.va/en.rss.xml' },
  { name: 'Charisma News', url: 'https://www.charismanews.com/feed/' },
  { name: 'Open Doors', url: 'https://www.opendoorsuk.org/feed/' },
  { name: 'NPR Health', url: 'https://feeds.npr.org/1128/rss.xml' },
  { name: 'Christianity Today', url: 'https://www.christianitytoday.com/rss/' },
  { name: 'Evangelical Focus', url: 'https://www.evangelicalfocus.com/rss' },
  { name: 'Sight Magazine', url: 'https://sightmagazine.com.au/feed' },
  // The persecution desks. Most of what they publish is grief and the veto
  // stops it there, which is the point: what gets through is the church that
  // kept meeting anyway.
  { name: 'International Christian Concern', url: 'https://www.persecution.org/feed/' },
  { name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml' },
];

const USER_AGENT =
  'MiracleWitnessNetwork/2.0 (+https://miraclewitness.network; newsroom scanner)';

function stripCdata(value: string): string {
  return value.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '');
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
  ndash: '–',
  mdash: '—',
};

export function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_m, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name.toLowerCase()] ?? match);
}

export function textOf(html: string): string {
  return decodeEntities(
    stripCdata(html)
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block: string, name: string): string | null {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i');
  const m = re.exec(block);
  return m?.[1] ?? null;
}

function attr(block: string, tagName: string, attrName: string): string | null {
  const re = new RegExp(`<${tagName}\\b[^>]*\\b${attrName}=["']([^"']+)["']`, 'i');
  const m = re.exec(block);
  return m?.[1] ?? null;
}

function firstImage(block: string): string | null {
  const candidates = [
    attr(block, 'media:content', 'url'),
    attr(block, 'media:thumbnail', 'url'),
    attr(block, 'enclosure', 'url'),
    attr(block, 'image', 'href'),
  ];
  for (const candidate of candidates) {
    if (candidate && /^https?:\/\//.test(candidate)) return decodeEntities(candidate);
  }
  const inline = /<img[^>]+src=["']([^"']+)["']/i.exec(block);
  if (inline?.[1] && /^https?:\/\//.test(inline[1])) return decodeEntities(inline[1]);
  return null;
}

function linkOf(block: string): string | null {
  const plain = tag(block, 'link');
  if (plain) {
    const value = textOf(plain);
    if (value.startsWith('http')) return value;
  }
  // Atom puts the URL in an attribute rather than the element body.
  const href = attr(block, 'link', 'href');
  if (href?.startsWith('http')) return decodeEntities(href);
  const guid = tag(block, 'guid');
  if (guid) {
    const value = textOf(guid);
    if (value.startsWith('http')) return value;
  }
  return null;
}

function dateOf(block: string): string | null {
  for (const name of ['pubDate', 'dc:date', 'published', 'updated']) {
    const raw = tag(block, name);
    if (!raw) continue;
    const parsed = new Date(textOf(raw));
    if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString();
  }
  return null;
}

export function parseFeed(xml: string, feed: FeedDef): RawItem[] {
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) ?? [];
  const items: RawItem[] = [];

  for (const block of blocks) {
    const rawTitle = tag(block, 'title');
    const url = linkOf(block);
    if (!rawTitle || !url) continue;

    const title = textOf(rawTitle);
    if (title.length < 12) continue;

    const body =
      tag(block, 'content:encoded') ?? tag(block, 'description') ?? tag(block, 'summary');
    const summary = body ? textOf(body).slice(0, 600) : null;

    items.push({
      title,
      url: url.split('?utm_')[0] ?? url,
      summary: summary && summary.length > 30 ? summary : null,
      imageUrl: firstImage(block),
      publishedAt: dateOf(block),
      sourceName: feed.name,
      sourceKind: 'rss',
      country: feed.country ?? null,
    });
  }

  return items;
}

export async function fetchFeed(feed: FeedDef, timeoutMs = 12_000): Promise<RawItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(feed.url, {
      headers: { 'user-agent': USER_AGENT, accept: 'application/rss+xml, application/xml, */*' },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`${feed.name} answered ${response.status}`);
    return parseFeed(await response.text(), feed);
  } finally {
    clearTimeout(timer);
  }
}
