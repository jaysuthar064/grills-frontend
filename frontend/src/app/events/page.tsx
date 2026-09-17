import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { EventList } from '@/components/blocks/event-list';
import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { PageHeader } from '@/components/blocks/page-header';
import { RecurringProgrammeCard } from '@/components/blocks/recurring-programme-card';
import { MonthCalendar } from '@/components/events/month-calendar';
import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { JsonLd } from '@/components/seo/json-ld';
import { getEvents } from '@/lib/api';
import { eventsJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const events = await getEvents();
  return buildMetadata(events.seo, events._global, '/events');
}

/*
 * Events route — 02-INFORMATION-ARCHITECTURE.md §2.3. One fetch, in this Server
 * Component, through the typed getEvents() helper (CLAUDE.md rule 1). Static +
 * ISR on the `events` tag / 900s window, configured in the fetch layer.
 *
 * Block order (02-IA §2.3): PageHeader → RecurringProgrammeCard (when present)
 * → upcoming EventList → any page-builder blocks. Past and private events are
 * excluded server-side (04-API-CONTRACT §5.3), so the route renders exactly
 * what `upcoming` provides, in the contract's start-ascending order.
 *
 * Heading outline: PageHeader owns the page <h1>; RecurringProgrammeCard and
 * EventList are each <h2>; event titles are <h3>. `headingLevelOffset={0}` keeps
 * any page blocks' top headings at <h2> under the same <h1>.
 *
 * generateMetadata builds metadata from `events.seo` (08 §4.2); JsonLd emits an
 * Event graph, one node per upcoming event (08 §4.5), skipped when there are
 * none. The /events/[slug] detail route (and its BreadcrumbList) is a separate
 * task. events.blocks is empty for this content — nothing is silently dropped.
 */

export default async function EventsPage(): Promise<ReactNode> {
  const events = await getEvents();
  const { _global, title, recurring, upcoming, emptyMessage, blocks } = events;

  return (
    <PageShell global={_global} currentPath="/events">
      {upcoming.length > 0 ? (
        <JsonLd data={eventsJsonLd(_global, upcoming)} />
      ) : null}
      <PageHeader
        title={title}
        eyebrow="Live Music & Special Happenings"
        intro="Live music every Friday & Saturday, patio barbecue specials, and community events fairway-side at the 18th hole."
        imageSrc="http://localhost:8885/wp-content/uploads/2026/09/IMG_2172.JPG.jpeg"
      />

      {/* Month Calendar View (Wood Ranch client requirement) */}
      <MonthCalendar events={upcoming} />

      {recurring ? <RecurringProgrammeCard recurring={recurring} /> : null}

      <EventList
        events={upcoming}
        emptyMessage={emptyMessage}
        hasRecurring={recurring !== null}
        contactHref="/contact"
      />

      {/* Musician & Band Booking Banner (Client Change 6d) */}
      <section className="border-t border-border bg-surface-raised py-12 md:py-16">
        <Container width="narrow">
          <AnimatedReveal>
            <div className="rounded-2xl border-2 border-brand-primary/40 bg-surface p-8 shadow-sm text-center flex flex-col items-center gap-4">
              <span className="text-overline uppercase tracking-widest text-brand-primary font-bold">
                Musicians & Performers
              </span>
              <Heading level={2} visualLevel="h2">
                Want to Play at Grill on the Green?
              </Heading>
              <p className="text-body text-ink-muted max-w-lg leading-relaxed">
                We host live music on our fairway patio every Friday and Saturday evening from 7:00 PM to 10:00 PM. We are always looking for great acoustic acts, country duos, and classic rock bands.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <LinkButton
                  href="mailto:music@grillonthegreen.com?subject=Live%20Music%20Booking%20Inquiry%20-%20Grill%20on%20the%20Green"
                  variant="primary"
                  size="md"
                  isExternal
                >
                  Contact Emily for Booking
                </LinkButton>
                <LinkButton href="/contact#contact-form-section" variant="secondary" size="md">
                  Send Booking Message
                </LinkButton>
              </div>
            </div>
          </AnimatedReveal>
        </Container>
      </section>

      <PageBlockRenderer blocks={blocks} headingLevelOffset={0} />
    </PageShell>
  );
}
