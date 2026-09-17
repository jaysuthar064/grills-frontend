import type { CSSProperties, ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import { cn } from '@/lib/cn';
import { slugId } from '@/lib/slug';
import type { CtaBandBlock } from '@/types/api';

/*
 * CtaBand — 06-COMPONENT-SPEC.md §CtaBand. A full-width band, centred, capped at
 * --measure-narrow, wired as a labelled section.
 *
 * | style   | Band            | Button      |
 * | brand   | brand primary   | secondary   |  ← a red button on a red band would
 * | ink     | inverse surface | primary     |    have no boundary, so brand uses
 * | surface | sunken          | primary     |    a secondary (white) button.
 *
 * `brand` is not a Section tone (Section's contract lists surface/sunken/inverse
 * only), so the band is rendered as its own <section> here with the same
 * --section-y padding Section applies. Text is inverse on brand/ink, default on
 * surface.
 */

export interface CtaBandProps {
  block: CtaBandBlock;
}

const BAND = {
  brand: 'bg-brand text-ink-inverse',
  ink: 'bg-surface-inverse text-ink-inverse',
  surface: 'bg-surface-sunken text-ink',
} as const satisfies Record<CtaBandBlock['style'], string>;

const BUTTON_VARIANT = {
  brand: 'secondary',
  ink: 'primary',
  surface: 'primary',
} as const satisfies Record<CtaBandBlock['style'], 'primary' | 'secondary'>;

export function CtaBand({ block }: CtaBandProps): ReactNode {
  const headingId = slugId('cta', block.heading);
  const imageSrc =
    block.image?.src ||
    'http://localhost:8885/wp-content/uploads/2026/09/IMG_2175.JPG.jpeg';
  const hasImage = Boolean(imageSrc);
  const isInverse = block.style !== 'surface' || hasImage;
  const style: CSSProperties = { paddingBlock: 'var(--section-y)' };

  return (
    <section
      aria-labelledby={headingId}
      className={cn('relative overflow-hidden', BAND[block.style])}
      style={style}
    >
      {hasImage ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={imageSrc}
            alt={block.image?.alt || block.heading}
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/75" />
        </div>
      ) : null}

      <Container className="relative z-10">
        <AnimatedReveal>
          <div
            className="mx-auto flex flex-col items-center gap-5 text-center"
            style={{ maxWidth: 'var(--measure-narrow)' }}
          >
            <Heading level={2} id={headingId}>
              {isInverse ? (
                <span className="text-ink-inverse drop-shadow-sm">{block.heading}</span>
              ) : (
                block.heading
              )}
            </Heading>

            {block.body !== undefined && block.body !== '' ? (
              <Text
                size="body-lg"
                tone={isInverse ? 'inverse-muted' : 'muted'}
                className={isInverse ? 'drop-shadow-sm' : undefined}
              >
                {block.body}
              </Text>
            ) : null}

            <LinkButton
              href={block.cta.href}
              variant={BUTTON_VARIANT[block.style]}
              size="lg"
              isExternal={block.cta.isExternal}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              {block.cta.label}
            </LinkButton>
          </div>
        </AnimatedReveal>
      </Container>
    </section>
  );
}

