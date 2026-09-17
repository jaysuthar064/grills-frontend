import type { ReactNode } from 'react';

import { MenuCard } from '@/components/blocks/menu-card';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { slugId } from '@/lib/slug';
import type { FeaturedItemsBlock } from '@/types/api';

/*
 * FeaturedMenuRow — 06-COMPONENT-SPEC.md §FeaturedMenuRow. Section > Container >
 * heading > item row > optional LinkButton to /menu.
 *
 * Below md the row is a horizontal scroll-snap strip showing ~1.2 cards to
 * signal overflow; at md+ it is a three-column grid. The scroll strip is
 * `tabindex=0` with `role="group"` and an accessible name so keyboard users can
 * scroll it; the cards themselves are not interactive. Max six items, enforced
 * server-side.
 *
 * The block is omitted from the payload when nothing is featured; the empty
 * guard here is defensive.
 */

export interface FeaturedMenuRowProps {
  band?: 'surface' | 'sunken';
  block: FeaturedItemsBlock;
}

export function FeaturedMenuRow({
  block,
  band = 'surface',
}: FeaturedMenuRowProps): ReactNode {
  if (block.items.length === 0) {
    return null;
  }

  const headingId = slugId('featured', block.heading);

  return (
    <Section tone={band} ariaLabelledBy={headingId} watermark="script">
      <Container>
        <div className="flex flex-col gap-6">
          <AnimatedReveal>
            <Heading level={2} id={headingId}>
              {block.heading}
            </Heading>
          </AnimatedReveal>

          {/* A scrollable region must be focusable so keyboard users can scroll it
              (WCAG 2.1.1); the ARIA group name explains what the stop is. */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
          <div role="group" aria-label="Featured menu items" tabIndex={0} className="overflow-x-auto pb-2 md:overflow-visible md:pb-0">
            <ul className="flex snap-x snap-mandatory gap-4 md:grid md:grid-cols-3">
              {block.items.map((item, index) => (
                <li
                  key={item.id}
                  className="shrink-0 basis-4/5 snap-start sm:basis-3/5 md:basis-auto"
                >
                  <AnimatedReveal delay={Math.min(index * 0.1, 0.4)}>
                    <MenuCard item={item} variant="featured" headingLevel={3} />
                  </AnimatedReveal>
                </li>
              ))}
            </ul>
          </div>

          {block.cta ? (
            <AnimatedReveal delay={0.3}>
              <div>
                <LinkButton
                  href={block.cta.href}
                  variant="secondary"
                  isExternal={block.cta.isExternal}
                >
                  {block.cta.label}
                </LinkButton>
              </div>
            </AnimatedReveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
