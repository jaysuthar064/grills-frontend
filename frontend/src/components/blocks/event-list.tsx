import type { ReactNode } from 'react';

import { EventCard } from '@/components/blocks/event-card';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import type { EventItem } from '@/types/api';

/*
 * EventList — the dated upcoming-events listing on /events (02-IA §2.3 block 4).
 * The full-width `list` variant of EventCard, one per upcoming event, distinct
 * from the `preview` variant used in the home page's EventsPreview block.
 *
 * The heading stays visible in every state so the section is always a labelled
 * landmark. Ordering is `start_datetime` ascending, guaranteed by the contract
 * (04-API-CONTRACT.md §5.3), so the payload order is rendered as-is.
 *
 * Empty state (the primary one — no upcoming events): the designed panel shows
 * `emptyMessage`. When there is no recurring programme either, it also offers a
 * route to `/contact`, per the contract's empty-state table; when a recurring
 * card is present above, the message alone is the designed state.
 */

export interface EventListProps {
  events: EventItem[];
  emptyMessage: string;
  hasRecurring: boolean;
  contactHref: string;
}

const HEADING_ID = 'upcoming-events-heading';

export function EventList({
  events,
  emptyMessage,
  hasRecurring,
  contactHref,
}: EventListProps): ReactNode {
  return (
    <Section ariaLabelledBy={HEADING_ID}>
      <Container>
        <div className="flex flex-col gap-6">
          <Heading level={2} id={HEADING_ID}>
            Upcoming events
          </Heading>

          {events.length > 0 ? (
            <ul className="flex flex-col gap-8">
              {events.map((event, index) => (
                <li key={event.id} id={`event-${event.slug}`} className="scroll-mt-24">
                  <AnimatedReveal delay={Math.min(index * 0.1, 0.5)}>
                    <EventCard event={event} variant="list" headingLevel={3} />
                  </AnimatedReveal>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-lg border border-border bg-surface-sunken p-6 md:p-8">
              <Text size="body-lg" tone="muted">
                {emptyMessage}
              </Text>
              {hasRecurring ? null : (
                <LinkButton href={contactHref} variant="secondary">
                  Get in touch
                </LinkButton>
              )}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
