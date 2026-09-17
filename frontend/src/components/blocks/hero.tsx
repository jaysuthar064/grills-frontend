'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { slugId } from '@/lib/slug';
import type { HeroBlock } from '@/types/api';

export interface HeroProps {
  block: HeroBlock;
  isPrimary?: boolean;
}

export function Hero({ block, isPrimary = false }: HeroProps): ReactNode {
  const headingId = slugId('hero', block.heading || 'welcome');
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
  const overlayOpacity = Math.max((block.overlay ?? 50) / 100, 0.45);

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#141210]"
    >
      {/* Background Full-Bleed Video (Wood Ranch Benchmark) */}
      {hasVideo ? (
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster={block.image?.src}
            className="h-full w-full object-cover object-center"
          >
            <source src={block.videoUrl} type="video/mp4" />
          </video>
        </div>
      ) : block.image ? (
        <div className="absolute inset-0">
          <Image image={block.image} fill priority sizes="100vw" />
        </div>
      ) : null}

      {/* Cinematic Dark Gradient Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/85 transition-opacity"
        style={{ opacity: overlayOpacity + 0.15 }}
      />

      {/* Center Hero Content (Logo -> Line -> View Menu & Call buttons) */}
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col items-center justify-center px-4 py-28 text-center sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col items-center gap-7">
          {/* Main Brand Logo Lockup */}
          <AnimatedReveal delay={0.15}>
            <div className="flex flex-col items-center drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] transition-transform hover:scale-[1.02]">
              <Logo
                variant="stacked-reverse"
                height="badge"
                priority
                className="h-auto w-[240px] sm:w-[320px] md:w-[380px] lg:w-[420px] max-w-full"
                alt="Grill on the Green"
              />
            </div>
          </AnimatedReveal>

          {/* Accessible Heading for SEO & Landmarks */}
          <div className="sr-only">
            <Heading level={isPrimary ? 1 : 2} id={headingId}>
              {block.heading || 'Grill on the Green - Fresh Smoked Fairway Side'}
            </Heading>
          </div>

          {/* Elegant Gold/Accent Dividing Line */}
          <AnimatedReveal delay={0.3}>
            <div className="flex items-center gap-3 my-1">
              <span className="h-[2px] w-14 bg-accent/90 rounded-full shadow-[0_0_12px_rgba(200,140,50,0.5)]" />
              <span className="h-2 w-2 rotate-45 border border-accent bg-accent/50 shadow-[0_0_8px_rgba(200,140,50,0.6)]" />
              <span className="h-[2px] w-14 bg-accent/90 rounded-full shadow-[0_0_12px_rgba(200,140,50,0.5)]" />
            </div>
          </AnimatedReveal>

          {/* Action Buttons: View Menu & Call */}
          <AnimatedReveal delay={0.45}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto">
              <LinkButton
                href={block.primaryCta.href || '/menu'}
                variant="primary"
                size="lg"
                isExternal={block.primaryCta.isExternal}
                className="w-full sm:w-auto min-w-[200px] shadow-[0_10px_25px_rgba(0,0,0,0.4)] px-8 text-[16px] font-bold tracking-wider uppercase"
              >
                {block.primaryCta.label || 'View Menu'}
              </LinkButton>

              {block.secondaryCta ? (
                <LinkButton
                  href={block.secondaryCta.href}
                  variant="secondary"
                  size="lg"
                  isExternal={block.secondaryCta.isExternal}
                  className="w-full sm:w-auto min-w-[200px] border-white/85 text-white hover:bg-white/15 hover:border-white shadow-[0_10px_25px_rgba(0,0,0,0.3)] px-8 text-[16px] font-bold tracking-wider uppercase backdrop-blur-sm"
                >
                  {block.secondaryCta.label}
                </LinkButton>
              ) : null}
            </div>
          </AnimatedReveal>
        </div>
      </div>

      {/* Video Play/Pause Toggle */}
      {hasVideo ? (
        <button
          type="button"
          onClick={toggleVideo}
          aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
          className="absolute bottom-20 md:bottom-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/75 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent border border-white/20"
        >
          {isPlaying ? (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
      ) : null}

      {/* Subtle Scroll Down Prompt */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <span className="text-[11px] font-body uppercase tracking-[0.25em] text-white/80 drop-shadow-sm font-medium">
          Scroll
        </span>
        <svg
          className="h-4 w-4 text-white/80 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
