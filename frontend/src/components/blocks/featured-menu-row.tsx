import type { ReactNode } from 'react';

import { MenuCard } from '@/components/blocks/menu-card';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { slugId } from '@/lib/slug';
import type { FeaturedItemsBlock } from '@/types/api';

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
          {/* Section Header with Clear Menu Label & PDF Button */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-sm uppercase tracking-[0.2em] text-brand-primary font-bold">
                Menu &middot; House Specialties
              </span>
              <AnimatedReveal>
                <Heading level={2} id={headingId} visualLevel="h2" className="text-3xl sm:text-4xl font-display font-bold text-ink">
                  {block.heading && !block.heading.toLowerCase().includes('menu') ? `Our Menu: ${block.heading}` : (block.heading || 'Our Menu')}
                </Heading>
              </AnimatedReveal>
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
                Slow-smoked over seasoned California white oak and seared hot to order.
                Prepared fresh from 4:00 AM daily right at the 18th hole fairway.
              </p>
            </div>

            {/* Clear Action Buttons: View PDF Menu & Explore Interactive Menu */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <LinkButton
                href="/media/grill-on-the-green-menu.pdf"
                variant="primary"
                size="md"
                isExternal
                className="font-bold tracking-wider"
              >
                View PDF Menu
              </LinkButton>
              <LinkButton
                href={block.cta?.href || '/menu'}
                variant="secondary"
                size="md"
                className="hover:border-brand-primary hover:text-brand-primary font-bold tracking-wider shadow-xs"
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
        </div>
      </Container>
    </Section>
  );
}