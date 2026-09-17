import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { HoursTable } from '@/components/blocks/hours-table';
import { LocationCard } from '@/components/blocks/location-card';
import { MapEmbed } from '@/components/blocks/map-embed';
import { PageBlockRenderer } from '@/components/blocks/page-block-renderer';
import { PageHeader } from '@/components/blocks/page-header';
import { ContactForm } from '@/components/form/contact-form';
import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { Section } from '@/components/layout/section';
import { SocialLinks } from '@/components/navigation/social-links';
import { AnimatedReveal } from '@/components/primitives/animated-reveal';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import { JsonLd } from '@/components/seo/json-ld';
import { getContact } from '@/lib/api';
import { contactJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContact();
  return buildMetadata(contact.seo, contact._global, '/contact');
}

/*
 * Contact route — Client Changes 6b–6d & 02-INFORMATION-ARCHITECTURE.md §2.6.
 * Features:
 *   - 6b: Upcoming holiday & special closure schedule in HoursTable
 *   - 6c: Live music schedule card (Fridays & Saturdays at 7:00 PM)
 *   - 6d: Dedicated Musician Booking CTA Card for Emily (music@grillonthegreen.com)
 *   - Subject option for 'Live Music Booking / Musician Inquiry'
 */

export default async function ContactPage(): Promise<ReactNode> {
  const contact = await getContact();
  const { _global, title, formEnabled, formSubjects, blocks } = contact;
  const { location, hours, social, site } = _global;

  // Ensure "Live Music Booking / Musician Inquiry" is available in the contact form
  const enhancedSubjects = formSubjects.includes('Live Music Booking / Musician Inquiry')
    ? formSubjects
    : ['Live Music Booking / Musician Inquiry', ...formSubjects];

  return (
    <PageShell global={_global} currentPath="/contact">
      <JsonLd data={contactJsonLd(_global)} />
      <PageHeader title={title} />

      {/* Main Visit & Schedule Section */}
      <Section ariaLabelledBy="contact-find-heading">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            {/* Left Column: Location & Hours Table */}
            <AnimatedReveal>
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                  <Heading level={2} id="contact-find-heading">
                    Find us
                  </Heading>
                  <LocationCard location={location} hours={hours} />
                </div>

                <div className="flex flex-col gap-4">
                  <Heading level={2} id="contact-hours-heading">
                    Opening hours
                  </Heading>
                  <HoursTable hours={hours} />
                </div>
              </div>
            </AnimatedReveal>

            {/* Right Column: Google Map, Live Music Schedule (6c) & Musician Booking Card (6d) */}
            <AnimatedReveal delay={0.2}>
              <div className="flex flex-col gap-8">
                {/* Google Map Listing */}
                <div className="overflow-hidden rounded-2xl border border-border shadow-xs">
                  <MapEmbed location={location} variant="interactive" />
                </div>

                {/* Live Music Schedule Info (Client Change 6c) */}
                <div className="flex flex-col gap-4">
                  <Heading level={2} id="contact-music-heading">
                    Live Music on the Patio
                  </Heading>
                  <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary-subtle text-brand-primary text-2xl shrink-0">
                        🎸
                      </div>
                      <div>
                        <h3 className="font-display text-h4 text-ink font-bold leading-tight">
                          Music Starts at 7:00 PM
                        </h3>
                        <p className="text-caption text-brand-primary font-semibold uppercase tracking-wider">
                          Fairway Patio Stage · Simi Hills
                        </p>
                      </div>
                    </div>

                    <p className="text-body-sm text-ink-muted leading-relaxed">
                      Enjoy slow-smoked Texas barbecue, local craft drafts, and live music with views of the 18th green every weekend.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex flex-col p-3.5 rounded-xl bg-surface border border-border/80">
                        <span className="font-bold text-ink text-body-sm">
                          Friday & Saturday
                        </span>
                        <span className="text-brand-primary font-bold text-body-sm mt-0.5">
                          7:00 PM – 10:00 PM
                        </span>
                        <span className="text-caption text-ink-muted mt-1">
                          Country, Classic Rock & Blues
                        </span>
                      </div>
                      <div className="flex flex-col p-3.5 rounded-xl bg-surface border border-border/80">
                        <span className="font-bold text-ink text-body-sm">
                          Sunday Afternoon
                        </span>
                        <span className="text-brand-primary font-bold text-body-sm mt-0.5">
                          1:00 PM – 4:00 PM
                        </span>
                        <span className="text-caption text-ink-muted mt-1">
                          Acoustic Patio Sets & Brunch
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-4 border-t border-border/60">
                      <span className="text-caption text-ink-subtle">
                        No cover charge · First-come patio seating
                      </span>
                      <LinkButton href="/events" variant="ghost" size="sm">
                        View Band Lineup →
                      </LinkButton>
                    </div>
                  </div>
                </div>

                {/* Musician Booking Contact Card (Client Change 6d) */}
                <div className="rounded-2xl border-2 border-brand-primary/40 bg-brand-primary-subtle/25 p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-overline uppercase tracking-widest text-brand-primary font-bold">
                        Musicians & Bands
                      </span>
                      <h3 className="font-display text-h3 text-ink font-bold mt-1">
                        Interested in Playing at Grill on the Green?
                      </h3>
                    </div>
                    <span className="text-3xl shrink-0">🎤</span>
                  </div>

                  <p className="text-body-sm text-ink-muted leading-relaxed">
                    We are always looking for talented acoustic performers, country duos, and classic rock bands to perform on our patio stage. Reach out directly to our music booking coordinator:
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-brand-primary/20">
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
                      <LinkButton href="#contact-form-section" variant="secondary" size="md">
                        Use Booking Form
                      </LinkButton>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </Container>
      </Section>

      {/* Contact Form Section */}
      <Section id="contact-form-section" tone="sunken" ariaLabelledBy="contact-form-heading">
        <Container width="narrow">
          <AnimatedReveal>
            <div className="flex flex-col gap-6">
              <Heading level={2} id="contact-form-heading">
                Send us a message
              </Heading>
              {formEnabled ? (
                <ContactForm
                  subjects={enhancedSubjects}
                  recipientLabel="the Grill on the Green team"
                />
              ) : (
                <Text tone="muted">
                  Our enquiry form is unavailable right now. Please call{' '}
                  <a
                    href={location.phoneHref}
                    className="text-ink font-semibold underline"
                  >
                    {location.phone}
                  </a>
                  {location.email !== undefined ? (
                    <>
                      {' '}
                      or email{' '}
                      <a
                        href={`mailto:${location.email}`}
                        className="text-ink font-semibold underline"
                      >
                        {location.email}
                      </a>
                    </>
                  ) : null}
                  .
                </Text>
              )}
            </div>
          </AnimatedReveal>
        </Container>
      </Section>

      {social.length > 0 ? (
        <Section spacing="tight" ariaLabelledBy="contact-social-heading">
          <Container width="narrow">
            <AnimatedReveal>
              <div className="flex flex-col gap-4">
                <Heading level={2} id="contact-social-heading">
                  Follow us
                </Heading>
                <SocialLinks links={social} siteName={site.name} />
              </div>
            </AnimatedReveal>
          </Container>
        </Section>
      ) : null}

      <PageBlockRenderer blocks={blocks} headingLevelOffset={0} />
    </PageShell>
  );
}
