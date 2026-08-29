'use client';

import { useState } from 'react';

import { DESK_LIST } from '@/lib/desks';

type State =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'sent' }
  | { status: 'error'; message: string; fallback?: string };

const FIELD =
  'mt-2 w-full min-h-[44px] border border-rule bg-paper-card px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-faint focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25 disabled:opacity-60';

export function SubmitForm() {
  const [state, setState] = useState<State>({ status: 'idle' });
  const sending = state.status === 'sending';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ status: 'sending' });

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        fallback?: string;
      };

      if (!response.ok) {
        setState({
          status: 'error',
          message: body.error ?? 'The newsroom did not accept that. Try once more.',
          fallback: body.fallback,
        });
        return;
      }

      form.reset();
      setState({ status: 'sent' });
    } catch {
      setState({
        status: 'error',
        message:
          'Your connection dropped before the story reached us. Nothing was lost on your end, so send it again.',
      });
    }
  }

  if (state.status === 'sent') {
    return (
      <div className="border-l-[3px] border-desk-rescue bg-paper-card p-8">
        <p className="kicker text-desk-rescue">Received</p>
        <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">
          It is in front of a person now.
        </h2>
        <p className="mt-4 max-w-column text-[15px] leading-relaxed text-ink-soft">
          Every testimony is read by someone in the newsroom, not by the scanner.
          If we run it you will hear from us at the address you gave, and we will
          ask before we print your name.
        </p>
        <button
          type="button"
          onClick={() => setState({ status: 'idle' })}
          className="kicker mt-6 border-b-2 border-ember pb-1 text-ember"
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="kicker text-ink">
            Your name
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            disabled={sending}
            className={FIELD}
            placeholder="Who is telling us"
          />
        </div>
        <div>
          <label htmlFor="email" className="kicker text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            disabled={sending}
            className={FIELD}
            placeholder="So we can come back to you"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="place" className="kicker text-ink">
            Where it happened
          </label>
          <input
            id="place"
            name="place"
            maxLength={160}
            disabled={sending}
            className={FIELD}
            placeholder="City and country"
          />
        </div>
        <div>
          <label htmlFor="desk" className="kicker text-ink">
            Which desk
          </label>
          <select id="desk" name="desk" disabled={sending} className={FIELD} defaultValue="">
            <option value="">Let the desk decide</option>
            {DESK_LIST.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="story" className="kicker text-ink">
          What happened
        </label>
        <textarea
          id="story"
          name="story"
          required
          rows={8}
          minLength={40}
          maxLength={4000}
          disabled={sending}
          className={`${FIELD} resize-y`}
          placeholder="Tell it plainly. When it happened, who was there, and how you know. If a newspaper or a station covered it, paste the link."
        />
        <p className="mt-2 text-xs text-ink-faint">
          Forty characters minimum. If you are sending a correction, start with
          the word CORRECTION.
        </p>
      </div>

      {state.status === 'error' && (
        <div
          role="alert"
          className="border-l-[3px] border-ember bg-ember-soft px-5 py-4 text-sm leading-relaxed text-ink"
        >
          <p className="font-semibold">{state.message}</p>
          {state.fallback && (
            <p className="mt-2">
              In the meantime, send it straight to{' '}
              <a
                href={`mailto:${state.fallback}`}
                className="link-underline font-semibold text-ember"
              >
                {state.fallback}
              </a>
              . It reaches the same desk.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="kicker inline-flex min-h-[48px] items-center bg-ink px-8 py-3.5 text-paper transition-colors hover:bg-ember disabled:cursor-not-allowed disabled:bg-ink-faint"
      >
        {sending ? 'Sending…' : 'Send it to the newsroom →'}
      </button>
    </form>
  );
}
