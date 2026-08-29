import Link from 'next/link';

import {
  Dinkus,
  Folio,
  InsideIndex,
  ScanBox,
  SectionHead,
  StandingQuote,
} from '@/components/Broadsheet';
import { DeskCard, EmptyDesk, LeadStory, SecondStory, WireRow } from '@/components/StoryPieces';
import { DESKS, DESK_LIST } from '@/lib/desks';
import { count, timeAgo } from '@/lib/format';
import { GDELT_QUERIES } from '@/lib/sources/gdelt';
import { FEEDS } from '@/lib/sources/rss';
import { edition, store } from '@/lib/store';
import { KILLED, PER_DAY } from '@/lib/witness-roll';

export const revalidate = 900;

// Counted from the source config rather than typed, so adding a feed can never
// leave the front page claiming a number that stopped being true.
const PIPELINE = [
  {
    step: 'I',
    title: 'Scan',
    body: `Every hour we read ${FEEDS.length} wire feeds and a rotating window of ${GDELT_QUERIES.length} standing queries against GDELT, which indexes news from every country on earth in more than a hundred languages.`,
  },
  {
    step: 'II',
    title: 'Screen',
    body: 'A keyword veto throws out anything whose subject is a death, a crime or a catastrophe, even when a rescue is buried inside it. The signal has to be in the headline.',
  },
  {
    step: 'III',
    title: 'Place',
    body: `Claude reads each surviving candidate, decides whether it runs, writes the headline and the standfirst, and files it to one of ${DESK_LIST.length} desks. Stories that could endanger the people in them lose their location here.`,
  },
  {
    step: 'IV',
    title: 'Corroborate',
    body: 'Reports of the same event are merged and the count of independent outlets is printed on the story. That number is the only verification claim we make.',
  },
];

