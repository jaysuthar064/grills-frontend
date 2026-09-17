import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo';

/*
 * Sitemap — 08-PERFORMANCE-SEO-A11Y.md §4.3. Absolute production URLs from
 * NEXT_PUBLIC_SITE_URL. Only routes that currently resolve are listed: the five
 * built top-level pages. 08 also lists /privacy-policy, /accessibility, and the
 * /events/[slug] detail URLs — those routes are not built yet, so they are
 * omitted rather than advertising 404s to crawlers. Add them (and re-enable an
 * events fetch for the detail URLs) when those routes ship.
 */

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITE_URL}/menu`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/catering`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
