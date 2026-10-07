import type { ReactNode } from 'react';

import { RichText } from '@/components/blocks/rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { cn } from '@/lib/cn';
import { slugId } from '@/lib/slug';
import type { TextBlock } from '@/types/api';

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
      <Container width="narrow">
        <div
          className={cn(
            'flex flex-col gap-6 py-6',
            block.align === 'center' && 'items-center text-center',
          )}
        >
          {/* Centered Story Text - Clean typography, no AI clutter or filler boxes */}
          <AnimatedReveal>
            <div className="max-w-2xl mx-auto flex flex-col gap-4 text-center">
              <span className="text-sm uppercase tracking-[0.2em] text-brand-primary font-bold">
                The Pit &amp; The Fairway &middot; Smoked Daily
              </span>
              {hasHeading ? (
                <Heading
                  level={HEADING_LEVEL[headingLevelOffset]}
                  visualLevel="h1"
                  {...(headingId !== undefined ? { id: headingId } : {})}
                  className="font-display font-bold tracking-tight text-ink text-3xl sm:text-4xl md:text-5xl"
                >
                  {block.heading}
                </Heading>
              ) : null}
              <div className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto pt-1">
                <RichText html={block.bodyHtml} />
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </Container>
    </Section>
  );
}