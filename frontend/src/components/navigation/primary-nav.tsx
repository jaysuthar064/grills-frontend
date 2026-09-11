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
      <ul className="flex items-center gap-7">
        {items.map((item) => {
          const active = isActive(item.href, currentPath);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative font-display text-[18px] tracking-[0.05em] text-inherit hover:text-accent uppercase transition-colors pb-1',
                  active ? 'font-bold' : 'font-semibold',
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-[2px] w-full origin-center bg-accent transition-transform duration-300',
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
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
