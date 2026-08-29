import type { DeskId } from './desks';

/** What a source hands back before anything has judged it. */
export interface RawItem {
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  sourceName: string;
  sourceKind: 'rss' | 'gdelt';
  country: string | null;
}

/** A story that passed the filter and has been placed on a desk. */
export interface Story {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  desk: DeskId;
  place: string | null;
  sourceName: string;
  sourceUrl: string;
  imageUrl: string | null;
  publishedAt: string;
  scannedAt: string;
  /** 0-100. How much this matters. Drives front-page placement. */
  weight: number;
  /** 0-100. How sure we are it is genuinely good news. */
  confidence: number;
  /** Who made the call. `rules` means the keyword pass, no model was reached. */
  reviewedBy: 'claude' | 'rules';
  /** Independent outlets we saw carrying the same story. Always at least 1. */
  corroborations: number;
  /**
   * True when naming the place would put the people in the story at risk.
   * Underground church reporting is the usual case. The UI prints "Location
   * withheld" and the story page says why.
   */
  locationSensitive: boolean;
}

/** One pass of the scanner, recorded so the site can tell the truth about itself. */
export interface ScanRun {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  itemsSeen: number;
  itemsKept: number;
  sourcesOk: number;
  sourcesFailed: number;
  reviewer: 'claude' | 'rules' | 'mixed';
  notes: string | null;
}

/** A testimony sent in by a reader. Never published without a human reading it. */
export interface Submission {
  id: string;
  name: string;
  email: string;
  place: string | null;
  desk: DeskId | null;
  story: string;
  createdAt: string;
  status: 'new' | 'reviewing' | 'published' | 'declined';
}

export interface NewsroomStats {
  storiesAllTime: number;
  storiesLast24h: number;
  countries: number;
  outlets: number;
  lastScanAt: string | null;
}
