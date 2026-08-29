import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { runScan } from '@/lib/scan';
import { isPersisted, store } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * The hourly pass. Vercel Cron sends `Authorization: Bearer $CRON_SECRET`, so
 * the same secret is what a human needs to trigger it by hand.
 */
function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== 'production';
  const header = request.headers.get('authorization') ?? '';
  return header === `Bearer ${secret}`;
}

async function handle(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const includeGdelt = url.searchParams.get('gdelt') !== 'off';
  const useClaude = url.searchParams.get('claude') !== 'off';

  const started = Date.now();
  const result = await runScan({ includeGdelt, useClaude });
  const active = store();

  let saved = 0;
  const problems: string[] = [...result.warnings];

  try {
    saved = await active.saveStories(result.stories);
    await active.saveRun(result.run);
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }

  // The front page, the wire and every desk read from the archive, so they all
  // need to be rebuilt the moment the archive changes.
  for (const path of ['/', '/wire', '/how-we-verify']) {
    revalidatePath(path);
  }
  revalidatePath('/desk/[id]', 'page');

  return NextResponse.json({
    ok: true,
    persisted: isPersisted(),
    reviewer: result.run.reviewer,
    itemsSeen: result.run.itemsSeen,
    storiesKept: result.stories.length,
    storiesSaved: saved,
    sourcesOk: result.run.sourcesOk,
    sourcesFailed: result.run.sourcesFailed,
    tookMs: Date.now() - started,
    warnings: problems.slice(0, 12),
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
