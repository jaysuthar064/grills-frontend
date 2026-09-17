import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';
import { formatWallClockRange, formatWeekdaysPlural } from '@/lib/datetime';
import { slugId } from '@/lib/slug';
import type { RecurringProgramme } from '@/types/api';

/*
 * RecurringProgrammeCard — 06-COMPONENT-SPEC.md §EventHero/RecurringProgrammeCard.
 * The standing weekly programme (live music), which is NOT an event record and
 * so is presented as a distinct highlighted panel above the dated listing.
 *
 * Heading is level 2. Days render as a readable conjunction list
 * ("Fridays and Saturdays") and the wall-clock time range as "6–9pm" via the
 * shared Pacific date/time helpers — starts/ends are zoneless HH:MM strings, so
 * they are treated as literal wall-clock, not converted through any zone.
 */

export interface RecurringProgrammeCardProps {
  recurring: RecurringProgramme;
}

export function RecurringProgrammeCard({
  recurring,
}: RecurringProgrammeCardProps): ReactNode {
  const headingId = slugId('recurring', recurring.heading);
  const daysLabel = formatWeekdaysPlural(recurring.days);
  const { startLabel, endLabel } = formatWallClockRange(
    recurring.starts,
    recurring.ends,
  );

  return (
    <Section spacing="tight" ariaLabelledBy={headingId}>
      <Container>
        <AnimatedReveal>
          <div className="border-brand bg-surface-raised flex flex-col gap-3 rounded-lg border p-6 shadow-sm md:p-8">
            <Text as="span" size="overline" tone="muted" weight="semibold">
              {daysLabel} · <time dateTime={recurring.starts}>{startLabel}</time>–
              <time dateTime={recurring.ends}>{endLabel}</time>
            </Text>
            <Heading level={2} id={headingId}>
              {recurring.heading}
            </Heading>
            <Text size="body-lg" tone="muted">
              {recurring.body}
            </Text>
          </div>
        </AnimatedReveal>
      </Container>
    </Section>
  );
}

