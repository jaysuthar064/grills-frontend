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
import { SCHEDULED_BANDS } from '@/lib/band-schedule';
import { eventsJsonLd } from '@/lib/json-ld';
import { getWpUploadUrl } from '@/lib/media';
import { buildMetadata } from '@/lib/seo';
import type { EventItem } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const events = await getEvents();
  return buildMetadata(events.seo, events._global, '/events');
}

export default async function EventsPage(): Promise<ReactNode> {
  const events = await getEvents();
  const { _global, title, recurring, upcoming, emptyMessage, blocks } = events;

  // Merge CMS events with full live band calendar schedule, avoiding duplicate slugs
  const allEventsMap = new Map<string, EventItem>();
  upcoming.forEach((evt) => allEventsMap.set(evt.slug, evt));
  SCHEDULED_BANDS.forEach((band) => {
    if (!allEventsMap.has(band.slug)) {
      allEventsMap.set(band.slug, band);
    }
  });

  const combinedUpcoming = Array.from(allEventsMap.values()).sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
  );

  return (
    <PageShell global={_global} currentPath="/events">
      {combinedUpcoming.length > 0 ? (
        <JsonLd data={eventsJsonLd(_global, combinedUpcoming)} />
      ) : null}
      <PageHeader
        title={title}
        eyebrow="Live Music & Special Happenings"
        intro="Live music every Friday & Saturday, patio barbecue specials, and community events fairway-side at the 18th hole."
        imageSrc={getWpUploadUrl('IMG_2172.JPG.jpeg')}
      />

      {/* Interactive Month Calendar View with Highlighted Bands & Touch/Hover Photo Popover */}
      <MonthCalendar events={combinedUpcoming} />

      {recurring ? <RecurringProgrammeCard recurring={recurring} /> : null}

      <EventList
        events={combinedUpcoming}
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
