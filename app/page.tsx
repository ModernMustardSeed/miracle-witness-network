import Link from 'next/link';

import { DeskCard, EmptyDesk, LeadStory, SecondStory, WireRow } from '@/components/StoryPieces';
import { DESKS, DESK_LIST } from '@/lib/desks';
import { count, timeAgo } from '@/lib/format';
import { GDELT_QUERIES } from '@/lib/sources/gdelt';
import { FEEDS } from '@/lib/sources/rss';
import { edition } from '@/lib/store';
import { KILLED, PER_DAY } from '@/lib/witness-roll';

export const revalidate = 900;

// Counted from the source config rather than typed, so adding a feed can never
// leave the front page claiming a number that stopped being true.
const PIPELINE = [
  {
    step: '01',
    title: 'Scan',
    body: `Every hour we read ${FEEDS.length} wire feeds and ${GDELT_QUERIES.length} standing queries against GDELT, which indexes news from every country on earth in more than a hundred languages.`,
  },
  {
    step: '02',
    title: 'Screen',
    body: 'A keyword pass throws out anything whose subject is a death, a crime or a catastrophe, even when a rescue is buried inside it. What survives goes to the editor.',
  },
  {
    step: '03',
    title: 'Place',
    body: `Claude reads each surviving candidate, decides whether it runs, writes the headline and the standfirst, and puts it on one of ${DESK_LIST.length} desks. Stories that could endanger the people in them lose their location here.`,
  },
  {
    step: '04',
    title: 'Corroborate',
    body: 'Stories carried by more than one outlet are merged, and the count of independent outlets is printed on the story. That number is the only verification claim we make.',
  },
];

