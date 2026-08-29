import type { Metadata } from 'next';
import Link from 'next/link';

import { DESK_LIST } from '@/lib/desks';
import { count, shortDate, timeAgo } from '@/lib/format';
import { GDELT_QUERIES } from '@/lib/sources/gdelt';
import { FEEDS } from '@/lib/sources/rss';
import { isPersisted, store } from '@/lib/store';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'How we verify',
  description:
    'Exactly where Miracle Witness Network stories come from, what gets thrown out, who decides, and what our numbers do and do not claim.',
  alternates: { canonical: '/how-we-verify' },
};

function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-ink pt-6">
      {kicker && <p className="kicker text-ember">{kicker}</p>}
      <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
      <div className="mt-4 max-w-column space-y-4 text-[15px] leading-[1.7] text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export default async function HowWeVerifyPage() {
  const active = store();
  const [run, stats] = await Promise.all([
    active.lastRun().catch(() => null),
    active.stats().catch(() => null),
  ]);
  const persisted = isPersisted();

  return (
    <div className="mx-auto max-w-broadsheet px-4 py-10 sm:px-6">
      <div className="rule-double pt-3">
        <p className="kicker text-ember">The standard</p>
        <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
          We would rather run nothing than run something that is not true.
        </h1>
        <p className="mt-5 max-w-column text-lg leading-relaxed text-ink-soft">
          Good news has a credibility problem, and it earned it. Feel-good
          stories get shared before anyone checks them, and the ones that turn
          out to be invented poison the ones that were real. So here is the
          whole machine, including the parts that are only as good as a keyword.
        </p>
      </div>

      <div className="mt-10 grid gap-4 border border-rule bg-paper-card p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="kicker text-ink-faint">Last scan</p>
          <p className="mt-1 font-display text-xl font-semibold">
            {run?.finishedAt ? timeAgo(run.finishedAt) : 'Running now'}
          </p>
        </div>
        <div>
          <p className="kicker text-ink-faint">Items read, items kept</p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums">
            {run ? `${count(run.itemsSeen)} / ${count(run.itemsKept)}` : '—'}
          </p>
        </div>
        <div>
          <p className="kicker text-ink-faint">Sources answering</p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums">
            {run ? `${run.sourcesOk} of ${run.sourcesOk + run.sourcesFailed}` : '—'}
          </p>
        </div>
        <div>
          <p className="kicker text-ink-faint">Placed by</p>
          <p className="mt-1 font-display text-xl font-semibold capitalize">
            {run?.reviewer === 'rules' ? 'Keyword pass' : (run?.reviewer ?? '—')}
          </p>
        </div>
      </div>

      <div className="mt-14 space-y-12">
        <Section kicker="Step one" title="Where the stories come from">
          <p>
            Two lanes. The first is {FEEDS.length} editorial feeds read in full
            every pass, {FEEDS.filter((feed) => feed.alwaysPositive).length} of
            which publish nothing but good news and{' '}
            {FEEDS.filter((feed) => !feed.alwaysPositive).length} of which are
            general, faith or persecution desks we read selectively.
          </p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            {FEEDS.map((feed) => (
              <li key={feed.url} className="text-ink">
                {feed.name}
                {feed.alwaysPositive && <span className="text-ink-faint"> ·</span>}
              </li>
            ))}
          </ul>
          <p>
            The second lane is GDELT, the open index of world news that covers
            every country in more than a hundred languages and refreshes every
            fifteen minutes. We hold {GDELT_QUERIES.length} standing queries
            against it and run four of them each hour on a rotation, two at a
            time, because it is a free public service and a healthy answer from
            it takes the better part of a minute. This is the lane that reaches a flood rescue in
            Nepal or a building collapse in Abuja within the hour, which no
            curated good-news feed ever does.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {GDELT_QUERIES.map((query) => (
              <li key={query.label} className="text-ink capitalize">
                {query.label}
              </li>
            ))}
          </ul>
        </Section>

        <Section kicker="Step two" title="What gets thrown out before anyone reads it">
          <p>
            GDELT is an index, not an editor. A query for “rescued alive” returns
            the rescue and the death toll in the same list. So every candidate
            hits a keyword veto first, and the veto is deliberately blunt:
          </p>
          <p>
            If the subject of the headline is a death, a crime, a war, a
            disaster, a scandal or a loss, it does not run, even when a rescue is
            buried inside it. “Two rescued, twelve killed” is a disaster story.
            We will report the rescue when an outlet leads with the rescue.
          </p>
          <p>
            A short pardon list undoes the veto where the word changes meaning,
            so “trafficking ring dismantled” and “conviction overturned” still
            get through. Then a candidate must carry a positive signal of its
            own. Absence of bad news is not evidence of good news.
          </p>
        </Section>

        <Section kicker="Step three" title="Who decides what runs">
          <p>
            What survives the veto goes to Claude, which reads each candidate and
            answers four questions: does this run, on which desk, what is the
            headline, and how sure are you. It rejects sermons, listicles,
            product launches, fundraising appeals, opinion columns, and anything
            claiming a supernatural event that no outlet actually reported as
            fact.
          </p>
          <p>
            We report what happened and name who reported it. We never assert a
            miracle the source did not.
          </p>
          <p>
            If the model cannot be reached, the newsroom does not stop. The
            keyword pass runs the paper on its own, using each outlet’s own
            headline and excerpt unedited, and every story on the site records
            which of the two placed it. You can see it on any story page under
            “Placed by”.
          </p>
        </Section>

        <Section kicker="Step four" title="What our numbers claim, and what they do not">
          <p>
            The only verification number on this site is the count of
            independent outlets carrying the same story. When two or more
            outlets report a rescue, we merge them and print the count. That is
            corroboration, and it is worth something.
          </p>
          <p>
            The confidence figure on a story page is the desk’s confidence that
            the item is genuine, already-happened good news. It is not a claim
            about the source’s accuracy, and it is not a fact-check.
          </p>
          <p>
            Every other number on this site is counted from the archive at the
            moment you load the page.{' '}
            {stats
              ? `Right now that is ${count(stats.storiesAllTime)} stories from ${count(stats.outlets)} outlets.`
              : ''}{' '}
            There are no witness counts, no souls-saved tickers and no
            projections anywhere on this site, because we cannot count those
            things and neither can anyone else.
          </p>
        </Section>

        <Section kicker="Step five" title={`The ${DESK_LIST.length} desks`}>
          <div className="not-prose grid gap-3 sm:grid-cols-2">
            {DESK_LIST.map((entry) => (
              <div key={entry.id} className="border-l-[3px] pl-3" style={{ borderColor: entry.color }}>
                <p className="font-display text-lg font-semibold" style={{ color: entry.color }}>
                  {entry.name}
                </p>
                <p className="text-sm leading-relaxed text-ink-soft">{entry.brief}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section kicker="The underground" title="The stories we deliberately publish incomplete">
          <p>
            The Underground desk carries believers who meet where meeting is
            punished. For those stories the normal rule of journalism runs
            backwards: naming the place is not rigour, it is exposure.
          </p>
          <p>
            So the editor is instructed to mark any story whose location could
            endanger the people in it, and to err toward marking it. A marked
            story loses the city, the district, the church name and the full
            names before it is ever written to the archive, and the page prints
            “Location withheld” with a note saying why. Merging two reports
            keeps the mark if either one carried it.
          </p>
          <p>
            The outlet is still named and the original is still linked, because
            that reporting is already public. What we decline to do is
            concentrate it.
          </p>
          <p>
            The people who do not survive that pressure are counted on{' '}
            <Link href="/witness-roll" className="link-underline font-semibold text-ink">
              the Witness Roll
            </Link>
            , which no scanner is allowed to write to.
          </p>
        </Section>

        <Section kicker="The record" title="What we store and how long it lives">
          {persisted ? (
            <p>
              Every scan is written to the newsroom database, so the archive
              grows rather than resetting. Stories keep the outlet, the original
              URL, the publication time, the desk, the corroboration count and
              which reviewer placed them.
            </p>
          ) : (
            <p>
              The newsroom database is not connected yet, so this site is
              currently reading the fast wire lane on demand and holding the
              result for fifteen minutes at a time. Everything you see is real
              and freshly fetched. What is missing is the permanent archive,
              hourly GDELT passes and reader testimonies, all of which switch on
              the moment the database is wired.
            </p>
          )}
          <p>
            We link out to every source and host none of their reporting. The
            summary and the headline on our pages are ours. The story is theirs.
          </p>
        </Section>

        <Section kicker="Corrections" title="If we get one wrong">
          <p>
            Tell us and we will pull it. A story that turns out to be false, or
            that turns out to have a tragedy at its centre we did not see, comes
            down rather than getting a footnote.
          </p>
          <p>
            <Link href="/submit" className="link-underline font-semibold text-ink">
              Use the same form readers use to send us a story
            </Link>{' '}
            and put the word CORRECTION at the top.
          </p>
        </Section>
      </div>

      <p className="mt-14 border-t border-rule pt-6 text-xs text-ink-faint">
        This page is generated from the live newsroom configuration, not written
        by hand, so the source lists above are the sources actually being read.
        Last regenerated {shortDate(new Date().toISOString())}.
      </p>
    </div>
  );
}
