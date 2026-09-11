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

async function loadPosts(
  handle: string,
  count: number,
): Promise<InstagramPost[]> {
  // 09-INTEGRATIONS.md vendor client is not wired yet. Reject so the component
  // shows its fallback rather than a grid that never resolves.
  return Promise.reject(
    new Error(`instagram feed not configured (handle=${handle}, count=${count})`),
  );
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
      <Grid columns={3} gap={2}>
        {state.posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View post on Instagram"
            className="block"
          >
            <Image image={post.image} fill aspectRatio="1/1" sizes="(min-width: 1024px) 33vw, 50vw" />
          </a>
        ))}
      </Grid>
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
    <Section tone={band} ariaLabelledBy={headingId}>
      <Container>
        <div ref={containerRef} className="flex flex-col items-start gap-6">
          <Heading level={2} id={headingId}>
            {block.heading}
          </Heading>
          {body}
        </div>
      </Container>
    </Section>
  );
}
