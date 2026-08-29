'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';

import { DESK_LIST } from '@/lib/desks';

const NAV = [
  { href: '/', label: 'Front Page' },
  { href: '/wire', label: 'The Wire' },
  { href: '/how-we-verify', label: 'How We Verify' },
  { href: '/witness-roll', label: 'Witness Roll' },
  { href: '/newsroom', label: 'Newsroom' },
  { href: '/submit', label: 'Send a Story' },
];

const subscribeToNothing = () => () => {};

/**
 * The date and the edition number belong to the reader, not the server, so they
 * render once the client is driving. useSyncExternalStore answers that during
 * render, with no state written from inside an effect.
 */
function useClientDate(): Date | null {
  const onClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  return onClient ? new Date() : null;
}

/** Papers number their editions from a founding date. Ours is 1 January 2026. */
function editionNumber(date: Date): number {
  const founded = Date.UTC(2026, 0, 1);
  return Math.max(1, Math.floor((date.valueOf() - founded) / 86_400_000) + 1);
}

export function Masthead() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const today = useClientDate();

  const dateLine = today
    ? today
        .toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        .toUpperCase()
    : '';

  return (
    <header className="relative">
      {/* Folio strip: volume, date, motto. */}
      <div className="border-b border-ink/25 bg-paper-tint">
        <div className="mx-auto flex max-w-broadsheet items-center justify-between gap-3 px-4 py-1.5 sm:px-6">
          <span className="folio hidden min-h-[0.9rem] tabular-nums sm:block">
            {today ? `Vol. I · No. ${editionNumber(today)}` : ''}
          </span>
          <span className="folio min-h-[0.9rem] truncate text-center">{dateLine}</span>
          <span className="folio flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-desk-rescue animate-pulse-dot"
            />
            Scanning
          </span>
        </div>
      </div>

      {/* The nameplate. It takes the whole measure, margin to margin, the way
          a broadsheet nameplate does. The ears sit under it rather than beside
          it, because a masthead that shares its line is a logo, not a plate. */}
      <div className="mx-auto max-w-broadsheet px-4 pb-3 pt-4 sm:px-6 sm:pt-6">
        <h1>
          <Link href="/" aria-label="Miracle Witness Network, front page" className="block">
            <span className="nameplate text-ink">MIRACLE</span>
          </Link>
        </h1>

        <div className="section-head mt-1 sm:mt-1.5">
          <span className="index-entry whitespace-nowrap px-2 text-[0.6rem] tracking-[0.4em] text-ink sm:text-[0.82rem] sm:tracking-[0.58em]">
            Witness Network
          </span>
        </div>

        <div className="mt-3 grid gap-2 lg:grid-cols-[13rem_1fr_13rem] lg:items-start lg:gap-6">
          <p className="ear hidden lg:block">
            Established 2026. Reporting the good from every country on earth,
            every hour, with the outlet that broke it named.
          </p>
          <p className="text-center text-[11px] italic leading-relaxed text-ink-soft sm:text-[13px]">
            Real stories. Named sources. Every one you can check.
          </p>
          <p className="ear hidden text-right lg:block">
            No invented story. No counted witness. Every number on this page is
            counted from the archive as it renders.
          </p>
        </div>
      </div>

      <nav
        aria-label="Sections"
        className="sticky top-0 z-40 border-y-[3px] border-ink bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85"
      >
        <div className="mx-auto flex max-w-broadsheet items-center justify-between px-4 sm:px-6 md:justify-center">
          <ul className="hidden flex-wrap items-center justify-center gap-x-7 gap-y-1 py-2.5 md:flex">
            {NAV.map((entry) => {
              const active =
                entry.href === '/' ? pathname === '/' : pathname.startsWith(entry.href);
              return (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    aria-current={active ? 'page' : undefined}
                    className={`index-entry transition-colors ${
                      active ? 'text-ember' : 'text-ink hover:text-ember'
                    }`}
                  >
                    {entry.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mwn-mobile-nav"
            className="flex min-h-[44px] items-center gap-2 py-2 text-left md:hidden"
          >
            <span aria-hidden className="flex flex-col gap-[3px]">
              <span className="block h-[2px] w-5 bg-ink" />
              <span className="block h-[2px] w-5 bg-ink" />
              <span className="block h-[2px] w-5 bg-ink" />
            </span>
            <span className="index-entry">{open ? 'Close' : 'Sections'}</span>
          </button>

        </div>

        {open && (
          <div id="mwn-mobile-nav" className="border-t border-rule bg-paper md:hidden">
            <ul className="mx-auto max-w-broadsheet px-4 py-2">
              {NAV.map((entry) => (
                <li key={entry.href} className="border-b border-rule/70 last:border-0">
                  <Link
                    href={entry.href}
                    onClick={() => setOpen(false)}
                    className="block min-h-[44px] py-3 font-display text-lg text-ink"
                  >
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mx-auto max-w-broadsheet px-4 pb-4">
              <p className="index-entry mb-2 text-ink-soft">The desks</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {DESK_LIST.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/desk/${entry.id}`}
                    onClick={() => setOpen(false)}
                    className="text-sm font-semibold"
                    style={{ color: entry.color }}
                  >
                    {entry.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
