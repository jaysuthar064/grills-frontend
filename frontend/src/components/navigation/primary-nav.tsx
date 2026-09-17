import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { LinkObject } from '@/types/api';

/*
 * PrimaryNav — 06-COMPONENT-SPEC.md §PrimaryNav. Horizontal, md and up only.
 * Active item carries aria-current="page", a brand underline, and semibold
 * weight (never colour alone). Active is exact match, or prefix for /events so
 * /events/[slug] keeps Events current.
 */

export interface PrimaryNavProps {
  items: LinkObject[];
  currentPath: string;
}

function isActive(href: string, currentPath: string): boolean {
  if (href === '/events') {
    return currentPath === '/events' || currentPath.startsWith('/events/');
  }
  return currentPath === href;
}

export function PrimaryNav({ items, currentPath }: PrimaryNavProps): ReactNode {
  return (
    <nav aria-label="Primary" className="hidden md:block">
      <ul className="flex items-center gap-1.5 lg:gap-2.5">
        {items.map((item) => {
          const active = isActive(item.href, currentPath);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative inline-flex items-center justify-center px-3.5 py-1.5 rounded-full font-display text-[15px] lg:text-[16px] tracking-[0.06em] uppercase transition-all duration-200 select-none',
                  active
                    ? 'font-bold text-ink group-[.header-transparent-mode]:text-white'
                    : 'font-medium text-ink/75 group-[.header-transparent-mode]:text-white/80 hover:text-ink group-[.header-transparent-mode]:hover:text-white',
                )}
              >
                {/* Frosted Capsule Background on Hover / Active */}
                <span
                  className={cn(
                    'absolute inset-0 rounded-full transition-all duration-300 pointer-events-none',
                    active
                      ? 'bg-black/[0.06] group-[.header-transparent-mode]:bg-white/20 shadow-xs'
                      : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 bg-black/[0.04] group-[.header-transparent-mode]:bg-white/12 backdrop-blur-xs',
                  )}
                />

                {/* Text Label with subtle lift */}
                <span className="relative z-10 transition-transform duration-200 group-hover:-translate-y-[0.5px]">
                  {item.label}
                </span>

                {/* Refined Glowing Accent Pip Underneath */}
                <span
                  className={cn(
                    'absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-300 pointer-events-none',
                    active
                      ? 'w-4 bg-brand-primary group-[.header-transparent-mode]:bg-accent shadow-[0_0_8px_rgba(211,84,0,0.6)] group-[.header-transparent-mode]:shadow-[0_0_10px_rgba(230,175,46,0.9)] opacity-100'
                      : 'w-0 opacity-0 group-hover:w-2.5 group-hover:opacity-80 bg-brand-primary group-[.header-transparent-mode]:bg-accent',
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
