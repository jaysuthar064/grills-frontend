import type { ReactNode } from 'react';

import { Badge } from '@/components/primitives/badge';
import { Heading } from '@/components/primitives/heading';
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
 * > heading > summary > metadata row (time, performer, ticket badge).
 *
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
        'group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:shadow-md hover:border-brand-primary/40',
        variant === 'list' && 'md:flex-row md:items-start md:gap-6 md:p-6',
      )}
    >
      <div className="flex items-center gap-3 md:flex-col md:items-center">
        <time
          dateTime={event.startDateTime}
          className={cn(
            'flex shrink-0 flex-col items-center justify-center rounded-xl bg-surface-sunken border border-border px-4 py-3 text-center shadow-xs',
            variant === 'list' && 'w-20 md:w-24 md:py-4',
          )}
        >
          <Text as="span" size="overline" tone="muted" weight="semibold">
            {formatEventMonth(event.startDateTime)}
          </Text>
          <span className="font-display text-h3 font-semibold text-ink">
            {formatEventDay(event.startDateTime)}
          </span>
        </time>

        {/* Band/Event Image (visible on mobile next to date, or desktop) */}
        {event.image?.src ? (
          <div className="relative shrink-0 overflow-hidden rounded-xl bg-surface-sunken border border-border/80 h-16 w-20 md:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image.src}
              alt={event.image.alt || event.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>

      {/* Desktop Band Image */}
      {event.image?.src && variant === 'list' ? (
        <div className="hidden md:block relative shrink-0 overflow-hidden rounded-xl bg-surface-sunken border border-border/80 h-28 w-36 shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image.src}
            alt={event.image.alt || event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <span className="absolute bottom-1.5 left-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
            Patio Stage
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {hasPerformer ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary">
              🎸 {event.performerName}
            </span>
          ) : null}
          {!event.isTicketed ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Free Admission
            </span>
          ) : null}
        </div>

        <Heading level={headingLevel} visualLevel="h4" className="text-ink group-hover:text-brand-primary transition-colors">
          {event.title}
        </Heading>

        {event.summary !== '' ? (
          <Text size="body-sm" tone="muted" className="line-clamp-2">
            {event.summary}
          </Text>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-caption text-ink-muted">
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <time dateTime={event.startDateTime} className="font-semibold text-ink">
              {formatEventTime(event.startDateTime)}
            </time>
          </div>

          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Heated Fairway Patio</span>
          </div>

          {event.isTicketed ? (
            <Badge tone="brand">{ticketLabel(event)}</Badge>
          ) : null}
        </div>
      </div>
    </article>
  );
}
