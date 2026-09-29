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
        <div className="flex flex-col gap-8">
          {/* Section Header with Overline, Heading, Subtitle & Action */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-overline uppercase tracking-[0.2em] text-brand-primary font-bold">
                House Specialties · Wood-Fired Perfection
              </span>
              <AnimatedReveal>
                <Heading level={2} id={headingId} visualLevel="h2">
                  {block.heading || 'Off the Smoker'}
                </Heading>
              </AnimatedReveal>
              <p className="text-body text-ink-muted leading-relaxed">
                Slow-smoked over seasoned California white oak and seared hot to order.
                Prepared fresh from 4:00 AM daily right at the 18th hole fairway.
              </p>
            </div>

            <div className="shrink-0">
              <LinkButton
                href={block.cta?.href || '/menu'}
                variant="secondary"
                size="md"
                className="hover:border-brand-primary hover:text-brand-primary shadow-xs"
              >
                {block.cta?.label || 'Explore Full Menu'} &rarr;
              </LinkButton>
            </div>
          </div>

          {/* Featured Cards Grid / Responsive Scroll */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
          <div
            role="group"
            aria-label="Featured menu items"
            tabIndex={0}
            className="overflow-x-auto pb-2 md:overflow-visible md:pb-0"
          >
            <ul className="flex snap-x snap-mandatory gap-6 md:grid md:grid-cols-3">
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

          {/* Craft Guarantee Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/40 text-center">
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface-sunken/40 text-caption font-semibold text-ink-muted">
              <span>🪵</span>
              <span>100% California White Oak</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface-sunken/40 text-caption font-semibold text-ink-muted">
              <span>🥩</span>
              <span>Prime Cuts &amp; House Dry Rub</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface-sunken/40 text-caption font-semibold text-ink-muted">
              <span>🍳</span>
              <span>Breakfast, Lunch &amp; Dinner</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
