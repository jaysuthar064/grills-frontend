'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface CinematicVideoProps {
  videoUrl: string;
  poster?: string;
  label?: string;
}

export function CinematicVideo({
  videoUrl,
  poster = '/media/brisket-sandwich.jpg',
  label = 'Life on the 18th Hole · Simi Hills',
}: CinematicVideoProps): ReactNode {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay blocked by browser policy until interaction
            setIsPlaying(false);
          });
      }
    }
  }, [videoUrl]);

  const togglePlay = (): void => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="group relative w-full max-w-4xl mx-auto aspect-4-3 sm:aspect-16-9 md:aspect-21-9 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-border/80 bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        onLoadedData={() => setIsLoaded(true)}
        className="w-full h-full object-cover transition-opacity duration-700"
        style={{ opacity: isLoaded ? 0.95 : 0.85 }}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src="/media/hero-broll.mp4" type="video/mp4" />
      </video>

      {/* Subtle vignette scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

      {/* Top Left Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent backdrop-blur-md border border-accent/30 shadow-md">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          {label}
        </span>
      </div>

      {/* Interactive Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
        className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-brand-primary hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent border border-white/20 shadow-lg cursor-pointer"
      >
        {isPlaying ? (
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 fill-current translate-x-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
