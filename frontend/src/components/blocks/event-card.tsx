import Link from 'next/link';
import type { ReactNode } from 'react';

import { Badge } from '@/components/primitives/badge';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import { cn } from '@/lib/cn';
import {
  formatEventDay,
  formatEventMonth,
  formatEventTime,
} from '@/lib/datetime';
import type { EventItem } from '@/types/api';

/*
 * EventCard — 06-COMPONENT-SPEC.md §EventCard. <article> > date block > [image]
 * > linked heading > summary > metadata row (time, performer, ticket badge) >
 * LinkButton to the detail page.
 *
 * The title is the only link, wrapped in the heading — no card-wide click
 * target, which would force a duplicate link or a non-semantic clickable div.
 * Dates render in America/Los_Angeles regardless of the visitor's zone, so the
 * server and client agree and the displayed date is factually the event's
 * Pacific date.
 */

export interface EventCardProps {
  event: EventItem;
  variant?: 'list' | 'preview';
  headingLevel?: 2 | 3;
}

function ticketLabel(event: EventItem): string {
  return event.coverCharge !== undefined
    ? `Ticketed · $${String(event.coverCharge)}`
    : 'Ticketed';
}

export function EventCard({
  event,
  variant = 'list',
  headingLevel = 3,
}: EventCardProps): ReactNode {
  const hasPerformer =
    event.performerName !== undefined && event.performerName !== '';

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md',
        variant === 'list' && 'md:flex-row md:items-start md:gap-6 md:p-6',
      )}
    >
      <time
        dateTime={event.startDateTime}
        className={cn(
          'flex shrink-0 flex-col items-center justify-center rounded-lg bg-surface-sunken border border-border px-4 py-3 text-center',
          variant === 'list' && 'md:w-24 md:py-4',
        )}
      >
        <Text as="span" size="overline" tone="muted" weight="semibold">
          {formatEventMonth(event.startDateTime)}
        </Text>
        <span className="font-display text-h3 font-semibold text-ink">
          {formatEventDay(event.startDateTime)}
        </span>
      </time>

      <div className="flex flex-1 flex-col gap-2">
        {event.image?.src ? (
          <div className="relative w-full overflow-hidden rounded-lg max-h-64">
            <Image
              image={event.image}
              fill
              aspectRatio="3/2"
              sizes={
                variant === 'list'
                  ? '(min-width: 768px) 66vw, 100vw'
                  : '(min-width: 1024px) 33vw, 100vw'
              }
            />
          </div>
        ) : null}

        <Heading level={headingLevel} visualLevel="h4">
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </Heading>

        {event.summary !== '' ? (
          <Text size="body-sm" tone="muted">
            {event.summary}
          </Text>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Text as="span" size="body-sm">
            <time dateTime={event.startDateTime}>
              {formatEventTime(event.startDateTime)}
            </time>
          </Text>
          {hasPerformer ? (
            <Text as="span" size="body-sm" tone="muted">
              {event.performerName}
            </Text>
          ) : null}
          {event.isTicketed ? (
            <Badge tone="brand">{ticketLabel(event)}</Badge>
          ) : null}
        </div>

        <div className="pt-1">
          <LinkButton href={`/events/${event.slug}`} variant="ghost" size="sm">
            View details
          </LinkButton>
        </div>
      </div>
    </article>
  );
}
