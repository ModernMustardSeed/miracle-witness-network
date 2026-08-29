import type { Metadata } from 'next';
import Link from 'next/link';

import { DESKS } from '@/lib/desks';
import { count } from '@/lib/format';
import {
  KILLED,
  KILLED_PREVIOUS,
  PER_DAY,
  ROLL_REGIONS,
  ROLL_SOURCE,
  UNDER_PERSECUTION,
} from '@/lib/witness-roll';

export const metadata: Metadata = {
  title: 'The Witness Roll',
  description:
    'A standing memorial to the believers killed for their faith this year, counted from the Open Doors World Watch List, with no name invented and no number rounded up.',
  alternates: { canonical: '/witness-roll' },
};

const TOTAL = ROLL_REGIONS.reduce((sum, region) => sum + region.killed, 0);

export default function WitnessRollPage() {
  const change = KILLED - KILLED_PREVIOUS;

  return (
    <div className="mx-auto max-w-broadsheet px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="border-t-[3px] border-ink pt-4">
          <p className="kicker text-ink-soft">A standing page</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.04] sm:text-6xl">
            The Witness Roll
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            This newsroom exists to report the good. There is one thing it will
            not do to keep the tone up, and that is walk past the people who paid
            for their faith with their lives while the rest of us were reading
            something else.
          </p>
        </div>

        <div className="mt-12 border-y border-rule py-10 text-center">
          <p className="kicker text-ink-soft">Killed for their faith in one year</p>
          <p className="mt-3 font-display text-[4.5rem] font-semibold leading-none tabular-nums text-ink sm:text-[7rem]">
            {count(KILLED)}
          </p>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            That is {Math.floor(PER_DAY)} people a day, every day, for a year.
            Thirteen this morning, before most of the world had finished
            breakfast. It is {count(Math.abs(change))} {change >= 0 ? 'more' : 'fewer'} than the
            year before.
          </p>
        </div>

        <section className="mt-12" aria-labelledby="where">
          <h2 id="where" className="kicker border-b-2 border-ink pb-2 text-ink">
            Where
          </h2>
          <ul className="mt-6 space-y-6">
            {ROLL_REGIONS.map((region) => {
              const share = Math.round((region.killed / TOTAL) * 100);
              return (
                <li key={region.name}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-display text-xl font-semibold">{region.name}</p>
                    <p className="font-display text-xl font-semibold tabular-nums text-ink">
                      {count(region.killed)}
                    </p>
                  </div>
                  <div
                    className="mt-2 h-2 w-full bg-paper-tint"
                    role="img"
                    aria-label={`${region.name}: ${count(region.killed)} of ${count(TOTAL)}, ${share} per cent`}
                  >
                    <div
                      className="h-2 bg-ink"
                      style={{ width: `${Math.max(1, share)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{region.note}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="names">
          <h2 id="names" className="kicker border-b-2 border-ink pb-2 text-ink">
            Why there are no names on this page
          </h2>
          <div className="mt-6 space-y-4 text-[16px] leading-[1.7] text-ink-soft">
            <p>
              A memorial wants names. We do not have them, and we are not going
              to write any.
            </p>
            <p>
              Most of these people were never named in any report that reached
              the outside. The ones who were named are often named alongside a
              village, a congregation and a family who are all still there and
              still in danger. Printing a list would be an act of imagination in
              the first case and an act of exposure in the second.
            </p>
            <p>
              So the roll is a number, and the number is exact, and it comes from
              somewhere you can check. That is the most honest memorial we know
              how to build.
            </p>
            <p>
              Behind the number is a second one:{' '}
              <span className="font-semibold text-ink">
                {(UNDER_PERSECUTION / 1_000_000).toFixed(0)} million
              </span>{' '}
              believers living under high levels of persecution or
              discrimination. They are not a statistic to us either. They are the
              reason the{' '}
              <Link
                href="/desk/underground"
                className="link-underline font-semibold"
                style={{ color: DESKS.underground.color }}
              >
                Underground desk
              </Link>{' '}
              exists, and the reason stories on it never carry a location.
            </p>
          </div>
        </section>

        <blockquote className="mt-14 border-l-[3px] border-ember pl-6">
          <p className="font-display text-2xl font-medium italic leading-snug text-ink sm:text-3xl">
            “Therefore, since we are surrounded by so great a cloud of
            witnesses, let us also lay aside every weight.”
          </p>
          <footer className="kicker mt-3 text-ink-soft">Hebrews 12:1</footer>
        </blockquote>

        <section className="mt-14 border-t border-rule pt-6" aria-labelledby="source">
          <h2 id="source" className="kicker text-ink">
            Where these figures come from
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Every number on this page is taken from {ROLL_SOURCE.publisher}’s{' '}
            <a
              href={ROLL_SOURCE.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-semibold text-ink"
            >
              {ROLL_SOURCE.title}
            </a>
            , published {ROLL_SOURCE.published} and covering {ROLL_SOURCE.period}. It
            is the most widely cited count of its kind, and it is a count of
            documented cases, which means the real figure is higher than the one
            printed above rather than lower.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            This page is updated when that report is, and at no other time. No
            scanner writes to it.
          </p>
        </section>

        <div className="mt-14 border-t border-rule pt-8">
          <Link
            href="/desk/underground"
            className="kicker inline-flex min-h-[44px] items-center bg-ink px-6 py-3 text-paper transition-colors hover:bg-ember"
          >
            Read the Underground desk →
          </Link>
        </div>
      </div>
    </div>
  );
}
