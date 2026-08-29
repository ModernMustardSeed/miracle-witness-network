'use client';

import { useEffect, useState } from 'react';

const UNITS = [
  { label: 'days', ms: 86_400_000 },
  { label: 'hours', ms: 3_600_000 },
  { label: 'minutes', ms: 60_000 },
  { label: 'seconds', ms: 1000 },
] as const;

function split(remaining: number): number[] {
  let left = Math.max(0, remaining);
  return UNITS.map((unit) => {
    const value = Math.floor(left / unit.ms);
    left -= value * unit.ms;
    return value;
  });
}

export function Countdown({ target, label }: { target: string; label: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const at = Date.parse(target);
    const tick = () => setRemaining(at - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const parts = remaining === null ? null : split(remaining);
  const live = remaining !== null && remaining <= 0;

  return (
    <div>
      <p className="kicker text-ink-faint">{live ? 'On air' : label}</p>
      <div
        className="mt-2 flex flex-wrap gap-x-6 gap-y-2"
        // The server has no clock the reader shares, so the numbers arrive on
        // mount. The row holds its height so nothing jumps when they do.
        style={{ minHeight: '4.25rem' }}
        aria-live="off"
      >
        {live ? (
          <p className="font-display text-4xl font-semibold text-ember">The channels are live.</p>
        ) : (
          UNITS.map((unit, index) => (
            <div key={unit.label}>
              <p className="font-display text-4xl font-semibold tabular-nums text-ink sm:text-5xl">
                {parts ? String(parts[index] ?? 0).padStart(2, '0') : '––'}
              </p>
              <p className="kicker mt-1 text-ink-faint">{unit.label}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
