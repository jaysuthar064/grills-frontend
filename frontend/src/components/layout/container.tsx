import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';

/*
 * Container — 06-COMPONENT-SPEC.md §Container. Max-width and the responsive
 * gutter come from tokens that live in tokens.css but are not mapped into the
 * Tailwind @theme (05-DESIGN-SYSTEM.md §8.1), so they are applied as CSS
 * custom-property references — token values, not arbitrary literals. The gutter
 * steps 24px→40px at md on its own via the token's media query.
 */

export interface ContainerProps {
  width?: 'default' | 'narrow' | 'full';
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'nav' | 'main';
  className?: string | undefined;
  children: ReactNode;
}

const MAX_WIDTH = {
  default: 'var(--container-max)',
  narrow: 'var(--container-narrow)',
  full: '100%',
} as const;

export function Container({
  width = 'default',
  as = 'div',
  className,
  children,
}: ContainerProps): ReactNode {
  const Tag = as;
  const style: CSSProperties = {
    maxWidth: MAX_WIDTH[width],
    paddingInline: 'var(--gutter)',
  };

  return (
    <Tag className={cn('mx-auto w-full', className)} style={style}>
      {children}
    </Tag>
  );
}
