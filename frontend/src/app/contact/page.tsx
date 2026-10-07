import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { HoursTable } from '@/components/blocks/hours-table';
import { LocationCard } from '@/components/blocks/location-card';
import { MapEmbed } from '@/components/blocks/map-embed';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/blocks/page-header';
import { PageShell } from '@/components/layout/page-shell';
import { Section } from '@/components/layout/section';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { JsonLd } from '@/components/seo/json-ld';
import { getContact } from '@/lib/api';
import { contactJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContact();
  return buildMetadata(contact.seo, contact._global, '/contact');
}

export default async function ContactPage(): Promise<ReactNode> {
  const contact = await getContact();
  const { _global, title } = contact;
  const { location, hours } = _global;

  return (
    <PageShell global={_global} currentPath="/contact">
      <JsonLd data={contactJsonLd(_global)} />
      <PageHeader title={title || 'Contact & Location'} />

      {/* Main Visit & Schedule Section - Consistent 1px strokes & uniform headings */}
      <Section ariaLabelledBy="contact-find-heading">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            {/* Left Column: Location & Hours Table */}
            <AnimatedReveal>
              <div className="flex flex-col gap-8">
                {/* Find Us Card */}
                <div className="flex flex-col gap-3">
                  <Heading level={2} id="contact-find-heading" visualLevel="h3" className="text-2xl font-bold font-display text-ink">
                    Find Us
                  </Heading>
                  <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-xs">
                    <LocationCard location={location} hours={hours} />
                  </div>
                </div>

                {/* Opening Hours Card */}
                <div className="flex flex-col gap-3">
                  <Heading level={2} id="contact-hours-heading" visualLevel="h3" className="text-2xl font-bold font-display text-ink">
                    Opening Hours
                  </Heading>
                  <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-xs">
                    <HoursTable hours={hours} />
                  </div>
                </div>
              </div>
            </AnimatedReveal>

            {/* Right Column: Google Map, Live Music & Musicians Card */}
            <AnimatedReveal delay={0.2}>
              <div className="flex flex-col gap-8">
                {/* Google Map Listing */}
                <div className="flex flex-col gap-3">
                  <Heading level={2} id="contact-map-heading" visualLevel="h3" className="text-2xl font-bold font-display text-ink">
                    Location Map
                  </Heading>
                  <div className="overflow-hidden rounded-2xl border border-border shadow-xs">
                    <MapEmbed location={location} variant="interactive" />
                  </div>
                </div>

                {/* Live Music Schedule Info */}
                <div className="flex flex-col gap-3">
                  <Heading level={2} id="contact-music-heading" visualLevel="h3" className="text-2xl font-bold font-display text-ink">
                    Live Music on the Patio
                  </Heading>
                  <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary-subtle text-brand-primary shrink-0">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-h4 text-ink font-bold leading-tight">
                          Music Starts at 7:00 PM
                        </h3>
                        <p className="text-caption text-brand-primary font-semibold uppercase tracking-wider">
                          Fairway Patio Stage &middot; Simi Hills
                        </p>
                      </div>
                    </div>

                    <p className="text-body-sm text-ink-muted leading-relaxed">
                      Enjoy slow-smoked Texas barbecue, local craft drafts, and live music with views of the 18th green every weekend.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex flex-col p-3.5 rounded-xl bg-surface border border-border/80">
                        <span className="font-bold text-ink text-body-sm">
                          Friday &amp; Saturday
                        </span>
                        <span className="text-brand-primary font-bold text-body-sm mt-0.5">
                          7:00 PM &ndash; 10:00 PM
                        </span>
                        <span className="text-caption text-ink-muted mt-1">
                          Country, Classic Rock &amp; Blues
                        </span>
                      </div>
                      <div className="flex flex-col p-3.5 rounded-xl bg-surface border border-border/80">
                        <span className="font-bold text-ink text-body-sm">
                          Sunday Afternoon
                        </span>
                        <span className="text-brand-primary font-bold text-body-sm mt-0.5">
                          1:00 PM &ndash; 4:00 PM
                        </span>
                        <span className="text-caption text-ink-muted mt-1">
                          Acoustic Patio Sets &amp; Brunch
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-4 border-t border-border/60">
                      <span className="text-caption text-ink-subtle">
                        No cover charge &middot; First-come patio seating
                      </span>
                      <LinkButton href="/events" variant="ghost" size="sm">
                        View Band Lineup &rarr;
                      </LinkButton>
                    </div>
                  </div>
                </div>

                {/* Musicians & Bands Booking Card */}
                <div className="flex flex-col gap-3">
                  <Heading level={2} id="contact-booking-heading" visualLevel="h3" className="text-2xl font-bold font-display text-ink">
                    Musicians &amp; Bands
                  </Heading>
                  <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-xs flex flex-col gap-4">
                    <div>
                      <h3 className="font-display text-h4 text-ink font-bold">
                        Interested in Playing at Grill on the Green?
                      </h3>
                      <p className="text-body-sm text-ink-muted leading-relaxed mt-2">
                        We are always looking for talented acoustic performers, country duos, and classic rock bands to perform on our patio stage.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-border/60">
                      <div>
                        <span className="text-caption text-ink-muted block">
                          Music Booking Coordinator
                        </span>
                        <span className="font-bold text-ink text-body">
                          Emily Leonard
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <LinkButton
                          href="mailto:music@grillonthegreen.com?subject=Live%20Music%20Booking%20Inquiry%20-%20Grill%20on%20the%20Green"
                          variant="primary"
                          size="md"
                          isExternal
                        >
                          Contact Emily
                        </LinkButton>
                        <LinkButton
                          href="tel:+18058422947"
                          variant="secondary"
                          size="md"
                        >
                          Call: 805-842-2947
                        </LinkButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
