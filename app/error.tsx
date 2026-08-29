'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is what ties this screen to a line in the Vercel runtime log.
    console.error('[mwn] page failed', error.digest ?? '', error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-broadsheet px-4 py-20 sm:px-6">
      <div className="rule-double max-w-2xl pt-3">
        <p className="kicker text-ember">The press stopped</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
          This page could not be printed.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Something in the newsroom failed on the way to you. The scanner keeps
          running either way, so the wire is still filling up behind this screen.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={reset}
            className="kicker inline-flex min-h-[44px] items-center bg-ink px-6 py-3 text-paper transition-colors hover:bg-ember"
          >
            Try this page again →
          </button>
          <Link
            href="/"
            className="kicker inline-flex min-h-[44px] items-center border border-ink px-6 py-3 text-ink transition-colors hover:border-ember hover:text-ember"
          >
            Back to the front page
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs text-ink-faint">
            If you tell us about this, quote reference{' '}
            <code className="font-mono text-ink-soft">{error.digest}</code>.
          </p>
        )}
      </div>
    </div>
  );
}
