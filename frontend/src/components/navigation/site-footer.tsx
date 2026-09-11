import Link from 'next/link';
import type { ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';
import { Container } from '@/components/layout/container';
import { SocialLinks } from '@/components/navigation/social-links';
import { Heading } from '@/components/primitives/heading';
import { Text } from '@/components/primitives/text';
import { VisuallyHidden } from '@/components/primitives/visually-hidden';
import type { GlobalData, HoursDay } from '@/types/api';

/*
 * SiteFooter — 06-COMPONENT-SPEC.md §SiteFooter, columns per
 * 02-INFORMATION-ARCHITECTURE.md §3.3. contentinfo landmark, one per page.
 * Four columns at lg, stacked below. Copyright uses legalName and the year
 * computed at build time.
 *
 * The hours summary is a minimal inline derivation; the full HoursStatus /
 * HoursTable (which computes open/closed from the visitor's clock) is a Client
 * Component deferred to the Contact route.
 */

export interface SiteFooterProps {
  global: GlobalData;
}

function formatHour(value: string): string {
  const [hRaw = '0', mRaw = '00'] = value.split(':');
  const hour = Number(hRaw);
  const suffix = hour < 12 ? 'am' : 'pm';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return mRaw === '00'
    ? `${String(twelve)}${suffix}`
    : `${String(twelve)}:${mRaw}${suffix}`;
}

function uniformHours(regular: HoursDay[]): string | null {
  if (regular.length === 0) {
    return null;
  }
  const first = regular[0];
  if (!first || first.isClosed) {
    return null;
  }
  const allSame = regular.every(
    (day) =>
      !day.isClosed && day.opens === first.opens && day.closes === first.closes,
  );
  return allSame
    ? `Open daily ${formatHour(first.opens)}–${formatHour(first.closes)}`
    : null;
}

export function SiteFooter({ global }: SiteFooterProps): ReactNode {
  const { site, navigation, location, hours, social } = global;
  const year = new Date().getFullYear();
  const hoursSummary = uniformHours(hours.regular);

  return (
    <footer className="bg-surface-inverse text-ink-inverse border-t-[4px] border-accent">
      <Container as="div">
        <div className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            {/* The cream lockup, not the full-colour one: the flag red reads
                2.34:1 against the green band (05-DESIGN-SYSTEM.md §1.1), so the
                reverse variant is the only one that holds up here. The name is
                still in the DOM for assistive tech via the visually-hidden
                heading below. */}
            <div className="inline-flex shrink-0 items-start max-w-[200px]">
              <Logo variant="reverse" height="footer" />
            </div>
            <VisuallyHidden>{site.name}</VisuallyHidden>
            <Text tone="inverse-muted" size="body-sm">
              {site.tagline}
            </Text>
            <Text tone="inverse-muted" size="body-sm">
              {site.description}
            </Text>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2">
            <Heading level={2} visualLevel="h4">
              <span className="text-ink-inverse">Explore</span>
            </Heading>
            <ul className="flex flex-col gap-2">
              {navigation.footer.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-body text-body-sm text-ink-inverse-muted hover:text-ink-inverse transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-2">
            <Heading level={2} visualLevel="h4">
              <span className="text-ink-inverse">Visit</span>
            </Heading>
            <address className="font-body text-body-sm text-ink-inverse-muted not-italic">
              {location.streetAddress}
              {location.addressLine2 ? (
                <>
                  <br />
                  {location.addressLine2}
                </>
              ) : null}
              <br />
              {location.city}, {location.state} {location.postalCode}
            </address>
            <a
              href={location.phoneHref}
              className="font-body text-body-sm text-ink-inverse-muted hover:text-ink-inverse transition-colors"
            >
              {location.phone}
            </a>
            {hoursSummary ? (
              <Text tone="inverse-muted" size="body-sm">
                {hoursSummary}
              </Text>
            ) : null}
            <a
              href={location.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-body-sm text-ink-inverse-muted hover:text-ink-inverse transition-colors"
            >
              Get Directions
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <Heading level={2} visualLevel="h4">
              <span className="text-ink-inverse">Follow</span>
            </Heading>
            <SocialLinks links={social} siteName={site.name} />
          </div>
        </div>

        <div className="border-border-inverse text-ink-inverse-muted flex flex-col gap-2 border-t py-6 md:flex-row md:items-center md:gap-4">
          <Text tone="inverse-muted" size="caption">
            © {year} {site.legalName}
          </Text>
          <ul className="flex gap-4">
            <li>
              <Link
                href="/privacy-policy"
                className="font-body text-caption text-ink-inverse-muted hover:text-ink-inverse transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/accessibility"
                className="font-body text-caption text-ink-inverse-muted hover:text-ink-inverse transition-colors"
              >
                Accessibility
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
