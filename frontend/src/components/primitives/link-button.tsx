import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

import { Icon } from '@/components/primitives/icons/icon';
import type { IconName } from '@/components/primitives/icons/index';
import { VisuallyHidden } from '@/components/primitives/visually-hidden';
import { cn } from '@/lib/cn';

/*
 * LinkButton — 06-COMPONENT-SPEC.md §LinkButton. Navigation styled as a button.
 * `next/link` for internal hrefs; a plain <a> for tel:/mailto: and external
 * links. External http(s) links open in a new tab with the documented rel and a
 * visually-hidden "(opens in a new tab)" suffix.
 *
 * Note: the spec's exact button heights (36/44/52px) are not expressible in the
 * token spacing scale (which skips steps 9/11/13), so sizes are padding-based
 * and each meets the 44×44 minimum touch target. Reported as a design-system
 * gap.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isExternal?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT = {
  primary:
    'bg-accent text-ink-inverse hover:bg-opacity-90 active:bg-opacity-80',
  secondary:
    'bg-transparent text-inherit border border-current hover:bg-black/10 hover:shadow-inner',
  ghost: 'text-ink hover:bg-surface-sunken',
  danger: 'bg-danger text-ink-inverse',
} as const;

/*
 * Height comes from the control-height token (05-DESIGN-SYSTEM.md §4.5) as
 * min-height — there is no spacing step for 36/44/52px, so no h-* utility. `sm`
 * is 36px (below the 44px touch minimum) and carries `.gotg-hit-target`, which
 * expands its interactive box to 44px without changing the visual height. `md`
 * and `lg` meet 44px by height.
 */
const SIZE = {
  sm: {
    classes: 'px-3 text-label gotg-hit-target',
    height: 'var(--control-height-sm)',
  },
  md: { classes: 'px-5 text-body', height: 'var(--control-height-md)' },
  lg: { classes: 'px-6 text-body-lg', height: 'var(--control-height-lg)' },
} as const;

function isDialHref(href: string): boolean {
  return href.startsWith('tel:') || href.startsWith('mailto:');
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  isExternal = false,
  iconStart,
  iconEnd,
  fullWidth = false,
  children,
}: LinkButtonProps): ReactNode {
  const sizing = SIZE[size];
  const className = cn(
    // whitespace-nowrap: a button label is a single action and never reads as
    // two lines. 'Call 805-842-2947' is the case that forced it — a wrapped
    // phone number looks broken and costs a tap target's worth of height.
    'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold whitespace-nowrap transition-all duration-300 active:translate-y-px hover:scale-[1.03] hover:shadow-lg',
    VARIANT[variant],
    sizing.classes,
    fullWidth && 'w-full',
  );
  const style: CSSProperties = { minHeight: sizing.height };

  const content = (
    <>
      {iconStart ? <Icon name={iconStart} size={20} /> : null}
      {children}
      {iconEnd ? <Icon name={iconEnd} size={20} /> : null}
    </>
  );

  // tel:/mailto: — a plain anchor, never a new tab.
  if (isDialHref(href)) {
    return (
      <a href={href} className={className} style={style}>
        {content}
      </a>
    );
  }

  // External web links open in a new tab, with the documented rel and suffix.
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {content}
        <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style}>
      {content}
    </Link>
  );
}
