'use client';

import { useEffect, useRef, useState } from 'react';
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

interface ActiveBandPreview {
  evt: EventItem;
  bandName: string;
  imageSrc: string;
  genre: string;
  timeStr: string;
  stage: string;
  x: number;
  y: number;
  alignRight: boolean;
  showAbove: boolean;
}

function getBandDetails(evt: EventItem): {
  isBand: boolean;
  bandName: string;
  imageSrc: string;
  genre: string;
  timeStr: string;
  stage: string;
} {
  const isLiveMusic =
    evt.eventType === 'live_music' ||
    Boolean(evt.performerName) ||
    /band|acoustic|groove|trio|duo|all-stars|live music/i.test(evt.title);

  const bandName =
    evt.performerName ||
    evt.title
      .replace(/^Live Music:\s*/i, '')
      .replace(/on the Patio/i, '')
      .trim();

  let imageSrc = '/media/bands/canyon-creek-band.jpg';
  let genre = 'Country, Southern Rock & Americana';

  const lower = (bandName + ' ' + evt.summary).toLowerCase();

  if (evt.image?.src && !evt.image.src.includes('placeholder') && !evt.image.src.includes('og-default')) {
    imageSrc = evt.image.src;
  } else if (lower.includes('velvet') || lower.includes('groove') || lower.includes('acoustic') || lower.includes('soul') || lower.includes('blues')) {
    imageSrc = '/media/bands/velvet-groove.jpg';
    genre = 'Acoustic Soul, Blues & Fairway Harmonies';
  } else if (lower.includes('simi') || lower.includes('all-star') || lower.includes('rock') || lower.includes('bash')) {
    imageSrc = '/media/bands/simi-allstars.jpg';
    genre = 'Classic Rock, Blues & High-Energy Fairway Hits';
  } else if (lower.includes('canyon') || lower.includes('creek') || lower.includes('country')) {
    imageSrc = '/media/bands/canyon-creek-band.jpg';
    genre = 'Country, Southern Rock & Fairway Classics';
  }

  let timeStr = '7:00 PM – 10:00 PM';
  if (evt.startDateTime) {
    try {
      const dStart = new Date(evt.startDateTime);
      const startFormatted = dStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      if (evt.endDateTime) {
        const dEnd = new Date(evt.endDateTime);
        const endFormatted = dEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        timeStr = `${startFormatted} – ${endFormatted}`;
      } else {
        timeStr = startFormatted;
      }
    } catch {
      // keep fallback
    }
  }

  return {
    isBand: isLiveMusic,
    bandName,
    imageSrc,
    genre,
    timeStr,
    stage: 'Fairway Patio Stage',
  };
}

