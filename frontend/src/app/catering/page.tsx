import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Container } from '@/components/layout/container';
import { PageShell } from '@/components/layout/page-shell';
import { Section } from '@/components/layout/section';
import { Heading } from '@/components/primitives/heading';
import { LinkButton } from '@/components/primitives/link-button';
import { Text } from '@/components/primitives/text';
import { JsonLd } from '@/components/seo/json-ld';
import { getAbout } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAbout();
  const cateringSeo = {
    title: 'Catering & Private Events | Grill On the Green',
    description:
      'BBQ catering for weddings, golf tournaments, corporate events, and parties in Simi Valley. Smoked brisket, ribs, and sides for 10 to 500+ guests.',
    noindex: false,
  };
  return buildMetadata(cateringSeo, data._global, '/catering');
}

export default async function CateringPage(): Promise<ReactNode> {
  const data = await getAbout();
  const { _global } = data;

  const packages = [
    {
      title: 'Full Buffet Setup',
      guests: '30–500+ Guests',
      description:
        'Hot, slow-smoked BBQ delivered and set up with chaffing dishes, serving utensils, and complete table service. Perfect for golf tournaments, weddings, and large corporate events.',
      highlights: ['Brisket & Baby Back Ribs', 'Choice of 3 House Sides', 'Garlic Rolls & Cornbread', 'Full Service Staff Available'],
      tag: 'Most Popular',
    },
    {
      title: 'Party Packs & Drop-Off',
      guests: '10–30 Guests',
      description:
        'Ready-to-serve trays packed hot and delivered directly to your doorstep or office. Ideal for family gatherings, game days, and team lunches.',
      highlights: ['Meat by the Pound', 'Pints & Quarts of Sides', 'Pickles, Jalapeños & BBQ Sauce', 'Disposable Plates & Napkins'],
      tag: 'Flexible & Quick',
    },
    {
      title: 'Fairway Tournament Special',
      guests: 'Golf Outings & Clubs',
      description:
        'Customized dining tailored for golfers at Simi Hills Golf Course. Boxed lunches on the course, patio post-round celebrations, or evening awards banquets.',
      highlights: ['On-Course Meal Boxes', 'Patio Firepit Buffer', 'Draft Beer & Cocktail Service', 'Custom Scoring Banquet Menus'],
      tag: 'Golf Outings',
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FoodEstablishment',
          name: 'Grill On the Green Catering',
          description: 'Full service and drop-off BBQ catering in Simi Valley, California.',
          url: 'http://localhost:8885/catering',
          telephone: '805-842-2947',
        }}
      />
      <PageShell global={_global} currentPath="/catering">
        {/* Catering Hero */}
        <section className="relative overflow-hidden bg-black text-ink-inverse py-20 md:py-28 min-h-[60vh] flex items-center">
          <div className="absolute inset-0 z-0">
            {/* Poster image fallback immediately visible */}
            <img
              src="http://localhost:8885/wp-content/uploads/2026/09/IMG_2175.JPG.jpeg"
              alt="Catering & Private Events BBQ Feast"
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
            {/* High definition local video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="http://localhost:8885/wp-content/uploads/2026/09/IMG_2175.JPG.jpeg"
              className="absolute inset-0 h-full w-full object-cover opacity-65"
            >
              <source src="http://localhost:8885/wp-content/uploads/2026/09/IMG_2197.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
          </div>
          <Container>
            <div className="relative z-10 max-w-3xl flex flex-col gap-6">
              <span className="font-script text-h2 text-brand-accent-subtle">
                Wood. Smoke. Fire.
              </span>
              <Heading level={1} visualLevel="display">
                <span className="text-white">Catering & Private Events</span>
              </Heading>
              <Text size="body-lg" tone="inverse">
                Slow-smoked Texas brisket, baby back ribs, and fresh golf-side classics for your next event. From intimate family feasts to 500-person tournament banquets.
              </Text>
              <div className="flex flex-wrap gap-4 pt-2">
                <LinkButton href="#catering-form" variant="primary" size="lg">
                  Request Catering Quote
                </LinkButton>
                <LinkButton href="tel:+18058422947" variant="secondary" size="lg" isExternal>
                  Call Catering: 805-842-2947
                </LinkButton>
              </div>
            </div>
          </Container>
        </section>

        {/* Packages Grid */}
        <Section tone="surface">
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
              <Heading level={2} visualLevel="h1">
                Catering Packages
              </Heading>
              <Text tone="muted" size="body-lg">
                Choose a turnkey catering package or let us build a custom menu tailored to your headcount and budget.
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => (
                <div
                  key={pkg.title}
                  className="flex flex-col justify-between bg-surface-raised rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-overline uppercase tracking-widest text-brand-primary font-bold bg-brand-primary-subtle px-3 py-1 rounded-full">
                        {pkg.tag}
                      </span>
                      <span className="text-caption font-semibold text-ink-muted">
                        {pkg.guests}
                      </span>
                    </div>

                    <Heading level={3} visualLevel="h3">
                      {pkg.title}
                    </Heading>

                    <Text tone="muted" size="body-sm">
                      {pkg.description}
                    </Text>

                    <hr className="border-border my-2" />

                    <ul className="flex flex-col gap-2">
                      {pkg.highlights.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-body-sm font-medium text-ink">
                          <svg className="w-4 h-4 text-brand-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <LinkButton href="#catering-form" variant="secondary" fullWidth>
                      Select Package
                    </LinkButton>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Catering Request Form Section */}
        <Section id="catering-form" tone="sunken">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="flex flex-col gap-6">
                <span className="text-overline uppercase tracking-widest text-brand-primary font-bold">
                  Get In Touch
                </span>
                <Heading level={2} visualLevel="h1">
                  Plan Your Event With Us
                </Heading>
                <Text size="body-lg" tone="muted">
                  Fill out the form with your event details, date, and headcount. Our catering manager will contact you within 24 hours with a custom menu proposal.
                </Text>

                <div className="flex flex-col gap-4 bg-surface-raised p-6 rounded-xl border border-border mt-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-primary-subtle text-brand-primary rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h32a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                      </svg>
                    </div>
                    <div>
                      <Heading level={4} visualLevel="h4">Direct Catering Hotline</Heading>
                      <a href="tel:+18058422947" className="text-brand-primary font-bold text-lg hover:underline">
                        805-842-2947
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t border-border pt-4">
                    <div className="p-3 bg-brand-primary-subtle text-brand-primary rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <Heading level={4} visualLevel="h4">Venue Location</Heading>
                      <Text tone="muted" size="body-sm">
                        5031 Alamo Street, Simi Valley, CA 93063 (Simi Hills Golf Course)
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-surface-raised rounded-2xl p-8 border border-border shadow-md">
                <form className="flex flex-col gap-5" action="#" method="POST">
                  <Heading level={3} visualLevel="h3">
                    Catering Inquiry Form
                  </Heading>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="name" className="text-body-sm font-semibold text-ink">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="phone" className="text-body-sm font-semibold text-ink">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        placeholder="805-000-0000"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="email" className="text-body-sm font-semibold text-ink">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="date" className="text-body-sm font-semibold text-ink">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        id="date"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="guests" className="text-body-sm font-semibold text-ink">
                        Estimated Guest Count *
                      </label>
                      <select
                        id="guests"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <option value="">Select count...</option>
                        <option value="10-25">10 – 25 Guests</option>
                        <option value="25-50">25 – 50 Guests</option>
                        <option value="50-100">50 – 100 Guests</option>
                        <option value="100+">100+ Guests</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="type" className="text-body-sm font-semibold text-ink">
                        Event Type *
                      </label>
                      <select
                        id="type"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      >
                        <option value="">Select type...</option>
                        <option value="golf">Golf Tournament</option>
                        <option value="corporate">Corporate Outing</option>
                        <option value="wedding">Wedding / Reception</option>
                        <option value="birthday">Private Party</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="notes" className="text-body-sm font-semibold text-ink">
                      Tell us about your event / Dietary needs
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      placeholder="Special requests, favorite menu items, venue location..."
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full font-body font-semibold whitespace-nowrap transition-colors active:translate-y-px bg-accent text-ink-inverse hover:bg-opacity-90 active:bg-opacity-80 px-6 text-body-lg cursor-pointer mt-2"
                    style={{ minHeight: 'var(--control-height-lg)' }}
                  >
                    Submit Catering Request
                  </button>
                </form>
              </div>
            </div>
          </Container>
        </Section>
      </PageShell>
    </>
  );
}
