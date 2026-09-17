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
                <button
                  type="button"
                  onClick={undefined}
                  className="inline-flex items-center gap-1.5 text-caption font-semibold text-ink-muted hover:text-brand-primary transition-colors cursor-pointer"
                  title="Print friendly menu"
                >
                  <span>🖨️</span> Print Menu
                </button>
              </div>
            </div>
          </Container>
        </nav>
      ) : null}

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
