import type { ReactNode } from 'react';

import { Text } from '@/components/primitives/text';
import type { Location } from '@/types/api';

/*
 * MapEmbed — 06-COMPONENT-SPEC.md §MapEmbed.
 *
 * `interactive` is the variant /contact renders. It is the keyless Google Maps
 * embed — `maps.google.com/maps?q=…&output=embed` — which needs no API key, no
 * Google Cloud project, and no billing account, so it works in every
 * environment with no configuration. 09-INTEGRATIONS.md §8 recommends the keyed
 * Static Maps API instead; that recommendation still stands as the later
 * option, and the trade-off this variant accepts (third-party cookies set
 * before consent, ~900 KB) is recorded there.
 *
 * `static` remains the default so the recommended path stays the default. Until
 * GOOGLE_MAPS_STATIC_API_KEY is configured it renders a keyless placeholder
 * panel that IS the directions link, rather than a broken <img>.
 *
 * Both variants keep the address and the "View on Google Maps" link, so the
 * section stays usable if the iframe is blocked by a content blocker.
 */

export interface MapEmbedProps {
  location: Location;
  variant?: 'static' | 'interactive';
}

/* "Grill on the Green, 5031 Alamo St, Simi Valley, CA 93063" — built from the
 * CMS record rather than hard-coded, so a change in the CMS moves the pin. */
function locationQuery(location: Location): string {
  return [
    location.name,
    location.streetAddress,
    location.city,
    `${location.state} ${location.postalCode}`,
  ].join(', ');
}

const OFFICIAL_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Grill+on+the+Green,+5031+Alamo+St,+Simi+Valley,+CA+93063';

function resolvedDirectionsUrl(url?: string): string {
  if (!url || url.includes('cid=0000000000000000000')) {
    return OFFICIAL_DIRECTIONS_URL;
  }
  return url;
}

function AddressLine({ location }: { location: Location }): ReactNode {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <Text as="span" size="body-sm" tone="muted">
        {location.streetAddress}, {location.city}, {location.state}{' '}
        {location.postalCode}
      </Text>
      <a
        href={resolvedDirectionsUrl(location.directionsUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-body text-body-sm text-brand font-semibold underline"
      >
        View on Google Maps
      </a>
    </div>
  );
}

export function MapEmbed({
  location,
  variant = 'static',
}: MapEmbedProps): ReactNode {
  const directionsUrl = resolvedDirectionsUrl(location.directionsUrl);

  if (variant === 'interactive') {
    const src = `https://maps.google.com/maps?q=${encodeURIComponent(
      locationQuery(location),
    )}&output=embed`;

    return (
      <div className="flex flex-col gap-3">
        <div className="border-border-strong aspect-16-9 w-full overflow-hidden rounded-lg border">
          <iframe
            src={src}
            title={`Map showing ${location.name}, ${location.streetAddress}, ${location.city}`}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        </div>
        <AddressLine location={location} />
      </div>
    );
  }

  const accessibleName = `Open directions to ${location.name} in Google Maps`;

  return (
    <a
      href={directionsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleName}
      className="group border-border-strong focus-visible:ring-border-interactive block overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="aspect-16-9 bg-surface-sunken group-hover:bg-surface-raised flex w-full flex-col items-center justify-center gap-2 p-6 text-center transition-colors">
        <Text as="span" weight="semibold">
          {location.name}
        </Text>
        <Text as="span" size="body-sm" tone="muted">
          {location.streetAddress}, {location.city}, {location.state}{' '}
          {location.postalCode}
        </Text>
        <Text as="span" size="body-sm" weight="semibold">
          View on Google Maps
        </Text>
      </div>
    </a>
  );
}
