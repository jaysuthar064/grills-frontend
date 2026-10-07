import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { getAbout } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return buildMetadata(about.seo, about._global, '/about');
}

export default async function AboutPage(): Promise<ReactNode> {
  const about = await getAbout();
  const { _global, blocks } = about;

  const firstBlock = blocks[0];
  const isFirstBlockText = firstBlock?.type === 'text';
  const storyHeading = isFirstBlockText && firstBlock.heading ? firstBlock.heading : 'How It Started';

  return (
    <PageShell global={_global} currentPath="/about">
      {/* Story Header - Editorial, clean typography (No AI-style rounded photo/badge cards per client feedback) */}
      <section className="relative overflow-hidden bg-surface-raised border-b border-border py-14 md:py-20">
        <Container width="narrow">
          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <AnimatedReveal delay={0.1}>
              <div className="flex items-center gap-3">
                <span className="text-sm uppercase tracking-widest text-brand-primary font-bold">
                  Since 2024 &middot; Simi Hills, California
                </span>
              </div>
              <div className="mt-2 text-ink">
                <Heading level={1} visualLevel="display" className="text-4xl sm:text-5xl font-display font-bold">
                  {storyHeading}
                </Heading>
              </div>
            </AnimatedReveal>

            <AnimatedReveal delay={0.2}>
              <div className="prose prose-lg text-ink-muted leading-relaxed flex flex-col gap-4 text-base sm:text-lg">
                <p className="font-medium text-ink leading-relaxed">
                  Marco fires up the smoker from four in the morning; Mark runs the course. What began as a passion for authentic Central Texas barbecue evolved into a welcoming neighborhood destination on the green.
                </p>
                <p>
                  Every cut of brisket and rack of ribs is seasoned simply with coarse black pepper and kosher salt, then smoked low and slow over native oak and hickory wood for up to 14 hours. No shortcuts, no compromises&mdash;just patience, smoke, and craftsmanship.
                </p>
                <p>
                  Whether you are swinging by for breakfast before your morning tee time, enjoying a post-round burger on the patio, or gathering with friends and family for weekend barbecue and live music, Grill on the Green was built for you.
                </p>
              </div>
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
        </Container>
      </section>

      {/* The Team: Marco & Mark (Clean typography & bios; no fake stock photos per client feedback) */}
      <section className="py-12 md:py-16 bg-surface border-b border-border">
        <Container width="narrow">
          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-widest text-brand-primary font-bold">
                The Pit &amp; The Fairway
              </span>
              <Heading level={2} visualLevel="h2" className="text-3xl sm:text-4xl font-display font-bold text-ink">
                Who&apos;s Here
              </Heading>
              <p className="text-base sm:text-lg text-ink-muted">
                Two lifelong passions coming together at the 18th hole.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-2xl border border-border bg-surface-raised shadow-xs flex flex-col gap-3">
                <span className="text-sm font-bold uppercase tracking-wider text-brand-primary">
                  Pitmaster &middot; The Smokehouse
                </span>
                <h3 className="text-2xl font-display font-bold text-ink">Marco</h3>
                <p className="text-base text-ink-muted leading-relaxed">
                  Tends the oak smoker from 4:00 AM every morning. Brings authentic Central Texas slow-smoking techniques, handmade dry rubs, and generational recipes to the fairway.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border bg-surface-raised shadow-xs flex flex-col gap-3">
                <span className="text-sm font-bold uppercase tracking-wider text-brand-primary">
                  Course Director &middot; Hospitality
                </span>
                <h3 className="text-2xl font-display font-bold text-ink">Mark</h3>
                <p className="text-base text-ink-muted leading-relaxed">
                  Oversees the course experience, patio hospitality, and community events. Ensures every golfer, neighbor, and visitor feels at home at Simi Hills.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
