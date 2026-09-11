import type { ReactNode } from 'react';

import { Image } from '@/components/primitives/image';
import { RichText } from '@/components/blocks/rich-text';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
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
      <Container width={block.width === 'narrow' ? 'narrow' : 'default'}>
        <div
          className={cn(
            'flex flex-col gap-5',
            block.align === 'center' && 'items-center text-center',
          )}
        >
          {block.image ? (
            <div className={cn(
              'overflow-hidden rounded-2xl shadow-lg border border-border/60 relative',
              block.align === 'center'
                ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-brand-primary-subtle/30 shadow-md mx-auto mb-1'
                : 'w-full max-w-md aspect-3-2 mb-2'
            )}>
              <Image
                image={block.image}
                fill
                sizes="(min-width: 768px) 320px, 100vw"
              />
            </div>
          ) : null}

          {hasHeading ? (
            <Heading
              level={HEADING_LEVEL[headingLevelOffset]}
              {...(headingId !== undefined ? { id: headingId } : {})}
            >
              {block.heading}
            </Heading>
          ) : null}
          <RichText html={block.bodyHtml} />
        </div>
      </Container>
    </Section>
  );
}
