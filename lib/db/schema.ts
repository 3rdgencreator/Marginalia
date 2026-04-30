import {
  pgTable, serial, varchar, text, boolean, integer,
  timestamp, date, jsonb,
} from 'drizzle-orm/pg-core';

// ─── Admin Users ──────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('editor').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Releases ─────────────────────────────────────────────────────────────────

export const releases = pgTable('releases', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  catalogNumber: varchar('catalog_number', { length: 50 }),
  releaseDate: date('release_date'),
  releaseType: varchar('release_type', { length: 50 }).default('single'),
  coverArt: varchar('cover_art', { length: 1000 }),
  description: text('description'),
  featured: boolean('featured').default(false),
  presave: boolean('presave').default(false),
  badgeText: varchar('badge_text', { length: 100 }),
  sortOrder: integer('sort_order').default(0),
  // Platform links (flattened from Keystatic platformLinksField)
  artistName: varchar('artist_name', { length: 255 }),
  artworkUrl: varchar('artwork_url', { length: 1000 }),
  upc: varchar('upc', { length: 50 }),
  layloUrl: varchar('laylo_url', { length: 1000 }),
  presaveLayloUrl: varchar('presave_laylo_url', { length: 1000 }),
  hypedditUrl: varchar('hypeddit_url', { length: 1000 }),
  beatportUrl: varchar('beatport_url', { length: 1000 }),
  spotifyUrl: varchar('spotify_url', { length: 1000 }),
  soundcloudUrl: varchar('soundcloud_url', { length: 1000 }),
  appleMusicUrl: varchar('apple_music_url', { length: 1000 }),
  deezerUrl: varchar('deezer_url', { length: 1000 }),
  bandcampUrl: varchar('bandcamp_url', { length: 1000 }),
  tidalUrl: varchar('tidal_url', { length: 1000 }),
  traxsourceUrl: varchar('traxsource_url', { length: 1000 }),
  junoUrl: varchar('juno_url', { length: 1000 }),
  boomkatUrl: varchar('boomkat_url', { length: 1000 }),
  amazonUrl: varchar('amazon_url', { length: 1000 }),
  youtubeUrl: varchar('youtube_url', { length: 1000 }),
  anghamiUrl: varchar('anghami_url', { length: 1000 }),
  mixcloudUrl: varchar('mixcloud_url', { length: 1000 }),
  netEaseUrl: varchar('net_ease_url', { length: 1000 }),
  pandoraUrl: varchar('pandora_url', { length: 1000 }),
  saavnUrl: varchar('saavn_url', { length: 1000 }),
  soundcloudPodcastUrl: varchar('soundcloud_podcast_url', { length: 1000 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Artists ──────────────────────────────────────────────────────────────────

export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }),
  bio: text('bio'),
  photo: varchar('photo', { length: 1000 }),
  featured: boolean('featured').default(true),
  soundcloudUrl: varchar('soundcloud_url', { length: 1000 }),
  spotifyUrl: varchar('spotify_url', { length: 1000 }),
  beatportUrl: varchar('beatport_url', { length: 1000 }),
  instagramUrl: varchar('instagram_url', { length: 1000 }),
  residentAdvisorUrl: varchar('resident_advisor_url', { length: 1000 }),
  youtubeUrl: varchar('youtube_url', { length: 1000 }),
  layloUrl: varchar('laylo_url', { length: 1000 }),
  managementEmail: varchar('management_email', { length: 255 }),
  bookingEmail: varchar('booking_email', { length: 255 }),
  bookingNaEmail: varchar('booking_na_email', { length: 255 }),
  bookingRowEmail: varchar('booking_row_email', { length: 255 }),
  pressKitUrl: varchar('press_kit_url', { length: 1000 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Podcasts ─────────────────────────────────────────────────────────────────

export const podcasts = pgTable('podcasts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  episodeNumber: integer('episode_number'),
  episodePart: varchar('episode_part', { length: 10 }).default('single'),
  catalogNumber: varchar('catalog_number', { length: 50 }),
  date: date('date'),
  artistSlug: varchar('artist_slug', { length: 255 }),
  soundcloudUrl: varchar('soundcloud_url', { length: 1000 }),
  spotifyUrl: varchar('spotify_url', { length: 1000 }),
  youtubeUrl: varchar('youtube_url', { length: 1000 }),
  applePodcastsUrl: varchar('apple_podcasts_url', { length: 1000 }),
  description: text('description'),
  coverImage: varchar('cover_image', { length: 1000 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Press ────────────────────────────────────────────────────────────────────

export const press = pgTable('press', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  headline: varchar('headline', { length: 500 }).notNull(),
  publication: varchar('publication', { length: 255 }),
  date: date('date'),
  url: varchar('url', { length: 1000 }),
  excerpt: text('excerpt'),
  type: varchar('type', { length: 50 }).default('feature'),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Free Downloads ───────────────────────────────────────────────────────────

export const freeDownloads = pgTable('free_downloads', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  artistName: varchar('artist_name', { length: 255 }),
  description: text('description'),
  coverImage: varchar('cover_image', { length: 1000 }),
  releaseDate: date('release_date'),
  soundcloudDownloadUrl: varchar('soundcloud_download_url', { length: 1000 }),
  soundcloudTrackId: varchar('soundcloud_track_id', { length: 100 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Showcases ────────────────────────────────────────────────────────────────

export const showcases = pgTable('showcases', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  date: date('date'),
  venue: varchar('venue', { length: 255 }),
  city: varchar('city', { length: 255 }),
  country: varchar('country', { length: 255 }),
  artistSlugs: jsonb('artist_slugs').$type<string[]>().default([]),
  ticketUrl: varchar('ticket_url', { length: 1000 }),
  layloSignupUrl: varchar('laylo_signup_url', { length: 1000 }),
  flyer: varchar('flyer', { length: 1000 }),
  aftermovieUrl: varchar('aftermovie_url', { length: 1000 }),
  merchHandles: jsonb('merch_handles').$type<string[]>().default([]),
  links: jsonb('links').$type<Array<{ label: string; url: string }>>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const showcasePhotos = pgTable('showcase_photos', {
  id: serial('id').primaryKey(),
  showcaseId: integer('showcase_id').notNull().references(() => showcases.id, { onDelete: 'cascade' }),
  image: varchar('image', { length: 1000 }),
  caption: varchar('caption', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
});

export const showcaseRecordings = pgTable('showcase_recordings', {
  id: serial('id').primaryKey(),
  showcaseId: integer('showcase_id').notNull().references(() => showcases.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 1000 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  djLabel: varchar('dj_label', { length: 500 }),
  sortOrder: integer('sort_order').default(0),
});

// ─── Singletons ───────────────────────────────────────────────────────────────

export const siteConfig = pgTable('site_config', {
  id: integer('id').primaryKey().default(1),
  siteName: varchar('site_name', { length: 255 }).default('Marginalia'),
  tagline: varchar('tagline', { length: 500 }),
  instagramUrl: varchar('instagram_url', { length: 1000 }),
  soundcloudUrl: varchar('soundcloud_url', { length: 1000 }),
  beatportUrl: varchar('beatport_url', { length: 1000 }),
  youtubeUrl: varchar('youtube_url', { length: 1000 }),
  tiktokUrl: varchar('tiktok_url', { length: 1000 }),
  facebookUrl: varchar('facebook_url', { length: 1000 }),
  merchUrl: varchar('merch_url', { length: 1000 }),
  shopifyBuyButtonCode: text('shopify_buy_button_code'),
  demoEmail: varchar('demo_email', { length: 255 }).default('elif@marginalialabel.com'),
  newsletterProvider: varchar('newsletter_provider', { length: 100 }),
  layloUrl: varchar('laylo_url', { length: 1000 }),
  soundcloudPlaylistUrl: varchar('soundcloud_playlist_url', { length: 1000 }),
  navbarColor: varchar('navbar_color', { length: 50 }).default('black-70'),
  buttonColor: varchar('button_color', { length: 50 }).default('white'),
  miniPlayerColor: varchar('mini_player_color', { length: 50 }).default('player-default'),
  footerColor: varchar('footer_color', { length: 50 }).default('surface'),
  announcementActive: boolean('announcement_active').default(false),
  announcementText: varchar('announcement_text', { length: 500 }),
  announcementUrl: varchar('announcement_url', { length: 1000 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const homePage = pgTable('home_page', {
  id: integer('id').primaryKey().default(1),
  heroHeadline: varchar('hero_headline', { length: 500 }),
  heroSubtext: varchar('hero_subtext', { length: 500 }),
  heroVideoDesktopR2Url: varchar('hero_video_desktop_r2_url', { length: 1000 }),
  heroVideoDesktopYoutubeUrl: varchar('hero_video_desktop_youtube_url', { length: 1000 }),
  heroVideoMobileR2Url: varchar('hero_video_mobile_r2_url', { length: 1000 }),
  heroVideoMobileYoutubeUrl: varchar('hero_video_mobile_youtube_url', { length: 1000 }),
  heroVideoStartSecond: integer('hero_video_start_second'),
  featuredReleaseSlug: varchar('featured_release_slug', { length: 255 }),
  featuredArtistSlugs: jsonb('featured_artist_slugs').$type<string[]>().default([]),
  beatportAccolade: varchar('beatport_accolade', { length: 255 }),
  heroLayloEmbedUrl: varchar('hero_laylo_embed_url', { length: 1000 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aboutPage = pgTable('about_page', {
  id: integer('id').primaryKey().default(1),
  headline: varchar('headline', { length: 500 }),
  body: text('body'),
  photo: varchar('photo', { length: 1000 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const demoPage = pgTable('demo_page', {
  id: integer('id').primaryKey().default(1),
  acceptingDemos: boolean('accepting_demos').default(true),
  heading: varchar('heading', { length: 255 }).default('Submit a Demo'),
  intro: text('intro'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
