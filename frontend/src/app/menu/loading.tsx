import type { ReactNode } from 'react';

export default function MenuLoading(): ReactNode {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen w-full bg-[#141210] text-[#f4f0e8]"
    >
      <span className="sr-only">Loading Menu...</span>

      {/* Hero Header Skeleton */}
      <div className="w-full bg-[#1c1815] py-16 px-4 border-b border-white/5">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-3">
          <div className="h-4 w-32 rounded bg-amber-500/20 animate-pulse" />
          <div className="h-10 w-64 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-80 rounded bg-white/5 animate-pulse" />
        </div>
      </div>

      {/* Menu Categories Skeleton */}
      <div className="mx-auto max-w-5xl px-4 py-12 flex flex-col gap-12">
        <div className="flex gap-3 overflow-x-auto pb-2 border-b border-white/5">
          <div className="h-9 w-24 rounded-full bg-amber-500/20 animate-pulse shrink-0" />
          <div className="h-9 w-24 rounded-full bg-white/5 animate-pulse shrink-0" />
          <div className="h-9 w-28 rounded-full bg-white/5 animate-pulse shrink-0" />
          <div className="h-9 w-24 rounded-full bg-white/5 animate-pulse shrink-0" />
          <div className="h-9 w-32 rounded-full bg-white/5 animate-pulse shrink-0" />
        </div>

        {/* Menu Items Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`menu-skel-${i}`}
              className="flex gap-4 p-4 rounded-xl border border-white/5 bg-[#1a1714]/60"
            >
              <div className="h-20 w-20 rounded-lg bg-white/5 animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-36 rounded bg-white/10 animate-pulse" />
                  <div className="h-5 w-12 rounded bg-amber-500/20 animate-pulse" />
                </div>
                <div className="h-3.5 w-full rounded bg-white/5 animate-pulse" />
                <div className="h-3.5 w-2/3 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

