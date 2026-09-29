import type { ReactNode } from 'react';

import { GalleryCarousel } from '@/components/blocks/gallery-carousel';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { slugId } from '@/lib/slug';
import type { GalleryBlock } from '@/types/api';

export interface GalleryProps {
  band?: 'surface' | 'sunken';
  block: GalleryBlock;
}

export function Gallery({
  block,
  band = 'surface',
}: GalleryProps): ReactNode {
  const images = block.images || [];
  if (images.length === 0) {
    return null;
  }

  const headingId = slugId('gallery', block.heading ?? 'fresh-from-the-pit');
  const instagramUrl = 'https://www.instagram.com/grillonthegreen_simi/';
  const instagramHandle = 'grillonthegreen_simi';

  // Display a curated selection of 6 to 9 photos for clean visual balance
  const displayedImages = images.slice(0, 9);

  const body =
    block.layout === 'carousel' ? (
      <GalleryCarousel images={images} label={block.heading ?? 'Fresh from the Pit'} />
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {displayedImages.map((image, index) => (
          <a
            key={image.src || index}
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on Instagram"
            className="group relative block aspect-square overflow-hidden rounded-2xl md:rounded-3xl border border-border/80 bg-surface-sunken shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-brand-primary/50"
          >
            <div className="aspect-square w-full h-full transition-transform duration-700 ease-out group-hover:scale-105">
              <Image
                image={image}
                fill
                aspectRatio="1/1"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            {/* Dark vignette overlay with Instagram badge on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex items-center justify-between text-white">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-accent drop-shadow">
                  <span>📸</span> View on Instagram
                </span>
                <span className="text-[11px] font-medium text-white/80">
                  @{instagramHandle} ↗
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    );

  return (
    <Section
      tone={band}
      {...(headingId !== undefined ? { ariaLabelledBy: headingId } : {})}
      watermark="script"
    >
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-6">
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-overline uppercase tracking-[0.2em] text-brand-primary font-bold inline-flex items-center gap-2">
                <span>📸</span> Live On Instagram · @{instagramHandle}
              </span>
              <Heading level={2} id={headingId} visualLevel="h2">
                {block.heading || 'Fresh from the Pit'}
              </Heading>
              <p className="text-body text-ink-muted leading-relaxed">
                Daily smoker reveals, weekend concert announcements, and life on the 18th hole fairway. Follow along and tag{' '}
                <strong className="text-ink font-semibold">#GrillOnTheGreen</strong>.
              </p>
            </div>

            <div className="shrink-0">
              <LinkButton
                href={instagramUrl}
                variant="secondary"
                size="md"
                isExternal
                iconStart="instagram"
                className="hover:border-brand-primary hover:text-brand-primary shadow-xs"
              >
                Follow @{instagramHandle} &rarr;
              </LinkButton>
            </div>
          </div>

          {body}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border/40 text-center sm:text-left">
            <p className="text-body-sm text-ink-muted">
              Tag <strong className="text-brand-primary font-semibold">@{instagramHandle}</strong> or{' '}
              <strong className="text-brand-primary font-semibold">#GrillOnTheGreen</strong> on Instagram to be featured!
            </p>
            <LinkButton
              href={instagramUrl}
              variant="secondary"
              size="sm"
              isExternal
              iconStart="instagram"
            >
              Visit @{instagramHandle}
            </LinkButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}
