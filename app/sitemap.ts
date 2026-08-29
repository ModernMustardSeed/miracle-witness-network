import type { MetadataRoute } from 'next';

import { DESK_IDS } from '@/lib/desks';
import { store } from '@/lib/store';

const BASE = 'https://miraclewitness.network';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/wire`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/how-we-verify`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/witness-roll`, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/newsroom`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/submit`, changeFrequency: 'monthly', priority: 0.6 },
    ...DESK_IDS.map((id) => ({
      url: `${BASE}/desk/${id}`,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
  ];

  try {
    const stories = await store().listStories({ limit: 200 });
    return [
      ...fixed,
      ...stories.map((story) => ({
        url: `${BASE}/story/${story.slug}`,
        lastModified: new Date(story.publishedAt),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // A sitemap that lists the fixed pages beats a 500 that lists nothing.
    return fixed;
  }
}
