import type { ReactNode } from 'react';

/**
 * Root loading state for Next.js App Router route transitions.
 * Follows design-taste-frontend and ui-ux-pro-max:
 * - Brand-aligned warm dark tones with amber glowing pulse
 * - Accessible aria-live status
 * - Subtle layout skeleton preventing layout shifts
 */
export default function Loading(): ReactNode {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen w-full bg-[#141210] text-[#f4f0e8] flex flex-col justify-between"
    >
      <span className="sr-only">Loading Grill on the Green page...</span>

      {/* Top Header Placeholder */}
      <div className="w-full border-b border-white/5 bg-[#1a1714]/60 px-4 py-4 md:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="h-9 w-32 rounded-lg bg-white/5 animate-pulse" />
          <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-16 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-lg bg-white/5 animate-pulse" />
        </div>
      </div>

      {/* Hero / Content Center Indicator */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="relative flex flex-col items-center gap-6">
          {/* Animated Brand Glow Ring */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
            <div className="h-16 w-16 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
            {/* Center Golf Flag Mark Icon */}
            <div className="absolute text-amber-400 text-xl font-bold">
              ⛳
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="font-display text-lg font-bold tracking-wide text-amber-100">
              Grill on the Green
            </span>
            <span className="text-xs uppercase tracking-widest text-amber-400/80 font-semibold animate-pulse">
              Loading Fairway Experience...
            </span>
          </div>

          {/* Shimmer skeleton bar */}
          <div className="mt-4 w-48 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full w-24 rounded-full bg-linear-to-r from-transparent via-amber-400 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Footer Placeholder */}
      <div className="w-full border-t border-white/5 bg-[#110f0e] px-4 py-6 text-center text-xs text-stone-500">
        Simi Hills Golf Course · 5031 Alamo St, Simi Valley, CA
      </div>
    </div>
  );
}