export default async function FrontPage() {
  const { lead, seconds, wire, byDesk, stats } = await edition();

  return (
    <>
      <div className="mx-auto max-w-broadsheet px-4 pb-16 pt-8 sm:px-6">
        {!lead ? (
          <EmptyDesk
            message="The wire is quiet this minute. The scanner runs every hour, so this page fills itself. Check the newsroom log to see what the last pass found."
            action={
              <Link
                href="/how-we-verify"
                className="kicker border-b-2 border-ember pb-1 text-ember"
              >
                Read the newsroom log
              </Link>
            }
          />
        ) : (
          <>
            <div className="rule-double mb-6 flex items-baseline justify-between pt-3">
              <h1 className="kicker text-ink">Today’s front page</h1>
              <Link href="/wire" className="kicker text-ink-soft hover:text-ember">
                The full wire →
              </Link>
            </div>

            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <LeadStory story={lead} />
              </div>

              <aside className="lg:col-span-4 lg:col-rule lg:pl-8" aria-label="The wire">
                <div className="mb-1 flex items-center justify-between border-b-2 border-ink pb-2">
                  <h2 className="kicker text-ink">The Wire</h2>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">
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
                      className="kicker mt-4 inline-block border-b-2 border-ember pb-1 text-ember"
                    >
                      Everything we found →
                    </Link>
                  </>
                ) : (
                  <p className="py-6 text-sm leading-relaxed text-ink-soft">
                    Nothing else cleared the desk this pass. The next scan runs within the hour.
                  </p>
                )}
              </aside>
            </div>

            {seconds.length > 0 && (
              <div className="mt-14 border-t border-ink pt-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                  {seconds.map((story) => (
                    <SecondStory key={story.id} story={story} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* The numbers are counted from the archive at request time. Nothing here
          is a target, a projection or a decoration. */}
      <section className="border-y border-ink/15 bg-paper-tint" aria-label="Newsroom numbers">
        <div className="mx-auto grid max-w-broadsheet grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[
            { value: count(stats.storiesLast24h), label: 'Stories in the last 24 hours' },
            { value: count(stats.storiesAllTime), label: 'Stories in the archive' },
            { value: count(stats.countries), label: 'Places reporting' },
            { value: count(stats.outlets), label: 'Outlets credited' },
          ].map((stat) => (
            <div key={stat.label} className="px-2 text-center">
              <p className="font-display text-4xl font-semibold tabular-nums text-ink sm:text-5xl">
                {stat.value}
              </p>
              <p className="mx-auto mt-2 max-w-[16ch] text-xs leading-snug text-ink-soft">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {byDesk.length > 0 && (
        <div className="mx-auto max-w-broadsheet px-4 py-16 sm:px-6">
          <div className="rule-double mb-8 pt-3">
            <h2 className="kicker text-ink">The desks</h2>
          </div>
          <div className="space-y-14">
            {byDesk.map((group) => {
              const entry = DESKS[group.desk];
              return (
                <section key={group.desk} aria-labelledby={`desk-${group.desk}`}>
                  <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule pb-2">
                    <h3
                      id={`desk-${group.desk}`}
                      className="font-display text-2xl font-semibold"
                      style={{ color: entry.color }}
                    >
                      {entry.name}
                    </h3>
                    <p className="text-sm text-ink-soft">{entry.brief}</p>
                    <Link
                      href={`/desk/${entry.id}`}
                      className="kicker text-ink-soft hover:text-ember"
                    >
                      All {entry.name.toLowerCase()} →
                    </Link>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {group.stories.map((story) => (
                      <DeskCard key={story.id} story={story} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* The one page on this site the scanner cannot write to. It runs here,
          quietly, because a paper that only prints the good becomes a lie by
          omission if it never says this. */}
      <section className="border-y border-ink/15 bg-paper-card" aria-labelledby="roll">
        <div className="mx-auto max-w-broadsheet px-4 py-14 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
            <div className="border-l-[3px] border-ink pl-6">
              <p className="kicker text-ink-soft">The Witness Roll</p>
              <p className="mt-2 font-display text-5xl font-semibold tabular-nums leading-none sm:text-6xl">
                {count(KILLED)}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                killed for their faith in one year
              </p>
            </div>
            <div>
              <h2 id="roll" className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
                {Math.floor(PER_DAY)} a day, and almost none of them named anywhere.
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                We report the good on purpose. We refuse to do it by walking
                past this. The roll is a standing page, counted from published
                research, updated only when that research is, and carrying no
                name we could not verify.
              </p>
              <Link
                href="/witness-roll"
                className="kicker mt-5 inline-block border-b-2 border-ink pb-1 text-ink hover:border-ember hover:text-ember"
              >
                Read the Witness Roll →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/15" aria-labelledby="pipeline">
        <div className="mx-auto max-w-broadsheet px-4 py-16 sm:px-6">
          <div className="rule-double mb-8 flex items-baseline justify-between pt-3">
            <h2 id="pipeline" className="kicker text-ink">
              How the paper gets made
            </h2>
            <Link href="/how-we-verify" className="kicker text-ink-soft hover:text-ember">
              In full →
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((entry) => (
              <div key={entry.step} className="border-t-2 border-ink pt-4">
                <p className="font-display text-3xl font-semibold text-ember">{entry.step}</p>
                <h3 className="mt-1 font-display text-xl font-semibold">{entry.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{entry.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-broadsheet px-4 py-16 sm:px-6">
        <div className="grid gap-8 border border-rule bg-paper-tint p-8 md:grid-cols-[1.3fr_1fr] md:p-12">
          <div>
            <p className="kicker text-ember">The newsroom, 1 January 2027</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Next year this wire gets a face and a voice.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Four channels, correspondents on four continents, and a daily
              broadcast built on exactly the stories you are reading here. The
              schedule, the desks they cover and the first hires are published.
            </p>
            <Link
              href="/newsroom"
              className="kicker mt-6 inline-block border-b-2 border-ember pb-1 text-ember"
            >
              See the launch plan →
            </Link>
          </div>
          <div className="border-t border-rule pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="kicker text-ink">Saw something good happen?</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              The wire cannot reach a hospital corridor in Missoula or a church
              in Jos. You can. Send us the story and a person reads every one.
            </p>
            <Link
              href="/submit"
              className="kicker mt-5 inline-block border-b-2 border-ink pb-1 text-ink hover:border-ember hover:text-ember"
            >
              Send a story →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
