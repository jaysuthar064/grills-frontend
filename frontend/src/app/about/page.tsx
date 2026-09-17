import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { InstagramFeed } from '@/components/blocks/instagram-feed';
import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { getAbout } from '@/lib/api';
import { getWpUploadUrl } from '@/lib/media';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return buildMetadata(about.seo, about._global, '/about');
}

/*
 * About route — Client Changes 5a–5e.
 * Redesigned top hero to eliminate negative space, incorporate Jessica's
 * "How it started" origin story, feature high quality imagery, and include
 * an Instagram gallery. Fully synced to WordPress Headless CMS blocks.
 */

export default async function AboutPage(): Promise<ReactNode> {
  const about = await getAbout();
  const { _global, blocks } = about;

  const firstBlock = blocks[0];
  const isFirstBlockText = firstBlock?.type === 'text';
  const displayBlocks = isFirstBlockText ? blocks.slice(1) : blocks;

  const storyHeading = isFirstBlockText && firstBlock.heading ? firstBlock.heading : 'How It Started';
  const storyImage = isFirstBlockText && firstBlock.image ? firstBlock.image.src : getWpUploadUrl('IMG_2175.JPG.jpeg');

  const hasInstagramFeed = blocks.some((b) => b.type === 'instagram_feed');

  return (
    <PageShell global={_global} currentPath="/about">
      {/* Redesigned Story Header (Removes negative space & tells the restaurant story) */}
      <section className="relative overflow-hidden bg-surface-raised border-b border-border py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Story Narrative */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <AnimatedReveal delay={0.1}>
                <div className="flex items-center gap-3">
                  <span className="text-overline uppercase tracking-widest text-brand-primary font-bold">
                    Since 2024 · Simi Hills, California
                  </span>
                </div>
                <div className="mt-2 text-ink">
                  <Heading level={1} visualLevel="display">
                    {storyHeading}
                  </Heading>
                </div>
              </AnimatedReveal>

              <AnimatedReveal delay={0.2}>
                {isFirstBlockText && firstBlock.bodyHtml ? (
                  <div
                    className="prose prose-lg text-ink-muted leading-relaxed flex flex-col gap-4 text-body"
                    dangerouslySetInnerHTML={{ __html: firstBlock.bodyHtml }}
                  />
                ) : (
                  <div className="prose prose-lg text-ink-muted leading-relaxed flex flex-col gap-4 text-body">
                    <p className="text-body-lg text-ink font-medium leading-relaxed">
                      Marco fires up the smoker from four in the morning; Mark runs the course. What began as a passion for authentic Central Texas barbecue evolved into a welcoming neighborhood destination on the green.
                    </p>
                    <p>
                      Every cut of brisket and rack of ribs is seasoned simply with coarse black pepper and kosher salt, then smoked low and slow over native oak and hickory wood for up to 14 hours. No shortcuts, no compromises—just patience, smoke, and craftsmanship.
                    </p>
                    <p>
                      Whether you are swinging by for breakfast before your morning tee time, enjoying a post-round burger on the patio, or gathering with friends and family for weekend barbecue and live music, Grill on the Green was built for you.
                    </p>
                  </div>
                )}
              </AnimatedReveal>

              <AnimatedReveal delay={0.3}>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <LinkButton href="/menu" variant="primary" size="md">
                    Explore Our Menu
                  </LinkButton>
                  <LinkButton href="/contact" variant="secondary" size="md">
                    Visit the Course
                  </LinkButton>
                </div>
              </AnimatedReveal>
            </div>

            {/* Right Column: Prominent Brand Badge & Authentic Barbecue Photography */}
            <div className="lg:col-span-5 flex flex-col items-center gap-6">
              <AnimatedReveal delay={0.25} className="w-full">
                <div className="relative overflow-hidden rounded-2xl shadow-xl border border-border aspect-4-3 bg-black">
                  <img
                    src={storyImage}
                    alt={storyHeading}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-caption font-bold text-white tracking-wide">
                      Smoked Fresh Daily on Simi Hills Golf Course
                    </span>
                  </div>
                </div>
              </AnimatedReveal>

              <AnimatedReveal delay={0.35}>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border/70 shadow-xs">
                  <Logo
                    variant="mark"
                    height="badge"
                    className="h-12 w-auto"
                    alt="Grill on the Green mark"
                  />
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-ink text-body leading-tight">
                      Grill on the Green
                    </span>
                    <span className="text-caption text-ink-muted">
                      5031 Alamo St · Simi Valley, CA
                    </span>
                  </div>
                </div>
              </AnimatedReveal>
            </div>
          </div>
        </Container>
      </section>

      <PageBlockRenderer blocks={displayBlocks} headingLevelOffset={0} />

      {/* Instagram Feed Section (if not in CMS blocks) */}
      {!hasInstagramFeed ? (
        <InstagramFeed
          band="surface"
          block={{
            type: 'instagram_feed',
            heading: 'Around the Pit & Patio',
            handle: 'grillonthegreen_simi',
            count: 6,
          }}
        />
      ) : null}
    </PageShell>
  );
}
