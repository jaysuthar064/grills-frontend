'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import type { EventItem } from '@/types/api';

export interface MonthCalendarProps {
  events: EventItem[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthCalendar({ events }: MonthCalendarProps): ReactNode {
  const now = new Date();
  const [currentYear] = useState(now.getFullYear());
  const [currentMonth] = useState(now.getMonth());

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
            <div className="flex items-center gap-2 text-body-sm font-semibold text-ink-muted">
              <span className="inline-block w-3 h-3 rounded-full bg-brand-primary" />
              Special Event Scheduled
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-surface-raised rounded-2xl border border-border shadow-xs overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-7 bg-brand-primary text-white font-bold text-center py-3 text-body-sm tracking-wider uppercase">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 border-t border-border">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[90px] border-b border-r border-border/40 bg-surface/40 p-2"
                />
              ))}

              {/* Month dates */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dayEvents = eventsByDate.get(dayNum) || [];
                const isToday =
                  dayNum === now.getDate() &&
                  currentMonth === now.getMonth() &&
                  currentYear === now.getFullYear();

                return (
                  <div
                    key={dayNum}
                    className={`min-h-[90px] border-b border-r border-border/60 p-2 flex flex-col justify-between transition-colors ${
                      isToday ? 'bg-brand-primary-subtle/30 font-bold' : 'hover:bg-surface/60'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-body-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full ${
                          isToday ? 'bg-brand-primary text-white' : 'text-ink'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    {/* Event badges */}
                    <div className="flex flex-col gap-1 mt-1">
                      {dayEvents.map((evt) => (
                        <a
                          key={evt.id}
                          href={`#event-${evt.slug}`}
                          className="block text-[11px] font-bold text-white bg-brand-primary rounded px-1.5 py-0.5 truncate hover:bg-brand-primary-hover transition-colors"
                          title={evt.title}
                        >
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
      </Container>
    </Section>
  );
}
