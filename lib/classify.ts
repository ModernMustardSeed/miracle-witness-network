import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

import { DESK_IDS, DESK_LIST, type DeskId } from './desks';
import type { Screened } from './filter';

/**
 * The editor. The keyword pass in `filter.ts` decides what is even a candidate;
 * this decides what actually runs, what desk it belongs on, and how the
 * headline and standfirst read.
 *
 * When no key is configured the newsroom still publishes: `runRules` below is
 * the fallback, and every story records which of the two placed it.
 */

const MODEL = 'claude-opus-5';
const BATCH_SIZE = 18;

const VerdictSchema = z.object({
  index: z.number().int(),
  publish: z.boolean(),
  desk: z.enum(DESK_IDS),
  headline: z.string(),
  summary: z.string(),
  place: z.string(),
  weight: z.number().int(),
  confidence: z.number().int(),
  locationSensitive: z.boolean(),
  reason: z.string(),
});

const BatchSchema = z.object({ verdicts: z.array(VerdictSchema) });

export type Verdict = z.infer<typeof VerdictSchema>;

const SYSTEM = [
  'You are the copy desk of the Miracle Witness Network, a newsroom that reports only',
  'verifiable good news: rescues, recoveries, revivals, reunions, generosity, justice done,',
  'and land and communities coming back. You are handling raw wire candidates.',
  '',
  'For each candidate decide whether it runs.',
  '',
  'Run it only when ALL of these hold:',
  '- The subject of the story is genuinely good news that has already happened.',
  '- A named outlet is reporting it as fact, not as a rumour, a prediction, a plan,',
  '  a fundraising appeal, a prayer request, or an opinion column.',
  '- A reader would finish it feeling that something good is true, not that something',
  '  terrible happened and a fragment was salvaged.',
  '',
  'Do not run it when any of these hold:',
  '- The story is primarily about death, crime, war, disaster, scandal or loss, even if',
  '  a rescue or a kindness appears inside it.',
  '- It is a sermon, a devotional, a book review, a listicle, a horoscope, a sports result,',
  '  a product launch, a stock movement, a celebrity item, or a political campaign story.',
  '- It claims a supernatural event that no outlet has actually reported as fact. We report',
  '  what happened and name who reported it. We never assert a miracle the source did not.',
  '- It is an appeal for money or an advertisement in the shape of news.',
  '',
  'One clarification that matters, because the revival and underground desks are the',
  'reason this newsroom exists. A report that believers DID something real runs: a',
  'church planted, reopened or rebuilt, a group baptized, a mission or a broadcast',
  'launched, a congregation that outgrew its building, believers who kept meeting',
  'under a ban. Only the commentary is out: a sermon, a devotional, a columnist',
  'arguing a position, a conference preview, or a complaint about church culture.',
  'Do not reject a genuine ministry story for being small, local, or about faith.',
  '',
  'Desks:',
  ...DESK_LIST.map((d) => `- ${d.id}: ${d.signal}`),
  '',
  'Writing rules for the headline and summary:',
  '- headline: rewrite the source headline in plain sentence case, under 90 characters,',
  '  concrete and specific. Keep the number, the place, the span of time. No hype words',
  '  ("incredible", "amazing", "unbelievable"), no clickbait, no question headlines, and',
  '  never an em dash.',
  '- summary: one or two sentences, under 260 characters, saying what happened, where, and',
  '  who reported it if that matters. Plain past tense. Never an em dash. Never speculate',
  '  beyond the candidate text you were given.',
  '- place: "City, Country" when the text supports it, otherwise the country alone,',
  '  otherwise the single word "Unspecified".',
  '- weight: 0-100, how much this matters to a global reader. A national rescue of many',
  '  people is 80+. A neighbourhood kindness is 30-50.',
  '- confidence: 0-100, how sure you are this is genuine, already-happened good news.',
  '- locationSensitive: true when naming the place could put the people in the story in',
  '  danger. Set it for underground and house churches, converts in countries where',
  '  conversion is punished, believers meeting under a ban, and anyone sheltering them.',
  '  When it is true, put only a region or the single word "Unspecified" in place, never a',
  '  city, a district, a church name, or anyone’s full name. Err toward true.',
  '- reason: at most 12 words, for the newsroom log, not for readers.',
  '',
  'Return a verdict for every candidate index you were given, including the ones you reject.',
].join('\n');

