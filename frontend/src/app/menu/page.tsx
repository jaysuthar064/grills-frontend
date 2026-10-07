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
import { LinkButton } from '@/components/primitives/link-button';
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
      <PageHeader
        title={title || 'Our Menu'}
        eyebrow="Smoked Daily · 18th Hole"
        intro="Prepared fresh from 4:00 AM daily right at the Simi Hills Golf Course fairway."
      />

      {/* Prominent PDF Option Banner */}
      <section className="bg-surface-raised border-b border-border py-6 sm:py-8">
        <Container>
          <AnimatedReveal>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 sm:p-6 rounded-2xl bg-surface border border-border/80 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary-subtle/40 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 text-xl font-bold">
                  PDF
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="font-display font-bold text-ink text-lg sm:text-xl">
                    View Complete One-Page PDF Menu
                  </h2>
                  <p className="text-body-sm text-ink-muted">
                    Prefer our classic printed paper menu? Open or download the complete menu directly on your phone.
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <LinkButton
                  href="/media/grill-on-the-green-menu.pdf"
                  variant="primary"
                  size="md"
                  isExternal
                  className="font-bold tracking-wider w-full sm:w-auto text-center shadow-xs"
                >
                  Open PDF Menu &rarr;
                </LinkButton>
              </div>
            </div>
          </AnimatedReveal>
        </Container>
      </section>

      {/* Quick Category Navigation & Action Bar with sticky PDF Button */}
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
              <div className="flex items-center gap-3 shrink-0">
                <LinkButton
                  href="/media/grill-on-the-green-menu.pdf"
                  variant="primary"
                  size="sm"
                  isExternal
                  className="font-bold tracking-wider whitespace-nowrap shadow-xs"
                >
                  View PDF Menu
                </LinkButton>
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

              {/* Bottom PDF CTA banner */}
              <div className="mt-8 p-6 rounded-2xl bg-surface-raised border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                  <h3 className="font-display font-bold text-ink text-lg">
                    Need a printable copy of the menu?
                  </h3>
                  <p className="text-body-sm text-ink-muted">
                    Download the high-resolution menu PDF to keep on your device.
                  </p>
                </div>
                <LinkButton
                  href="/media/grill-on-the-green-menu.pdf"
                  variant="secondary"
                  size="md"
                  isExternal
                  className="font-bold shrink-0 hover:border-brand-primary hover:text-brand-primary"
                >
                  Download Menu PDF
                </LinkButton>
              </div>
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
              <Text size="body-sm" tone="muted" className="italic text-center">
                {disclaimer}
              </Text>
            </AnimatedReveal>
          </Container>
        </Section>
      ) : null}
    </PageShell>
  );
}
