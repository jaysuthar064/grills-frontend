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
import { getBandProfileForEvent, SCHEDULED_BANDS } from '@/lib/band-schedule';
import { eventsJsonLd } from '@/lib/json-ld';
import { getWpUploadUrl } from '@/lib/media';
import { buildMetadata } from '@/lib/seo';
import type { EventItem } from '@/types/api';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const events = await getEvents();
  return buildMetadata(events.seo, events._global, '/events');
}

export default async function EventsPage(): Promise<ReactNode> {
  const events = await getEvents();
  const { _global, title, recurring, upcoming, emptyMessage, blocks } = events;

  // Merge CMS events with full live band calendar schedule, attaching authentic band photography
  const allEventsMap = new Map<string, EventItem>();
  upcoming.forEach((evt) => {
    allEventsMap.set(evt.slug, {
      ...evt,
      image: evt.image || getBandProfileForEvent(evt).image,
    });
  });
  // Client band schedule is authoritative with attached authentic band photos
  SCHEDULED_BANDS.forEach((band) => {
    allEventsMap.set(band.slug, band);
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
                We host live music on our fairway patio every Friday and Saturday evening from 6:00 PM to 9:00 PM. We are always looking for great acoustic acts, country duos, and classic rock bands.
              </p>
              {/* Booking Coordinator Contact Card */}
              <div className="w-full max-w-lg rounded-2xl bg-surface-raised border border-border/80 p-5 my-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary block">
                    Music &amp; Performance Booking Coordinator
                  </span>
                  <span className="font-display font-bold text-ink text-h4 block mt-0.5">
                    Emily Leonard
                  </span>
                  <a
                    href="mailto:bbq101catering@yahoo.com?subject=Live%20Music%20Booking%20Inquiry%20-%20Grill%20on%20the%20Green"
                    className="text-body-sm font-semibold text-brand-primary hover:underline inline-flex items-center gap-1.5 mt-1"
                  >
                    <span>✉</span>
                    <span>bbq101catering@yahoo.com</span>
                  </a>
                </div>
                <div className="shrink-0">
                  <a
                    href="tel:8058422947"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-ink text-body-sm font-bold hover:border-brand-primary hover:text-brand-primary transition-all hover:scale-[1.02]"
                  >
                    <span>📞</span>
                    <span>805-842-2947</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <LinkButton
                  href="mailto:bbq101catering@yahoo.com?subject=Live%20Music%20Booking%20Inquiry%20-%20Grill%20on%20the%20Green"
                  variant="primary"
                  size="md"
                  isExternal
                >
                  Email Emily: bbq101catering@yahoo.com
                </LinkButton>
                <LinkButton href="/contact#booking-form" variant="secondary" size="md">
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
