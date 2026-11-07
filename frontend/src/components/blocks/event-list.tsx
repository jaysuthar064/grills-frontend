import type { ReactNode } from 'react';

import { EventCard } from '@/components/blocks/event-card';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import { parsePacificDate } from '@/lib/datetime';
import type { EventItem } from '@/types/api';

/*
 * EventList — the dated upcoming-events listing on /events.
 * Grouped cleanly by month (October, November, December) with distinct section dividers
 * so visitors can easily browse upcoming shows.
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
  // Group events by Month Year (e.g., "October 2026", "November 2026")
  const groups: { monthKey: string; monthTitle: string; events: EventItem[] }[] = [];
  const groupMap = new Map<string, EventItem[]>();

  events.forEach((evt) => {
    const parts = parsePacificDate(evt.startDateTime);
    const monthKey = `${parts.year}-${String(parts.month + 1).padStart(2, '0')}`;
    const existing = groupMap.get(monthKey);
    if (existing) {
      existing.push(evt);
    } else {
      const arr = [evt];
      groupMap.set(monthKey, arr);
      const monthTitle = `${parts.monthName} ${parts.year}`;
      groups.push({ monthKey, monthTitle, events: arr });
    }
  });

  return (
    <Section ariaLabelledBy={HEADING_ID}>
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <span className="text-overline uppercase tracking-widest text-brand-primary font-bold">
                Live Concert Lineup
              </span>
              <Heading level={2} id={HEADING_ID}>
                Upcoming Shows &amp; Dates
              </Heading>
            </div>
            <p className="text-body-sm text-ink-muted">
              {events.length} Live Music Events Scheduled · Heated Fairway Patio
            </p>
          </div>

          {events.length > 0 ? (
            <div className="flex flex-col gap-12">
              {groups.map((group) => (
                <div key={group.monthKey} className="flex flex-col gap-6">
                  {/* Month Divider Header */}
                  <div className="flex items-center gap-3 border-b-2 border-brand-primary/20 pb-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
                      {group.monthTitle}
                    </h3>
                    <span className="rounded-full bg-brand-primary/10 px-3 py-0.5 text-caption font-bold text-brand-primary">
                      {group.events.length} {group.events.length === 1 ? 'Show' : 'Shows'}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-4">
                    {group.events.map((event, index) => (
                      <li key={event.id} id={`event-${event.slug}`} className="scroll-mt-24">
                        <AnimatedReveal delay={Math.min(index * 0.05, 0.3)}>
                          <EventCard event={event} variant="list" headingLevel={3} />
                        </AnimatedReveal>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface-sunken p-6 md:p-8">
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
