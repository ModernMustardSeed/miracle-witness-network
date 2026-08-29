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

function EditionLine() {
  // The server has no idea what day it is where the reader is, so the date is
  // rendered only once the client is driving. useSyncExternalStore gives that
  // answer during render, with no state written from inside an effect.
  const onClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  const today = onClient
    ? new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return <span className="block min-h-[1rem] tabular-nums">{today ?? ' '}</span>;
}

export function Masthead() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative">
      <div className="border-b border-rule bg-paper-tint/60">
        <div className="mx-auto flex max-w-broadsheet items-center justify-between gap-4 px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-ink-soft sm:px-6">
          <EditionLine />
          <span className="hidden sm:block">Good news, gathered every hour</span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-desk-rescue animate-pulse-dot"
            />
            Scanning
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-broadsheet px-4 pb-3 pt-6 text-center sm:px-6 sm:pt-8">
        <Link href="/" className="inline-block group">
          <span className="kicker block text-ember">Miracle</span>
          <span className="mt-1 block font-display text-[2.1rem] font-semibold leading-[0.95] tracking-[-0.02em] text-ink sm:text-[3.2rem] md:text-[3.9rem]">
            Witness Network
          </span>
        </Link>
        <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-ink-soft">
          Real stories. Named sources. Every one you can check.
        </p>
      </div>

      <nav
        aria-label="Sections"
        className="sticky top-0 z-40 border-y border-ink/15 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80"
      >
        <div className="mx-auto flex max-w-broadsheet items-center justify-between px-4 sm:px-6">
          <ul className="hidden flex-wrap items-center gap-x-7 gap-y-1 py-2.5 md:flex">
            {NAV.map((entry) => {
              const active =
                entry.href === '/' ? pathname === '/' : pathname.startsWith(entry.href);
              return (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    aria-current={active ? 'page' : undefined}
                    className={`kicker transition-colors ${
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
            <span className="kicker">{open ? 'Close' : 'Sections'}</span>
          </button>

          <Link
            href="/wire"
            className="kicker hidden py-2.5 text-ink-soft transition-colors hover:text-ember md:block"
          >
            {DESK_LIST.length} desks
          </Link>
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
              <p className="kicker mb-2 text-ink-soft">Desks</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {DESK_LIST.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/desk/${entry.id}`}
                    onClick={() => setOpen(false)}
                    className="text-sm text-ink-soft"
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
