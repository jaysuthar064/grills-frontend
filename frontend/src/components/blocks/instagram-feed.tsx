'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { Icon } from '@/components/primitives/icons/icon';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { Skeleton } from '@/components/primitives/skeleton';
import { Text } from '@/components/primitives/text';
import { slugId } from '@/lib/slug';
import type { InstagramFeedBlock, InstagramPostItem } from '@/types/api';

/*
 * InstagramFeed — Client Component synced with Headless WordPress CMS.
 *
 * Prioritizes dynamic posts configured directly in WordPress Admin Page Blocks.
 * Falls back to live Behold JSON API if configured, or authentic high-resolution
 * local barbecue and fairway photography.
 */

export interface InstagramFeedProps {
  band?: 'surface' | 'sunken';
  block: InstagramFeedBlock;
}

type FeedState =
  | { status: 'loading' }
  | { status: 'loaded'; posts: InstagramPostItem[] }
  | { status: 'error' };

const LOAD_TIMEOUT_MS = 5000;

const DEFAULT_POSTS: InstagramPostItem[] = [
  {
    id: 'post-1',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/p/DWE51CQgcSd/',
    image: {
      src: '/media/instagram/post-1.jpg',
      alt: 'Texas Smoked Brisket Sandwich with BBQ baked beans on the fairway',
      width: 800,
      height: 800,
    },
    caption: 'Texas Smoked Brisket Sandwich with BBQ baked beans on the fairway',
    isReel: false,
  },
  {
    id: 'post-2',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/p/DWZLt-oDS59/',
    image: {
      src: '/media/instagram/post-2.jpg',
      alt: 'Juicy craft burger on the fairway patio with mountain views',
      width: 800,
      height: 800,
    },
    caption: 'Juicy craft burger on the fairway patio with mountain views',
    isReel: false,
  },
  {
    id: 'post-3',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/p/DQu4NH4AXhf/',
    image: {
      src: '/media/instagram/post-3.jpg',
      alt: 'Nathan’s All Beef Hot Dog on the 18th hole fairway',
      width: 800,
      height: 800,
    },
    caption: 'Nathan’s All Beef Hot Dog on the 18th hole fairway',
    isReel: false,
  },
  {
    id: 'post-4',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/p/DQsh5ZDDSgK/',
    image: {
      src: '/media/instagram/post-4.jpg',
      alt: 'Clubhouse Sandwich with roasted turkey, ham and crispy bacon',
      width: 800,
      height: 800,
    },
    caption: 'Clubhouse Sandwich with roasted turkey, ham and crispy bacon',
    isReel: false,
  },
  {
    id: 'post-5',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/p/DRLi40uDQhe/',
    image: {
      src: '/media/instagram/post-5.jpg',
      alt: 'Crispy Southern Fried Chicken Sandwich with golden fries',
      width: 800,
      height: 800,
    },
    caption: 'Crispy Southern Fried Chicken Sandwich with golden fries',
    isReel: false,
  },
  {
    id: 'post-6',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/reel/Ddy3uurB44x/',
    image: {
      src: '/media/instagram/post-6.jpg',
      alt: 'Watch the Reel — Live from the smoker on the 18th hole patio',
      width: 800,
      height: 800,
    },
    caption: 'Watch the Reel — Live from the smoker on the 18th hole patio',
    isReel: true,
  },
];

async function loadPosts(
  handle: string,
  count: number,
): Promise<InstagramPostItem[]> {
  const feedId = process.env.NEXT_PUBLIC_BEHOLD_FEED_ID;
  if (feedId && feedId.trim() !== '') {
    try {
      const res = await fetch(`https://feeds.behold.so/${feedId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.slice(0, count || 6).map((item: {
            id: string;
            permalink?: string;
            mediaUrl?: string;
            sizes?: { medium?: { mediaUrl?: string }; large?: { mediaUrl?: string } };
            prunedCaption?: string;
            caption?: string;
            mediaType?: string;
          }) => ({
            id: item.id,
            permalink: item.permalink || `https://www.instagram.com/${handle}/`,
            image: {
              src: item.sizes?.medium?.mediaUrl || item.mediaUrl || '/media/brisket-sandwich.jpg',
              alt: item.prunedCaption || item.caption || 'Grill on the Green Instagram update',
              width: 800,
              height: 800,
            },
            caption: item.prunedCaption ?? item.caption ?? undefined,
            isReel: item.mediaType === 'VIDEO' || Boolean(item.permalink?.includes('/reel/')),
          }));
        }
      }
    } catch (e) {
      console.warn('Could not fetch live Instagram feed from Behold, using curated posts:', e);
    }
  }

  return Promise.resolve(DEFAULT_POSTS.slice(0, count || 6));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error('instagram feed timed out'));
      }, ms);
    }),
  ]);
}

