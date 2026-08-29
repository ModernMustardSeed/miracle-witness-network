import type { DeskId } from './desks';
import type { RawItem } from './types';

/**
 * The gate between a keyword index and a good-news front page.
 *
 * Two rules govern everything here:
 *
 * 1. A headline whose subject is a death, a crime or a catastrophe never runs,
 *    even when a rescue is buried inside it. "Two rescued, twelve killed" is a
 *    disaster story. We report the rescue when an outlet leads with the rescue.
 * 2. Nothing runs on absence of evidence. An item must carry a positive signal
 *    of its own, unless it came from a wire whose entire output is good news.
 */

/** Kills an item outright. Ordered roughly by how often each one fires. */
const VETO = [
  'killed',
  'kills',
  'death toll',
  'dead',
  'deaths',
  'dies',
  'died',
  'murder*',
  'homicide',
  'massacre',
  'shooting',
  'shot dead',
  'stabbed',
  'rape*',
  'raped',
  'sexual assault',
  'sexual abuse',
  'child abuse',
  'abuse scandal',
  'pleads guilty',
  'convicted of',
  'sentenced to',
  'charged with',
  'indicted',
  'on trial',
  'lawsuit',
  'sues',
  'fraud',
  'embezzl*',
  'scandal',
  'airstrike',
  'air strike',
  'bombing',
  'shelling',
  'war crime',
  'genocide',
  'atrocit*',
  'execution',
  'executed',
  'suicide',
  'overdose',
  'layoffs',
  'lays off',
  'bankrupt',
  'foreclos*',
  'missing after',
  'feared dead',
  'body found',
  'bodies found',
  'remains found',
  'toll rises',
  'toll climbs',
  'crackdown',
  'deport*',
  'evicted',
] as const;

/**
 * Words that turn a veto off because they change what the sentence is about.
 * "Trafficking ring dismantled" is a justice story; "abuse survivors win" is a
 * justice story. Both would otherwise trip the veto list above.
 */
const VETO_PARDON = [
  'ring dismantled',
  'ring busted',
  'survivors win',
  'survivor wins',
  'overturned',
  'exonerat*',
  'acquitted',
  'cleared of',
  'freed after',
  'released after',
  'compensation awarded',
] as const;

type SignalTable = Record<DeskId, readonly string[]>;

const SIGNALS: SignalTable = {
  rescue: [
    'rescued',
    'rescue',
    'pulled from the rubble',
    'found alive',
    'alive after',
    'survived',
    'survivor',
    'saved from',
    'airlifted to safety',
    'evacuated safely',
    'brought to safety',
    'search and rescue',
    'coast guard',
    'lifeboat',
    'pulled to safety',
  ],
  revival: [
    'came to christ',
    'gave their lives to',
    'gave his life to christ',
    'gave her life to christ',
    'professions of faith',
    'profession of faith',
    'salvation',
    'saved by grace',
    'born again',
    'accepted christ',
    'outpouring',
    'baptism',
    'baptized',
    'baptised',
    'revival',
    'congregation',
    'church grew',
    'new church',
    'church reopens',
    'rebuilt church',
    'worship',
    'gospel',
    'missionar*',
    'prayer meeting',
    'came to faith',
    'converts',
    'ordained',
    'pilgrim',
  ],
  healing: [
    'cancer free',
    'in remission',
    'remission',
    'recovered',
    'recovery',
    'walks again',
    'woke from',
    'out of a coma',
    'transplant',
    'cured',
    'breakthrough',
    'approved treatment',
    'trial success',
    'vaccine',
    'eradicated',
    'discharged from hospital',
    'clean bill of health',
  ],
  provision: [
    'donated',
    'donation',
    'raised',
    'fundrais*',
    'gift of',
    'paid off',
    'debt forgiven',
    'grant awarded',
    'free meals',
    'meals served',
    'food bank',
    'housing for',
    'scholarship',
    'gave away',
    'anonymous donor',
    'covered the cost',
  ],
  reunion: [
    'reunited',
    'reunion',
    'found safe',
    'returned home',
    'came home',
    'adopted',
    'adoption',
    'found her mother',
    'found his father',
    'traced her family',
    'after decades apart',
    'long-lost',
  ],
  kindness: [
    'kindness',
    'good samaritan',
    'stranger helped',
    'neighbours rallied',
    'neighbors rallied',
    'community came together',
    'volunteer',
    'stepped in to help',
    'act of courage',
    'hailed a hero',
    'saved a life',
    'gave up his',
    'gave up her',
    'surprised her with',
    'surprised him with',
  ],
  justice: [
    'exonerated',
    'wrongfully convicted',
    'conviction overturned',
    'released from prison',
    'freed after',
    'hostages released',
    'trafficking victims',
    'rescued from trafficking',
    'peace deal',
    'ceasefire holds',
    'charges dropped',
    'pardoned',
    'compensation awarded',
    'rights restored',
  ],
  underground: [
    'house church',
    'underground church',
    'secret church',
    'meeting in secret',
    'despite the ban',
    'despite a ban',
    'banned church',
    'smuggled bibles',
    'bibles reached',
    'closed country',
    'restricted nation',
    'persecuted church',
    'keeps meeting',
    'still gathering',
    'church grows despite',
  ],
  renewal: [
    'rediscovered',
    'no longer endangered',
    'population rebounds',
    'restored',
    'reforest*',
    'rewild*',
    'conservation',
    'habitat',
    'cleaned up',
    'river runs clean',
    'reef recover*',
    'rebuilt after',
    'reopened after',
    'protected area',
  ],
};