export default async function FrontPage() {
  const [{ lead, seconds, wire, byDesk, counts, stats }, run] = await Promise.all([
    edition(),
    store()
      .lastRun()
      .catch(() => null),
  ]);
  const running = byDesk.filter((group) => group.stories.length > 0);
  const quiet = byDesk.filter((group) => group.stories.length === 0);

  return (
    <>
      <InsideIndex counts={counts} />

      <div className="mx-auto max-w-broadsheet px-4 pb-14 pt-7 sm:px-6">
        {!lead ? (
          <EmptyDesk
            message="The wire is quiet this minute. The scanner runs every hour, so this page fills itself. The newsroom log shows what the last pass found."
            action={
              <Link
                href="/how-we-verify"
                className="index-entry border-b-2 border-ember pb-1 text-ember"
              >
                Read the newsroom log
              </Link>
            }
          />
        ) : (
          <>
            <div className="rule-press mb-6 flex items-baseline justify-between pt-3">
              <h2 className="index-entry text-ink">Page One</h2>
              <Link href="/wire" className="index-entry text-ink-soft hover:text-ember">
                The full wire →
              </Link>
            </div>

            <div className="grid gap-10 lg:grid-cols-12 lg:gap-9">
              <div className="lg:col-span-8">
                <LeadStory story={lead} />
              </div>

              <aside className="lg:col-span-4 lg:col-rule lg:pl-9" aria-label="The wire">
                <div className="mb-1 flex items-center justify-between border-b-2 border-ink pb-2">
                  <h2 className="index-entry text-ink">Also on the wire</h2>
                  <span className="folio">
                    {stats.lastScanAt ? timeAgo(stats.lastScanAt) : 'live'}
                  </span>
                </div>
                {wire.length > 0 ? (
                  <>
                    {wire.map((story) => (
                      <WireRow key={story.id} story={story} />
                    ))}
                    <Link
                      href="/wire"
                      className="index-entry mt-4 inline-block border-b-2 border-ember pb-1 text-ember"
                    >
                      Everything we found →
                    </Link>
                  </>
                ) : (
                  <p className="py-6 text-sm leading-relaxed text-ink-soft">
                    Nothing else cleared the desk this pass. The next scan runs within the hour.
                  </p>
                )}

                {run && (
                  <ScanBox
                    itemsSeen={run.itemsSeen}
                    itemsKept={run.itemsKept}
                    sourcesOk={run.sourcesOk}
                    sourcesTotal={run.sourcesOk + run.sourcesFailed}
                    reviewer={run.reviewer}
                  />
                )}
              </aside>
            </div>

            {seconds.length > 0 && (
              <div className="mt-12 border-t-2 border-ink pt-8">
                <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
                  {seconds.map((story, index) => (
                    <div key={story.id} className={index > 0 ? 'lg:col-rule lg:pl-9' : ''}>
                      <SecondStory story={story} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Every number here is counted from the archive at the moment this page
          renders. None of it is a target, a projection or a decoration. */}
      <section className="border-y-2 border-ink bg-paper-tint" aria-label="Newsroom numbers">
        <div className="mx-auto grid max-w-broadsheet grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[
            { value: count(stats.storiesLast24h), label: 'Stories in the last 24 hours' },
            { value: count(stats.storiesAllTime), label: 'Stories in the archive' },
            { value: count(stats.countries), label: 'Places reporting' },
            { value: count(stats.outlets), label: 'Outlets credited' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`px-3 text-center ${index % 2 === 1 ? 'col-rule' : ''} ${
                index > 0 ? 'md:col-rule' : ''
              }`}
            >
              <p className="font-display text-4xl font-black tabular-nums text-ink sm:text-5xl">
                {stat.value}
              </p>
              <p className="mx-auto mt-2 max-w-[16ch] text-xs leading-snug text-ink-soft">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-broadsheet px-4 sm:px-6">
        <Dinkus />
        <SectionHead id="desks">The Desks</SectionHead>

        <div className="space-y-14">
          {running.map((group) => {
            const entry = DESKS[group.desk];
            return (
              <section key={group.desk} aria-labelledby={`desk-${group.desk}`}>
                <div
                  className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 pb-2"
                  style={{ borderColor: entry.color }}
                >
                  <h3
                    id={`desk-${group.desk}`}
                    className="font-display text-2xl font-black tracking-tight"
                    style={{ color: entry.color }}
                  >
                    {entry.name}
                  </h3>
                  <p className="text-sm italic text-ink-soft">{entry.brief}</p>
                  <Link
                    href={`/desk/${entry.id}`}
                    className="index-entry text-ink-soft hover:text-ember"
                  >
                    All {entry.name.toLowerCase()} →
                  </Link>
                </div>
                {/* Columns rather than a fixed grid, so a desk carrying one
                    story fills its row instead of leaving two thirds of the
                    page blank. A paper always sets to the measure. */}
                <div className="flex flex-col gap-5 sm:flex-row">
                  {group.stories.map((story) => (
                    <div key={story.id} className="flex-1 sm:min-w-0">
                      <DeskCard story={story} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* The quiet desks still run. A section that vanishes when it is empty
            tells the reader it does not exist. */}
        {quiet.length > 0 && (
          <section className="mt-14" aria-labelledby="quiet-desks">
            <div className="mb-5 border-b border-rule pb-2">
              <h3 id="quiet-desks" className="index-entry text-ink-faint">
                Quiet this pass
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quiet.map((group) => {
                const entry = DESKS[group.desk];
                return (
                  <Link
                    key={group.desk}
                    href={`/desk/${entry.id}`}
                    className="group border border-dashed border-rule p-4 transition-colors hover:border-ink"
                  >
                    <p className="font-display text-lg font-bold" style={{ color: entry.color }}>
                      {entry.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{entry.brief}</p>
                    <p className="index-entry mt-3 text-[0.625rem] text-ink-faint">
                      Nothing cleared it this hour →
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </div>

      <StandingQuote />

      {/* The one page on this site the scanner cannot write to. It runs here,
          quietly, because a paper that only prints the good becomes a lie by
          omission if it never says this. */}
      <section className="border-y-2 border-ink bg-paper-card" aria-labelledby="roll">
        <div className="mx-auto max-w-broadsheet px-4 py-14 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
            <div className="border-l-4 border-ink pl-6">
              <p className="index-entry text-ink-soft">The Witness Roll</p>
              <p className="mt-2 font-display text-5xl font-black tabular-nums leading-none sm:text-6xl">
                {count(KILLED)}
              </p>
              <p className="mt-2 text-sm text-ink-soft">killed for their faith in one year</p>
            </div>
            <div>
              <h2 id="roll" className="font-display text-2xl font-bold leading-snug sm:text-3xl">
                {Math.floor(PER_DAY)} a day, and almost none of them named anywhere.
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                We report the good on purpose. We refuse to do it by walking past
                this. The roll is a standing page, counted from published
                research, updated only when that research is, and carrying no
                name we could not verify.
              </p>
              <Link
                href="/witness-roll"
                className="index-entry mt-5 inline-block border-b-2 border-ink pb-1 text-ink hover:border-ember hover:text-ember"
              >
                Read the Witness Roll →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-broadsheet px-4 py-14 sm:px-6" aria-labelledby="pipeline">
        <SectionHead id="pipeline">How the paper gets made</SectionHead>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((entry, index) => (
            <div
              key={entry.step}
              className={`border-t-2 border-ink pt-4 ${index > 0 ? 'lg:col-rule lg:pl-8' : ''}`}
            >
              <p className="font-display text-3xl font-black text-ember">{entry.step}</p>
              <h3 className="mt-1 font-display text-xl font-bold">{entry.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{entry.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-right">
          <Link href="/how-we-verify" className="index-entry text-ink-soft hover:text-ember">
            The standard, in full →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-broadsheet px-4 pb-14 sm:px-6">
        <div className="grid gap-8 border-2 border-ink bg-paper-tint p-8 md:grid-cols-[1.3fr_1fr] md:p-12">
          <div>
            <p className="index-entry text-ember">The newsroom, 1 January 2027</p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">
              Next year this wire gets a face and a voice.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Four channels, correspondents on four continents, and a daily
              broadcast built on exactly the stories you are reading here. The
              schedule, the desks they cover and the first hires are published.
            </p>
            <Link
              href="/newsroom"
              className="index-entry mt-6 inline-block border-b-2 border-ember pb-1 text-ember"
            >
              See the launch plan →
            </Link>
          </div>
          <div className="border-t border-rule pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="index-entry text-ink">Saw something good happen?</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              The wire cannot reach a hospital corridor in Missoula or a church
              in Jos. You can. Send us the story and a person reads every one.
            </p>
            <Link
              href="/submit"
              className="index-entry mt-5 inline-block border-b-2 border-ink pb-1 text-ink hover:border-ember hover:text-ember"
            >
              Send a story →
            </Link>
          </div>
        </div>
      </section>

      <Folio>
        Miracle Witness Network · Page One · {count(stats.storiesAllTime)} stories in the archive
      </Folio>
    </>
  );
}
