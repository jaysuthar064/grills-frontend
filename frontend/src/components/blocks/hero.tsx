'use client';

import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import { slugId } from '@/lib/slug';
import type { HeroBlock } from '@/types/api';

export interface HeroProps {
  block: HeroBlock;
  isPrimary?: boolean;
}

interface OverlayStyle extends CSSProperties {
  '--hero-overlay-alpha': number;
}

export function Hero({ block, isPrimary = false }: HeroProps): ReactNode {
  const headingId = slugId('hero', block.heading);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleVideo = (): void => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const hasVideo = block.videoUrl !== undefined && block.videoUrl !== '';
  const hasEyebrow = block.eyebrow !== undefined && block.eyebrow !== '';
  const hasSubheading =
    block.subheading !== undefined && block.subheading !== '';

  const sectionStyle: CSSProperties = { minHeight: 'var(--hero-height)' };
  const overlayStyle: OverlayStyle = {
    backgroundColor: 'var(--color-hero-overlay)',
    '--hero-overlay-alpha': Math.max(block.overlay / 100, 0.45),
  };

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex items-center overflow-hidden bg-[#1C1917]"
      style={sectionStyle}
    >
      {/* Background image — always present as a subtle layer */}
      {block.image ? (
        <div className="absolute inset-0">
          <Image image={block.image} fill priority sizes="100vw" />
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={overlayStyle}
      />

      <Container>
        <div className="relative z-10 flex flex-col items-center gap-10 py-16 md:py-24 lg:flex-row lg:items-center lg:gap-16">
          {/* Left side — Text content */}
          <div className="flex flex-1 flex-col items-start gap-5 text-ink-inverse">
            {hasEyebrow ? (
              <AnimatedReveal delay={0.1}>
                <span className="font-script text-h3 text-ink-inverse">
                  {block.eyebrow}
                </span>
              </AnimatedReveal>
            ) : null}

            <AnimatedReveal delay={0.2}>
              <Heading
                level={isPrimary ? 1 : 2}
                visualLevel="display"
                id={headingId}
              >
                <span className="text-ink-inverse font-extrabold tracking-tight drop-shadow-md">
                  {block.heading}
                </span>
              </Heading>
            </AnimatedReveal>

            {hasSubheading ? (
              <AnimatedReveal delay={0.3}>
                <Text size="body-lg" tone="inverse">
                  {block.subheading}
                </Text>
              </AnimatedReveal>
            ) : null}

            <AnimatedReveal delay={0.4}>
              <div className="flex w-full flex-col gap-4 pt-3 sm:w-auto sm:flex-row sm:items-center">
                <div className="w-full sm:w-auto sm:shrink-0">
                  <LinkButton
                    href={block.primaryCta.href}
                    variant="primary"
                    size="lg"
                    isExternal={block.primaryCta.isExternal}
                    fullWidth
                  >
                    {block.primaryCta.label}
                  </LinkButton>
                </div>
                {block.secondaryCta ? (
                  <div className="w-full sm:w-auto sm:shrink-0">
                    <LinkButton
                      href={block.secondaryCta.href}
                      variant="secondary"
                      size="lg"
                      isExternal={block.secondaryCta.isExternal}
                      fullWidth
                    >
                      {block.secondaryCta.label}
                    </LinkButton>
                  </div>
                ) : null}
              </div>
            </AnimatedReveal>
          </div>

          {/* Right side — Portrait video with rounded corners */}
          {hasVideo ? (
            <AnimatedReveal delay={0.3} direction="right" className="w-full lg:w-auto lg:shrink-0">
              <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[360px]">
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={block.image?.src}
                  className="aspect-[9/16] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/10"
                >
                  <source src={block.videoUrl} type="video/mp4" />
                </video>

                {/* Video play/pause toggle */}
                <button
                  type="button"
                  onClick={toggleVideo}
                  aria-label={
                    isPlaying
                      ? 'Pause background video'
                      : 'Play background video'
                  }
                  className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  {isPlaying ? (
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  )}
                </button>
              </div>
            </AnimatedReveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
