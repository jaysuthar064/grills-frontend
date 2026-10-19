'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { cn } from '@/lib/cn';
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
  const [isMuted, setIsMuted] = useState(true);

  // Default to reliable local b-roll if empty or pointing to unreachable host
  const getInitialSrc = (url?: string): string => {
    if (!url || url === '' || url.includes('localhost') || url.includes('launchpreview.live')) {
      return '/media/hero-broll.mp4';
    }
    return url;
  };

  const [videoSrc, setVideoSrc] = useState(() => getInitialSrc(block.videoUrl));

  // Sync state whenever the WordPress CMS payload updates
  useEffect(() => {
    setVideoSrc(getInitialSrc(block.videoUrl));
  }, [block.videoUrl]);

  // Ensure initial video playback follows mute/autoplay standards
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  }, [videoSrc]);

  const toggleVideo = (): void => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };

  const toggleMute = (): void => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      // If paused or stalled, resume playback smoothly
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };

  const handleVideoError = (): void => {
    if (videoSrc !== '/media/hero-broll.mp4') {
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
            muted={isMuted}
            playsInline
            poster={block.image?.src || '/media/uploads/IMG_2175.JPG.jpeg'}
            onError={handleVideoError}
            className="h-full w-full object-cover object-center"
          >
            <source src={videoSrc} type="video/mp4" />
            <source src="/media/hero-broll.mp4" type="video/mp4" />
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

      {/* Center Hero Content — Focused on Clear Headline Typography & Actionable CTAs */}
      <div className="relative z-10 flex min-h-[100svh] w-full flex-col items-center justify-center px-4 pt-28 pb-20 text-center sm:px-6 lg:px-8">
        <div className="flex max-w-4xl flex-col items-center gap-6">
          {/* Main Cinematic Headline Text (Replacing center logo per client request) */}
          <AnimatedReveal delay={0.15}>
            <Heading level={isPrimary ? 1 : 2} id={headingId}>
              <span className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] uppercase leading-[1.08] block max-w-3xl">
                {block.heading || 'Fresh Smoked Fairway Dining'}
              </span>
            </Heading>
          </AnimatedReveal>

          {/* Subheading / Tagline from CMS - Larger, clear readable text for older guests */}
          {block.subheading ? (
            <AnimatedReveal delay={0.25}>
              <p className="max-w-2xl text-balance text-lg sm:text-xl md:text-2xl text-white font-medium tracking-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] leading-relaxed">
                {block.subheading}
              </p>
            </AnimatedReveal>
          ) : null}

          {/* Action Buttons: View Menu & Call */}
          <AnimatedReveal delay={0.35}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full sm:w-auto">
              <LinkButton
                href={block.primaryCta.href || '/menu'}
                variant="primary"
                size="lg"
                isExternal={block.primaryCta.isExternal}
                className="w-full sm:w-auto min-w-[210px] shadow-[0_10px_25px_rgba(0,0,0,0.5)] px-8 text-base font-bold tracking-wider uppercase hover:shadow-[0_12px_30px_rgba(215,90,40,0.4)]"
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

      {/* Video Controls: Sound Pill + Play/Pause */}
      {hasVideo ? (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 sm:gap-3">
          {/* Prominent Sound Pill Toggle — Makes audio availability immediately clear & interactive */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            className={cn(
              'flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer border select-none',
              isMuted
                ? 'bg-black/60 text-white/95 border-white/20 hover:bg-black/80 hover:scale-105 hover:border-amber-400'
                : 'bg-emerald-950/85 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/90 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
            )}
          >
            {isMuted ? (
              <>
                <svg className="h-4 w-4 fill-current shrink-0 text-amber-400" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
                <span>Sound Off · Tap to Unmute</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse delay-75" />
                  <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse delay-150" />
                </span>
                <svg className="h-4 w-4 fill-current shrink-0 text-emerald-300" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                <span>Sound Playing</span>
              </>
            )}
          </button>

          {/* Play/Pause Toggle */}
          <button
            type="button"
            onClick={toggleVideo}
            aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-primary border border-white/20 shadow-lg cursor-pointer"
          >
            {isPlaying ? (
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="h-4 w-4 fill-current translate-x-0.5" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
        </div>
      ) : null}
    </section>
  );
}