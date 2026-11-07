import type { ReactNode } from 'react';

export default function EventsLoading(): ReactNode {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen w-full bg-[#141210] text-[#f4f0e8]"
    >
      <span className="sr-only">Loading Live Music & Events Calendar...</span>

      {/* Header Skeleton */}
      <div className="w-full bg-[#1c1815] py-16 px-4 border-b border-white/5">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-3">
          <div className="h-4 w-40 rounded bg-amber-500/20 animate-pulse" />
          <div className="h-10 w-72 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded bg-white/5 animate-pulse" />
        </div>
      </div>

      {/* Calendar Section Skeleton */}
      <div className="mx-auto max-w-6xl px-4 py-12 flex flex-col gap-8">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="h-7 w-48 rounded bg-white/10 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" />
          </div>
        </div>

        {/* Calendar Grid Skeleton */}
        <div className="rounded-2xl border border-white/5 bg-[#181512] p-4 flex flex-col gap-3">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`cal-head-${i}`} className="h-6 rounded bg-white/5 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={`cal-cell-${i}`} className="h-20 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

