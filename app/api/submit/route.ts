import { NextResponse } from 'next/server';
import { z } from 'zod';

import { DESK_IDS } from '@/lib/desks';
import { NotPersisted, store } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NEWSROOM_EMAIL = 'newsroom@miraclewitness.network';

const Body = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  place: z.string().trim().max(160).optional().or(z.literal('')),
  desk: z.enum(DESK_IDS).optional().or(z.literal('')),
  story: z.string().trim().min(40).max(4000),
  // Bots fill every field they find. Readers never see this one.
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'That did not arrive as readable text. Send it again.' },
      { status: 400 },
    );
  }

  const parsed = Body.safeParse(payload);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first?.path[0];
    const message =
      field === 'email'
        ? 'That email address does not look right, and we need it to come back to you.'
        : field === 'story'
          ? 'Tell us a little more. Forty characters is the minimum.'
          : field === 'name'
            ? 'We need a name to put on the story.'
            : 'Something in the form did not come through. Check the fields and send it again.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, place, desk, story } = parsed.data;

  try {
    await store().saveSubmission({
      name,
      email,
      place: place ? place : null,
      desk: desk ? desk : null,
      story,
    });
  } catch (error) {
    if (error instanceof NotPersisted) {
      return NextResponse.json(
        {
          error:
            'The newsroom inbox is not accepting submissions from this form yet.',
          fallback: NEWSROOM_EMAIL,
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      {
        error: 'We could not file that just now. Nothing was lost, so try once more.',
        fallback: NEWSROOM_EMAIL,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
