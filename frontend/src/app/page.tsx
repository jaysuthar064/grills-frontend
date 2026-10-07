import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { PageShell } from '@/components/layout/page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { getHome } from '@/lib/api';
import { homeJsonLd } from '@/lib/json-ld';
import { getWpUploadUrl, normalizeMediaUrl } from '@/lib/media';
import { buildMetadata } from '@/lib/seo';
import type { InstagramFeedBlock } from '@/types/api';

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

  // Filter and enhance blocks
  // The client requested: "so fresh from the pitt can we just use that for the IG feed? and lets just link that"
  // We use "Fresh from the Pit" as the official Instagram showcase and filter out the duplicate second IG feed.
  const enhancedBlocks = blocks
    .filter((block) => {
      // Client feedback (line 41): "Full Service and Drop-off Kit, let's just kill this, this whole thing"
      if (block.type === 'split_feature') return false;
      // Client feedback (lines 50-53): kill redundant pre-footer CTA band that repeats footer hours & phone
      if (block.type === 'cta_band') return false;
      return true;
    })
    .map((block) => {
      if (block.type === 'hero') {
        const rawUrl = block.videoUrl && block.videoUrl !== '' ? block.videoUrl : '/media/hero-broll.mp4';
        // In production/remote, ensure localhost:8885 is mapped to public WP host
        const normalizedUrl = process.env.NODE_ENV === 'production' ? normalizeMediaUrl(rawUrl) : rawUrl;
        // Prefer faststart MP4 over raw MOV for universal browser streaming support
        const videoUrl = normalizedUrl.replace(/\.mov$/i, '.mp4');

        return {
          ...block,
          videoUrl,
          image: {
            src: '/media/brisket-sandwich.jpg',
            alt: 'Grill on the Green 18th Hole Fairway Dining',
            width: 1200,
            height: 800,
          },
        };
      }
      if (block.type === 'text') {
        // Fast-loading local b-roll hosted on Vercel CDN + client fairway photo poster
        // Completely eliminates the unappealing paper menu photo (IMG_2180)
        return {
          ...block,
          videoUrl: '/media/hero-broll.mp4',
          image: {
            src: '/media/brisket-sandwich.jpg',
            alt: 'Grill on the Green fairway dining and pit smokehouse',
            width: 1200,
            height: 800,
          },
        };
      }
      if (block.type === 'featured_items') {
        const itemImageMap: Record<string, { src: string; alt: string }> = {
          'smoked-brisket-sandwich': {
            src: '/media/brisket-sandwich.jpg',
            alt: 'Texas Smoked Brisket Sandwich',
          },
          'bbq-bacon-cheese-burger': {
            src: '/media/burger-patio.jpg',
            alt: 'BBQ Bacon Cheese Burger on brioche bun',
          },
          'bbq-chopped-salad': {
            src: '/media/bbq-salad.jpg',
            alt: 'BBQ Chopped Salad with crisp greens and roasted corn',
          },
          'all-beef-nathans-hot-dog': {
            src: '/media/fairway-hotdog.jpg',
            alt: "All Beef Nathan's Hot Dog with relish and onions",
          },
          'wings': {
            src: getWpUploadUrl('IMG_2185.JPG.jpeg'),
            alt: 'Crispy Jumbo Wings',
          },
          'smoked-prime-rib-sandwich': {
            src: getWpUploadUrl('IMG_2175.JPG.jpeg'),
            alt: 'Smoked Prime Rib Sandwich',
          },
        };

        return {
          ...block,
          items: block.items.map((item) => {
            const mappedImg = itemImageMap[item.slug];
            if (mappedImg && (!item.image || !item.image.src || item.image.src.includes('brisket-plate.png'))) {
              return {
                ...item,
                image: {
                  src: mappedImg.src,
                  alt: mappedImg.alt || item.name,
                  width: 800,
                  height: 600,
                },
              };
            }
            return item;
          }),
        };
      }
      if (block.type === 'split_feature' && block.image) {
        return {
          ...block,
          image: {
            ...block.image,
            src: normalizeMediaUrl(block.image.src || getWpUploadUrl('IMG_2175.JPG.jpeg')),
          },
        };
      }
      if (block.type === 'gallery') {
        // Client feedback: "so fresh from the pitt can we just use that for the IG feed? and lets just link that"
        const igBlock: InstagramFeedBlock = {
          type: 'instagram_feed',
          heading: 'Fresh from the Pit',
          handle: 'grillonthegreen_simi',
          count: 6,
        };
        return igBlock;
      }
      if (block.type === 'cta_band' && block.image) {
        return {
          ...block,
          image: {
            ...block.image,
            src: normalizeMediaUrl(block.image.src),
          },
        };
      }
      return block;
    });

  // Guarantee the Instagram feed is present on the homepage
  if (!enhancedBlocks.some((b) => b.type === 'instagram_feed')) {
    const fallbackIg: InstagramFeedBlock = {
      type: 'instagram_feed',
      heading: 'Fresh from the Pit',
      handle: 'grillonthegreen_simi',
      count: 6,
    };
    enhancedBlocks.push(fallbackIg);
  }

  return (
    <>
      <JsonLd data={homeJsonLd(_global)} />
      <PageShell global={_global} currentPath="/">
        <PageBlockRenderer blocks={enhancedBlocks} headingLevelOffset={0} />
      </PageShell>
    </>
  );
}
