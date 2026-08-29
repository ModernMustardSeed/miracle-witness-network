import Link from 'next/link';

import { DESK_LIST } from '@/lib/desks';

const SOCIAL = [
  { label: 'YouTube', href: 'https://www.youtube.com/@miraclewitnessnetwork' },
  { label: 'Instagram', href: 'https://www.instagram.com/miraclewitnessnetwork' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@miraclewitnessnetwork' },
  { label: 'X', href: 'https://x.com/miraclewitnessn' },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/15 bg-paper-tint">
      <div className="mx-auto max-w-broadsheet px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-semibold leading-tight text-ink">
              Miracle Witness Network
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              A newsroom for the other half of the record. We scan the world’s
              wires every hour for the rescues, recoveries and reunions that
              happened while everyone was reading something else.
            </p>
            <p className="mt-4 text-sm italic leading-relaxed text-ink-soft">
              “Come and hear, all you who fear God, and I will tell what he has
              done for my soul.”
              <span className="not-italic"> Psalm 66:16</span>
            </p>
          </div>

          <nav aria-label="Desks">
            <p className="kicker mb-3 text-ink">Desks</p>
            <ul className="space-y-2 text-sm">
              {DESK_LIST.map((entry) => (
                <li key={entry.id}>
                  <Link href={`/desk/${entry.id}`} className="text-ink-soft hover:text-ember">
                    {entry.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="The paper">
            <p className="kicker mb-3 text-ink">The paper</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/wire" className="text-ink-soft hover:text-ember">
                  The Wire
                </Link>
              </li>
              <li>
                <Link href="/how-we-verify" className="text-ink-soft hover:text-ember">
                  How We Verify
                </Link>
              </li>
              <li>
                <Link href="/witness-roll" className="text-ink-soft hover:text-ember">
                  The Witness Roll
                </Link>
              </li>
              <li>
                <Link href="/newsroom" className="text-ink-soft hover:text-ember">
                  The Newsroom
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-ink-soft hover:text-ember">
                  Send a Story
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Follow">
            <p className="kicker mb-3 text-ink">Follow</p>
            <ul className="space-y-2 text-sm">
              {SOCIAL.map((entry) => (
                <li key={entry.label}>
                  <a
                    href={entry.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-soft hover:text-ember"
                  >
                    {entry.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              Channels open 1 January 2027.
            </p>
          </nav>
        </div>

        <div className="mwn-foot mt-10 flex flex-col gap-3 border-t border-rule pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getUTCFullYear()} Miracle Witness Network. All rights reserved.</p>
          <p>
            Built by{' '}
            <a
              href="https://modernmustardseed.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mms-credit font-semibold"
            >
              Modern Mustard Seed
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
