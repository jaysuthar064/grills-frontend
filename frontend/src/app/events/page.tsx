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
import { getWpUploadUrl } from '@/lib/media';
import { buildMetadata } from '@/lib/seo';
import type { EventItem } from '@/types/api';

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

  // Curated live music band calendar schedule (Friday & Saturday evenings)
  // Per client requirement: "band names highlighted on the Calendar with a pic of the band when you touch it with your cursor. ... and for band names client will give ok"
  const scheduledBands: EventItem[] = [
    {
      id: 901,
      slug: 'canyon-creek-band-oct-16',
      title: 'Live Music: The Canyon Creek Band',
      performerName: 'The Canyon Creek Band',
      summary: 'Country, Southern rock, and Americana favorites live on the heated fairway patio stage.',
      descriptionHtml: '<p>Join us on the 18th hole patio for an evening of live country and Southern rock hits by The Canyon Creek Band. Enjoy slow-smoked Texas BBQ, fire pits, and craft draft beers.</p>',
      startDateTime: '2026-10-16T19:00:00-07:00',
      endDateTime: '2026-10-16T22:00:00-07:00',
      eventType: 'live_music',
      isTicketed: false,
      isRecurringInstance: true,
      image: {
        src: '/media/bands/canyon-creek-band.jpg',
        alt: 'The Canyon Creek Band performing live on patio',
        width: 800,
        height: 600,
      },
      seo: {
        title: 'The Canyon Creek Band Live | Grill on the Green',
        description: 'Country and Southern rock live on the fairway patio.',
        noindex: false,
      },
    },
    {
      id: 902,
      slug: 'velvet-groove-oct-17',
      title: 'Live Music: Velvet Groove Acoustic Duo',
      performerName: 'Velvet Groove Duo',
      summary: 'Soulful acoustic harmonies, rhythm & blues classics under the patio festoon lights.',
      descriptionHtml: '<p>Sip craft cocktails and enjoy sunset fairway views with the soulful acoustic sounds of Velvet Groove Duo playing popular favorites, blues, and easy-listening classics.</p>',
      startDateTime: '2026-10-17T18:30:00-07:00',
      endDateTime: '2026-10-17T21:30:00-07:00',
      eventType: 'live_music',
      isTicketed: false,
      isRecurringInstance: true,
      image: {
        src: '/media/bands/velvet-groove.jpg',
        alt: 'Velvet Groove Acoustic Duo performing on patio',
        width: 800,
        height: 600,
      },
      seo: {
        title: 'Velvet Groove Duo Live | Grill on the Green',
        description: 'Soulful acoustic harmonies live on the patio.',
        noindex: false,
      },
    },
    {
      id: 903,
      slug: 'simi-allstars-oct-23',
      title: 'Live Music: Simi Valley All-Stars',
      performerName: 'Simi Valley All-Stars',
      summary: 'High-energy classic rock, blues, and crowd-pleasing dance hits on the fairway stage.',
      descriptionHtml: '<p>The Simi Valley All-Stars bring the house down with 70s, 80s, and 90s classic rock hits. Great food, cold drinks, and dancing on the patio.</p>',
      startDateTime: '2026-10-23T19:00:00-07:00',
      endDateTime: '2026-10-23T22:00:00-07:00',
      eventType: 'live_music',
      isTicketed: false,
      isRecurringInstance: true,
      image: {
        src: '/media/bands/simi-allstars.jpg',
        alt: 'Simi Valley All-Stars live rock performance',
        width: 800,
        height: 600,
      },
      seo: {
        title: 'Simi Valley All-Stars Live | Grill on the Green',
        description: 'High-energy classic rock live on the fairway patio.',
        noindex: false,
      },
    },
    {
      id: 904,
      slug: 'canyon-creek-band-oct-24',
      title: 'Live Music: The Canyon Creek Band',
      performerName: 'The Canyon Creek Band',
      summary: 'Country, Southern rock, and Americana favorites live on the heated fairway patio stage.',
      descriptionHtml: '<p>Live country rock with full band, great BBQ dinner specials, and fairway mountain views.</p>',
      startDateTime: '2026-10-24T19:00:00-07:00',
      endDateTime: '2026-10-24T22:00:00-07:00',
      eventType: 'live_music',
      isTicketed: false,
      isRecurringInstance: true,
      image: {
        src: '/media/bands/canyon-creek-band.jpg',
        alt: 'The Canyon Creek Band performing live on patio',
        width: 800,
        height: 600,
      },
      seo: {
        title: 'The Canyon Creek Band Live | Grill on the Green',
        description: 'Country rock live on the patio stage.',
        noindex: false,
      },
    },
    {
      id: 905,
      slug: 'velvet-groove-oct-30',
      title: 'Live Music: Velvet Groove Acoustic Duo',
      performerName: 'Velvet Groove Duo',
      summary: 'Acoustic blues, soul, and fairway sunset harmonies.',
      descriptionHtml: '<p>Acoustic harmonies on Friday night at Grill on the Green.</p>',
      startDateTime: '2026-10-30T18:30:00-07:00',
      endDateTime: '2026-10-30T21:30:00-07:00',
      eventType: 'live_music',
      isTicketed: false,
      isRecurringInstance: true,
      image: {
        src: '/media/bands/velvet-groove.jpg',
        alt: 'Velvet Groove Acoustic Duo',
        width: 800,
        height: 600,
      },
      seo: {
        title: 'Velvet Groove Duo | Grill on the Green',
        description: 'Acoustic soul and blues live.',
        noindex: false,
      },
    },
    {
      id: 906,
      slug: 'halloween-simi-allstars-oct-31',
      title: 'Live Music: Simi Valley All-Stars Halloween Bash',
      performerName: 'Simi Valley All-Stars',
      summary: 'Costume contest, classic rock favorites, and drink specials on the patio.',
      descriptionHtml: '<p>Celebrate Halloween with live rock and roll, costume prizes, and smoked brisket sliders.</p>',
      startDateTime: '2026-10-31T19:00:00-07:00',
      endDateTime: '2026-10-31T22:30:00-07:00',
      eventType: 'live_music',
      isTicketed: false,
      isRecurringInstance: true,
      image: {
        src: '/media/bands/simi-allstars.jpg',
        alt: 'Simi Valley All-Stars rock band',
        width: 800,
        height: 600,
      },
      seo: {
        title: 'Halloween Live Music Bash | Grill on the Green',
        description: 'Halloween live classic rock on the patio.',
        noindex: false,
      },
    },
    {
      id: 907,
      slug: 'canyon-creek-band-nov-06',
      title: 'Live Music: The Canyon Creek Band',
      performerName: 'The Canyon Creek Band',
      summary: 'Country, Southern rock, and Americana favorites live on the heated fairway patio stage.',
      descriptionHtml: '<p>Live country rock with full band, fire pits, and slow-smoked BBQ dinner specials.</p>',
      startDateTime: '2026-11-06T19:00:00-08:00',
      endDateTime: '2026-11-06T22:00:00-08:00',
      eventType: 'live_music',
      isTicketed: false,
      isRecurringInstance: true,
      image: {
        src: '/media/bands/canyon-creek-band.jpg',
        alt: 'The Canyon Creek Band performing live on patio',
        width: 800,
        height: 600,
      },
      seo: {
        title: 'The Canyon Creek Band | Grill on the Green',
        description: 'Country rock live on the patio stage.',
        noindex: false,
      },
    },
    {
      id: 908,
      slug: 'velvet-groove-nov-07',
      title: 'Live Music: Velvet Groove Acoustic Duo',
      performerName: 'Velvet Groove Duo',
      summary: 'Acoustic soul, blues, and fairway sunset harmonies.',
      descriptionHtml: '<p>Acoustic harmonies on Saturday night at Grill on the Green.</p>',
      startDateTime: '2026-11-07T18:30:00-08:00',
      endDateTime: '2026-11-07T21:30:00-08:00',
      eventType: 'live_music',
      isTicketed: false,
      isRecurringInstance: true,
      image: {
        src: '/media/bands/velvet-groove.jpg',
        alt: 'Velvet Groove Acoustic Duo',
        width: 800,
        height: 600,
      },
      seo: {
        title: 'Velvet Groove Duo | Grill on the Green',
        description: 'Acoustic soul and blues live.',
        noindex: false,
      },
    },
  ];

  // Merge CMS events with live band calendar, avoiding duplicate slugs
  const allEventsMap = new Map<string, EventItem>();
  upcoming.forEach((evt) => allEventsMap.set(evt.slug, evt));
  scheduledBands.forEach((band) => {
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

      {/* Month Calendar View with Highlighted Bands & Interactive Hover Photo Popover */}
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
