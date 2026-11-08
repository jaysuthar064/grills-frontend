'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { getBandProfileForEvent } from '@/lib/band-schedule';
import type { BandProfile } from '@/lib/band-schedule';
import { parsePacificDate } from '@/lib/datetime';
import type { EventItem } from '@/types/api';

export interface MonthCalendarProps {
  events: EventItem[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface ActiveBandPreview {
  evt: EventItem;
  bandName: string;
  genre: string;
  timeStr: string;
  stage: string;
  profile: BandProfile;
  dateStr: string;
  x: number;
  y: number;
  alignRight: boolean;
  showAbove: boolean;
}

export function MonthCalendar({ events }: MonthCalendarProps): ReactNode {
  // Default to November 2026 (active schedule season)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 10 is November (0-indexed)
  const [selectedBandFilter, setSelectedBandFilter] = useState<string>('all');
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

  function handleJumpMonth(monthIndex: number, year = 2026): void {
    setActivePreview(null);
    setCurrentMonth(monthIndex);
    setCurrentYear(year);
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

  // Map dates to events strictly using Pacific calendar parts (immune to visitor timezone shifts)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const eventsByDate = new Map<number, EventItem[]>();
  events.forEach((evt) => {
    const parts = parsePacificDate(evt.startDateTime);
    if (parts.year === currentYear && parts.month === currentMonth) {
      const existing = eventsByDate.get(parts.day) || [];
      eventsByDate.set(parts.day, [...existing, evt]);
    }
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = monthNames[currentMonth] || 'November';

  const handleBandHover = (evt: EventItem, e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const profile = getBandProfileForEvent(evt);
    const bandName = evt.performerName || evt.title.replace(/^Live Music:\s*/i, '');
    const parts = parsePacificDate(evt.startDateTime);
    const dateStr = `${parts.monthName} ${parts.day}, ${parts.year}`;

    const timeStr = '6:00 PM – 9:00 PM';

    const rect = e.currentTarget.getBoundingClientRect();
    const alignRight = rect.left + 350 > window.innerWidth;
    const showAbove = rect.bottom + 360 > window.innerHeight;

    setActivePreview({
      evt,
      bandName,
      genre: profile.genre,
      timeStr,
      stage: 'Fairway Patio Stage (Heated)',
      profile,
      dateStr,
      x: alignRight ? rect.right : rect.left,
      y: showAbove ? rect.top : rect.bottom,
      alignRight,
      showAbove,
    });
  };

  const handleBandLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActivePreview(null);
    }, 300);
  };

  const handlePreviewEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Quick filter buttons data
  const filterOptions = [
    { id: 'all', label: 'All Shows', count: 17, icon: '🎵' },
    { id: 'zaremba', label: 'Zaremba', count: 7, icon: '⚡' },
    { id: 'todd-hines-band', label: 'Todd Hines Band', count: 4, icon: '🤠' },
    { id: 'captain-kori', label: 'Captain Kori', count: 3, icon: '🌊' },
    { id: 'ashwater-saints', label: 'AshWater Saints', count: 1, icon: '🦅' },
  ];

  return (
    <Section tone="surface">
      <Container>
        <AnimatedReveal>
          <div className="flex flex-col gap-6">
            {/* Header & Month Navigation */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-overline uppercase tracking-widest text-brand-primary font-bold">
                    Fall &amp; Winter Live Music Schedule
                  </span>
                </div>
                <Heading level={2} visualLevel="h2">
                  {monthName} {currentYear} Calendar
                </Heading>
                <p className="text-body-sm text-ink-muted mt-1">
                  Live music every Friday &amp; Saturday evening. Tap or hover any band name for showtimes and performance details.
                </p>
              </div>

              {/* Month Quick-Jump & Navigation Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Month Jump Tabs */}
                <div className="inline-flex rounded-xl bg-surface-sunken p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => handleJumpMonth(9, 2026)} // October
                    className={`px-3 py-1.5 rounded-lg text-caption font-bold tracking-wider transition-all cursor-pointer ${
                      currentMonth === 9 && currentYear === 2026
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    Oct
                  </button>
                  <button
                    type="button"
                    onClick={() => handleJumpMonth(10, 2026)} // November
                    className={`px-3 py-1.5 rounded-lg text-caption font-bold tracking-wider transition-all cursor-pointer ${
                      currentMonth === 10 && currentYear === 2026
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    Nov
                  </button>
                  <button
                    type="button"
                    onClick={() => handleJumpMonth(11, 2026)} // December
                    className={`px-3 py-1.5 rounded-lg text-caption font-bold tracking-wider transition-all cursor-pointer ${
                      currentMonth === 11 && currentYear === 2026
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    Dec
                  </button>
                </div>

                {/* Prev / Next Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="px-3 py-1.5 rounded-xl border border-border bg-surface font-bold text-body-sm text-ink hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Previous month"
                    aria-label="Previous month"
                  >
                    ‹ Prev
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="px-3 py-1.5 rounded-xl border border-border bg-surface font-bold text-body-sm text-ink hover:border-brand-primary hover:text-brand-primary transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Next month"
                    aria-label="Next month"
                  >
                    Next ›
                  </button>
                </div>
              </div>
            </div>

            {/* Filter by Performer / Band Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-sunken/60 p-3 rounded-2xl border border-border/80">
              <span className="text-caption uppercase font-bold text-ink-muted tracking-wider px-2">
                Filter by Band:
              </span>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((opt) => {
                  const isActive = selectedBandFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedBandFilter(opt.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-brand-primary text-white border-brand-primary shadow-xs scale-[1.02]'
                          : 'bg-surface text-ink-muted border-border hover:border-ink-muted hover:text-ink'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                      <span
                        className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-surface-sunken text-ink-muted'
                        }`}
                      >
                        {opt.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="w-full overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-2">
              <div className="min-w-[680px] bg-surface-raised rounded-2xl border border-border shadow-xs overflow-hidden">
                {/* Day of Week Header */}
                <div className="grid grid-cols-7 border-b border-border bg-surface-sunken">
                  {DAYS_OF_WEEK.map((day) => {
                    const isWeekend = day === 'Fri' || day === 'Sat';
                    return (
                      <div
                        key={day}
                        className={`py-3 text-center text-body-sm font-bold uppercase tracking-wider ${
                          isWeekend ? 'text-brand-primary bg-brand-primary/5' : 'text-ink'
                        }`}
                      >
                        {day}
                        {isWeekend ? (
                          <span className="block text-[9px] font-semibold text-amber-600">
                            Live Music
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border">
                  {/* Empty cells before month starts */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[105px] p-2 bg-surface-sunken/40" />
                  ))}

                  {/* Days of month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNumber = i + 1;
                    const dayEvents = eventsByDate.get(dayNumber) || [];

                    // Day of week for this specific day
                    const dayOfWeek = new Date(currentYear, currentMonth, dayNumber).getDay();
                    const isFridayOrSaturday = dayOfWeek === 5 || dayOfWeek === 6;

                    return (
                      <div
                        key={dayNumber}
                        className={`min-h-[105px] p-2 flex flex-col gap-1 transition-colors ${
                          isFridayOrSaturday ? 'bg-surface/90 hover:bg-surface-raised' : 'bg-surface/50'
                        }`}
                      >
                        {/* Day Number Header */}
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-body-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                              isFridayOrSaturday
                                ? 'text-brand-primary bg-brand-primary/10 font-black'
                                : 'text-ink'
                            }`}
                          >
                            {dayNumber}
                          </span>
                          {dayEvents.length > 0 ? (
                            <span className="text-[10px] uppercase font-bold text-amber-600 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              {dayEvents.length === 1 ? 'Live Act' : `${dayEvents.length} Acts`}
                            </span>
                          ) : null}
                        </div>

                        {/* Event Pills (Pure Typography - No Dummy Images) */}
                        <div className="flex flex-col gap-1.5 mt-1 overflow-y-auto max-h-[100px]">
                          {dayEvents.map((evt) => {
                            const profile = getBandProfileForEvent(evt);
                            const bandName = evt.performerName || evt.title.replace(/^Live Music:\s*/i, '');

                            // Check filter match
                            const matchesFilter =
                              selectedBandFilter === 'all' || profile.id === selectedBandFilter;

                            const isSelected = selectedBandFilter !== 'all' && matchesFilter;
                            const isDimmed = selectedBandFilter !== 'all' && !matchesFilter;

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
                                className={`group relative block w-full text-left rounded-lg px-2 py-1.5 transition-all duration-200 cursor-pointer shadow-xs border ${
                                  profile.colorClasses.bg
                                } ${profile.colorClasses.border} ${profile.colorClasses.hoverBorder} ${
                                  profile.colorClasses.glow
                                } ${isSelected ? 'ring-2 ring-amber-400 scale-[1.04]' : ''} ${
                                  isDimmed ? 'opacity-30 grayscale' : 'opacity-100 hover:scale-[1.02]'
                                }`}
                                title={`${bandName} — Showtime details`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                                    </span>
                                    <span className={`text-[11px] font-bold truncate ${profile.colorClasses.text}`}>
                                      🎸 {bandName}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400/90 shrink-0">
                                    6 PM
                                  </span>
                                </div>
                              </button>
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

        {/* Floating Concert Info Popover (Clean Typography - Zero Dummy Images) */}
        {activePreview ? (
          <div
            role="dialog"
            aria-label={`${activePreview.bandName} Live Performance Details`}
            onMouseEnter={handlePreviewEnter}
            onMouseLeave={handleBandLeave}
            style={{
              position: 'fixed',
              top: activePreview.showAbove
                ? `${Math.max(10, activePreview.y - 380)}px`
                : `${Math.min(window.innerHeight - 380, activePreview.y + 10)}px`,
              left: activePreview.alignRight
                ? `${Math.max(10, activePreview.x - 340)}px`
                : `${Math.max(10, Math.min(window.innerWidth - 350, activePreview.x))}px`,
              zIndex: 9999,
            }}
            className="w-[330px] rounded-2xl border-2 border-amber-500/80 bg-[#16120e] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-auto p-5 flex flex-col gap-3.5 text-left"
          >
            {/* Authentic Band Photo */}
            {activePreview.profile.image ? (
              <div className="relative -mx-5 -mt-5 h-36 w-[calc(100%+2.5rem)] overflow-hidden bg-black/60">
                <img
                  src={activePreview.profile.image.src}
                  alt={activePreview.profile.image.alt || activePreview.bandName}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#16120e] via-[#16120e]/40 to-transparent" />
                <button
                  type="button"
                  onClick={() => setActivePreview(null)}
                  className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/60 text-white/90 hover:bg-black/90 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer backdrop-blur-xs border border-white/20"
                  title="Close"
                >
                  ✕
                </button>
                <span className="absolute bottom-2 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-xs text-amber-300 border border-amber-500/50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Live Patio Concert
                </span>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Live Patio Concert
                </span>
                <button
                  type="button"
                  onClick={() => setActivePreview(null)}
                  className="h-6 w-6 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Band Name & Date */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                {activePreview.dateStr}
              </span>
              <h4 className="font-display text-xl font-bold text-white leading-tight mt-0.5">
                {activePreview.bandName}
              </h4>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                {activePreview.genre}
              </p>
            </div>

            {/* Timing & Stage Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-amber-400">Showtime</span>
                <span className="font-bold text-white">{activePreview.timeStr}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-amber-400">Stage</span>
                <span className="font-bold text-white">Fairway Patio</span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {activePreview.evt.summary || activePreview.profile.description}
            </p>

            {/* Footer Features */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                ✓ Free Admission
              </span>
              <span className="text-amber-300/90 font-semibold">
                Heated Outdoor Seating
              </span>
            </div>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
