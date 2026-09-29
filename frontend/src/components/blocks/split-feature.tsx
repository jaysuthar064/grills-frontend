import { Fragment } from 'react';
import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SplitLayout } from '@/components/layout/split-layout';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { slugId } from '@/lib/slug';
import type { SplitFeatureBlock } from '@/types/api';

/*
 * SplitFeature — 06-COMPONENT-SPEC.md §SplitFeature. Section > Container >
 * SplitLayout > [Image (4/3), content column (heading, body, optional
 * LinkButton)]. Image full-width above the text below lg; 50/50 at lg with the
 * side set by block.imageSide.
 *
 * `body` is plain text, not HTML: the field's `new_lines: br` setting delivers
 * literal newlines, so `\n` is rendered as <br /> here rather than parsed.
 */

export interface SplitFeatureProps {
  band?: 'surface' | 'sunken';
  block: SplitFeatureBlock;
}

function withLineBreaks(text: string): ReactNode {
  const lines = text.split('\n');
  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

export function SplitFeature({
  block,
  band = 'surface',
}: SplitFeatureProps): ReactNode {
  const headingId = slugId('split', block.heading);

  const media = (
    <AnimatedReveal delay={0.1} className="w-full">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl border border-border/80 group">
        <div className="transition-transform duration-500 ease-out group-hover:scale-[1.02]">
          <Image
            image={block.image}
            fill
            aspectRatio="4/3"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        {/* Floating pill badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent backdrop-blur-md border border-accent/40 shadow-lg">
            ★ 10 to 500+ Guests · On-Site Smoker
          </span>
        </div>
        {/* Bottom bar pill badge */}
        <div className="absolute bottom-4 right-4 z-10 hidden sm:block">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md border border-white/20 shadow-md">
            ⛳ 18th Hole Fairway Patio Available
          </span>
        </div>
      </div>
    </AnimatedReveal>
  );

  const content = (
    <AnimatedReveal delay={0.2} className="w-full">
      <div className="flex flex-col items-start gap-5">
        <span className="text-overline uppercase tracking-[0.2em] text-brand-primary font-bold">
          Full Service &amp; Drop-Off Catering
        </span>

        <Heading level={2} id={headingId} visualLevel="h2">
          {block.heading}
        </Heading>

        <div className="text-body sm:text-body-lg text-ink-muted leading-relaxed">
          {withLineBreaks(block.body)}
        </div>

        {/* 4 Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full my-1">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-sunken/40 border border-border/60">
            <span className="text-xl">🪵</span>
            <div>
              <strong className="block text-caption font-bold text-ink">Texas Smoker On-Site</strong>
              <span className="text-[12px] text-ink-muted">Whole hogs, brisket &amp; ribs</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-sunken/40 border border-border/60">
            <span className="text-xl">⛳</span>
            <div>
              <strong className="block text-caption font-bold text-ink">Fairway Patio or Delivered</strong>
              <span className="text-[12px] text-ink-muted">Hot setup or drop-off trays</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-sunken/40 border border-border/60">
            <span className="text-xl">🏆</span>
            <div>
              <strong className="block text-caption font-bold text-ink">Tournaments &amp; Banquets</strong>
              <span className="text-[12px] text-ink-muted">Boxed lunches to carving buffets</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-sunken/40 border border-border/60">
            <span className="text-xl">🍻</span>
            <div>
              <strong className="block text-caption font-bold text-ink">Full Bar &amp; 16 Draft Taps</strong>
              <span className="text-[12px] text-ink-muted">Cocktails, wine &amp; staff available</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <LinkButton
            href="/catering#catering-form"
            variant="primary"
            size="md"
            className="shadow-md hover:shadow-lg"
          >
            Request Catering Quote
          </LinkButton>

          <LinkButton
            href="/catering"
            variant="secondary"
            size="md"
            className="hover:border-brand-primary hover:text-brand-primary"
          >
            View Packages &amp; Menus &rarr;
          </LinkButton>
        </div>
      </div>
    </AnimatedReveal>
  );

  return (
    <Section tone={band} ariaLabelledBy={headingId} watermark="flag">
      <Container>
        <SplitLayout imageSide={block.imageSide} media={media} content={content} />
      </Container>
    </Section>
  );
}
