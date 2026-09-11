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
      <Container width={block.videoUrl || block.image ? 'default' : (block.width === 'narrow' ? 'narrow' : 'default')}>
        <div
          className={cn(
            'flex flex-col gap-6',
            block.align === 'center' && 'items-center text-center',
          )}
        >
          {/* Centered Story Text */}
          <div className="max-w-2xl mx-auto flex flex-col gap-3 text-center">
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

          {/* Cinematic Photo or Video Showcase */}
          {block.videoUrl ? (
            <div className="w-full max-w-4xl mx-auto aspect-16-9 md:aspect-21-9 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border/50 relative bg-black">
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
          ) : block.image ? (
            <div className="w-full max-w-4xl mx-auto aspect-16-9 md:aspect-21-9 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border/50 relative">
              <Image
                image={block.image}
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
