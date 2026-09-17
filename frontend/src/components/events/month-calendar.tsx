'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import type { EventItem } from '@/types/api';

export interface MonthCalendarProps {
  events: EventItem[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthCalendar({ events }: MonthCalendarProps): ReactNode {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  function handlePrevMonth(): void {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function handleNextMonth(): void {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleToday(): void {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }

  // Get total days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map dates to events
  const eventsByDate = new Map<number, EventItem[]>();
  events.forEach((evt) => {
    const d = new Date(evt.startDateTime);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const dateNum = d.getDate();
      const existing = eventsByDate.get(dateNum) || [];
      eventsByDate.set(dateNum, [...existing, evt]);
    }
  });

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', {
    month: 'long',
  });

  return (
    <Section tone="surface">
      <Container>
        <AnimatedReveal>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <span className="text-overline uppercase tracking-widest text-brand-primary font-bold">
                  Schedule at a Glance
                </span>
                <Heading level={2} visualLevel="h2">
                  {monthName} {currentYear} Calendar
                </Heading>
              </div>

              {/* Month Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface-raised font-bold text-body-sm text-ink hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Previous month"
                >
                  ‹ Prev
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface-raised font-semibold text-caption uppercase tracking-wider text-ink-muted hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Current month"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="px-3 py-1.5 rounded-lg border border-border bg-surface-raised font-bold text-body-sm text-ink hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Next month"
                >
                  Next ›
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-surface-raised rounded-2xl border border-border shadow-xs overflow-hidden">
              {/* Day of Week Header */}
              <div className="grid grid-cols-7 border-b border-border bg-surface-sunken">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-body-sm font-bold text-ink uppercase tracking-wider"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border">
                {/* Empty cells before month starts */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] p-2 bg-surface-sunken/40" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNumber = i + 1;
                  const dayEvents = eventsByDate.get(dayNumber) || [];
                  const isToday =
                    now.getDate() === dayNumber &&
                    now.getMonth() === currentMonth &&
                    now.getFullYear() === currentYear;

                  return (
                    <div
                      key={dayNumber}
                      className={`min-h-[90px] p-2 flex flex-col gap-1 transition-colors ${
                        isToday ? 'bg-brand-primary/5' : 'bg-surface hover:bg-surface-raised'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-body-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-brand text-white'
                              : 'text-ink'
                          }`}
                        >
                          {dayNumber}
                        </span>
                        {dayEvents.length > 0 ? (
                          <span className="text-[10px] uppercase font-bold text-accent">
                            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                          </span>
                        ) : null}
                      </div>

                      {/* Event pills - high contrast solid badges with visible white text */}
                      <div className="flex flex-col gap-1.5 mt-1 overflow-y-auto max-h-[85px]">
                        {dayEvents.map((evt) => (
                          <a
                            key={evt.id}
                            href={`#event-${evt.slug}`}
                            className="block text-[11px] font-bold text-white bg-[#1c1917] hover:bg-[#292524] rounded-md px-2 py-1 truncate transition-all shadow-xs hover:scale-[1.02]"
                            title={evt.title}
                          >
                            {evt.eventType === 'live_music' ? '🎸 ' : evt.eventType === 'special_menu' ? '🍽️ ' : '📅 '}
                            {evt.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </AnimatedReveal>
      </Container>
    </Section>
  );
}
