/*
 * API response types for the `gotg/v1` REST endpoints.
 *
 * SOURCE OF TRUTH: `docs/04-API-CONTRACT.md` in the frontend repository.
 * This file is a HAND-MAINTAINED transcription of that document — nothing
 * generates it. When the two disagree, the contract wins and this file is
 * corrected (never the reverse). A component may not declare its own shape for
 * API data; import or derive from here (07-CODING-STANDARDS.md §4.3).
 *
 * Drift is caught in CI by the contract test that validates each live response
 * against a Zod schema transcribed from the same document
 * (01-TECH-STACK.md §3.2). That schema is a later task and is not in this file.
 */

// --- §2 Shared types ------------------------------------------------------

export type Daypart = 'breakfast' | 'lunch' | 'dinner';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type SpiceLevel = 'none' | 'mild' | 'medium' | 'hot';

export type DietaryColor = 'neutral' | 'green' | 'amber' | 'red';

export type EventType =
  'live_music' | 'special_menu' | 'holiday' | 'private' | 'other';

export type SocialPlatform =
  'instagram' | 'facebook' | 'yelp' | 'google' | 'tripadvisor' | 'youtube';

export interface ImageObject {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl?: string;
}

export interface LinkObject {
  label: string;
  href: string;
  isExternal: boolean;
}

export interface DietaryTag {
  slug: string;
  name: string;
  abbreviation: string;
  color: DietaryColor;
  description: string;
}

export interface PriceVariant {
  label?: string;
  amount: number;
}

export interface MenuItem {
  id: number;
  slug: string;
  name: string;
  priceVariants: PriceVariant[];
  description?: string;
  availability: Daypart[];
  dietaryTags: DietaryTag[];
  isFeatured: boolean;
  spiceLevel: SpiceLevel;
  image?: ImageObject;
}

export interface MenuSection {
  slug: string;
  title: string;
  order: number;
  intro?: string;
  image?: ImageObject;
  items: MenuItem[];
  children: MenuSection[];
}

export interface EventItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  descriptionHtml?: string;
  startDateTime: string;
  endDateTime: string;
  eventType: EventType;
  performerName?: string;
  performerUrl?: string;
  isTicketed: boolean;
  ticketUrl?: string;
  coverCharge?: number;
  isRecurringInstance: boolean;
  image?: ImageObject;
  seo: SeoFields;
}

export interface SeoFields {
  title: string;
  description: string;
  ogImage?: ImageObject;
  noindex: boolean;
  canonical?: string;
}

export interface HoursDay {
  day: Weekday;
  opens: string;
  closes: string;
  isClosed: boolean;
}

export interface HoursException {
  date: string;
  label: string;
  isClosed: boolean;
  opens?: string;
  closes?: string;
}

export interface Hours {
  timezone: string;
  regular: HoursDay[];
  exceptions: HoursException[];
}

export interface Location {
  name: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  phoneHref: string;
  email?: string;
  directionsUrl: string;
  parkingNote?: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  handle?: string;
}

export interface SiteIdentity {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  logo?: ImageObject;
  logoInverse?: ImageObject;
  favicon?: ImageObject;
}

export interface SeoDefaults {
  titleTemplate: string;
  description: string;
  ogImage?: ImageObject;
  sameAs: string[];
  priceRange: string;
  servesCuisine: string[];
}

export interface Navigation {
  primary: LinkObject[];
  footer: LinkObject[];
  headerCta: LinkObject;
}

export interface SiteActions {
  reservationUrl?: string;
  orderingUrl?: string;
  giftCardUrl?: string;
}

export interface Announcement {
  text: string;
  href?: string;
}

export interface GlobalData {
  site: SiteIdentity;
  navigation: Navigation;
  location: Location;
  hours: Hours;
  social: SocialLink[];
  actions: SiteActions;
  announcement: Announcement | null;
  seoDefaults: SeoDefaults;
  generatedAt: string;
}

// --- §4 Page blocks -------------------------------------------------------

export interface CtaLink {
  label: string;
  href: string;
  isExternal: boolean;
}

export interface HeroBlock {
  type: 'hero';
  heading: string;
  subheading?: string;
  eyebrow?: string;
  image: ImageObject;
  videoUrl?: string;
  overlay: number;
  primaryCta: CtaLink;
  secondaryCta?: CtaLink;
}

export interface TextBlock {
  type: 'text';
  heading?: string;
  bodyHtml: string;
  width: 'narrow' | 'wide';
  align: 'left' | 'center';
  image?: ImageObject;
}

export interface SplitFeatureBlock {
  type: 'split_feature';
  heading: string;
  body: string;
  image: ImageObject;
  imageSide: 'left' | 'right';
  cta?: CtaLink;
}

export interface GalleryBlock {
  type: 'gallery';
  heading?: string;
  images: ImageObject[];
  layout: 'grid' | 'carousel';
}

export interface CtaBandBlock {
  type: 'cta_band';
  heading: string;
  body?: string;
  cta: CtaLink;
  style: 'brand' | 'ink' | 'surface';
}

export interface FeaturedItemsBlock {
  type: 'featured_items';
  heading: string;
  items: MenuItem[];
  cta?: CtaLink;
}

export interface EventsPreviewBlock {
  type: 'events_preview';
  heading: string;
  events: EventItem[];
  cta?: CtaLink;
}

export interface Person {
  name: string;
  role: string;
  bio?: string;
  photo?: ImageObject;
}

export interface PeopleBlock {
  type: 'people';
  heading?: string;
  people: Person[];
}

export interface InstagramFeedBlock {
  type: 'instagram_feed';
  heading: string;
  handle: string;
  count: number;
}

export type PageBlock =
  | HeroBlock
  | TextBlock
  | SplitFeatureBlock
  | GalleryBlock
  | CtaBandBlock
  | FeaturedItemsBlock
  | EventsPreviewBlock
  | PeopleBlock
  | InstagramFeedBlock;

// --- §5 Endpoint responses ------------------------------------------------

export interface HomeResponse {
  _global: GlobalData;
  seo: SeoFields;
  blocks: PageBlock[];
}

export interface DaypartWindow {
  key: Daypart;
  label: string;
  starts: string;
  ends: string;
}

export interface MenuResponse {
  _global: GlobalData;
  seo: SeoFields;
  title: string;
  blocks: PageBlock[];
  dayparts: DaypartWindow[];
  defaultDaypart: Daypart | 'auto' | 'all';
  sections: MenuSection[];
  dietaryTags: DietaryTag[];
  showDietaryLegend: boolean;
  disclaimer: string;
}

export interface RecurringProgramme {
  heading: string;
  body: string;
  days: Weekday[];
  starts: string;
  ends: string;
}

export interface EventsResponse {
  _global: GlobalData;
  seo: SeoFields;
  title: string;
  blocks: PageBlock[];
  recurring: RecurringProgramme | null;
  upcoming: EventItem[];
  emptyMessage: string;
}

export interface AboutResponse {
  _global: GlobalData;
  seo: SeoFields;
  title: string;
  blocks: PageBlock[];
}

export interface ContactResponse {
  _global: GlobalData;
  seo: SeoFields;
  title: string;
  blocks: PageBlock[];
  formEnabled: boolean;
  formSubjects: string[];
}

// --- §7 Error envelope ----------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
  data: { status: number };
}