function candidateBlock(screened: Screened[], offset: number): string {
  return screened
    .map((entry, i) => {
      const { item } = entry;
      const lines = [
        `[${offset + i}]`,
        `title: ${item.title}`,
        `outlet: ${item.sourceName}`,
        `published: ${item.publishedAt ?? 'unknown'}`,
        `keyword desk guess: ${entry.desk}`,
      ];
      if (item.country) lines.push(`source country: ${item.country}`);
      if (item.summary) lines.push(`excerpt: ${item.summary.slice(0, 420)}`);
      return lines.join('\n');
    })
    .join('\n\n');
}

export function hasClaude(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

async function judgeBatch(
  client: Anthropic,
  batch: Screened[],
  offset: number,
): Promise<Verdict[]> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Candidates:\n\n${candidateBlock(batch, offset)}`,
      },
    ],
    output_config: {
      effort: 'low',
      format: zodOutputFormat(BatchSchema),
    },
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('The model declined this batch; falling back to the keyword pass.');
  }

  return response.parsed_output?.verdicts ?? [];
}

export interface Judged {
  screened: Screened;
  desk: DeskId;
  headline: string;
  summary: string;
  place: string | null;
  weight: number;
  confidence: number;
  reviewedBy: 'claude' | 'rules';
  locationSensitive: boolean;
}

/** The fallback editor. Uses the source's own headline and excerpt, unedited. */
export function runRules(screened: Screened[]): Judged[] {
  return screened.map((entry) => ({
    screened: entry,
    desk: entry.desk,
    headline: entry.item.title,
    summary:
      entry.item.summary?.slice(0, 240) ??
      `${entry.item.sourceName} reported this story. Read it at the source.`,
    place: entry.item.country,
    weight: entry.weight,
    confidence: entry.confidence,
    reviewedBy: 'rules' as const,
    locationSensitive: entry.locationSensitive,
  }));
}

export async function judge(
  screened: Screened[],
  onWarn?: (message: string) => void,
): Promise<Judged[]> {
  if (screened.length === 0) return [];
  if (!hasClaude()) {
    onWarn?.('No ANTHROPIC_API_KEY set. The keyword pass placed this run on its own.');
    return runRules(screened);
  }

  const client = new Anthropic();
  const judged: Judged[] = [];

  for (let offset = 0; offset < screened.length; offset += BATCH_SIZE) {
    const batch = screened.slice(offset, offset + BATCH_SIZE);
    let verdicts: Verdict[];
    try {
      verdicts = await judgeBatch(client, batch, offset);
    } catch (error) {
      onWarn?.(
        `Batch at ${offset} fell back to the keyword pass: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      judged.push(...runRules(batch));
      continue;
    }

    for (const verdict of verdicts) {
      const entry = screened[verdict.index];
      if (!entry) continue;
      if (!verdict.publish) continue;
      if (verdict.confidence < 55) continue;

      const headline = verdict.headline.trim();
      const summary = verdict.summary.trim();
      if (headline.length < 12 || summary.length < 20) continue;

      const place = verdict.place.trim();
      const sensitive = verdict.locationSensitive || verdict.desk === 'underground';
      const named = place && place.toLowerCase() !== 'unspecified' ? place : entry.item.country;
      judged.push({
        screened: entry,
        desk: verdict.desk,
        headline,
        summary,
        // A sensitive story keeps whatever the editor chose to say and never
        // falls back to the source country, which is the one field that would
        // put a location back on a story that asked not to have one.
        place: sensitive ? (place && place.toLowerCase() !== 'unspecified' ? place : null) : named,
        locationSensitive: sensitive,
        weight: Math.max(1, Math.min(100, verdict.weight)),
        confidence: Math.max(1, Math.min(100, verdict.confidence)),
        reviewedBy: 'claude',
      });
    }
  }

  return judged;
}