export function InstagramFeed({
  block,
  band = 'surface',
}: InstagramFeedProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);

  // When WordPress CMS provides posts, use them directly as single source of truth
  const hasCmsPosts = Array.isArray(block.posts) && block.posts.length > 0;
  const cmsPosts = hasCmsPosts && block.posts ? block.posts.slice(0, block.count || 6) : null;

  const [fallbackState, setFallbackState] = useState<FeedState>({ status: 'loading' });

  useEffect(() => {
    // If CMS posts are present, skip client-side fetch entirely
    if (cmsPosts) {
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    let cancelled = false;

    const start = (): void => {
      withTimeout(loadPosts(block.handle, block.count), LOAD_TIMEOUT_MS)
        .then((posts) => {
          if (!cancelled) {
            setFallbackState(
              posts.length > 0
                ? { status: 'loaded', posts }
                : { status: 'error' },
            );
          }
        })
        .catch(() => {
          if (!cancelled) {
            setFallbackState({ status: 'error' });
          }
        });
    };

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        observer.disconnect();
        start();
      }
    });

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [block.handle, block.count, cmsPosts]);

  const displayedPosts = cmsPosts ?? (fallbackState.status === 'loaded' ? fallbackState.posts : null);

  const headingId = slugId('instagram', block.heading);
  const profileUrl = block.profileUrl || `https://www.instagram.com/${block.handle}/`;
  const subtitle =
    block.subtitle ||
    'Daily smoker reveals, weekend concert announcements, and life on the 18th hole fairway.';

  let body: ReactNode;
  if (displayedPosts && displayedPosts.length > 0) {
    body = (
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {displayedPosts.map((post, idx) => {
            const isReel = post.isReel ?? (post.permalink?.includes('/reel/') || false);
            return (
              <a
                key={post.id || `post-${idx}`}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={post.caption || `View Instagram post by @${block.handle}`}
                className="group relative block aspect-square overflow-hidden rounded-xl border border-border/80 bg-surface-sunken shadow-xs transition-all duration-300 hover:scale-[1.03] hover:shadow-md hover:border-brand-primary/40"
              >
                <Image
                  image={post.image}
                  fill
                  aspectRatio="1/1"
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                />



                {/* Hover Scrim with Instagram Branding & Caption */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="flex items-center gap-1.5 text-white mb-1">
                    <Icon name="instagram" size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {isReel ? 'Watch Reel' : 'View Post'}
                    </span>
                  </div>
                  {post.caption && (
                    <p className="line-clamp-2 text-[11px] leading-tight text-white/90">
                      {post.caption}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
          <p className="text-body-sm text-ink-muted">
            Tag <strong className="text-brand-primary">@{block.handle}</strong> or <strong className="text-brand-primary">#GrillOnTheGreen</strong> on Instagram!
          </p>
          <LinkButton href={profileUrl} variant="secondary" size="sm" isExternal iconStart="instagram">
            Follow @{block.handle}
          </LinkButton>
        </div>
      </div>
    );
  } else if (!displayedPosts && fallbackState.status === 'loading') {
    body = (
      <div aria-busy="true">
        <Grid columns={3} gap={2}>
          {Array.from({ length: block.count || 6 }, (_, index) => (
            <div key={index} className="aspect-square">
              <Skeleton variant="rect" />
            </div>
          ))}
        </Grid>
      </div>
    );
  } else {
    body = (
      <div className="flex w-full flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border bg-surface p-12 text-center shadow-sm">
        <Text tone="muted" size="body-lg">
          Follow us on Instagram to see what's on the smoker today.
        </Text>
        <LinkButton href={profileUrl} variant="secondary" isExternal iconStart="instagram">
          View @{block.handle}
        </LinkButton>
      </div>
    );
  }

  return (
    <Section tone={band} ariaLabelledBy={headingId} watermark="flag">
      <Container>
        <div ref={containerRef} className="flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/60 pb-6">
            <div className="flex flex-col gap-2">
              <span className="text-overline uppercase tracking-[0.2em] text-brand-primary font-bold">
                Follow The Smoke · @{block.handle}
              </span>
              <Heading level={2} id={headingId} visualLevel="h2">
                {block.heading || 'Fresh from the Pit'}
              </Heading>
              <p className="text-body text-ink-muted leading-relaxed max-w-xl">
                {subtitle}
              </p>
            </div>
            <div>
              <LinkButton href={profileUrl} variant="secondary" size="md" isExternal iconStart="instagram">
                Follow @{block.handle}
              </LinkButton>
            </div>
          </div>
          {body}
        </div>
      </Container>
    </Section>
  );
}
