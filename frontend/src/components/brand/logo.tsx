import NextImage from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

import flagMark from '../../../public/brand/flag-mark.png';
import logoHorizontal from '../../../public/brand/logo-horizontal.png';
import logoMonoGreen from '../../../public/brand/logo-mono-green.png';
import logoReverse from '../../../public/brand/logo-reverse.png';
import logoStackedReverse from '../../../public/brand/logo-stacked-reverse.png';
import logoStacked from '../../../public/brand/logo-stacked.png';

/*
 * Logo — 06-COMPONENT-SPEC.md §Logo.
 *
 * This is the second and only other place `next/image` is used directly; the
 * Image primitive is typed to the CMS `ImageObject` contract, and these are
 * build-time static assets with no CMS record. Static imports give Next the
 * intrinsic dimensions at compile time, so the reserved box is exact and the
 * logo cannot shift the header as it decodes.
 *
 * | variant          | Asset                     | Ground it is built for |
 * | primary          | logo-horizontal.png       | cream / white          |
 * | reverse          | logo-reverse.png          | brand green            |
 * | mono             | logo-mono-green.png       | cream / white, quiet   |
 * | stacked          | logo-stacked.png          | cream / white          |
 * | stacked-reverse  | logo-stacked-reverse.png  | brand green            |
 * | mark             | flag-mark.png             | cream / white, compact |
 *
 * The pairing is a contrast rule, not a preference. The cream variants measure
 * 10.31:1 on brand green and 1.06:1 on cream — invisible on the wrong ground —
 * and the green variants invert that exactly. `mono` is the all-green lockup:
 * the same drawing as `primary` without the red flag, for places where the
 * accent would be the loudest thing on screen.
 *
 * Height comes from a token and width is `auto`, so each lockup's ratio lives
 * in its asset rather than being restated as a second token that could drift.
 */

export type LogoVariant =
  'primary' | 'reverse' | 'mono' | 'stacked' | 'stacked-reverse' | 'mark';

const ASSET = {
  primary: logoHorizontal,
  reverse: logoReverse,
  mono: logoMonoGreen,
  stacked: logoStacked,
  'stacked-reverse': logoStackedReverse,
  mark: flagMark,
} as const satisfies Record<LogoVariant, typeof logoHorizontal>;

export interface LogoProps {
  variant?: LogoVariant;
  /** Token driving rendered height. Width follows from the asset's ratio. */
  height?: 'header' | 'footer' | 'badge';
  priority?: boolean;
  className?: string;
  /**
   * Overrides the empty alt. Only pass this where the logo is the sole carrier
   * of the name — a standalone anchor with no adjacent heading. Anywhere the
   * caller already names the brand, leave it empty so it is not read twice.
   */
  alt?: string;
}

const HEIGHT_TOKEN = {
  header: 'var(--logo-height)',
  footer: 'var(--logo-height-footer)',
  badge: 'var(--logo-height-badge)',
} as const satisfies Record<NonNullable<LogoProps['height']>, string>;

/*
 * `sizes` is the largest CSS pixel width each variant is ever rendered at, so
 * Next requests a 2x source for retina and no more.
 */
const SIZES = {
  primary: '(min-width: 768px) 128px, 101px',
  reverse: '(min-width: 768px) 156px, 129px',
  mono: '(min-width: 768px) 156px, 129px',
  stacked: '(min-width: 768px) 148px, 119px',
  'stacked-reverse': '(min-width: 768px) 148px, 119px',
  mark: '(min-width: 768px) 52px, 41px',
} as const satisfies Record<LogoVariant, string>;

import { cn } from '@/lib/cn';

export function Logo({
  variant = 'primary',
  height = 'header',
  priority = false,
  className,
  alt = '',
}: LogoProps): ReactNode {
  const style: CSSProperties = { height: HEIGHT_TOKEN[height], width: 'auto' };

  return (
    <NextImage
      src={ASSET[variant]}
      alt={alt}
      sizes={SIZES[variant]}
      priority={priority}
      quality={90}
      className={cn('object-contain w-auto max-w-full', className)}
      style={style}
    />
  );
}
