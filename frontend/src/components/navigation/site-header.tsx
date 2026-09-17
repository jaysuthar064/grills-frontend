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
      setScrolled(window.scrollY > 20);
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

  const isTransparentMode = variant === 'transparent' && !scrolled;

  return (
    <header
      data-variant={variant}
      data-scrolled={scrolled}
      className={cn(
        'group flex items-center transition-all duration-300 w-full',
        variant === 'transparent'
          ? 'fixed top-0 left-0 right-0'
          : 'sticky top-0 border-b border-transparent bg-white text-ink shadow-sm',
        isTransparentMode
          ? 'header-transparent-mode border-b border-transparent bg-transparent text-white'
          : variant === 'transparent'
            ? 'border-b border-border/20 bg-white/95 shadow-md backdrop-blur-md text-ink'
            : '',
      )}
      style={style}
    >
      {children}
    </header>
  );
}
