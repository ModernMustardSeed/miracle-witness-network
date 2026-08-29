import type { Metadata } from 'next';
import Link from 'next/link';

import { DeskCard, EmptyDesk } from '@/components/StoryPieces';
import { DESK_LIST, isDeskId, type DeskId } from '@/lib/desks';
import { timeAgo } from '@/lib/format';
import { store } from '@/lib/store';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'The Wire',
  description:
    'Everything the Miracle Witness Network scanner cleared this cycle, newest first, filterable by desk and searchable by place, outlet or subject.',
  alternates: { canonical: '/wire' },
};

interface WirePageProps {
  searchParams: Promise<{ desk?: string; q?: string }>;
}

export default async function WirePage({ searchParams }: WirePageProps) {
  const params = await searchParams;
  const desk: DeskId | undefined =
    params.desk && isDeskId(params.desk) ? params.desk : undefined;
  const search = params.q?.trim() ?? '';

  const active = store();
  const [stories, run] = await Promise.all([
    active.listStories({ desk, search, limit: 60 }),
    active.lastRun().catch(() => null),
  ]);

  const filtered = Boolean(desk || search);

  return (
    <div className="mx-auto max-w-broadsheet px-4 py-10 sm:px-6">
      <div className="rule-double pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">The Wire</h1>
          <p className="text-sm text-ink-soft">
            {run?.finishedAt ? (
              <>
                Last pass {timeAgo(run.finishedAt)}. Read {run.itemsSeen} items, kept{' '}
                {run.itemsKept}.
              </>
            ) : (
              'Scanning now.'
            )}
          </p>
        </div>
      </div>

      <form method="get" action="/wire" className="mt-6" role="search">
        <label htmlFor="wire-search" className="kicker block text-ink-soft">
          Search the wire
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="wire-search"
            type="search"
            name="q"
            defaultValue={search}
            placeholder="A place, an outlet, a word from the headline"
            className="min-h-[44px] flex-1 border border-rule bg-paper-card px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25"
          />
          {desk && <input type="hidden" name="desk" value={desk} />}
          <button
            type="submit"
            className="kicker min-h-[44px] bg-ink px-6 py-2.5 text-paper transition-colors hover:bg-ember"
          >
            Search
          </button>
        </div>
      </form>

      <nav aria-label="Filter by desk" className="mt-6 flex flex-wrap gap-2">
        <Link
          href={search ? `/wire?q=${encodeURIComponent(search)}` : '/wire'}
          aria-current={!desk ? 'true' : undefined}
          className={`kicker min-h-[36px] border px-3 py-2 transition-colors ${
            desk
              ? 'border-rule text-ink-soft hover:border-ink hover:text-ink'
              : 'border-ink bg-ink text-paper'
          }`}
        >
          All desks
        </Link>
        {DESK_LIST.map((entry) => {
          const href = `/desk/${entry.id}`;
          const isActive = desk === entry.id;
          return (
            <Link
              key={entry.id}
              href={href}
              aria-current={isActive ? 'true' : undefined}
              className="kicker min-h-[36px] border px-3 py-2 transition-colors"
              style={
                isActive
                  ? { borderColor: entry.color, background: entry.color, color: '#FFFDF9' }
                  : { borderColor: '#E4DACA', color: entry.color }
              }
            >
              {entry.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10">
        {stories.length === 0 ? (
          <EmptyDesk
            message={
              filtered
                ? `Nothing on the wire matches ${search ? `“${search}”` : 'that desk'} right now. The archive grows every hour.`
                : 'The wire is empty this minute. The scanner runs hourly and this page fills itself.'
            }
            action={
              filtered ? (
                <Link href="/wire" className="kicker border-b-2 border-ember pb-1 text-ember">
                  Clear the filter →
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="kicker mb-5 text-ink-soft">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
              {search && ` matching “${search}”`}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <DeskCard key={story.id} story={story} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
