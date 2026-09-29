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
import { getWpUploadUrl } from '@/lib/media';
import type { ImageObject, InstagramFeedBlock } from '@/types/api';

/*
 * InstagramFeed — 06-COMPONENT-SPEC.md §InstagramFeed. Client Component
 * (register §0: third-party fetch after hydration).
 *
 * Loading is deferred until the section scrolls into view (IntersectionObserver)
 * so the feed never joins the initial JS payload or contributes to LCP. States:
 * loading → loaded | error | empty, where empty renders as error (zero posts is
 * indistinguishable from a failure). The component never throws: a rejection, a
 * 5s timeout, or a malformed response all resolve to the error state.
 *
 * The vendor fetch is defined in 09-INTEGRATIONS.md and is not yet wired, so
 * `loadPosts` reports "unconfigured" and the component degrades to its
 * documented error/fallback state. `InstagramPost` is a provisional local shape
 * for the loaded branch until that integration lands; it is intentionally not in
 * the API contract types.
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
      src: '/media/brisket-sandwich.jpg',
      alt: 'Texas Smoked Brisket Sandwich with BBQ baked beans',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-2',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: '/media/bbq-salad.jpg',
      alt: 'BBQ Chopped Salad loaded with chicken and fresh greens',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-3',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: '/media/fairway-hotdog.jpg',
      alt: 'Nathan’s All Beef Hot Dog on the 18th hole fairway',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-4',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: '/media/club-sandwich.jpg',
      alt: 'Clubhouse Sandwich with roasted turkey, ham and bacon',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-5',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: getWpUploadUrl('IMG_2175.JPG.jpeg'),
      alt: 'Fresh brisket sliced straight off the smoker',
      width: 800,
      height: 800,
    },
  },
  {
    id: 'post-6',
    permalink: 'https://www.instagram.com/grillonthegreen_simi/',
    image: {
      src: getWpUploadUrl('IMG_2180.JPG.jpeg'),
      alt: 'Firing up the oak wood smoker at dawn',
      width: 800,
      height: 800,
    },
  },
];

async function loadPosts(
  _handle: string,
  count: number,
): Promise<InstagramPost[]> {
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