export function MonthCalendar({ events }: MonthCalendarProps): ReactNode {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [activePreview, setActivePreview] = useState<ActiveBandPreview | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handlePrevMonth(): void {
    setActivePreview(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function handleNextMonth(): void {
    setActivePreview(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleToday(): void {
    setActivePreview(null);
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }

  // Close floating popover when clicking outside or pressing Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActivePreview(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Map dates to events
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

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

  const handleBandHover = (evt: EventItem, e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const band = getBandDetails(evt);
    const rect = e.currentTarget.getBoundingClientRect();
    const alignRight = rect.left + 340 > window.innerWidth;
    const showAbove = rect.bottom + 360 > window.innerHeight;

    setActivePreview({
      evt,
      bandName: band.bandName,
      imageSrc: band.imageSrc,
      genre: band.genre,
      timeStr: band.timeStr,
      stage: band.stage,
      x: alignRight ? rect.right : rect.left,
      y: showAbove ? rect.top : rect.bottom,
      alignRight,
      showAbove,
    });
  };

  const handleBandLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActivePreview(null);
    }, 250);
  };

  const handlePreviewEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

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

            {/* Calendar Grid Container */}
            <div className="w-full overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-2">
              <div className="min-w-[620px] bg-surface-raised rounded-2xl border border-border shadow-xs overflow-hidden">
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
                    <div key={`empty-${i}`} className="min-h-[95px] p-2 bg-surface-sunken/40" />
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
                        className={`min-h-[95px] p-2 flex flex-col gap-1 transition-colors ${
                          isToday ? 'bg-brand-primary/5 ring-1 ring-inset ring-brand-primary/40' : 'bg-surface hover:bg-surface-raised'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-body-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                              isToday ? 'bg-brand text-white shadow-xs' : 'text-ink'
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

                        {/* Event Pills */}
                        <div className="flex flex-col gap-1.5 mt-1 overflow-y-auto max-h-[90px]">
                          {dayEvents.map((evt) => {
                            const band = getBandDetails(evt);

                            if (band.isBand) {
                              return (
                                <button
                                  type="button"
                                  key={evt.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleBandHover(evt, e);
                                  }}
                                  onMouseEnter={(e) => handleBandHover(evt, e)}
                                  onMouseLeave={handleBandLeave}
                                  onFocus={(e) => handleBandHover(evt, e)}
                                  onBlur={handleBandLeave}
                                  className="group relative block w-full text-left rounded-md px-2 py-1 transition-all duration-200 cursor-pointer shadow-xs bg-linear-to-r from-[#2a1708] via-[#1a1105] to-[#2a1708] border border-amber-500/70 hover:border-amber-400 hover:shadow-[0_4px_14px_rgba(245,158,11,0.35)] hover:scale-[1.03]"
                                  title={`${band.bandName} — Touch/Hover to preview photo`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                                      </span>
                                      <span className="text-[11px] font-bold text-amber-200 truncate">
                                        🎸 {band.bandName}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400/90 shrink-0">
                                      PIC ↗
                                    </span>
                                  </div>
                                </button>
                              );
                            }

                            return (
                              <a
                                key={evt.id}
                                href={`#event-${evt.slug}`}
                                className="block text-[11px] font-bold text-white bg-[#1c1917] hover:bg-[#292524] rounded-md px-2 py-1 truncate transition-all shadow-xs hover:scale-[1.02]"
                                title={evt.title}
                              >
                                {evt.eventType === 'special_menu' ? '🍽️ ' : '📅 '}
                                {evt.title}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </AnimatedReveal>

        {/* Floating Band Preview Popover (Active on Touch / Cursor Hover) */}
        {activePreview ? (
          <div
            role="dialog"
            aria-label={`${activePreview.bandName} Live Performance Details`}
            onMouseEnter={handlePreviewEnter}
            onMouseLeave={handleBandLeave}
            style={{
              position: 'fixed',
              top: activePreview.showAbove
                ? `${Math.max(10, activePreview.y - 360)}px`
                : `${Math.min(window.innerHeight - 360, activePreview.y + 10)}px`,
              left: activePreview.alignRight
                ? `${Math.max(10, activePreview.x - 330)}px`
                : `${Math.max(10, Math.min(window.innerWidth - 340, activePreview.x))}px`,
              zIndex: 9999,
            }}
            className="w-[320px] rounded-2xl border-2 border-amber-500/80 bg-[#16120e] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-auto"
          >
            {/* Band Image with Overlaid Stage Tag */}
            <div className="relative aspect-4-3 w-full overflow-hidden bg-black/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePreview.imageSrc}
                alt={activePreview.bandName}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              {/* Close Button for touch devices */}
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="absolute top-2.5 right-2.5 z-20 h-7 w-7 rounded-full bg-black/70 text-white hover:bg-black flex items-center justify-center text-xs font-bold border border-white/20 transition-all cursor-pointer"
                title="Close preview"
              >
                ✕
              </button>

              {/* Stage Badge */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                  Live Patio Concert
                </span>
              </div>

              {/* Band name over image bottom */}
              <div className="absolute bottom-2.5 left-3 right-3 z-10">
                <h4 className="font-display text-lg font-bold text-white drop-shadow-md leading-tight">
                  {activePreview.bandName}
                </h4>
                <p className="text-[11px] text-amber-200/90 font-medium">
                  {activePreview.genre}
                </p>
              </div>
            </div>

            {/* Info Body */}
            <div className="p-4 flex flex-col gap-3 text-left">
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-1 border-b border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Showtime</span>
                  <span className="font-bold text-white">{activePreview.timeStr}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Location</span>
                  <span className="font-bold text-white">Fairway Patio Stage</span>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                {activePreview.evt.summary ||
                  'Live music under the festoon lights on our heated fairway patio with slow-smoked BBQ and 16 craft beers on tap.'}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  ✓ Free Patio Admission
                </span>
                <span className="text-[11px] text-amber-300/90 font-medium">
                  Patio Table Seating
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
