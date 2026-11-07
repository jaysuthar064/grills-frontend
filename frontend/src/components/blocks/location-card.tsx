import type { ReactNode } from 'react';

import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import type { Hours, Location } from '@/types/api';

/*
 * LocationCard — 06-COMPONENT-SPEC.md §LocationCard. An <address> carrying the
 * page owner's contact details: name, formatted postal address, phone link,
 * optional email, parking note, and a directions button. The <address> default
 * italic is overridden (not-italic). Server Component — no interactivity.
 *
 * `hours` is accepted per the spec's props but rendered by the sibling
 * HoursTable on /contact; LocationCard uses it only in the `compact` variant,
 * which is not exercised here.
 */

export interface LocationCardProps {
  location: Location;
  hours?: Hours;
  variant?: 'full' | 'compact';
}

export function LocationCard({
  location,
  variant = 'full',
}: LocationCardProps): ReactNode {
  const cityLine = `${location.city}, ${location.state} ${location.postalCode}`;

  return (
    <address className="flex flex-col gap-4 not-italic">
      <div className="flex flex-col gap-1">
        <Text as="span" weight="semibold" size="body-lg">
          {location.name}
        </Text>
        <Text as="span" tone="muted">
          {location.streetAddress}
        </Text>
        {location.addressLine2 !== undefined ? (
          <Text as="span" tone="muted">
            {location.addressLine2}
          </Text>
        ) : null}
        <Text as="span" tone="muted">
          {cityLine}
        </Text>
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        <a
          href={location.phoneHref}
          className="font-body font-semibold text-ink transition-colors hover:text-brand"
        >
          {location.phone}
        </a>
        <a
          href={`mailto:${location.email || 'bbq101catering@yahoo.com'}`}
          className="font-body font-semibold text-brand-primary transition-colors hover:underline"
        >
          {location.email || 'bbq101catering@yahoo.com'}
        </a>
      </div>

      {variant === 'full' && location.parkingNote !== undefined ? (
        <Text size="body-sm" tone="muted">
          {location.parkingNote}
        </Text>
      ) : null}

      <div>
        <LinkButton
          href={location.directionsUrl}
          variant="secondary"
          size="md"
          isExternal
        >
          Get directions
        </LinkButton>
      </div>
    </address>
  );
}
