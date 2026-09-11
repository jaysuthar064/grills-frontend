'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

/*
 * SiteHeader — 06-COMPONENT-SPEC.md §SiteHeader. The single Client Component in
 * this slice, and only for the scroll-position class: all content is passed in
 * as server-rendered children. Sticky banner landmark; gains a shadow once the
 * page scrolls past 16px.
 *
 * The `transparent`-over-hero variant is a Home concern and not exercised here;
 * the Menu header is always solid.
 */

export interface SiteHeaderProps {
  variant?: 'transparent' | 'solid';
  children: ReactNode;
}

export function SiteHeader({
  variant = 'solid',
  children,
}: SiteHeaderProps): ReactNode {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => {
      setScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const style: CSSProperties = {
    zIndex: 'var(--z-sticky)',
    minHeight: 'var(--header-height)',
  };

  return (
    <header
      data-variant={variant}
      data-scrolled={scrolled}
      className={cn(
        'group sticky top-0 flex items-center border-b transition-all duration-300',
        variant === 'transparent' && !scrolled
          ? 'border-transparent bg-transparent text-ink-inverse'
          : scrolled
            ? 'border-border/30 bg-white/90 shadow-md backdrop-blur-md text-ink'
            : 'border-transparent bg-white text-ink',
      )}
      style={style}
    >
      {children}
    </header>
  );
}
