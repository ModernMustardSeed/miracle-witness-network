import type { Metadata } from 'next';
import Link from 'next/link';

import { Countdown } from '@/components/Countdown';
import { DESKS } from '@/lib/desks';

export const metadata: Metadata = {
  title: 'The Newsroom',
  description:
    'Four channels, a daily broadcast and a correspondent corps, on air 1 January 2027. What Miracle Witness Network is building on top of the wire.',
  alternates: { canonical: '/newsroom' },
};

const LAUNCH = '2027-01-01T12:00:00.000Z';

const CHANNELS = [
  {
    name: 'The Daily Witness',
    cadence: 'Every weekday, ten minutes',
    desk: DESKS.rescue,
    body: 'The front page read aloud. The same stories on this site, in the order the desk ranked them, with the outlet named on screen every time.',
  },
  {
    name: 'Found Alive',
    cadence: 'Weekly, long form',
    desk: DESKS.rescue,
    body: 'One rescue, told properly. We go to the place it happened, find the people who did the digging, and let them tell it without a music bed telling you how to feel.',
  },
  {
    name: 'Revival Report',
    cadence: 'Fortnightly, on location',
    desk: DESKS.revival,
    body: 'What faith is doing in public, filmed where it is happening. Baptisms in rivers, churches rebuilt after fire, congregations that should not still exist.',
  },
  {
    name: 'The Kindness Beat',
    cadence: 'Daily, vertical, under ninety seconds',
    desk: DESKS.kindness,
    body: 'One ordinary person a day. Shot for a phone, made to be sent to someone rather than watched alone.',
  },
];

const MILESTONES = [
  {
    when: 'Now',
    what: 'The wire runs',
    body: 'The scanner reads the world every hour and files to eight desks. Everything the channels will report is already being gathered.',
  },
  {
    when: 'Autumn 2026',
    what: 'Correspondents',
    body: 'Four seats open, one per continent we cannot currently reach by wire: West Africa, South Asia, Latin America and the American interior.',
  },
  {
    when: '1 January 2027',
    what: 'Four channels on air',
    body: 'All four launch the same morning with a full week of episodes already cut, so nobody arrives to an empty channel.',
  },
  {
    when: 'Alongside launch',
    what: 'The Good News Press',
    body: 'A small print shop attached to the newsroom. Front pages, desk shirts and the year’s best rescue on a poster. Made in short runs, printed on real paper stock.',
  },
];

export default function NewsroomPage() {
  return (
    <div className="mx-auto max-w-broadsheet px-4 py-10 sm:px-6">
      <div className="rule-double pt-3">
        <p className="kicker text-ember">The newsroom</p>
        <h1 className="mt-2 max-w-4xl font-display text-4xl font-semibold leading-[1.04] sm:text-6xl">
          The wire is the reporting. Next year it gets a face and a voice.
        </h1>
        <p className="mt-5 max-w-column text-lg leading-relaxed text-ink-soft">
          Miracle Witness Network is a media company that happens to start as a
          scanner. On 1 January 2027 four channels go live on the same morning,
          built on exactly the stories this site is already gathering, with the
          outlet that broke each one credited on screen.
        </p>
      </div>

      <div className="mt-10 border border-rule bg-paper-card p-6 sm:p-8">
        <Countdown target={LAUNCH} label="Until the channels go live" />
      </div>

      <section className="mt-16" aria-labelledby="channels">
        <div className="rule-double mb-8 pt-3">
          <h2 id="channels" className="kicker text-ink">
            Four channels
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {CHANNELS.map((channel) => (
            <article
              key={channel.name}
              className="border-t-[3px] bg-paper-card p-6"
              style={{ borderColor: channel.desk.color }}
            >
              <p className="kicker" style={{ color: channel.desk.color }}>
                {channel.cadence}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{channel.name}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{channel.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="plan">
        <div className="rule-double mb-8 pt-3">
          <h2 id="plan" className="kicker text-ink">
            The order it happens in
          </h2>
        </div>
        <ol className="space-y-0">
          {MILESTONES.map((milestone, index) => (
            <li
              key={milestone.what}
              className="grid gap-2 border-b border-rule py-6 last:border-0 sm:grid-cols-[9rem_1fr] sm:gap-8"
            >
              <div>
                <p className="kicker text-ember">{milestone.when}</p>
                <p className="mt-1 font-display text-3xl font-semibold text-ink-faint tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </p>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">{milestone.what}</h3>
                <p className="mt-2 max-w-column text-[15px] leading-relaxed text-ink-soft">
                  {milestone.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 border border-rule bg-paper-tint p-8 sm:p-12" aria-labelledby="join">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 id="join" className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
              We are looking for people who can get to the story.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              A correspondent for this newsroom needs one thing the wire cannot
              buy: proximity. If you live where these stories happen and you can
              film, write or simply knock on the door, tell us what you have
              covered and where you are.
            </p>
            <Link
              href="/submit"
              className="kicker mt-6 inline-flex min-h-[44px] items-center bg-ink px-6 py-3 text-paper transition-colors hover:bg-ember"
            >
              Write to the newsroom →
            </Link>
          </div>
          <div className="border-t border-rule pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <p className="kicker text-ink">The Good News Press</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Print runs go up with the channels: the year’s front pages, one
              poster per desk, and shirts that carry a real headline and the date
              it ran. Short runs, real stock, no drop-shipped slogans.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Nothing is on sale yet, and nothing here takes an order.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
