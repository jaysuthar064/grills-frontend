import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

import { Icon } from '@/components/primitives/icons/icon';
import type { IconName } from '@/components/primitives/icons/index';
import { cn } from '@/lib/cn';

/*
 * IconButton — 06-COMPONENT-SPEC.md §IconButton. An icon-only <button> with a
 * required `label` that becomes its accessible name; the glyph is decorative.
 * The touch target is 44×44 at every size (05-DESIGN-SYSTEM.md §4.5), held by
 * min-height/min-width so the visual icon can be smaller.
 */

export interface IconButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'children'
  > {
  icon: IconName;
  label: string;
  variant?: 'solid' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
}

const VARIANT = {
  solid:
    'bg-surface-raised text-ink border border-border-interactive hover:bg-surface-sunken',
  ghost: 'text-inherit hover:bg-surface-sunken',
} as const;

const ICON_SIZE = {
  sm: 20,
  md: 24,
} as const satisfies Record<NonNullable<IconButtonProps['size']>, 20 | 24>;

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}: IconButtonProps): ReactNode {
  // The 44px floor is a control-height token, applied as a minimum in both axes.
  const style: CSSProperties = {
    minHeight: 'var(--control-height-md)',
    minWidth: 'var(--control-height-md)',
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        className,
      )}
      style={style}
      {...rest}
    >
      <Icon name={icon} size={ICON_SIZE[size]} />
    </button>
  );
}
