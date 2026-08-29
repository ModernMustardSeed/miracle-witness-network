import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DeskCard, EmptyDesk, LeadStory } from '@/components/StoryPieces';
import { DESKS, DESK_IDS, DESK_LIST, isDeskId } from '@/lib/desks';
import { store } from '@/lib/store';

export const revalidate = 600;

export function generateStaticParams() {
  return DESK_IDS.map((id) => ({ id }));
}

interface DeskPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DeskPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isDeskId(id)) return { title: 'Desk not found' };
  const entry = DESKS[id];
  return {
    title: `${entry.name} desk`,
    description: `${entry.brief} Every story on the ${entry.name.toLowerCase()} desk carries the outlet that reported it.`,
    alternates: { canonical: `/desk/${entry.id}` },
  };
}

export default async function DeskPage({ params }: DeskPageProps) {
  const { id } = await params;
  if (!isDeskId(id)) notFound();

  const entry = DESKS[id];
  const stories = await store().listStories({ desk: id, limit: 40 });
  const [lead, ...rest] = stories;

  return (
    <div className="mx-auto max-w-broadsheet px-4 py-10 sm:px-6">
      <div className="border-t-[3px] pt-4" style={{ borderColor: entry.color }}>
        <p className="kicker" style={{ color: entry.color }}>
          The desks
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{entry.name}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{entry.brief}</p>
      </div>

      <div className="mt-10">
        {!lead ? (
          <EmptyDesk
            message={`Nothing has cleared the ${entry.name.toLowerCase()} desk yet this cycle. The scanner runs every hour and files straight to this page.`}
            action={
              <Link href="/wire" className="kicker border-b-2 border-ember pb-1 text-ember">
                Read the whole wire →
              </Link>
            }
          />
        ) : (
          <>
            <LeadStory story={lead} />
            {rest.length > 0 && (
              <div className="mt-14 border-t border-ink pt-8">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((story) => (
                    <DeskCard key={story.id} story={story} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <nav aria-label="Other desks" className="mt-16 border-t border-rule pt-6">
        <p className="kicker mb-3 text-ink-soft">The other desks</p>
        <div className="flex flex-wrap gap-2">
          {DESK_LIST.filter((other) => other.id !== entry.id).map((other) => (
            <Link
              key={other.id}
              href={`/desk/${other.id}`}
              className="kicker min-h-[36px] border border-rule px-3 py-2 transition-colors hover:border-ink"
              style={{ color: other.color }}
            >
              {other.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
