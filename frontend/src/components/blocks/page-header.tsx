import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';

/*
 * PageHeader — 06-COMPONENT-SPEC.md §PageHeader. Owns the page <h1> on every
 * route except Home. Section (tight) > Container (narrow) > optional eyebrow >
 * Heading level 1 > optional intro.
 */

export interface PageHeaderProps {
  title: string;
  intro?: string;
  eyebrow?: string;
  imageSrc?: string;
}

export function PageHeader({
  title,
  intro,
  eyebrow,
  imageSrc,
}: PageHeaderProps): ReactNode {
  if (imageSrc) {
    return (
      <section className="relative overflow-hidden bg-black text-ink-inverse py-14 md:py-20 mb-8 border-b border-border/20">
        <img
          src={imageSrc}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/20 bg-gradient-to-b from-black/55 via-black/20 to-black/65" />
        <Container>
          <AnimatedReveal>
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center gap-3 drop-shadow-md">
              {eyebrow !== undefined && eyebrow !== '' ? (
                <span className="font-script text-h2 text-brand-accent-subtle">
                  {eyebrow}
                </span>
              ) : null}
              <Heading level={1} visualLevel="display">
                <span className="text-white">{title}</span>
              </Heading>
              {intro !== undefined && intro !== '' ? (
                <Text size="body-lg" tone="inverse" className="max-w-xl mx-auto">
                  {intro}
                </Text>
              ) : null}
            </div>
          </AnimatedReveal>
        </Container>
      </section>
    );
  }

  return (
    <Section spacing="tight" watermark="script" watermarkPlacement="right">
      <Container width="narrow">
        <AnimatedReveal>
          <div className="flex flex-col items-center text-center gap-3 mx-auto">
            {eyebrow !== undefined && eyebrow !== '' ? (
              <Text as="span" size="overline" tone="muted" weight="semibold">
                {eyebrow}
              </Text>
            ) : null}
            <Heading level={1}>{title}</Heading>
            {intro !== undefined && intro !== '' ? (
              <Text size="body-lg" tone="muted">
                {intro}
              </Text>
            ) : null}
          </div>
        </AnimatedReveal>
      </Container>
    </Section>
  );
}

