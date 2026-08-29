import Image from 'next/image';
import Link from 'next/link';

import { DESKS, type DeskId } from '@/lib/desks';
import { outlet, placeLabel, timeAgo } from '@/lib/format';
import type { Story } from '@/lib/types';

export function DeskTag({ id, className = '' }: { id: DeskId; className?: string }) {
  const entry = DESKS[id];
  return (
    <Link
      href={`/desk/${entry.id}`}
      className={`kicker inline-flex items-center gap-1.5 transition-opacity hover:opacity-70 ${className}`}
      style={{ color: entry.color }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
      {entry.name}
    </Link>
  );
}

export function Provenance({ story, className = '' }: { story: Story; className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-ink-faint ${className}`}>
      <span className="font-semibold text-ink-soft">{outlet(story.sourceName)}</span>
      <span aria-hidden> · </span>
      <time dateTime={story.publishedAt}>{timeAgo(story.publishedAt)}</time>
      {story.corroborations > 1 && (
        <>
          <span aria-hidden> · </span>
          <span>{story.corroborations} outlets</span>
        </>
      )}
    </p>
  );
}

function Photo({
  story,
  sizes,
  priority = false,
  className = '',
}: {
  story: Story;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const entry = DESKS[story.desk];

  // No photo is a normal state, not a broken one: plenty of wires publish text
  // only. This is a printed plate rather than an empty box, so a story without
  // a picture still looks chosen.
  if (!story.imageUrl) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden ${className}`}
        style={{ background: entry.tint }}
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, ${entry.color} 0 1px, transparent 1px 9px)`,
          }}
        />
        <div className="relative flex flex-col items-center px-4 text-center">
          <span
            className="font-display leading-none"
            style={{ color: entry.color, fontSize: 'clamp(2.5rem, 7vw, 5rem)', opacity: 0.32 }}
          >
            {entry.name.charAt(0)}
          </span>
          <span
            className="kicker mt-2 text-[9px]"
            style={{ color: entry.color, opacity: 0.75 }}
          >
            {entry.name} desk
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-paper-tint ${className}`}>
      <Image
        src={story.imageUrl}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={false}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
    </div>
  );
}

export function LeadStory({ story }: { story: Story }) {
  return (
    <article className="group">
      <Link href={`/story/${story.slug}`} className="block">
        <Photo
          story={story}
          priority
          sizes="(max-width: 768px) 100vw, 62vw"
          className="aspect-[16/9] w-full sm:aspect-[2/1]"
        />
      </Link>
      <div className="mt-5">
        <DeskTag id={story.desk} />
        <h2 className="mt-2 font-display text-[1.9rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-[2.6rem] lg:text-[3.1rem]">
          <Link href={`/story/${story.slug}`} className="headline-link">
            {story.headline}
          </Link>
        </h2>
        <p className="dropcap mt-4 max-w-column text-[1.0625rem] leading-[1.65] text-ink-soft">
          {story.summary}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
          {placeLabel(story) && (
            <span className={`kicker ${story.locationSensitive ? 'text-ink-faint' : 'text-ink'}`}>
              {placeLabel(story)}
            </span>
          )}
          <Provenance story={story} />
        </div>
      </div>
    </article>
  );
}

export function SecondStory({ story }: { story: Story }) {
  return (
    <article className="group flex gap-4 sm:block">
      <Link href={`/story/${story.slug}`} className="block shrink-0 sm:mb-4">
        <Photo
          story={story}
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 50vw, 22vw"
          className="aspect-square w-24 sm:aspect-[4/3] sm:w-full"
        />
      </Link>
      <div className="min-w-0">
        <DeskTag id={story.desk} />
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-[1.18] sm:text-xl">
          <Link href={`/story/${story.slug}`} className="headline-link">
            {story.headline}
          </Link>
        </h3>
        <p className="mt-2 hidden text-sm leading-relaxed text-ink-soft sm:block">
          {story.summary.length > 150 ? `${story.summary.slice(0, 150).trimEnd()}…` : story.summary}
        </p>
        <Provenance story={story} className="mt-2" />
      </div>
    </article>
  );
}

export function WireRow({ story }: { story: Story }) {
  return (
    <article className="border-b border-rule py-3.5 last:border-0">
      <DeskTag id={story.desk} className="text-[10px]" />
      <h3 className="mt-1 font-display text-[0.98rem] font-semibold leading-[1.25]">
        <Link href={`/story/${story.slug}`} className="headline-link">
          {story.headline}
        </Link>
      </h3>
      <Provenance story={story} className="mt-1.5" />
    </article>
  );
}

export function DeskCard({ story }: { story: Story }) {
  return (
    <article className="group flex h-full flex-col border border-rule bg-paper-card p-4 transition-shadow hover:shadow-lift">
      <DeskTag id={story.desk} className="text-[10px]" />
      <h3 className="mt-2 font-display text-[1.05rem] font-semibold leading-[1.22]">
        <Link href={`/story/${story.slug}`} className="headline-link">
          {story.headline}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-soft">
        {story.summary.length > 130 ? `${story.summary.slice(0, 130).trimEnd()}…` : story.summary}
      </p>
      <Provenance story={story} className="mt-3" />
    </article>
  );
}

export function EmptyDesk({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-rule bg-paper-card px-6 py-12 text-center">
      <p className="mx-auto max-w-md font-display text-xl leading-snug text-ink">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
