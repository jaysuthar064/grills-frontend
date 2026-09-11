import type { ReactNode } from 'react';

import { CtaBand } from '@/components/blocks/cta-band';
import { EventsPreview } from '@/components/blocks/events-preview';
import { FeaturedMenuRow } from '@/components/blocks/featured-menu-row';
import { Gallery } from '@/components/blocks/gallery';
import { Hero } from '@/components/blocks/hero';
import { InstagramFeed } from '@/components/blocks/instagram-feed';
import { People } from '@/components/blocks/people';
import { SplitFeature } from '@/components/blocks/split-feature';
import { TextSection } from '@/components/blocks/text-section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import type { PageBlock } from '@/types/api';

/*
 * PageBlockRenderer — 06-COMPONENT-SPEC.md §PageBlockRenderer. The single place
 * a block `type` is switched on; maps a PageBlock[] to components in order.
 *
 * `headingLevelOffset` is threaded to the block components whose heading level
 * depends on where the block group sits in the outline (currently TextSection).
 * It is 0 whenever blocks sit directly under the page <h1> — the case for Home
 * (the primary Hero is that <h1>) and for About/Contact (a PageHeader is), so
 * each block's top heading is an <h2>. It is 1 only in the rarer case where the
 * whole block group is nested under an existing section <h2>, pushing block
 * headings to <h3>. Blocks with a fixed level 2 (Hero-secondary, SplitFeature,
 * Gallery, CtaBand, People, FeaturedMenuRow, EventsPreview, InstagramFeed)
 * assume the offset-0 placement these three routes use.
 *
 * The `never` assignment in `default` is the exhaustiveness guard: adding a
 * block type to the PageBlock union without a case here fails the type check.
 * At runtime an unknown type warns in development and renders nothing —
 * PageBlockRenderer never throws.
 */

export interface PageBlockRendererProps {
  blocks: PageBlock[];
  headingLevelOffset?: 0 | 1;
}

export function PageBlockRenderer({
  blocks,
  headingLevelOffset = 0,
}: PageBlockRendererProps): ReactNode {
  /*
   * Cream/sand alternation. Counted over the blocks that actually paint a
   * band, so a Hero (full-bleed image) or a CtaBand (its own brand/ink colour)
   * neither takes a turn nor breaks the rhythm of the ones around it. Without
   * this the page is one flat cream from header to footer.
   */
  let bandIndex = -1;
  const nextBand = (): 'surface' | 'sunken' => {
    bandIndex += 1;
    return bandIndex % 2 === 0 ? 'surface' : 'sunken';
  };

  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${String(index)}`;

        switch (block.type) {
          case 'hero':
            return <Hero key={key} block={block} isPrimary={index === 0} />;
          case 'text':
            return (
              <AnimatedReveal key={key}>
                <TextSection
                  block={block}
                  band={nextBand()}
                  headingLevelOffset={headingLevelOffset}
                />
              </AnimatedReveal>
            );
          case 'split_feature':
            return (
              <AnimatedReveal key={key}>
                <SplitFeature block={block} band={nextBand()} />
              </AnimatedReveal>
            );
          case 'gallery':
            return (
              <AnimatedReveal key={key}>
                <Gallery block={block} band={nextBand()} />
              </AnimatedReveal>
            );
          case 'cta_band':
            return (
              <AnimatedReveal key={key}>
                <CtaBand block={block} />
              </AnimatedReveal>
            );
          case 'featured_items':
            return (
              <AnimatedReveal key={key}>
                <FeaturedMenuRow block={block} band={nextBand()} />
              </AnimatedReveal>
            );
          case 'events_preview':
            return (
              <AnimatedReveal key={key}>
                <EventsPreview block={block} band={nextBand()} />
              </AnimatedReveal>
            );
          case 'people':
            return (
              <AnimatedReveal key={key}>
                <People block={block} band={nextBand()} />
              </AnimatedReveal>
            );
          case 'instagram_feed':
            return (
              <AnimatedReveal key={key}>
                <InstagramFeed block={block} band={nextBand()} />
              </AnimatedReveal>
            );
          default: {
            const exhaustive: never = block;
            if (process.env.NODE_ENV !== 'production') {
              console.warn('Unhandled page block', exhaustive);
            }
            return null;
          }
        }
      })}
    </>
  );
}
