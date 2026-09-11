import type { ReactNode } from 'react';

import { Icon } from '@/components/primitives/icons/icon';
import type { IconName } from '@/components/primitives/icons/index';
import { cn } from '@/lib/cn';
import type { SocialLink, SocialPlatform } from '@/types/api';

/*
 * SocialLinks — 06-COMPONENT-SPEC.md §SocialLinks. A <ul> of icon links whose
 * accessible name is "{siteName} on {Platform}", never the bare handle. Returns
 * null on an empty array.
 *
 * `siteName` is added to the spec's props because the accessible name is built
 * from it; the alternative (a client hook or a hardcoded brand) is worse.
 *
 * Only platforms whose glyph exists render an icon; others fall back to a text
 * label. The icon set is filled in per 06 §Icon as more platforms are supplied.
 */

export interface SocialLinksProps {
  links: SocialLink[];
  siteName: string;
  variant?: 'row' | 'stack';
}

const PLATFORM_ICON: Partial<Record<SocialPlatform, IconName>> = {
  instagram: 'instagram',
};

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  yelp: 'Yelp',
  google: 'Google',
  tripadvisor: 'Tripadvisor',
  youtube: 'YouTube',
};

export function SocialLinks({
  links,
  siteName,
  variant = 'row',
}: SocialLinksProps): ReactNode {
  if (links.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn(
        'flex gap-4',
        variant === 'stack' ? 'flex-col' : 'flex-row items-center',
      )}
    >
      {links.map((link) => {
        const platformLabel = PLATFORM_LABEL[link.platform];
        const iconName = PLATFORM_ICON[link.platform];
        return (
          <li key={link.platform}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${siteName} on ${platformLabel}`}
              className="inline-flex items-center text-inherit transition-colors hover:text-accent"
            >
              {iconName ? (
                <Icon name={iconName} size={24} />
              ) : (
                <span className="font-body text-label">{platformLabel}</span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
