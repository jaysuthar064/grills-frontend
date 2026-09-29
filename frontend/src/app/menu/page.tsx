import type { Metadata } from 'next';
import { Fragment } from 'react';
import type { ReactNode } from 'react';

import { DietaryLegend } from '@/components/blocks/dietary-legend';
import { MenuSection } from '@/components/blocks/menu-section';
import { PageHeader } from '@/components/blocks/page-header';
import { SectionDivider } from '@/components/brand/brand-decor';
import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';
import { JsonLd } from '@/components/seo/json-ld';
import { getMenu } from '@/lib/api';
import { menuJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const menu = await getMenu();
  return buildMetadata(menu.seo, menu._global, '/menu');
}

/*
 * Menu route — 02-INFORMATION-ARCHITECTURE.md §2.2. One fetch, in this Server
 * Component, through the typed getMenu() helper (CLAUDE.md rule 1). Static + ISR
 * on the `menu` tag / 3600s window, configured in the fetch layer.
 *
 * Block order: header → page intro → menu sections → dietary legend →
 * disclaimer → footer. The daypart filter and section jump-nav (both Client
 * Components) are deferred; the full, unfiltered menu renders and is indexable
 * without them.
 *
 * generateMetadata builds metadata from `menu.seo` (08 §4.2); JsonLd emits the
 * Menu + MenuSection + MenuItem graph (08 §4.5). Not rendered here: menu.blocks
 * (the page-builder blocks are a separate task); it is empty for this content,
 * so nothing is silently dropped.
 */

const SIGNATURE_ITEMS = [
  {
    title: 'Grill on the Green Cheeseburger',
    price: '$14.95',
    tag: 'Patio Favorite',
    image: '/media/burger-patio.jpg',
    description: 'Double smash patty, melted sharp cheddar, house secret sauce, crisp lettuce & tomatoes with golden fries.',
    href: '#sandwiches-burgers',
  },
  {
    title: 'BBQ Chopped Salad',
    price: '$15.95',
    tag: 'Fresh & Crisp',
    image: '/media/bbq-salad.jpg',
    description: 'Tender chicken, sweet roasted corn, black beans, crisp romaine & garden herbs drizzled with smoky BBQ dressing.',
    href: '#bowls-salads-wraps',
  },
  {
    title: 'Nathan’s All Beef Hot Dog',
    price: '$8.95',
    tag: 'The Turn Classic',
    image: '/media/fairway-hotdog.jpg',
    description: 'Quarter-pound all-beef frank in a warm toasted bun with sweet relish, yellow mustard, and ketchup.',
    href: '#appetizers',
  },
  {
    title: 'The Clubhouse Sandwich',
    price: '$15.95',
    tag: 'Skewered Classic',
    image: '/media/club-sandwich.jpg',
    description: 'Triple-decker toasted sourdough with oven-roasted turkey breast, smoked pit ham, bacon, and crisp greens.',
    href: '#sandwiches-burgers',
  },
];

export default async function MenuPage(): Promise<ReactNode> {
  const menu = await getMenu();
  const {
    _global,
    title,
    sections,
    dietaryTags,
    showDietaryLegend,
    disclaimer,
  } = menu;

  const showLegend = showDietaryLegend && dietaryTags.length > 0;

  return (
    <PageShell global={_global} currentPath="/menu">
      <JsonLd data={menuJsonLd(_global, sections)} />
      <PageHeader title={title} />

      {/* Quick Category Navigation & Action Bar */}
      {sections.length > 0 ? (
        <nav aria-label="Menu sections" className="sticky top-[var(--header-height)] z-20 border-y border-border/80 bg-surface/95 backdrop-blur-md py-3 shadow-xs">
          <Container>
            <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
              <ul className="flex items-center gap-2 sm:gap-3 shrink-0">
                {sections.map((section) => (
                  <li key={section.slug}>
                    <a
                      href={`#${section.slug}`}
                      className="inline-flex items-center rounded-full bg-surface-raised px-4 py-1.5 text-body-sm font-semibold text-ink border border-border/60 hover:border-brand-primary hover:text-brand-primary transition-all whitespace-nowrap"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="text-caption font-semibold text-ink-muted">
                  Smoked Daily · 18th Hole
                </span>
              </div>
            </div>
          </Container>
        </nav>
      ) : null}

      {/* Chef's Signature Selections Spotlight */}
      <section className="bg-surface-raised border-b border-border/80 py-10 md:py-14">
        <Container>
          <div className="flex flex-col gap-8">
            <AnimatedReveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-overline uppercase tracking-widest text-brand-primary font-bold">
                    Fairway Favorites · Smoked Daily
                  </span>
                  <Heading level={2} visualLevel="h2">
                    Signature Selections
                  </Heading>
                  <p className="text-body-sm text-ink-muted max-w-xl">
                    Our most-requested kitchen specialties, slow-smoked on-site and served fairway-side.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-caption font-semibold text-brand-primary bg-brand-primary-subtle/30 px-3 py-1 rounded-full border border-brand-primary/20">
                  ★ House Favorites
                </span>
              </div>
            </AnimatedReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SIGNATURE_ITEMS.map((dish, i) => (
                <AnimatedReveal key={dish.title} delay={i * 0.1}>
                  <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-md h-full">
                    <div className="relative aspect-4-3 w-full overflow-hidden bg-surface-sunken">
                      <img
                        src={dish.image}
                        alt={dish.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent backdrop-blur-md border border-accent/20 shadow-xs">
                          {dish.tag}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="rounded-lg bg-surface/95 px-2.5 py-1 text-caption font-bold text-brand-primary shadow-xs backdrop-blur-sm border border-border">
                          {dish.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4 gap-3">
                      <div>
                        <h3 className="font-display font-bold text-ink text-body group-hover:text-brand-primary transition-colors">
                          {dish.title}
                        </h3>
                        <p className="mt-1 text-caption text-ink-muted leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      <a
                        href={dish.href}
                        className="inline-flex items-center text-caption font-semibold text-brand-primary hover:underline gap-1 mt-auto pt-1"
                      >
                        <span>View on menu</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                </AnimatedReveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          {sections.length === 0 ? (
            <Text tone="muted">
              Our menu is being updated. Please call {_global.location.phone}.
            </Text>
          ) : (
            <div className="flex flex-col gap-16">
              {sections.map((section, index) => (
                <Fragment key={section.slug}>
                  {/* A flag divider between sections, never above the first */}
                  {index > 0 ? <SectionDivider /> : null}
                  <MenuSection section={section} activeDaypart="all" />
                </Fragment>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {showLegend ? (
        <Section tone="sunken" ariaLabelledBy="dietary-legend-heading">
          <Container width="narrow">
            <AnimatedReveal>
              <div className="flex flex-col gap-6">
                <Heading level={2} id="dietary-legend-heading">
                  Dietary Information
                </Heading>
                <DietaryLegend tags={dietaryTags} />
              </div>
            </AnimatedReveal>
          </Container>
        </Section>
      ) : null}

      {disclaimer !== '' ? (
        <Section spacing="tight">
          <Container width="narrow">
            <AnimatedReveal>
              <Text size="body-sm" tone="muted">
                {disclaimer}
              </Text>
            </AnimatedReveal>
          </Container>
        </Section>
      ) : null}
    </PageShell>
  );
}
