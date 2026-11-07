import type { EventItem } from '@/types/api';

export interface BandProfile {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly genre: string;
  readonly description: string;
  readonly image: string;
  readonly badgeTone: 'amber' | 'orange' | 'emerald' | 'purple' | 'neutral';
  readonly colorClasses: {
    readonly bg: string;
    readonly border: string;
    readonly text: string;
    readonly hoverBorder: string;
    readonly glow: string;
    readonly pillBg: string;
    readonly pillText: string;
  };
  readonly totalShows: number;
}

export type BandKey =
  | 'zaremba'
  | 'todd-hines-band'
  | 'captain-kori'
  | 'ashwater-saints'
  | 'live-music-tba';

export const BAND_PROFILES: Record<BandKey, BandProfile> = {
  zaremba: {
    id: 'zaremba',
    name: 'Zaremba',
    shortName: 'Zaremba',
    genre: 'Classic Rock, Pop & Dance Hits (Resident Favorite)',
    description:
      'Resident fairway favorite delivering crowd-pleasing classic rock anthems, 80s/90s dance hits, and energetic singalong live sets on the heated patio.',
    image: '/media/bands/zaremba.jpg',
    badgeTone: 'amber',
    colorClasses: {
      bg: 'bg-linear-to-r from-amber-950/90 via-stone-900/90 to-amber-950/90',
      border: 'border-amber-500/70',
      text: 'text-amber-200',
      hoverBorder: 'hover:border-amber-400',
      glow: 'hover:shadow-[0_4px_16px_rgba(245,158,11,0.35)]',
      pillBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      pillText: 'text-amber-300',
    },
    totalShows: 7,
  },
  'todd-hines-band': {
    id: 'todd-hines-band',
    name: 'Todd Hines Band',
    shortName: 'Todd Hines Band',
    genre: 'Country, Blues & Southern Rock',
    description:
      'Full-throttle Southern rock, driving country favorites, and Texas blues with full rhythm section and blistering guitar under the festoon lights.',
    image: '/media/bands/todd-hines-band.jpg',
    badgeTone: 'orange',
    colorClasses: {
      bg: 'bg-linear-to-r from-orange-950/90 via-stone-900/90 to-orange-950/90',
      border: 'border-orange-500/70',
      text: 'text-orange-200',
      hoverBorder: 'hover:border-orange-400',
      glow: 'hover:shadow-[0_4px_16px_rgba(249,115,22,0.35)]',
      pillBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      pillText: 'text-orange-300',
    },
    totalShows: 4,
  },
  'captain-kori': {
    id: 'captain-kori',
    name: 'Captain Kori',
    shortName: 'Captain Kori',
    genre: 'Coastal Rock, Acoustic Classics & Fairway Harmonies',
    description:
      'Smooth acoustic guitar favorites, breezy coastal rock, and singalong classics perfect for sunset fire pit dining fairway-side.',
    image: '/media/bands/captain-kori.jpg',
    badgeTone: 'emerald',
    colorClasses: {
      bg: 'bg-linear-to-r from-emerald-950/90 via-stone-900/90 to-emerald-950/90',
      border: 'border-emerald-500/70',
      text: 'text-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      glow: 'hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)]',
      pillBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      pillText: 'text-emerald-300',
    },
    totalShows: 3,
  },
  'ashwater-saints': {
    id: 'ashwater-saints',
    name: 'AshWater Saints',
    shortName: 'AshWater Saints',
    genre: 'Americana, Roots Rock & Blues',
    description:
      'Gritty roots rock, soulful Americana storytelling, and deep-groove California blues live on the 18th hole patio stage.',
    image: '/media/bands/ashwater-saints.jpg',
    badgeTone: 'purple',
    colorClasses: {
      bg: 'bg-linear-to-r from-purple-950/90 via-stone-900/90 to-purple-950/90',
      border: 'border-purple-500/70',
      text: 'text-purple-200',
      hoverBorder: 'hover:border-purple-400',
      glow: 'hover:shadow-[0_4px_16px_rgba(168,85,247,0.35)]',
      pillBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      pillText: 'text-purple-300',
    },
    totalShows: 1,
  },
  'live-music-tba': {
    id: 'live-music-tba',
    name: 'Holiday Live Music (Performer TBA)',
    shortName: 'Performer TBA',
    genre: 'Holiday Live Patio Concert',
    description:
      'Special holiday weekend live patio music. Special guest performer announcement coming soon! Slow-smoked BBQ and craft drafts served all evening.',
    image: '/media/bands/live-music-tba.jpg',
    badgeTone: 'neutral',
    colorClasses: {
      bg: 'bg-linear-to-r from-stone-900/90 via-stone-800/90 to-stone-900/90',
      border: 'border-stone-500/60',
      text: 'text-stone-200',
      hoverBorder: 'hover:border-stone-400',
      glow: 'hover:shadow-[0_4px_16px_rgba(120,113,108,0.35)]',
      pillBg: 'bg-stone-500/20 text-stone-300 border-stone-500/40',
      pillText: 'text-stone-300',
    },
    totalShows: 2,
  },
};