/** Signals that a story matters more than the average item on its desk. */
const WEIGHT_BOOSTS: Array<[RegExp, number]> = [
  [/\b(\d{2,6})\s+(people|children|families|passengers|miners|workers|survivors)\b/i, 14],
  [/\bafter\s+(\d+)\s+(days|years|decades|hours)\b/i, 10],
  [/\bfirst\s+(ever|time|in the world)\b/i, 8],
  [/\b(million|billion)\b/i, 6],
  [/\bworld['’]s\b/i, 5],
];

export function normaliseTitle(title: string): string {
  return title
    .replace(/\s+/g, ' ')
    .replace(/\s*[|–—-]\s*[^|–—-]{2,40}$/u, '') // trailing " - Outlet Name"
    .replace(/^[A-Z\s]{4,20}:\s*/u, '') // leading "BREAKING: "
    .trim();
}

function haystack(item: RawItem): string {
  return `${item.title} ${item.summary ?? ''}`.toLowerCase();
}

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matcherCache = new Map<string, RegExp>();

/**
 * Whole-word matching, not substring matching. Plain `includes` made "dies"
 * fire on "studies", "kills" on "skills", "dead" on "deadline" and "grant" on
 * "immigrant", which silently vetoed good stories and misfiled others. A
 * trailing asterisk marks the entries that really are meant as prefixes, so
 * "missionar*" still catches missionary and missionaries.
 */
function matches(text: string, phrase: string): boolean {
  let matcher = matcherCache.get(phrase);
  if (!matcher) {
    const prefix = phrase.endsWith('*');
    const body = escape(prefix ? phrase.slice(0, -1) : phrase);
    matcher = new RegExp(prefix ? `\\b${body}` : `\\b${body}\\b`);
    matcherCache.set(phrase, matcher);
  }
  return matcher.test(text);
}

export function vetoed(item: RawItem): boolean {
  const text = haystack(item);
  if (VETO_PARDON.some((phrase) => matches(text, phrase))) return false;
  return VETO.some((phrase) => matches(text, phrase));
}

export interface DeskGuess {
  desk: DeskId;
  hits: number;
  matched: string[];
}

export function guessDesk(item: RawItem): DeskGuess | null {
  const text = haystack(item);
  let best: DeskGuess | null = null;

  for (const [id, phrases] of Object.entries(SIGNALS) as Array<[DeskId, readonly string[]]>) {
    const matched = phrases.filter((phrase) => matches(text, phrase));
    if (matched.length === 0) continue;
    if (!best || matched.length > best.hits) best = { desk: id, hits: matched.length, matched };
  }

  return best;
}

export function baseWeight(item: RawItem, hits: number): number {
  let weight = 34 + Math.min(hits, 4) * 7;
  for (const [pattern, bonus] of WEIGHT_BOOSTS) {
    if (pattern.test(item.title)) weight += bonus;
  }
  if (item.imageUrl) weight += 4;
  if (item.summary) weight += 3;
  return Math.max(1, Math.min(96, weight));
}

export interface Screened {
  item: RawItem;
  desk: DeskId;
  weight: number;
  confidence: number;
  locationSensitive: boolean;
}

/**
 * The keyword pass. It runs on every item before the model sees anything, and
 * it is also the whole classifier when no API key is configured, which is why
 * it is deliberately strict rather than generous.
 */
export function screen(item: RawItem, alwaysPositive: boolean): Screened | null {
  if (vetoed(item)) return null;

  const guess = guessDesk(item);
  if (!guess && !alwaysPositive) return null;

  const desk: DeskId = guess?.desk ?? 'kindness';
  const hits = guess?.hits ?? 1;

  return {
    item,
    desk,
    weight: baseWeight(item, hits),
    confidence: guess ? Math.min(88, 52 + hits * 9) : 58,
    locationSensitive: desk === 'underground',
  };
}
