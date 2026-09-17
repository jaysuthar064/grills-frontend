import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import {
  formatCalendarDate,
  formatWallClockTime,
  pacificTodayISODate,
} from '@/lib/datetime';
import type { Hours, HoursException, Weekday } from '@/types/api';

/*
 * HoursTable — 06-COMPONENT-SPEC.md §HoursTable & Client Changes 6b.
 * Renders the weekly opening hours and upcoming holiday & special closures
 * with styled status badges (e.g., Thanksgiving, Christmas, New Year's).
 */

export interface HoursTableProps {
  hours: Hours;
  highlightToday?: boolean;
}

const DAY_LABEL: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

// Standard upcoming holiday schedule per Client Change 6b
const STANDARD_CLOSURES: HoursException[] = [
  {
    date: '2026-11-26',
    label: 'Thanksgiving Day',
    isClosed: true,
  },
  {
    date: '2026-12-24',
    label: 'Christmas Eve',
    isClosed: false,
    opens: '06:00',
    closes: '15:00',
  },
  {
    date: '2026-12-25',
    label: 'Christmas Day',
    isClosed: true,
  },
  {
    date: '2026-12-31',
    label: "New Year's Eve",
    isClosed: false,
    opens: '06:00',
    closes: '18:00',
  },
  {
    date: '2027-01-01',
    label: "New Year's Day",
    isClosed: true,
  },
];

function exceptionHoursLabel(exception: HoursException): string {
  if (exception.isClosed || exception.opens === undefined || exception.closes === undefined) {
    return 'Closed';
  }
  return `Closes Early: ${formatWallClockTime(exception.closes)}`;
}

export function HoursTable({ hours }: HoursTableProps): ReactNode {
  const today = pacificTodayISODate();
  
  // Merge API exceptions with standard holiday schedule, deduplicating by ISO date
  const apiExceptions = hours.exceptions || [];
  const apiDates = new Set(apiExceptions.map((e) => e.date));
  const combinedExceptions = [
    ...apiExceptions,
    ...STANDARD_CLOSURES.filter((closure) => !apiDates.has(closure.date)),
  ];

  const upcomingExceptions = combinedExceptions
    .filter((exception) => exception.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-6">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Opening hours</caption>
        <tbody>
          {hours.regular.map((row) => (
            <tr key={row.day} className="border-b border-border">
              <th
                scope="row"
                className="py-2.5 pr-6 font-body font-medium text-ink"
              >
                {DAY_LABEL[row.day]}
              </th>
              <td className="py-2.5 text-right font-body tabular-nums text-ink-muted font-medium">
                {row.isClosed
                  ? 'Closed'
                  : `${formatWallClockTime(row.opens)} – ${formatWallClockTime(row.closes)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {upcomingExceptions.length > 0 ? (
        <div className="rounded-xl border border-border/80 bg-surface-raised p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-display font-bold text-ink text-body-sm flex items-center gap-1.5">
              <span>📅</span> Holiday & Special Closures
            </span>
            <span className="text-caption text-ink-muted">Upcoming</span>
          </div>

          <ul className="flex flex-col gap-2">
            {upcomingExceptions.map((exception) => (
              <li
                key={exception.date}
                className="flex items-center justify-between text-body-sm py-1 border-b border-border/40 last:border-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="font-medium text-ink">{exception.label}</span>
                  <span className="text-caption text-ink-muted font-mono">
                    {formatCalendarDate(exception.date)}
                  </span>
                </div>
                <span
                  className={cn(
                    'font-semibold text-caption uppercase px-2 py-0.5 rounded tracking-wide shrink-0',
                    exception.isClosed
                      ? 'bg-danger/10 text-danger border border-danger/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  )}
                >
                  {exceptionHoursLabel(exception)}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-caption text-ink-subtle pt-1">
            * Private golf course tournament closures are announced 14 days in advance via social media and patio signage.
          </p>
        </div>
      ) : null}
    </div>
  );
}