/**
 * Full live music schedule provided by client for October, November, and December.
 * All shows take place on the Fairway Patio Stage (Friday & Saturday evenings, 7:00 PM – 10:00 PM).
 */
export const SCHEDULED_BANDS: EventItem[] = [
  // ── OCTOBER 2026 ─────────────────────────────────────────────────────────────
  {
    id: 9101,
    slug: 'captain-kori-oct-30',
    title: 'Live Music: Captain Kori',
    performerName: 'Captain Kori',
    summary:
      'Acoustic favorites, coastal rock, and classic fairway sunset harmonies on the heated patio stage.',
    descriptionHtml:
      '<p>Join us on the 18th hole patio for an evening of acoustic coastal rock, classic favorites, and great barbecue with Captain Kori. Free patio admission, fire pit seating, and 16 craft beers on tap.</p>',
    startDateTime: '2026-10-30T19:00:00-07:00',
    endDateTime: '2026-10-30T22:00:00-07:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/captain-kori.jpg',
      alt: 'Captain Kori performing acoustic coastal rock live on patio',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Captain Kori Live on the Patio | Grill on the Green',
      description: 'Acoustic coastal rock live on the heated fairway patio in Simi Valley.',
      noindex: false,
    },
  },
  {
    id: 9102,
    slug: 'zaremba-halloween-oct-31',
    title: 'Halloween Live Music Bash: Zaremba',
    performerName: 'Zaremba',
    summary:
      'Halloween live concert with Zaremba! Classic rock dance hits, costume contest, smoked brisket specials, and craft beers.',
    descriptionHtml:
      '<p>Celebrate Halloween under the festoon lights! Resident powerhouse Zaremba rocks the fairway patio with classic rock, dance covers, and costume prizes. Arrive early for patio seating.</p>',
    startDateTime: '2026-10-31T19:00:00-07:00',
    endDateTime: '2026-10-31T22:30:00-07:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/zaremba.jpg',
      alt: 'Zaremba rock band performing live on stage',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Halloween Live Music Bash with Zaremba | Grill on the Green',
      description: 'Celebrate Halloween with Zaremba live on the fairway patio stage.',
      noindex: false,
    },
  },

  // ── NOVEMBER 2026 ────────────────────────────────────────────────────────────
  {
    id: 9103,
    slug: 'todd-hines-band-nov-06',
    title: 'Live Music: Todd Hines Band',
    performerName: 'Todd Hines Band',
    summary:
      'High-energy country rock, driving blues, and Southern favorites live on the heated fairway patio stage.',
    descriptionHtml:
      '<p>Kick off November with the Todd Hines Band playing high-energy country and Southern rock classics. Smoked brisket sliders, craft drafts, and heated patio tables.</p>',
    startDateTime: '2026-11-06T19:00:00-08:00',
    endDateTime: '2026-11-06T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/todd-hines-band.jpg',
      alt: 'Todd Hines Band live country rock performance',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Todd Hines Band Live | Grill on the Green',
      description: 'High-energy country rock and blues on the fairway patio in Simi Valley.',
      noindex: false,
    },
  },
  {
    id: 9104,
    slug: 'zaremba-nov-07',
    title: 'Live Music: Zaremba',
    performerName: 'Zaremba',
    summary:
      'Resident patio favorite Zaremba delivers popular classic rock, pop dance hits, and crowd singalongs.',
    descriptionHtml:
      '<p>Saturday night fairway concert with Zaremba. Enjoy slow-smoked Texas BBQ, fire pit tables, and craft draft beers with golf course mountain views.</p>',
    startDateTime: '2026-11-07T19:00:00-08:00',
    endDateTime: '2026-11-07T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/zaremba.jpg',
      alt: 'Zaremba band performing live on patio',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Zaremba Live on the Fairway Patio | Grill on the Green',
      description: 'Classic rock dance hits live on Saturday night at Grill on the Green.',
      noindex: false,
    },
  },
  {
    id: 9105,
    slug: 'todd-hines-band-nov-13',
    title: 'Live Music: Todd Hines Band',
    performerName: 'Todd Hines Band',
    summary:
      'Country rock favorites and blues under the patio festoon lights with slow-smoked Texas BBQ.',
    descriptionHtml:
      '<p>Friday night country and Southern rock with the Todd Hines Band. Heated patio dining, craft draft beers, and great barbecue.</p>',
    startDateTime: '2026-11-13T19:00:00-08:00',
    endDateTime: '2026-11-13T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/todd-hines-band.jpg',
      alt: 'Todd Hines Band performing live',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Todd Hines Band Live | Grill on the Green',
      description: 'Country rock live on the heated patio stage at Simi Hills.',
      noindex: false,
    },
  },
  {
    id: 9106,
    slug: 'zaremba-nov-14',
    title: 'Live Music: Zaremba',
    performerName: 'Zaremba',
    summary:
      'Saturday night live classic rock and dance grooves on the 18th hole patio stage.',
    descriptionHtml:
      '<p>Zaremba returns for another high-energy Saturday night set. Classic rock anthems, craft cocktails, and slow-smoked ribs.</p>',
    startDateTime: '2026-11-14T19:00:00-08:00',
    endDateTime: '2026-11-14T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/zaremba.jpg',
      alt: 'Zaremba performing live on stage',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Zaremba Live Concert | Grill on the Green',
      description: 'Live classic rock and dance hits on Saturday night.',
      noindex: false,
    },
  },
  {
    id: 9107,
    slug: 'captain-kori-nov-20',
    title: 'Live Music: Captain Kori',
    performerName: 'Captain Kori',
    summary:
      'Acoustic soul, coastal classics, and relaxed fairway sunset vibes by fire pit tables.',
    descriptionHtml:
      '<p>Unwind your Friday evening with Captain Kori playing acoustic favorites and coastal rock hits. Free admission, fire pits, and seasonal dinner specials.</p>',
    startDateTime: '2026-11-20T19:00:00-08:00',
    endDateTime: '2026-11-20T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/captain-kori.jpg',
      alt: 'Captain Kori performing acoustic classics',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Captain Kori Live Acoustic | Grill on the Green',
      description: 'Acoustic coastal favorites live on the fairway patio.',
      noindex: false,
    },
  },
  {
    id: 9108,
    slug: 'ashwater-saints-nov-21',
    title: 'Live Music: AshWater Saints',
    performerName: 'AshWater Saints',
    summary:
      'Americana roots rock, soulful blues, and gritty Southern anthems live on the patio stage.',
    descriptionHtml:
      '<p>AshWater Saints bring their signature sound of California Americana, soulful roots rock, and deep-groove blues to Grill on the Green. Full band, great food, and craft beers on tap.</p>',
    startDateTime: '2026-11-21T19:00:00-08:00',
    endDateTime: '2026-11-21T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/ashwater-saints.jpg',
      alt: 'AshWater Saints performing Americana roots rock live',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'AshWater Saints Live on the Patio | Grill on the Green',
      description: 'Americana and roots rock live on the heated fairway patio in Simi Valley.',
      noindex: false,
    },
  },
  {
    id: 9109,
    slug: 'thanksgiving-live-music-nov-27',
    title: 'Thanksgiving Weekend Live Music: Performer TBA',
    performerName: 'Live Music TBA',
    summary:
      'Black Friday holiday weekend live patio music. Special guest performer announcement coming soon!',
    descriptionHtml:
      '<p>Celebrate the Thanksgiving holiday weekend on our heated fairway patio with live music, holiday cocktail specials, and slow-smoked BBQ. Performer to be announced shortly!</p>',
    startDateTime: '2026-11-27T19:00:00-08:00',
    endDateTime: '2026-11-27T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/live-music-tba.jpg',
      alt: 'Holiday weekend live patio concert at Grill on the Green',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Thanksgiving Weekend Live Music | Grill on the Green',
      description: 'Black Friday weekend live music and patio barbecue.',
      noindex: false,
    },
  },
  {
    id: 9110,
    slug: 'zaremba-nov-28',
    title: 'Live Music: Zaremba',
    performerName: 'Zaremba',
    summary:
      'Holiday weekend party with Zaremba playing classic rock dance hits on the fairway patio.',
    descriptionHtml:
      '<p>Keep the Thanksgiving weekend energy rolling with Zaremba live on stage. Classic rock hits, dance favorites, cold brews, and brisket.</p>',
    startDateTime: '2026-11-28T19:00:00-08:00',
    endDateTime: '2026-11-28T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/zaremba.jpg',
      alt: 'Zaremba performing on stage',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Zaremba Holiday Weekend Live | Grill on the Green',
      description: 'Zaremba live classic rock concert on the fairway patio.',
      noindex: false,
    },
  },

  // ── DECEMBER 2026 ────────────────────────────────────────────────────────────
  {
    id: 9111,
    slug: 'todd-hines-band-dec-04',
    title: 'Live Music: Todd Hines Band',
    performerName: 'Todd Hines Band',
    summary:
      'Kick off December with high-octane country rock, blues, and heated fire pit dining.',
    descriptionHtml:
      '<p>December kicks off with the Todd Hines Band playing driving country rock and Southern anthems. Stay warm by our outdoor fire pits with craft beer and barbecue.</p>',
    startDateTime: '2026-12-04T19:00:00-08:00',
    endDateTime: '2026-12-04T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/todd-hines-band.jpg',
      alt: 'Todd Hines Band performing live on patio',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Todd Hines Band Live in December | Grill on the Green',
      description: 'High-energy country rock live on the heated fairway patio stage.',
      noindex: false,
    },
  },
  {
    id: 9112,
    slug: 'zaremba-dec-05',
    title: 'Live Music: Zaremba',
    performerName: 'Zaremba',
    summary:
      'Saturday night live concert with Zaremba. Enjoy 16 craft beers and slow-smoked Texas BBQ.',
    descriptionHtml:
      '<p>Saturday night live concert with Zaremba. Rock singalongs, dance grooves, and warm fire pit seating on the 18th hole patio.</p>',
    startDateTime: '2026-12-05T19:00:00-08:00',
    endDateTime: '2026-12-05T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/zaremba.jpg',
      alt: 'Zaremba live classic rock concert',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Zaremba Live Concert | Grill on the Green',
      description: 'Saturday night live music with Zaremba on the patio.',
      noindex: false,
    },
  },
  {
    id: 9113,
    slug: 'zaremba-dec-11',
    title: 'Live Music: Zaremba',
    performerName: 'Zaremba',
    summary:
      'Holiday season live music with Zaremba playing classic rock favorites on the heated patio.',
    descriptionHtml:
      '<p>Join us for Friday night holiday cheers with Zaremba rocking the fairway patio stage. Free admission, heaters running, and great holiday cocktails.</p>',
    startDateTime: '2026-12-11T19:00:00-08:00',
    endDateTime: '2026-12-11T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/zaremba.jpg',
      alt: 'Zaremba rock performance',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Zaremba Holiday Live Music | Grill on the Green',
      description: 'Holiday live music with Zaremba in Simi Valley.',
      noindex: false,
    },
  },
  {
    id: 9114,
    slug: 'captain-kori-dec-12',
    title: 'Live Music: Captain Kori',
    performerName: 'Captain Kori',
    summary:
      'Acoustic coastal favorites, folk rock, and singalong classics fairway-side.',
    descriptionHtml:
      '<p>Saturday night acoustic sets with Captain Kori. Relax under the festoon lights by our fire tables with slow-smoked meats and local craft brews.</p>',
    startDateTime: '2026-12-12T19:00:00-08:00',
    endDateTime: '2026-12-12T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/captain-kori.jpg',
      alt: 'Captain Kori live acoustic guitar',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Captain Kori Live Acoustic | Grill on the Green',
      description: 'Acoustic classics and coastal rock live fairway-side.',
      noindex: false,
    },
  },
  {
    id: 9115,
    slug: 'zaremba-dec-18',
    title: 'Live Music: Zaremba',
    performerName: 'Zaremba',
    summary:
      'Friday night holiday celebration with Zaremba bringing classic rock energy to Simi Valley.',
    descriptionHtml:
      '<p>One of our biggest holiday weekend live shows! Zaremba rocks the house on the patio with classic rock, high-energy dancing, and Texas BBQ favorites.</p>',
    startDateTime: '2026-12-18T19:00:00-08:00',
    endDateTime: '2026-12-18T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/zaremba.jpg',
      alt: 'Zaremba live performance on patio stage',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Zaremba Pre-Christmas Live Concert | Grill on the Green',
      description: 'Holiday live concert with Zaremba on the heated patio.',
      noindex: false,
    },
  },
  {
    id: 9116,
    slug: 'todd-hines-band-dec-19',
    title: 'Live Music: Todd Hines Band',
    performerName: 'Todd Hines Band',
    summary:
      'Holiday Saturday night live country and Southern rock bash before Christmas week.',
    descriptionHtml:
      '<p>The Todd Hines Band brings their full-band country rock powerhouse to Grill on the Green for a festive holiday Saturday show. Enjoy dinner, drinks, and live music.</p>',
    startDateTime: '2026-12-19T19:00:00-08:00',
    endDateTime: '2026-12-19T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/todd-hines-band.jpg',
      alt: 'Todd Hines Band performing live country rock',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Todd Hines Band Holiday Live Concert | Grill on the Green',
      description: 'Country rock live concert on Saturday night at Simi Hills.',
      noindex: false,
    },
  },
  {
    id: 9117,
    slug: 'holiday-live-music-dec-26',
    title: 'Post-Holiday Live Music: Performer TBA',
    performerName: 'Live Music TBA',
    summary:
      'Post-Christmas Saturday evening live music on the patio. Performer announcement coming soon!',
    descriptionHtml:
      '<p>Keep the holiday celebration alive with live music on our heated patio following Christmas. Special guest artist announcement coming soon!</p>',
    startDateTime: '2026-12-26T19:00:00-08:00',
    endDateTime: '2026-12-26T22:00:00-08:00',
    eventType: 'live_music',
    isTicketed: false,
    isRecurringInstance: true,
    image: {
      src: '/media/bands/live-music-tba.jpg',
      alt: 'Post-Christmas live music concert on patio',
      width: 800,
      height: 600,
    },
    seo: {
      title: 'Post-Christmas Live Music | Grill on the Green',
      description: 'Live music on the heated patio on Saturday, December 26.',
      noindex: false,
    },
  },
];

/**
 * Resolves band details, profile, badge colors, and images from an event item.
 */
export function getBandProfileForEvent(evt: EventItem): BandProfile {
  const text = `${evt.performerName || ''} ${evt.title} ${evt.summary}`.toLowerCase();

  if (text.includes('zaremba')) {
    return BAND_PROFILES.zaremba;
  }
  if (text.includes('todd') || text.includes('hines')) {
    return BAND_PROFILES['todd-hines-band'];
  }
  if (text.includes('kori') || text.includes('captain')) {
    return BAND_PROFILES['captain-kori'];
  }
  if (text.includes('ashwater') || text.includes('saints')) {
    return BAND_PROFILES['ashwater-saints'];
  }

  return BAND_PROFILES['live-music-tba'];
}

