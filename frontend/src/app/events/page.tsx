import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { EventList } from '@/components/blocks/event-list';
import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { PageHeader } from '@/components/blocks/page-header';
import { RecurringProgrammeCard } from '@/components/blocks/recurring-programme-card';
import { MonthCalendar } from '@/components/events/month-calendar';
import { PageShell } from '@/components/layout/page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { getEvents } from '@/lib/api';
import { eventsJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

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
        imageSrc="http://localhost:8885/wp-content/uploads/2026/08/the-canyon-band.png"
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

      <PageBlockRenderer blocks={blocks} headingLevelOffset={0} />
    </PageShell>
  );
}
