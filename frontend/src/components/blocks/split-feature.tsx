import { Fragment } from 'react';
import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { SplitLayout } from '@/components/layout/split-layout';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
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
    <div className="overflow-hidden rounded-xl shadow-lg border border-border transition-transform hover:scale-[1.02] duration-300">
      <Image
        image={block.image}
        fill
        aspectRatio="4/3"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    </div>
  );

  const content = (
    <div className="flex flex-col items-start gap-4">
      <Heading level={2} id={headingId}>
        {block.heading}
      </Heading>
      <Text size="body-lg" tone="muted">
        {withLineBreaks(block.body)}
      </Text>
      {block.cta ? (
        <LinkButton
          href={block.cta.href}
          variant="secondary"
          isExternal={block.cta.isExternal}
        >
          {block.cta.label}
        </LinkButton>
      ) : null}
    </div>
  );

  return (
    <Section tone={band} ariaLabelledBy={headingId}>
      <Container>
        <SplitLayout imageSide={block.imageSide} media={media} content={content} />
      </Container>
    </Section>
  );
}
