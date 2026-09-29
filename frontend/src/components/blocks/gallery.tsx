import type { ReactNode } from 'react';

import { GalleryCarousel } from '@/components/blocks/gallery-carousel';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { slugId } from '@/lib/slug';
import type { GalleryBlock } from '@/types/api';

/*
 * Gallery — 06-COMPONENT-SPEC.md §Gallery. Server Component that dispatches on
 * layout: `grid` renders a static Grid (2 columns at sm, 3 at lg); `carousel`
 * hands off to the Client GalleryCarousel.
 *
 * The API omits empty gallery blocks (04-API-CONTRACT.md §4), but this still
 * returns null on an empty array rather than rendering an empty region.
 */

export interface GalleryProps {
  band?: 'surface' | 'sunken';
  block: GalleryBlock;
}

export function Gallery({
  block,
  band = 'surface',
}: GalleryProps): ReactNode {
  const images = block.images || [];
  if (images.length === 0) {
    return null;
  }

  const hasHeading = block.heading !== undefined && block.heading !== '';
  const headingId = hasHeading ? slugId('gallery', block.heading ?? '') : undefined;
  const label = block.heading ?? 'Photo gallery';

  // Display a curated selection of 6 to 9 photos for clean visual balance
  const displayedImages = images.slice(0, 9);

  const body =
    block.layout === 'carousel' ? (
      <GalleryCarousel images={images} label={label} />
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {displayedImages.map((image, index) => (
          <div
            key={image.src || index}
            className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-border/80 bg-surface-sunken shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-brand-primary/50"
          >
            <div className="aspect-square w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
              <Image
                image={image}
                fill
                aspectRatio="1/1"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            {/* Subtle bottom vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
              <span className="text-[12px] font-bold uppercase tracking-wider text-white drop-shadow">
                ★ Fairway Dining &amp; BBQ
              </span>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <Section
      tone={band}
      {...(headingId !== undefined ? { ariaLabelledBy: headingId } : {})}
      watermark="script"
    >
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center text-center gap-2 max-w-2xl mx-auto">
            <span className="text-overline uppercase tracking-[0.2em] text-brand-primary font-bold">
              Atmosphere &amp; Kitchen Craft
            </span>
            {hasHeading ? (
              <Heading
                level={2}
                visualLevel="h2"
                {...(headingId !== undefined ? { id: headingId } : {})}
              >
                {block.heading}
              </Heading>
            ) : null}
            <p className="text-body text-ink-muted leading-relaxed">
              From 4 AM California oak fires and slow-smoked brisket carving to golden sunset drinks on the 18th hole patio.
            </p>
          </div>

          {body}

          <div className="text-center pt-2">
            <p className="text-caption text-ink-muted">
              Come experience it in person · Open daily 6:00 AM – 9:00 PM at Simi Hills Golf Course
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
