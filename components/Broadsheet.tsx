import Link from 'next/link';

import { DESK_LIST, type DeskId } from '@/lib/desks';

/** The printer's ornament a paper uses to close one thing and open the next. */
export function Dinkus({ className = '' }: { className?: string }) {
  return (
    <div className={`dinkus my-12 ${className}`} aria-hidden>
      <span>✦</span>
      <span>✦</span>
      <span>✦</span>
    </div>
  );
}

/** A section head set in small caps between two rules. */
export function SectionHead({
  children,
  right,
  id,
  as: Tag = 'h2',
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  id?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div className="mb-6">
      <div className="section-head">
        <Tag
          id={id}
          className="index-entry whitespace-nowrap px-1 text-[0.7rem] tracking-[0.34em] text-ink"
        >
          {children}
        </Tag>
      </div>
      {right && <div className="mt-2 flex justify-end">{right}</div>}
    </div>
  );
}

/**
 * The INSIDE strip: every desk, with how many stories are on it right now.
 *
 * A newspaper prints its whole index on page one, including the sections that
 * are thin today. Hiding a quiet desk would tell the reader it does not exist,
 * when what is true is that nothing cleared it this hour.
 */
export function InsideIndex({ counts }: { counts: Record<DeskId, number> }) {
  return (
    <nav
      aria-label="The desks, and what is on them"
      className="border-y border-ink/25 bg-paper-tint/70"
    >
      <div className="mx-auto flex max-w-broadsheet flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
        <span className="index-entry shrink-0 text-ink-faint">Inside</span>
        {DESK_LIST.map((desk) => {
          const count = counts[desk.id] ?? 0;
          return (
            <Link
              key={desk.id}
              href={`/desk/${desk.id}`}
              className="index-entry group inline-flex items-baseline gap-1.5 transition-opacity hover:opacity-70"
              style={{ color: count > 0 ? desk.color : undefined }}
            >
              <span className={count > 0 ? '' : 'text-ink-faint'}>{desk.name}</span>
              <span
                className={`tabular-nums text-[0.625rem] ${count > 0 ? 'opacity-70' : 'text-ink-faint opacity-60'}`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** The line at the foot of the page, the way a broadsheet signs off. */
export function Folio({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-broadsheet px-4 sm:px-6">
      <div className="rule-press mt-4 pt-3">
        <p className="folio text-center">{children}</p>
      </div>
    </div>
  );
}

/**
 * A standing quote. Papers set one line large and let it hold a whole band of
 * the page. This one never changes, which is the point: it is the masthead's
 * argument, not a rotating decoration.
 */
export function StandingQuote() {
  return (
    <section className="border-y-2 border-ink bg-paper-card" aria-label="Standing quote">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
        <span aria-hidden className="dinkus mb-6">
          <span>✦</span>
        </span>
        <blockquote className="font-display text-[1.75rem] font-medium italic leading-[1.28] tracking-tight text-ink sm:text-[2.5rem]">
          “Come and hear, all you who fear God, and I will tell what he has done
          for my soul.”
        </blockquote>
        <p className="index-entry mt-6 text-ink-soft">Psalm 66 · 16</p>
      </div>
    </section>
  );
}

/**
 * The scan box: newspaper furniture that happens to be a status readout. Every
 * figure is from the last pass, so a reader can see the machine working rather
 * than take our word for it.
 */
export function ScanBox({
  itemsSeen,
  itemsKept,
  sourcesOk,
  sourcesTotal,
  reviewer,
}: {
  itemsSeen: number;
  itemsKept: number;
  sourcesOk: number;
  sourcesTotal: number;
  reviewer: string;
}) {
  const rows = [
    ['Items read', itemsSeen.toLocaleString('en-US')],
    ['Kept', itemsKept.toLocaleString('en-US')],
    ['Sources answering', `${sourcesOk} of ${sourcesTotal}`],
    ['Placed by', reviewer === 'rules' ? 'Keyword pass' : reviewer],
  ] as const;

  return (
    <aside className="mt-8 border-2 border-ink p-4" aria-label="The last scan">
      <p className="index-entry border-b border-ink pb-2 text-ink">The last pass</p>
      <dl className="mt-3 space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-soft">{label}</dt>
            <dd className="font-display text-[15px] font-bold tabular-nums text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
