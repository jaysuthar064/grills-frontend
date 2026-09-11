import 'server-only';

import type {
  AboutResponse,
  ApiError,
  ContactResponse,
  EventsResponse,
  HomeResponse,
  MenuResponse,
} from '@/types/api';

/*
 * The single WordPress read boundary. One typed function per `gotg/v1`
 * endpoint, each carrying the cache tag and `revalidate` window the contract
 * assigns it (04-API-CONTRACT.md §1.1). Server-only by construction — the
 * `server-only` import above makes importing this from a Client Component a
 * build error, per 01-TECH-STACK.md §2.3.
 *
 * There is no `/api/*` proxy: pages call these helpers directly in Server
 * Components (CLAUDE.md rule 1).
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
} as const satisfies Record<string, EndpointConfig>;

/**
 * Narrows an unknown error body to the WordPress REST error envelope
 * (04-API-CONTRACT.md §7).
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
 * Fetches and types one endpoint payload.
 *
 * A non-2xx response throws with the endpoint, status, and — when the body is
 * the documented error envelope — its `code` and `message`. Build-time and
 * revalidation fetches surface the failure loudly rather than falling back to
 * placeholder content (07-CODING-STANDARDS.md §7.1).
 */
async function fetchEndpoint<T>({
  path,
  tag,
  revalidate,
}: EndpointConfig): Promise<T> {
  if (!WP_API_BASE) {
    throw new Error('WP_API_BASE_URL is not set');
  }

  const isDev = process.env.NODE_ENV === 'development';
  const response = await fetch(`${WP_API_BASE}/wp-json/gotg/v1/${path}`, {
    ...(isDev ? { cache: 'no-store' } : { next: { tags: [tag], revalidate } }),
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const detail = isApiError(body) ? ` (${body.code}: ${body.message})` : '';

    throw new Error(
      `gotg/v1/${path} responded ${response.status} ${response.statusText}${detail}`,
    );
  }

  /*
   * The JSON body crosses an untyped network boundary here. Its shape is
   * guaranteed by the contract test that parses each live response against a
   * Zod schema (01-TECH-STACK.md §3.2), not by this assignment — which is why
   * the one unavoidable unsafe step is isolated to this line and named.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- typed at the deserialisation boundary; see comment above
  const data: T = await response.json();

  return data;
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
