import type { CSSProperties, ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
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
  brand: 'bg-gradient-to-br from-[#1c1917] via-[#29221d] to-[#1c1917] border-y border-amber-900/30 text-ink-inverse',
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
            className="w-full h-full object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/85" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(194,65,12,0.15)_0%,transparent_70%)] pointer-events-none"
        />
      )}

      <Container className="relative z-10">
        <AnimatedReveal>
          <div
            className="mx-auto flex flex-col items-center gap-6 text-center"
            style={{ maxWidth: 'var(--measure-narrow)' }}
          >
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-black/60 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-accent backdrop-blur-md shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>
                {isComeHungry
                  ? 'Open Daily 6 AM – 9 PM · 18th Hole Fairway'
                  : 'Walk-Ins & Large Parties Welcome'}
              </span>
            </div>

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
                className="w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all font-bold uppercase tracking-wider text-[14px]"
              >
                {block.cta.label}
              </LinkButton>

              {isComeHungry ? (
                <LinkButton
                  href="tel:+18058422947"
                  variant="secondary"
                  size="lg"
                  isExternal
                  className="w-full sm:w-auto border-white/80 text-white hover:bg-white/20 backdrop-blur-sm shadow-lg font-bold uppercase tracking-wider text-[14px]"
                >
                  Call: 805-842-2947
                </LinkButton>
              ) : null}
            </div>

            {/* Location & Details Strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 border-t border-white/15 text-[12px] text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <span>📍</span> Simi Hills Golf Course (5031 Alamo St)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span>⏰</span> Open 7 Days · 6:00 AM – 9:00 PM
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span>⛳</span> Free Parking in Clubhouse Lot
              </span>
            </div>
          </div>
        </AnimatedReveal>
      </Container>
    </section>
  );
}

