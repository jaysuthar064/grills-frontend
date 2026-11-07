'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * NavigationProgress
 * 
 * Provides instant (0ms) visual tactile feedback on page navigation across all routes.
 * When a user taps or clicks any link in the header, footer, or buttons, an amber/gold
 * progress bar slides across the top of the browser with a glowing pulse, completely
 * eliminating the "site feels frozen" lag during route transitions.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<'idle' | 'loading' | 'finishing'>('idle');
  const [progress, setProgress] = useState(0);

  // Complete and reset progress bar when route transition finishes
  useEffect(() => {
    if (state === 'loading') {
      setProgress(100);
      setState('finishing');
      const timer = setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks to trigger progress bar instantly
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');

      // Skip external links, hash anchors, mailto, tel, downloads, or new-tab links
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's an internal route that differs from current URL
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          const currentUrl = new URL(window.location.href);
          if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
            // Start progress bar immediately
            setProgress(25);
            setState('loading');
          }
        }
      } catch {
        // invalid URL, ignore
      }
    };

    // Also handle browser forward / back button transitions
    const handlePopState = () => {
      setProgress(35);
      setState('loading');
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Trickle effect while loading
  useEffect(() => {
    if (state !== 'loading') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 70) return prev + 15;
        if (prev < 90) return prev + 4;
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [state]);

  if (state === 'idle') return null;

  return (
    <div
      role="progressbar"
      aria-label="Navigating page"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none bg-black/10 overflow-hidden"
    >
      <div
        className="h-full bg-linear-to-r from-amber-600 via-amber-400 to-amber-300 shadow-[0_0_12px_#f59e0b,0_0_4px_#fbbf24] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: state === 'finishing' ? '200ms' : '150ms',
          opacity: state === 'finishing' ? 0 : 1,
        }}
      />
    </div>
  );
}

