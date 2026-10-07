'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { LinkObject } from '@/types/api';

/*
 * PrimaryNav — Floating sliding pill indicator with smooth micro-transitions.
 * Glides seamlessly between links on hover and returns to the active page on leave.
 */

export interface PrimaryNavProps {
  items: LinkObject[];
  currentPath: string;
}

function checkIsActive(href: string, path: string): boolean {
  if (href === '/events') {
    return path === '/events' || path.startsWith('/events/');
  }
  return path === href;
}

export function PrimaryNav({ items, currentPath }: PrimaryNavProps): ReactNode {
  const pathname = usePathname() || currentPath;
  const navRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
    opacity: number;
    ready: boolean;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
    ready: false,
  });

  const activeHref = items.find((item) => checkIsActive(item.href, pathname))?.href ?? null;

  const updateIndicatorToHref = useCallback((targetHref: string | null, smooth = true) => {
    if (!targetHref) {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const targetEl = itemRefs.current.get(targetHref);
    const parentEl = navRef.current;

    if (targetEl && parentEl) {
      const parentRect = parentEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      setIndicator({
        left: targetRect.left - parentRect.left,
        width: targetRect.width,
        opacity: 1,
        ready: smooth,
      });
    }
  }, []);

  // Position indicator at active route on mount and when pathname changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateIndicatorToHref(activeHref, false);
      // Enable smooth transitions after initial paint
      setTimeout(() => {
        setIndicator((prev) => ({ ...prev, ready: true }));
      }, 50);
    }, 20);

    return () => clearTimeout(timer);
  }, [activeHref, updateIndicatorToHref]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      updateIndicatorToHref(hoveredHref || activeHref, false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hoveredHref, activeHref, updateIndicatorToHref]);

  const handleMouseEnter = (href: string) => {
    setHoveredHref(href);
    updateIndicatorToHref(href, true);
  };

  const handleMouseLeave = () => {
    setHoveredHref(null);
    if (activeHref) {
      updateIndicatorToHref(activeHref, true);
    } else {
      setIndicator((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul
        ref={navRef}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center gap-1 lg:gap-2 p-1"
      >
        {/* Floating Gliding Capsule Indicator */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 h-[34px] rounded-full z-0',
            indicator.ready ? 'transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]' : '',
          )}
          style={{
            left: `${indicator.left}px`,
            width: `${indicator.width}px`,
            opacity: indicator.opacity,
          }}
        >
          {/* Frosted Glass Pill */}
          <div className="h-full w-full rounded-full bg-black/[0.06] group-[.header-transparent-mode]:bg-white/20 backdrop-blur-xs shadow-xs border border-black/[0.03] group-[.header-transparent-mode]:border-white/20" />

          {/* Glowing Center Accent Pip Underneath */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] w-3.5 rounded-full bg-brand-primary group-[.header-transparent-mode]:bg-white shadow-xs" />
        </div>

        {items.map((item) => {
          const active = checkIsActive(item.href, pathname);
          const isCurrentHover = hoveredHref === item.href;
          const isHighlighted = isCurrentHover || (hoveredHref === null && active);

          return (
            <li
              key={item.href}
              ref={(el) => {
                if (el) {
                  itemRefs.current.set(item.href, el);
                } else {
                  itemRefs.current.delete(item.href);
                }
              }}
              onMouseEnter={() => handleMouseEnter(item.href)}
              className="relative"
            >
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative z-10 inline-flex items-center justify-center px-3.5 py-1.5 rounded-full font-display text-[15px] lg:text-[16px] tracking-[0.05em] uppercase transition-colors duration-200 select-none',
                  isHighlighted
                    ? 'font-bold text-ink group-[.header-transparent-mode]:text-white'
                    : 'font-medium text-ink/70 group-[.header-transparent-mode]:text-white/75 hover:text-ink group-[.header-transparent-mode]:hover:text-white',
                )}
              >
                <span className="transition-transform duration-200">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
