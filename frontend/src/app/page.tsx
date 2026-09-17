import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { PageShell } from '@/components/layout/page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { getHome } from '@/lib/api';
import { homeJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome();
  return buildMetadata(home.seo, home._global, '/');
}

/*
 * Home route — 02-INFORMATION-ARCHITECTURE.md §2.1, 06-COMPONENT-SPEC.md §10.6.
 * One fetch, in this Server Component, through the typed getHome() helper
 * (CLAUDE.md rule 1). Static + ISR on the `home` tag / 86400s window, configured
 * in the fetch layer.
 *
 * The page is composition only. 04-API-CONTRACT §5 defines HomeResponse as
 * `{ _global, seo, blocks[] }` — the whole body is `blocks[]`, with no separate
 * hero/featured/events fields — so every home section (hero, featured_items,
 * events_preview, text, cta_band, …) is a PageBlock rendered in editor order by
 * the shared PageBlockRenderer. Nothing here is home-specific: the Hero,
 * FeaturedMenuRow, and EventsPreview block components already exist and are
 * reused as-is.
 *
 * Heading outline: unlike the other routes, Home has no PageHeader — the primary
 * Hero (the first block) owns the site's <h1> (PageBlockRenderer passes
 * `isPrimary` to the index-0 hero; a later hero would be an <h2>). Every other
 * block's top heading is an <h2> via `headingLevelOffset={0}`, so the outline
 * runs h1 → h2 with no skipped level.
 *
 * Empty/partial states are the block components' own contract: FeaturedMenuRow
 * and EventsPreview return null on an empty array, an omitted block simply does
 * not render, and PageBlockRenderer renders nothing for an unknown type rather
 * than throwing. The route makes no assumption about which blocks are present.
 *
 * generateMetadata builds title/description/OG/canonical from `home.seo` and
 * defaults (08 §4.2); JsonLd emits the Restaurant + WebSite graph (08 §4.5).
 */

export default async function HomePage(): Promise<ReactNode> {
  const home = await getHome();
  const { _global, blocks } = home;

  return (
    <>
      <JsonLd data={homeJsonLd(_global)} />
      <PageShell global={_global} currentPath="/">
        <PageBlockRenderer blocks={blocks} headingLevelOffset={0} />
      </PageShell>
    </>
  );
}
