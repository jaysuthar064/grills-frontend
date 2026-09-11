import type { ReactNode } from 'react';

import { EventCard } from '@/components/blocks/event-card';
import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { slugId } from '@/lib/slug';
import type { EventsPreviewBlock } from '@/types/api';

/*
 * EventsPreview — the `events_preview` page block.
 *
 * NOTE: 06-COMPONENT-SPEC.md has no dedicated section for this block, though the
 * content model (03 §9.3) and API contract (04 §4) both define it, and the
 * PageBlock union forces it to be handled. It is built here by analogy to
 * FeaturedMenuRow — Section > Container > heading > Grid of EventCard (preview
 * variant) > optional LinkButton to /events — using the specified EventCard.
 * Flagged for a spec addition rather than invented silently.
 *
 * The shaper returns null (and the block is omitted) when there are no upcoming
 * events and hide_when_empty is set; the empty guard here is defensive.
 */

export interface EventsPreviewProps {
  band?: 'surface' | 'sunken';
  block: EventsPreviewBlock;
}

export function EventsPreview({
  block,
  band = 'surface',
}: EventsPreviewProps): ReactNode {
  if (block.events.length === 0) {
    return null;
  }

  const headingId = slugId('events', block.heading);

  return (
    <Section tone={band} ariaLabelledBy={headingId} watermark="flag">
      <Container>
        <div className="flex flex-col gap-6">
          <Heading level={2} id={headingId}>
            {block.heading}
          </Heading>

          <Grid columns={3}>
            {block.events.map((event, index) => (
              <AnimatedReveal key={event.id} delay={Math.min(index * 0.1, 0.5)}>
                <EventCard
                  event={event}
                  variant="preview"
                  headingLevel={3}
                />
              </AnimatedReveal>
            ))}
          </Grid>

          {block.cta ? (
            <div>
              <LinkButton
                href={block.cta.href}
                variant="secondary"
                isExternal={block.cta.isExternal}
              >
                {block.cta.label}
              </LinkButton>
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
