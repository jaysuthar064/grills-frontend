import type { ReactNode } from 'react';

import { Image } from '@/components/primitives/image';
import { RichText } from '@/components/blocks/rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { cn } from '@/lib/cn';
import { slugId } from '@/lib/slug';
import type { TextBlock } from '@/types/api';

/*
 * TextSection — 06-COMPONENT-SPEC.md §TextSection and RichText. Section >
 * Container (narrow when block.width is 'narrow') > optional Heading
 * (level 2 + offset) > RichText + optional image.
 *
 * `headingLevelOffset` comes from PageBlockRenderer: 0 when blocks sit directly
 * under a page <h1> (Home), 1 when they sit under a PageHeader that already
 * carries its own section headings, so the outline never skips a level.
 */

export interface TextSectionProps {
  band?: 'surface' | 'sunken';
  block: TextBlock;
  headingLevelOffset?: 0 | 1;
}

const HEADING_LEVEL = {
  0: 2,
  1: 3,
} as const satisfies Record<0 | 1, 2 | 3>;

export function TextSection({
  block,
  headingLevelOffset = 0,
  band = 'surface',
}: TextSectionProps): ReactNode {
  const hasHeading = block.heading !== undefined && block.heading !== '';
  const headingId = hasHeading ? slugId('text', block.heading ?? '') : undefined;

  return (
    <Section
      tone={band}
      {...(headingId !== undefined ? { ariaLabelledBy: headingId } : {})}
    >
      <Container width={block.videoUrl || block.image ? 'default' : (block.width === 'narrow' ? 'narrow' : 'default')}>
        <div
          className={cn(
            'flex flex-col gap-6',
            block.align === 'center' && 'items-center text-center',
          )}
        >
          {/* Centered Story Text */}
          <AnimatedReveal>
            <div className="max-w-3xl mx-auto flex flex-col gap-4 text-center">
              <span className="text-overline uppercase tracking-[0.2em] text-brand-primary font-bold">
                The Pit &amp; The Fairway · Smoked Daily
              </span>
              {hasHeading ? (
                <Heading
                  level={HEADING_LEVEL[headingLevelOffset]}
                  visualLevel="h1"
                  {...(headingId !== undefined ? { id: headingId } : {})}
                  className="font-display font-bold tracking-tight text-ink"
                >
                  {block.heading}
                </Heading>
              ) : null}
              <div className="text-body sm:text-body-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
                <RichText html={block.bodyHtml} />
              </div>
            </div>
          </AnimatedReveal>

          {/* 3 Signature Craft Pillars */}
          <AnimatedReveal delay={0.15}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full my-3">
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface-raised border border-border/80 shadow-xs hover:border-brand-primary/40 hover:shadow-md transition-all">
                <span className="text-3xl mb-3">🪵</span>
                <h3 className="font-display font-bold text-ink text-body-lg mb-1.5">14-Hour Oak Smoke</h3>
                <p className="text-caption text-ink-muted leading-relaxed">
                  Prime briskets, pork shoulders, and ribs smoked low &amp; slow over seasoned California oak from 4 AM daily.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface-raised border border-border/80 shadow-xs hover:border-brand-primary/40 hover:shadow-md transition-all">
                <span className="text-3xl mb-3">⛳</span>
                <h3 className="font-display font-bold text-ink text-body-lg mb-1.5">18th Hole Fairway</h3>
                <p className="text-caption text-ink-muted leading-relaxed">
                  Panoramic golf course views, outdoor firepits, and patio seating. No tee time required—walk-ins always welcome.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface-raised border border-border/80 shadow-xs hover:border-brand-primary/40 hover:shadow-md transition-all">
                <span className="text-3xl mb-3">🍳</span>
                <h3 className="font-display font-bold text-ink text-body-lg mb-1.5">First Tee to Dinner</h3>
                <p className="text-caption text-ink-muted leading-relaxed">
                  Hearty golfer breakfast burritos at sunrise, burgers at the turn, and steaks, ribs &amp; cocktails for dinner.
                </p>
              </div>
            </div>
          </AnimatedReveal>

          {/* Cinematic Photo or Video Showcase */}
          {block.videoUrl ? (
            <AnimatedReveal delay={0.25} className="w-full">
              <div className="w-full max-w-4xl mx-auto aspect-4-3 sm:aspect-16-9 md:aspect-21-9 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border/50 relative bg-black">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={block.image?.src}
                  className="w-full h-full object-cover opacity-90"
                >
                  <source src={block.videoUrl} type="video/mp4" />
                </video>
              </div>
            </AnimatedReveal>
          ) : block.image ? (
            <AnimatedReveal delay={0.25} className="w-full">
              <div className="w-full max-w-4xl mx-auto aspect-4-3 sm:aspect-16-9 md:aspect-21-9 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border/50 relative">
                <Image
                  image={block.image}
                  fill
                  sizes="(min-width: 1024px) 896px, 100vw"
                />
              </div>
            </AnimatedReveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
