import type { CSSProperties, ReactNode } from 'react';

import {
  BrandWatermark,
  type WatermarkArt,
  type WatermarkPlacement,
} from '@/components/brand/brand-decor';
import { cn } from '@/lib/cn';

/*
 * Section — 06-COMPONENT-SPEC.md §Section. Vertical padding is --section-y
 * (48px mobile / 96px desktop, via the token's media query); `tight` halves it.
 * An unlabelled <section> is prohibited: when it contains a heading, pass
 * `ariaLabelledBy` with that heading's id.
 *
 * `watermark` puts one of the client's supporting brand graphics behind the
 * band as texture. The section becomes the positioning context and clips the
 * overflow, so a watermark can bleed past the edge without adding a horizontal
 * scrollbar. Content is not wrapped in an extra element — it keeps its own
 * stacking above the decoration through `relative` on the children wrapper.
 */

export interface SectionProps {
  tone?: 'surface' | 'sunken' | 'inverse';
  spacing?: 'default' | 'tight' | 'none';
  watermark?: WatermarkArt;
  watermarkPlacement?: WatermarkPlacement;
  id?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
}

const TONE = {
  surface: 'bg-surface-raised text-ink',
  sunken: 'bg-surface text-ink',
  inverse: 'bg-surface-inverse text-ink-inverse',
} as const;

const PADDING_BLOCK = {
  default: 'var(--section-y)',
  tight: 'calc(var(--section-y) / 2)',
  none: '0',
} as const;

export function Section({
  tone = 'surface',
  spacing = 'default',
  watermark,
  watermarkPlacement = 'right',
  id,
  ariaLabelledBy,
  children,
}: SectionProps): ReactNode {
  const style: CSSProperties = { paddingBlock: PADDING_BLOCK[spacing] };
  const decorated = watermark !== undefined;

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(TONE[tone], decorated && 'relative overflow-hidden')}
      style={style}
    >
      {decorated ? (
        <BrandWatermark
          art={watermark}
          placement={watermarkPlacement}
          tone={tone === 'inverse' ? 'inverse' : 'default'}
        />
      ) : null}
      {decorated ? <div className="relative">{children}</div> : children}
    </section>
  );
}
