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
import { getBandProfileForEvent } from '@/lib/band-schedule';
import type { EventItem } from '@/types/api';

/*
 * EventCard — Pure typography-led concert & event card without dummy/stock images.
 * Pinned to Pacific date and time formatting.
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
  const profile = getBandProfileForEvent(event);
  const bandImage = event.image || profile?.image;
  const hasPerformer =
    event.performerName !== undefined && event.performerName !== '';

  return (
    <article
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:shadow-md hover:border-brand-primary/40',
        variant === 'list' && 'sm:flex-row sm:items-start sm:gap-6 sm:p-6',
      )}
    >
      {/* Date Pill / Badge */}
      <time
        dateTime={event.startDateTime}
        className={cn(
          'flex shrink-0 flex-col items-center justify-center rounded-xl bg-surface-sunken border border-border px-4 py-3 text-center shadow-xs',
          variant === 'list' && 'w-20 sm:w-24 sm:py-4',
        )}
      >
        <Text as="span" size="overline" tone="muted" weight="semibold">
          {formatEventMonth(event.startDateTime)}
        </Text>
        <span className="font-display text-h3 font-bold text-ink">
          {formatEventDay(event.startDateTime)}
        </span>
      </time>

      {/* Main Details (Band Name, Time, Stage, Summary) */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {hasPerformer ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-0.5 text-[11px] font-bold text-brand-primary border border-brand-primary/20">
              <span>🎸</span>
              <span>{event.performerName}</span>
            </span>
          ) : null}
          {!event.isTicketed ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Free Admission · No Cover
            </span>
          ) : null}
        </div>

        <Heading
          level={headingLevel}
          visualLevel="h4"
          className="text-ink group-hover:text-brand-primary transition-colors font-display"
        >
          {event.title}
        </Heading>

        {event.summary !== '' ? (
          <Text size="body-sm" tone="muted" className="leading-relaxed">
            {event.summary}
          </Text>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2 text-caption text-ink-muted border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <svg
              className="h-4 w-4 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <time dateTime={event.startDateTime} className="font-bold text-ink">
              {formatEventTime(event.startDateTime)}
            </time>
          </div>

          <div className="flex items-center gap-1.5">
            <svg
              className="h-4 w-4 text-brand-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">Fairway Patio Stage (Heated Patio)</span>
          </div>

          {event.isTicketed ? (
            <Badge tone="brand">{ticketLabel(event)}</Badge>
          ) : null}
        </div>
      </div>

      {/* Authentic Band Photo */}
      {bandImage ? (
        <div
          className={cn(
            'relative overflow-hidden rounded-xl bg-surface-sunken border border-border/80 shadow-xs shrink-0',
            variant === 'list'
              ? 'w-full sm:w-44 sm:h-32 h-44 order-first sm:order-last'
              : 'w-full h-40 order-first',
          )}
        >
          <img
            src={bandImage.src}
            alt={bandImage.alt || event.title}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : null}
    </article>
  );
}
