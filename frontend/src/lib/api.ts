import 'server-only';

import type {
  AboutResponse,
  ApiError,
  CateringResponse,
  ContactResponse,
  EventsResponse,
  HomeResponse,
  MenuResponse,
} from '@/types/api';

/*
 * The single WordPress read boundary. One typed function per `gotg/v1`
 * endpoint, each carrying the cache tag and `revalidate` window the contract
 * assigns it (04-API-CONTRACT.md §1.1). Server-only by construction.
 */

const WP_API_BASE = process.env.WP_API_BASE_URL;

interface EndpointConfig {
  readonly path: string;
  readonly tag: string;
  readonly revalidate: number;
}

const ENDPOINTS = {
  home: { path: 'home', tag: 'home', revalidate: 3600 },
  menu: { path: 'menu', tag: 'menu', revalidate: 3600 },
  events: { path: 'events', tag: 'events', revalidate: 900 },
  about: { path: 'about', tag: 'about', revalidate: 86400 },
  contact: { path: 'contact', tag: 'contact', revalidate: 86400 },
  catering: { path: 'catering', tag: 'catering', revalidate: 3600 },
} as const satisfies Record<string, EndpointConfig>;

/**
 * In-memory fallback cache to guarantee instant page response
 * and prevent page hangs when WordPress is slow or temporarily unreachable.
 */
const memoryCache = new Map<string, unknown>();

/**
 * Narrows an unknown error body to the WordPress REST error envelope.
 */
function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('code' in value) || !('message' in value)) {
    return false;
  }

  return typeof value.code === 'string' && typeof value.message === 'string';
}

/**
 * Fetches and types one endpoint payload with automatic ISR Edge caching
 * and a 3.5s timeout to guarantee instant page transitions.
 */
async function fetchEndpoint<T>({
  path,
  tag,
  revalidate,
}: EndpointConfig): Promise<T> {
  if (!WP_API_BASE) {
    if (memoryCache.has(path)) {
      return memoryCache.get(path) as T;
    }
    throw new Error('WP_API_BASE_URL is not set');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const fetchOptions: RequestInit = {
    headers: { Accept: 'application/json' },
    // 3.5-second timeout ensures a slow WordPress host never freezes user routing
    signal: AbortSignal.timeout(3500),
  };

  if (isProduction) {
    // In production, enable Next.js ISR edge caching with revalidation and cache tags
    (fetchOptions as { next?: { revalidate: number; tags: string[] } }).next = {
      revalidate,
      tags: [tag],
    };
  } else {
    // In local dev, revalidate quickly so edits appear immediately
    (fetchOptions as { next?: { revalidate: number; tags: string[] } }).next = {
      revalidate: 5,
      tags: [tag],
    };
  }

  try {
    const response = await fetch(`${WP_API_BASE}/wp-json/gotg/v1/${path}`, fetchOptions);

    if (!response.ok) {
      if (memoryCache.has(path)) {
        return memoryCache.get(path) as T;
      }

      const body: unknown = await response.json().catch(() => null);
      const detail = isApiError(body) ? ` (${body.code}: ${body.message})` : '';

      throw new Error(
        `gotg/v1/${path} responded ${response.status} ${response.statusText}${detail}`,
      );
    }

    const data: T = await response.json();

    // Ensure official email is always applied across all global data payloads
    if (data && typeof data === 'object' && '_global' in data) {
      const globalHolder = data as { _global?: { location?: { email?: string } } };
      if (globalHolder._global?.location) {
        globalHolder._global.location.email = 'bbq101catering@yahoo.com';
      }
    }

    memoryCache.set(path, data);
    return data;
  } catch (error) {
    // Graceful fallback to memory cache if network times out or drops
    if (memoryCache.has(path)) {
      return memoryCache.get(path) as T;
    }
    throw error;
  }
}

export function getHome(): Promise<HomeResponse> {
  return fetchEndpoint<HomeResponse>(ENDPOINTS.home);
}

export function getMenu(): Promise<MenuResponse> {
  return fetchEndpoint<MenuResponse>(ENDPOINTS.menu);
}

export function getEvents(): Promise<EventsResponse> {
  return fetchEndpoint<EventsResponse>(ENDPOINTS.events);
}

export function getAbout(): Promise<AboutResponse> {
  return fetchEndpoint<AboutResponse>(ENDPOINTS.about);
}

export function getContact(): Promise<ContactResponse> {
  return fetchEndpoint<ContactResponse>(ENDPOINTS.contact);
}

export async function getCatering(): Promise<CateringResponse> {
  try {
    return await fetchEndpoint<CateringResponse>(ENDPOINTS.catering);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('gotg/v1/catering endpoint unavailable, using live fallback catering data', error);
    }
    const home = await getHome();
    return {
      _global: home._global,
      seo: {
        title: 'Catering & Private Events | Grill On the Green',
        description:
          'BBQ catering for weddings, golf tournaments, corporate events, and parties in Simi Valley. Smoked brisket, ribs, and sides for 10 to 500+ guests.',
        noindex: false,
      },
      title: 'Catering & Private Events',
      blocks: [
        {
          type: 'hero',
          overlay: 45,
          eyebrow: 'Wood. Smoke. Fire.',
          heading: 'Catering & Private Events',
          subheading: 'Whether you are hosting an intimate tournament banquet or a 300-guest outdoor wedding on the 18th hole, Grill on the Green provides custom slow-smoked barbecue catering and hospitality.',
          image: {
            src: '/media/uploads/IMG_2175.JPG.jpeg',
            alt: 'Grill on the Green Catering on the 18th Hole',
            width: 1200,
            height: 800,
          },
          primaryCta: {
            label: 'Submit Catering Inquiry',
            href: '#catering-inquiry-form',
            isExternal: false,
          },
          secondaryCta: {
            label: 'Call Catering Team',
            href: 'tel:8058422947',
            isExternal: true,
          },
          videoUrl: '/media/hero-broll.mp4',
        },
      ],
    };
  }
}
