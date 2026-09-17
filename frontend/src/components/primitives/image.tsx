import NextImage from 'next/image';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { normalizeMediaUrl } from '@/lib/media';
import type { ImageObject } from '@/types/api';

/* Maps the aspectRatio union to its token utility (05-DESIGN-SYSTEM.md §4.4). */
const ASPECT_CLASS = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-4-3',
  '3/2': 'aspect-3-2',
  '16/9': 'aspect-16-9',
} as const satisfies Record<
  NonNullable<ImageProps['aspectRatio']>,
  string
>;

/*
 * Image — 06-COMPONENT-SPEC.md §Image. The single image entry point; direct use
 * of next/image elsewhere is prohibited.
 *
 * `blurDataUrl` renders as a native blur placeholder when present; when absent
 * the reserved box holds --color-surface-sunken and the sharp image simply
 * appears (the blur field is empty until the generation hook lands —
 * 03-CONTENT-MODEL.md §2.8). Width/height always come from the payload, or
 * `fill` inside a box with an explicit aspectRatio — an image without reserved
 * space is a CLS defect.
 *
 * Kept a Server Component. The spec's load fade-in and error-box suppression
 * need an onLoad/onError client wrapper; native blur-up plus the sunken box
 * cover the same ground and are deferred rather than forcing this into the
 * client register.
 */

export interface ImageProps {
  image: ImageObject;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  aspectRatio?: '1/1' | '4/3' | '3/2' | '16/9';
  decorative?: boolean;
}

export function Image({
  image,
  sizes,
  priority = false,
  fill = false,
  aspectRatio,
  decorative = false,
}: ImageProps): ReactNode {
  const alt = decorative ? '' : image.alt;
  const blur = image.blurDataUrl;
  const normalizedSrc = normalizeMediaUrl(image.src);

  const blurProps =
    typeof blur === 'string' && blur.length > 0
      ? ({ placeholder: 'blur', blurDataURL: blur } as const)
      : ({ placeholder: 'empty' } as const);

  const filled = (
    <NextImage
      src={normalizedSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      {...blurProps}
    />
  );

  if (fill) {
    // With an aspectRatio the box reserves space itself via the token utility
    // (05-DESIGN-SYSTEM.md §4.4). Without one, the parent owns position, size,
    // and the sunken degrade box — this is how MenuCard applies a per-breakpoint
    // ratio (aspect-3-2 md:aspect-square).
    if (!aspectRatio) {
      return filled;
    }

    return (
      <span
        className={cn(
          'relative block overflow-hidden bg-surface-sunken',
          ASPECT_CLASS[aspectRatio],
        )}
      >
        {filled}
      </span>
    );
  }

  return (
    <NextImage
      src={normalizedSrc}
      alt={alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className={cn('h-auto bg-surface-sunken')}
      {...blurProps}
    />
  );
}
