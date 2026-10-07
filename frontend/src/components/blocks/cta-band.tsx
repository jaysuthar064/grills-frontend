import type { CSSProperties, ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { cn } from '@/lib/cn';
import { slugId } from '@/lib/slug';
import type { CtaBandBlock } from '@/types/api';

/*
 * CtaBand - A full-width band, centred, capped at --measure-narrow.
 * Clean, bold call-to-action without duplicating the footer directory info.
 */

export interface CtaBandProps {
  block: CtaBandBlock;
}

const BAND = {
  brand: 'bg-[#1E4338] border-y border-white/10 text-white',
  ink: 'bg-surface-inverse text-ink-inverse border-y border-white/10',
  surface: 'bg-surface-sunken text-ink',
} as const satisfies Record<CtaBandBlock['style'], string>;

const BUTTON_VARIANT = {
  brand: 'primary',
  ink: 'primary',
  surface: 'primary',
} as const satisfies Record<CtaBandBlock['style'], 'primary' | 'secondary'>;

export function CtaBand({ block }: CtaBandProps): ReactNode {
  const headingId = slugId('cta', block.heading);
  const imageSrc = block.image?.src;
  const hasImage = Boolean(imageSrc);
  const isInverse = block.style !== 'surface' || hasImage;
  const style: CSSProperties = { paddingBlock: 'var(--section-y)' };

  const isComeHungry = block.heading.toLowerCase().includes('come hungry');

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
            className="w-full h-full object-cover opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/85" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(30,67,56,0.2)_0%,transparent_70%)] pointer-events-none"
        />
      )}

      <Container className="relative z-10">
        <AnimatedReveal>
          <div
            className="mx-auto flex flex-col items-center gap-6 text-center"
            style={{ maxWidth: 'var(--measure-narrow)' }}
          >
            <span className="text-sm font-bold uppercase tracking-widest text-brand-primary">
              {isComeHungry
                ? 'Open Daily 6:00 AM – 9:00 PM'
                : 'Walk-Ins & Large Parties Welcome'}
            </span>

            <Heading level={2} id={headingId} visualLevel="h2">
              {isInverse ? (
                <span className="text-white drop-shadow-md font-display font-bold">
                  {block.heading}
                </span>
              ) : (
                block.heading
              )}
            </Heading>

            {block.body !== undefined && block.body !== '' ? (
              <p
                className={cn(
                  'text-body sm:text-body-lg max-w-xl leading-relaxed',
                  isInverse ? 'text-white/90 drop-shadow-xs' : 'text-ink-muted'
                )}
              >
                {block.body}
              </p>
            ) : null}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2">
              <LinkButton
                href={block.cta.href}
                variant={BUTTON_VARIANT[block.style]}
                size="lg"
                isExternal={block.cta.isExternal}
                className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all font-bold tracking-wider"
              >
                {block.cta.label}
              </LinkButton>

              {isComeHungry ? (
                <LinkButton
                  href="tel:+18058422947"
                  variant="secondary"
                  size="lg"
                  isExternal
                  className="w-full sm:w-auto border-white/80 text-white hover:bg-white/20 backdrop-blur-sm shadow-md font-bold tracking-wider"
                >
                  Call: 805-842-2947
                </LinkButton>
              ) : null}
            </div>
          </div>
        </AnimatedReveal>
      </Container>
    </section>
  );
}
