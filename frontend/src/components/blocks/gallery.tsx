import type { ReactNode } from 'react';

import { GalleryCarousel } from '@/components/blocks/gallery-carousel';
import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
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
  if (block.images.length === 0) {
    return null;
  }

  const hasHeading = block.heading !== undefined && block.heading !== '';
  const headingId = hasHeading ? slugId('gallery', block.heading ?? '') : undefined;
  const label = block.heading ?? 'Photo gallery';

  const body =
    block.layout === 'carousel' ? (
      <GalleryCarousel images={block.images} label={label} />
    ) : (
      <Grid columns={3} gap={4}>
        {block.images.map((image) => (
          <div
            key={image.src}
            className="group relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <Image
              image={image}
              fill
              aspectRatio="1/1"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        ))}
      </Grid>
    );

  return (
    <Section
      tone={band}
      {...(headingId !== undefined ? { ariaLabelledBy: headingId } : {})}
    >
      <Container>
        <div className="flex flex-col gap-6">
          {hasHeading ? (
            <Heading
              level={2}
              {...(headingId !== undefined ? { id: headingId } : {})}
            >
              {block.heading}
            </Heading>
          ) : null}
          {body}
        </div>
      </Container>
    </Section>
  );
}
