import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DeskCard, DeskTag } from '@/components/StoryPieces';
import { DESKS } from '@/lib/desks';
import { outlet, placeLabel, shortDate, timeAgo } from '@/lib/format';
import { store } from '@/lib/store';

export const revalidate = 1800;

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await store().getStory(slug);
  if (!story) return { title: 'Story not found' };

  return {
    title: story.headline,
    description: story.summary,
    alternates: { canonical: `/story/${story.slug}` },
    openGraph: {
      type: 'article',
      title: story.headline,
      description: story.summary,
      publishedTime: story.publishedAt,
      images: story.imageUrl ? [{ url: story.imageUrl }] : undefined,
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const active = store();
  const story = await active.getStory(slug);
  if (!story) notFound();

  const entry = DESKS[story.desk];
  const related = (await active.listStories({ desk: story.desk, limit: 4 })).filter(
    (item) => item.id !== story.id,
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: story.headline,
    description: story.summary,
    datePublished: story.publishedAt,
    image: story.imageUrl ? [story.imageUrl] : undefined,
    articleSection: entry.name,
    isBasedOn: story.sourceUrl,
    publisher: { '@type': 'Organization', name: 'Miracle Witness Network' },
    sourceOrganization: { '@type': 'Organization', name: story.sourceName },
  };

  return (
    <article className="mx-auto max-w-broadsheet px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="kicker mb-6 text-ink-faint">
        <Link href="/" className="hover:text-ember">
          Front page
        </Link>
        <span aria-hidden> / </span>
        <Link href={`/desk/${entry.id}`} className="hover:text-ember" style={{ color: entry.color }}>
          {entry.name}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <DeskTag id={story.desk} />
          <h1 className="mt-3 font-display text-[2.1rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-[3rem]">
            {story.headline}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-rule py-3 text-sm text-ink-soft">
            {placeLabel(story) && (
              <span className={`kicker ${story.locationSensitive ? 'text-ink-faint' : 'text-ink'}`}>
                {placeLabel(story)}
              </span>
            )}
            <span>
              Reported by{' '}
              <span className="font-semibold text-ink">{outlet(story.sourceName)}</span>
            </span>
            <span aria-hidden>·</span>
            <time dateTime={story.publishedAt}>{shortDate(story.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>{timeAgo(story.publishedAt)}</span>
          </div>

          {story.imageUrl && (
            <figure className="mt-7">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-tint">
                <Image
                  src={story.imageUrl}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  className="press-photo object-cover"
                />
              </div>
              <figcaption className="mt-2 text-xs text-ink-faint">
                Photograph published with the original report by {outlet(story.sourceName)}.
              </figcaption>
            </figure>
          )}

          <p className="dropcap mt-8 max-w-column text-[1.1875rem] leading-[1.7] text-ink">
            {story.summary}
          </p>

          {story.locationSensitive && (
            <div className="mt-8 border border-rule bg-paper-tint p-6">
              <p className="kicker text-ink">Location withheld</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                This story concerns believers who meet where meeting is
                punished. We have removed the city, the district and the names,
                and we have not linked anything that would restore them. The
                reporting is real and the outlet is named. The address is not
                ours to publish.
              </p>
            </div>
          )}

          <div
            className="mt-8 border-l-[3px] bg-paper-card p-6"
            style={{ borderColor: entry.color }}
          >
            <p className="kicker" style={{ color: entry.color }}>
              Read it at the source
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              We summarise and place the story. The reporting belongs to{' '}
              {outlet(story.sourceName)}, and the full account is theirs.
            </p>
            <a
              href={story.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="kicker mt-4 inline-flex min-h-[44px] items-center bg-ink px-5 py-3 text-paper transition-colors hover:bg-ember"
            >
              Open the original report →
            </a>
          </div>
        </div>

        <aside className="lg:col-span-4 lg:col-rule lg:pl-8" aria-label="How this story got here">
          <h2 className="kicker border-b-2 border-ink pb-2 text-ink">How this got here</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="kicker text-ink-faint">Independent outlets</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-ink">
                {story.corroborations}
              </dd>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                {story.corroborations > 1
                  ? 'We saw the same story carried by more than one outlet and merged them.'
                  : 'One outlet carried this. Read it at the source before you pass it on.'}
              </p>
            </div>
            <div>
              <dt className="kicker text-ink-faint">Placed by</dt>
              <dd className="mt-1 text-[15px] text-ink">
                {story.reviewedBy === 'claude'
                  ? 'Claude, reading the wire copy'
                  : 'The keyword pass, with no model in the loop'}
              </dd>
            </div>
            <div>
              <dt className="kicker text-ink-faint">Scanned</dt>
              <dd className="mt-1 text-[15px] text-ink">{timeAgo(story.scannedAt)}</dd>
            </div>
            <div>
              <dt className="kicker text-ink-faint">Editor’s confidence</dt>
              <dd className="mt-1 text-[15px] text-ink">{story.confidence} out of 100</dd>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                How sure the desk is that this is genuine, already-happened good
                news. It is not a claim about the source’s accuracy.
              </p>
            </div>
          </dl>
          <Link
            href="/how-we-verify"
            className="kicker mt-6 inline-block border-b-2 border-ember pb-1 text-ember"
          >
            What that means →
          </Link>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-ink pt-8" aria-labelledby="related">
          <h2 id="related" className="kicker mb-5 text-ink">
            More from the {entry.name.toLowerCase()} desk
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((item) => (
              <DeskCard key={item.id} story={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
