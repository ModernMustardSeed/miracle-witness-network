import { NextResponse } from 'next/server';

import { isDeskId } from '@/lib/desks';
import { store } from '@/lib/store';

export const runtime = 'nodejs';
export const revalidate = 600;

/**
 * The public feed. The channels, the newsletter and anything else built on top
 * of this newsroom read from here rather than re-implementing the scanner.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const deskParam = url.searchParams.get('desk');
  const desk = deskParam && isDeskId(deskParam) ? deskParam : undefined;
  const search = url.searchParams.get('q')?.trim() || undefined;
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? 24) || 24));

  try {
    const stories = await store().listStories({ desk, search, limit });
    return NextResponse.json(
      { count: stories.length, stories },
      { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'The archive did not answer.' },
      { status: 502 },
    );
  }
}
