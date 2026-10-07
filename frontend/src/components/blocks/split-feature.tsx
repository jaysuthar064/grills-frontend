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
      </div>
    </AnimatedReveal>
  );

  const content = (
    <AnimatedReveal delay={0.2} className="w-full">
      <div className="flex flex-col items-start gap-5">
        <span className="text-sm uppercase tracking-[0.2em] text-brand-primary font-bold">
          Catering &middot; Private Events
        </span>

        <Heading level={2} id={headingId} visualLevel="h2" className="text-3xl sm:text-4xl font-display font-bold text-ink">
          {block.heading}
        </Heading>

        <div className="text-base sm:text-lg text-ink-muted leading-relaxed">
          {withLineBreaks(block.body)}
        </div>

        {/* Action Buttons - Clean Dark Green & Outline Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <LinkButton
            href="/catering#catering-form"
            variant="primary"
            size="md"
            className="shadow-sm font-bold tracking-wider"
          >
            Request Catering Quote
          </LinkButton>

          <LinkButton
            href="/catering"
            variant="secondary"
            size="md"
            className="hover:border-brand-primary hover:text-brand-primary font-bold tracking-wider"
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