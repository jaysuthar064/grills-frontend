import type { Metadata } from 'next';

import type { GlobalData, SeoFields } from '@/types/api';

/*
 * Metadata builder — 08-PERFORMANCE-SEO-A11Y.md §4.2. Turns a route's SeoFields
 * plus _global into a Next Metadata object: canonical, robots, Open Graph, and
 * Twitter. Per-page values win; _global.seoDefaults fills the gaps.
 *
 * SITE_URL is the production origin, from NEXT_PUBLIC_SITE_URL (documented in
 * 10-ENVIRONMENTS-DEPLOYMENT.md §7); it defaults to https://example.com so a
 * misconfigured build never emits localhost canonicals. Only a production
 * VERCEL_ENV is indexable — previews and local dev emit noindex.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';
const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

/** Absolute canonical for a path, https, no trailing slash, query stripped. */
export function canonicalUrl(pathname: string): string {
  return `${SITE_URL}${pathname === '/' ? '' : pathname}`;
}

function resolveTitle(
  seo: SeoFields,
  global: GlobalData,
  pathname: string,
): string {
  // Home is complete on its own; a title already carrying the brand is used
  // verbatim; everything else is templated (08 §4.1).
  if (pathname === '/' || seo.title.includes(global.site.name)) {
    return seo.title;
  }
  return global.seoDefaults.titleTemplate.replace('%s', seo.title);
}

export function buildMetadata(
  seo: SeoFields,
  global: GlobalData,
  pathname: string,
): Metadata {
  const canonical = seo.canonical ?? canonicalUrl(pathname);
  const description = seo.description || global.seoDefaults.description;
  const title = resolveTitle(seo, global, pathname);
  const defaultOgImage = {
    src: '/brand/og-social.jpg',
    width: 1200,
    height: 630,
    alt: 'Grill on the Green - Smoked BBQ on Simi Hills Golf Course',
  };
  const image = seo.ogImage ?? global.seoDefaults.ogImage ?? defaultOgImage;
  const shouldIndex = IS_PRODUCTION && !seo.noindex;

  const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    // `absolute` opts out of any layout-level title template, so the value here
    // is exactly what ships.
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      siteName: global.site.name,
      title,
      description,
      url: canonical,
      locale: 'en_US',
      // og:image is omitted entirely when neither the page nor the defaults
      // supply one (04-API-CONTRACT §5.1) — never an empty or "undefined" tag.
      ...(image !== undefined
        ? {
            images: [
              {
                url: image.src,
                width: image.width,
                height: image.height,
                alt: image.alt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image !== undefined ? { images: [image.src] } : {}),
    },
  };

  return metadata;
}
