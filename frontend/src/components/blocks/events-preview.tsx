'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';

import { EventCard } from '@/components/blocks/event-card';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { slugId } from '@/lib/slug';
import type { EventsPreviewBlock, EventItem } from '@/types/api';

/*
 * EventsPreview — Client Change 1e.
 * Features a dedicated interactive Mini Calendar Snippet (month view with highlighted
 * live music & event dates) alongside the upcoming band schedules.
 */

export interface EventsPreviewProps {
  band?: 'surface' | 'sunken';
  block: EventsPreviewBlock;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function EventsPreview({
  block,
  band = 'surface',
}: EventsPreviewProps): ReactNode {
  if (block.events.length === 0) {
    return null;
  }

  const headingId = slugId('events', block.heading || 'upcoming');

  // Use the date of the first event as default initial month, falling back to current date.
  const initialDate = block.events[0]
    ? new Date(block.events[0].startDateTime)
    : new Date();

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  function handlePrevMonth(): void {
    setSelectedDay(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function handleNextMonth(): void {
    setSelectedDay(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  // Month grid calculations
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map dates to events for current viewed month
  const eventsByDay = new Map<number, EventItem[]>();
  block.events.forEach((evt) => {
    const d = new Date(evt.startDateTime);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const day = d.getDate();
      const existing = eventsByDay.get(day) || [];
      eventsByDay.set(day, [...existing, evt]);
    }
  });

  const monthLabel = new Date(currentYear, currentMonth, 1).toLocaleString('en-US', {
    month: 'long',
  });

  // Filter events if a specific day is clicked, otherwise show all events for this month or full lineup
  const monthEvents = block.events.filter((evt) => {
    const d = new Date(evt.startDateTime);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const displayedEvents =
    selectedDay !== null && eventsByDay.has(selectedDay)
      ? (eventsByDay.get(selectedDay) ?? block.events)
      : monthEvents.length > 0
        ? monthEvents
        : block.events;

  return (
    <Section
      tone={band}
      ariaLabelledBy={headingId}
      watermark="flag"
    >
      <Container>
        <div className="flex flex-col gap-8">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <span className="text-overline uppercase tracking-widest text-brand-primary font-bold">
                Live Music &amp; Entertainment
              </span>
              <Heading level={2} id={headingId} visualLevel="h2">
                {block.heading || "What's On at the Green"}
              </Heading>
            </div>
            <div>
              <LinkButton
                href="/events"
                variant="secondary"
                size="md"
                className="hover:border-brand-primary hover:text-brand-primary"
              >
                {block.cta?.label || 'View Full Events Calendar'}
              </LinkButton>
            </div>
          </div>

          {/* Main 2-Column Content: Mini Calendar Snippet (Left) + Upcoming Lineup (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Mini Calendar Snippet Widget */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <AnimatedReveal delay={0.1}>
                <div className="rounded-2xl border border-border/80 bg-surface-raised p-6 shadow-md transition-shadow hover:shadow-lg">
                  {/* Calendar Widget Top */}
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-base">
                        📅
                      </span>
                      <div>
                        <h3 className="font-display text-h4 font-bold text-ink leading-tight">
                          {monthLabel} {currentYear}
                        </h3>
                        <p className="text-caption text-ink-muted">
                          Upcoming band &amp; event schedule
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {selectedDay !== null ? (
                        <button
                          type="button"
                          onClick={() => setSelectedDay(null)}
                          className="text-caption font-semibold text-brand-primary hover:underline cursor-pointer mr-2"
                        >
                          Show all
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface font-bold text-ink hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
                        aria-label="Previous month"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface font-bold text-ink hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
                        aria-label="Next month"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  {/* Day Headers (Su, Mo, Tu, We, Th, Fr, Sa) */}
                  <div className="grid grid-cols-7 pt-4 pb-2 text-center text-[12px] font-bold text-ink-muted uppercase tracking-wider">
                    {DAYS_OF_WEEK.map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  {/* Mini Calendar Day Cells */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-body-sm">
                    {/* Empty pad cells */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`pad-${i}`} className="h-9 w-full" />
                    ))}

                    {/* Month Days */}
                    {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                      const dayNumber = i + 1;
                      const hasEvent = eventsByDay.has(dayNumber);
                      const isSelected = selectedDay === dayNumber;

                      return (
                        <button
                          key={dayNumber}
                          type="button"
                          disabled={!hasEvent}
                          onClick={() => setSelectedDay(isSelected ? null : dayNumber)}
                          className={`relative flex h-9 w-full items-center justify-center rounded-lg font-medium transition-all ${
                            isSelected
                              ? 'bg-brand-primary text-white font-bold shadow-md scale-105'
                              : hasEvent
                                ? 'bg-accent/20 text-ink font-bold border border-accent hover:bg-accent/30 hover:scale-105 cursor-pointer'
                                : 'text-ink-muted/50 cursor-default'
                          }`}
                          aria-label={`${monthLabel} ${dayNumber}${hasEvent ? ' (Event scheduled)' : ''}`}
                        >
                          {dayNumber}
                          {hasEvent && !isSelected ? (
                            <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-accent" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Music Timing Banner */}
                  <div className="mt-5 pt-4 border-t border-border flex items-center gap-3 bg-brand-primary-subtle/30 -mx-6 -mb-6 p-4 rounded-b-2xl">
                    <span className="text-xl">🎸</span>
                    <div className="text-caption">
                      <strong className="block text-ink font-semibold">Live Music Schedule:</strong>
                      <span className="text-ink-muted">Friday &amp; Saturday nights at 7:00 PM</span>
                    </div>
                  </div>
                </div>
              </AnimatedReveal>
            </div>

            {/* Right Column: Upcoming Band / Event Cards */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-caption font-bold text-ink-muted uppercase tracking-wider">
                  {selectedDay !== null
                    ? `Events for ${monthLabel} ${selectedDay}`
                    : `Upcoming Schedule (${block.events.length})`}
                </span>
                <Link
                  href="/events"
                  className="text-caption font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
                >
                  Full calendar &amp; tickets &rarr;
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {displayedEvents.map((event, index) => (
                  <AnimatedReveal key={event.id} delay={Math.min(index * 0.1, 0.4)}>
                    <EventCard
                      event={event}
                      variant="list"
                      headingLevel={3}
                    />
                  </AnimatedReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
