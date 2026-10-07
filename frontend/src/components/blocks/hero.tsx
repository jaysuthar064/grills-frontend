'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
  const [videoSrc, setVideoSrc] = useState(block.videoUrl);

  // Sync state whenever the WordPress CMS payload updates
  useEffect(() => {
    setVideoSrc(block.videoUrl);
  }, [block.videoUrl]);

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

  const handleVideoError = (): void => {
    if (videoSrc && videoSrc !== '/media/hero-broll.mp4') {
      setVideoSrc('/media/hero-broll.mp4');
    }
  };

  const hasVideo = videoSrc !== undefined && videoSrc !== '';
  const overlayOpacity = typeof block.overlay === 'number' ? block.overlay / 100 : 0.45;

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#141210]"
    >
      {/* Background Full-Bleed Video */}
      {hasVideo ? (
        <div className="absolute inset-0 overflow-hidden">
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            poster={block.image?.src}
            onError={handleVideoError}
            className="h-full w-full object-cover object-center"
          >
            <source src={videoSrc} />
          </video>
        </div>
      ) : block.image ? (
        <div className="absolute inset-0">
          <Image image={block.image} fill priority sizes="100vw" />
        </div>
      ) : null}

      {/* Cinematic Dark Gradient Scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-black/75 transition-opacity"
        style={{ opacity: overlayOpacity }}
      />
      {/* Soft radial focus */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.55)_100%)] pointer-events-none"
      />

      {/* Center Hero Content (Simplified & Clean Per Client Feedback) */}
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col items-center justify-center px-4 pt-28 pb-20 text-center sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col items-center gap-6">
          {/* Main Brand Logo Lockup - Clean reverse lockup with red flag (Clickable to home) */}
          <AnimatedReveal delay={0.1}>
            <Link
              href="/"
              className="flex flex-col items-center drop-shadow-[0_12px_28px_rgba(0,0,0,0.9)] transition-opacity hover:opacity-95"
              aria-label="Grill on the Green Home"
            >
              <Logo
                variant="reverse"
                priority
                className="h-auto w-[280px] sm:w-[360px] md:w-[440px] max-w-full drop-shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
                alt="Grill on the Green"
              />
            </Link>
          </AnimatedReveal>

          {/* Accessible Heading for SEO & Landmarks */}
          <div className="sr-only">
            <Heading level={isPrimary ? 1 : 2} id={headingId}>
              {block.heading || 'Grill on the Green - Fresh Smoked Fairway Side'}
            </Heading>
          </div>

          {/* Subheading / Tagline from CMS - Larger, clear readable text for older guests */}
          {block.subheading ? (
            <AnimatedReveal delay={0.2}>
              <p className="max-w-2xl text-balance text-lg sm:text-xl md:text-2xl text-white font-medium tracking-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] leading-relaxed">
                {block.subheading}
              </p>
            </AnimatedReveal>
          ) : null}

          {/* Action Buttons: View Menu & Call */}
          <AnimatedReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full sm:w-auto">
              <LinkButton
                href={block.primaryCta.href || '/menu'}
                variant="primary"
                size="lg"
                isExternal={block.primaryCta.isExternal}
                className="w-full sm:w-auto min-w-[210px] shadow-[0_10px_25px_rgba(0,0,0,0.5)] px-8 text-base font-bold tracking-wider uppercase"
              >
                {block.primaryCta.label || 'View Menu'}
              </LinkButton>

              {block.secondaryCta ? (
                <LinkButton
                  href={block.secondaryCta.href}
                  variant="secondary"
                  size="lg"
                  isExternal={block.secondaryCta.isExternal}
                  className="w-full sm:w-auto min-w-[210px] border-white/85 text-white hover:bg-white/20 hover:border-white shadow-[0_10px_25px_rgba(0,0,0,0.4)] px-8 text-base font-bold tracking-wider uppercase backdrop-blur-sm"
                >
                  {block.secondaryCta.label}
                </LinkButton>
              ) : (
                <LinkButton
                  href="tel:+18058422947"
                  variant="secondary"
                  size="lg"
                  isExternal
                  className="w-full sm:w-auto min-w-[210px] border-white/85 text-white hover:bg-white/20 hover:border-white shadow-[0_10px_25px_rgba(0,0,0,0.4)] px-8 text-base font-bold tracking-wider uppercase backdrop-blur-sm"
                >
                  Call 805-842-2947
                </LinkButton>
              )}
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
          className="absolute bottom-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/75 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-primary border border-white/20 shadow-lg cursor-pointer"
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
    </section>
  );
}