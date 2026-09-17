import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Text — 06-COMPONENT-SPEC.md §Text. `tone="subtle"` is intentionally absent:
 * --color-ink-subtle is reserved for input placeholders.
 *
 * `overline` is the one size that leaves --font-body: it is already uppercase,
 * which is the only setting Carla Sans can render (the face is unicase — see
 * 05-DESIGN-SYSTEM.md §2.1). Every other size is body text and stays on the
 * body stack.
 */

export interface TextProps {
  as?: 'p' | 'span' | 'div';
  size?: 'body-lg' | 'body' | 'body-sm' | 'caption' | 'overline';
  tone?: 'default' | 'muted' | 'inverse' | 'inverse-muted';
  weight?: 'regular' | 'medium' | 'semibold';
  id?: string;
  className?: string | undefined;
  children: ReactNode;
}

const SIZE = {
  'body-lg': 'font-body text-body-lg',
  body: 'font-body text-body',
  'body-sm': 'font-body text-body-sm',
  caption: 'font-body text-caption',
  overline: 'font-accent text-overline uppercase',
} as const;

const TONE = {
  default: 'text-ink',
  muted: 'text-ink-muted',
  inverse: 'text-ink-inverse',
  'inverse-muted': 'text-ink-inverse-muted',
} as const;

const WEIGHT = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
} as const;

export function Text({
  as = 'p',
  size = 'body',
  tone = 'default',
  weight = 'regular',
  id,
  className,
  children,
}: TextProps): ReactNode {
  const Tag = as;
  return (
    <Tag id={id} className={cn(SIZE[size], TONE[tone], WEIGHT[weight], className)}>
      {children}
    </Tag>
  );
}
