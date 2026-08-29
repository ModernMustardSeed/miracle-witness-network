/**
 * The Witness Roll.
 *
 * This is the one part of the site the scanner is not allowed to touch. Every
 * figure below is transcribed by hand from a named, published research report,
 * carries the period it covers, and links to where it came from. Nothing here
 * is estimated, extrapolated, rounded up for effect, or generated.
 *
 * When the next World Watch List publishes, update this file and nothing else.
 */

export interface RollSource {
  publisher: string;
  title: string;
  url: string;
  period: string;
  published: string;
}

export const ROLL_SOURCE: RollSource = {
  publisher: 'Open Doors',
  title: 'World Watch List 2026',
  url: 'https://www.opendoors.org/en-US/persecution/persecution-trends/',
  period: 'the World Watch List 2026 reporting year',
  published: 'January 2026',
};

/** Killed for faith reasons in the reporting year. */
export const KILLED = 4849;

/** The same count in the previous reporting year, for the direction of travel. */
export const KILLED_PREVIOUS = 4476;

/** Christians living under high levels of persecution or discrimination. */
export const UNDER_PERSECUTION = 388_000_000;

export interface RollRegion {
  name: string;
  killed: number;
  note: string;
}

export const ROLL_REGIONS: RollRegion[] = [
  {
    name: 'Nigeria',
    killed: 3490,
    note: 'About seven in ten of the world’s total, in one country.',
  },
  {
    name: 'Rest of sub-Saharan Africa',
    killed: 1001,
    note: 'Sub-Saharan Africa accounts for 4,491 of the year’s deaths, 93 per cent of the whole.',
  },
  {
    name: 'The rest of the world',
    killed: 358,
    note: 'Every other country on the list, added together.',
  },
];

export const PER_DAY = Math.round((KILLED / 365) * 10) / 10;

export function perDayWords(): string {
  return `${Math.floor(PER_DAY)} people a day`;
}
