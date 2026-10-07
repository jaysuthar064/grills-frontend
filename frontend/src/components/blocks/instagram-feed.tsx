'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { Image } from '@/components/primitives/image';
import { LinkButton } from '@/components/primitives/link-button';
import { Skeleton } from '@/components/primitives/skeleton';
import { Text } from '@/components/primitives/text';
import { slugId } from '@/lib/slug';
import type { ImageObject, InstagramFeedBlock } from '@/types/api';

/*
 * InstagramFeed — Client Component (third-party fetch after hydration).
 *
 * Loading is deferred until the section scrolls into view (IntersectionObserver)
 * so the feed never joins the initial JS payload or contributes to LCP.
 *
 * Pulling live posts:
 * Connects to Behold JSON API (https://behold.so) when NEXT_PUBLIC_BEHOLD_FEED_ID
 * is configured in .env.local. If unconfigured or offline, gracefully falls back
 * to authentic high-resolution local food photography from the course.
 */

export interface InstagramFeedProps {
  band?: 'surface' | 'sunken';
  block: InstagramFeedBlock;
}

interface InstagramPost {
  id: string;
  permalink: string;
  image: ImageObject;
}

type FeedState =
  | { status: 'loading' }
  | { status: 'loaded'; posts: InstagramPost[] }
  | { status: 'error' };

const LOAD_TIMEOUT_MS = 5000;

const DEFAULT_POSTS: InstagramPost[] = [
  {
    id: 'post-1',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: '/media/instagram/post-1.jpg',
      alt: 'Texas Smoked Brisket Sandwich with BBQ baked beans on the fairway',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-2',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: '/media/instagram/post-2.jpg',
      alt: 'Juicy craft burger on the fairway patio with mountain views',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-3',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: '/media/instagram/post-3.jpg',
      alt: 'Nathan’s All Beef Hot Dog on the 18th hole fairway',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-4',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: '/media/instagram/post-4.jpg',
      alt: 'Clubhouse Sandwich with roasted turkey, ham and crispy bacon',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-5',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: '/media/instagram/post-5.jpg',
      alt: 'Crispy Southern Fried Chicken Sandwich with golden fries',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-6',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: '/media/instagram/post-6.jpg',
      alt: 'Crisp BBQ chopped salad with grilled chicken and roasted corn',
      width: 800,
      height: 800,
    },
  },
];

async function loadPosts(
  handle: string,
  count: number,
): Promise<InstagramPost[]> {
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
          }) => ({
            id: item.id,
            permalink: item.permalink || `https://www.instagram.com/${handle}/`,
            image: {
              src: item.sizes?.medium?.mediaUrl || item.mediaUrl || '/media/brisket-sandwich.jpg',
              alt: item.prunedCaption || item.caption || 'Grill on the Green Instagram update',
              width: 800,
              height: 800,
            },
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
  const [state, setState] = useState<FeedState>({ status: 'loading' });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    let cancelled = false;

    const start = (): void => {
      withTimeout(loadPosts(block.handle, block.count), LOAD_TIMEOUT_MS)
        .then((posts) => {
          if (!cancelled) {
            setState(
              posts.length > 0
                ? { status: 'loaded', posts }
                : { status: 'error' },
            );
          }
        })
        .catch(() => {
          if (!cancelled) {
            setState({ status: 'error' });
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
  }, [block.handle, block.count]);

  const headingId = slugId('instagram', block.heading);
  const profileUrl = `https://www.instagram.com/${block.handle}/`;

  let body: ReactNode;
  if (state.status === 'loading') {
    body = (
      <div aria-busy="true">
        <Grid columns={3} gap={2}>
          {Array.from({ length: block.count }, (_, index) => (
            <div key={index} className="aspect-square">
              <Skeleton variant="rect" />
            </div>
          ))}
        </Grid>
      </div>
    );
  } else if (state.status === 'loaded') {
    body = (
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {state.posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View post on Instagram"
              className="group relative block aspect-square overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-xs transition-transform duration-300 hover:scale-[1.03]"
            >
              <Image image={post.image} fill aspectRatio="1/1" sizes="(min-width: 1024px) 16vw, 33vw" />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                <span>View</span>
              </div>
            </a>
          ))}
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
                {block.heading || 'From the Grill'}
              </Heading>
              <p className="text-body text-ink-muted leading-relaxed max-w-xl">
                Daily smoker reveals, weekend concert announcements, and life on the 18th hole fairway.
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
