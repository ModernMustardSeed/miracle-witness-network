import type { Story } from './types';

/**
 * Photography.
 *
 * Several of the best good-news wires publish feeds with no image in them at
 * all: Good News Network's RSS is title, link and description, nothing else.
 * A front page built only on what the feed hands over is a list, not a paper.
 *
 * So for the stories that will actually be seen, we fetch the article itself
 * and read the social card the publisher already made for it. That is the same
 * image every social platform shows when the link is shared, which is exactly
 * the permission model we want: nothing private, nothing scraped out of the
 * page body, just the card the outlet published for reuse.
 */

const USER_AGENT =
  'MiracleWitnessNetwork/2.0 (+https://miraclewitness.network; newsroom scanner)';

/** Enough of the document to be past </head> on any normal page. */
const MAX_BYTES = 120_000;

const META =
  /<meta[^>]+(?:property|name)=["'](og:image(?::secure_url|:url)?|twitter:image(?::src)?)["'][^>]*>/gi;

export function imageFromHtml(html: string, pageUrl: string): string | null {
  const head = html.slice(0, MAX_BYTES);
  META.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = META.exec(head)) !== null) {
    const content = /content=["']([^"']+)["']/i.exec(match[0])?.[1];
    if (!content) continue;
    try {
      const resolved = new URL(content.trim(), pageUrl);
      if (resolved.protocol !== 'https:') continue;
      if (/\.(svg|gif)(\?|$)/i.test(resolved.pathname)) continue;
      // Sprites, spacers and logo files are not story photography.
      if (/(logo|sprite|placeholder|avatar|favicon|default)/i.test(resolved.pathname)) continue;
      return resolved.toString();
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchImage(url: string, timeoutMs: number): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' },
      signal: controller.signal,
      redirect: 'follow',
      cache: 'no-store',
    });
    if (!response.ok) return null;
    if (!response.headers.get('content-type')?.includes('html')) return null;

    // Read only the head of the document. A news page can be a megabyte and we
    // need the first few kilobytes of it.
    const reader = response.body?.getReader();
    if (!reader) return imageFromHtml(await response.text(), response.url || url);

    const decoder = new TextDecoder();
    let html = '';
    while (html.length < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      if (html.includes('</head>')) break;
    }
    await reader.cancel().catch(() => {});
    return imageFromHtml(html, response.url || url);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fills in missing photography for the top `limit` stories, in place of nothing.
 * Every failure is silent by design: a story without a picture still runs, and
 * a slow publisher must never hold up an edition.
 */
export async function addMissingImages(
  stories: Story[],
  { limit = 24, concurrency = 8, timeoutMs = 6000 } = {},
): Promise<number> {
  const targets = stories.filter((story) => !story.imageUrl).slice(0, limit);
  if (targets.length === 0) return 0;

  let filled = 0;
  let cursor = 0;

  const workers = Array.from({ length: Math.min(concurrency, targets.length) }, async () => {
    while (cursor < targets.length) {
      const story = targets[cursor++];
      if (!story) return;
      const image = await fetchImage(story.sourceUrl, timeoutMs);
      if (image) {
        story.imageUrl = image;
        filled += 1;
      }
    }
  });

  await Promise.all(workers);
  return filled;
}
