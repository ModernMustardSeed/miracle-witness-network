import Link from 'next/link';

import { DESK_LIST } from '@/lib/desks';

export const metadata = {
  title: 'That page is not on the wire',
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-broadsheet px-4 py-20 sm:px-6">
      <div className="rule-double max-w-2xl pt-3">
        <p className="kicker text-ember">404</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
          That page never made the edition.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Either the link is wrong, or the story it pointed to was pulled. We
          take stories down rather than footnote them when they turn out not to
          hold up, so a dead link here is sometimes the system working.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="kicker inline-flex min-h-[44px] items-center bg-ink px-6 py-3 text-paper transition-colors hover:bg-ember"
          >
            Today’s front page →
          </Link>
          <Link
            href="/wire"
            className="kicker inline-flex min-h-[44px] items-center border border-ink px-6 py-3 text-ink transition-colors hover:border-ember hover:text-ember"
          >
            Search the wire
          </Link>
        </div>
      </div>

      <nav aria-label="Desks" className="mt-16 border-t border-rule pt-6">
        <p className="kicker mb-3 text-ink-soft">Or start at a desk</p>
        <div className="flex flex-wrap gap-2">
          {DESK_LIST.map((entry) => (
            <Link
              key={entry.id}
              href={`/desk/${entry.id}`}
              className="kicker min-h-[36px] border border-rule px-3 py-2 transition-colors hover:border-ink"
              style={{ color: entry.color }}
            >
              {entry.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
