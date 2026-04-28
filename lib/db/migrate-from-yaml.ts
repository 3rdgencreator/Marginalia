/**
 * One-time migration: reads all Keystatic YAML content files and inserts them
 * into the Neon PostgreSQL database. Safe to run multiple times — uses
 * ON CONFLICT DO NOTHING for collections and upserts for singletons.
 *
 * Run: npx tsx lib/db/migrate-from-yaml.ts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { db } from './index';
import {
  releases, artists, showcases, siteConfig, homePage, aboutPage, demoPage, freeDownloads,
} from './schema';

const CONTENT = path.join(process.cwd(), 'content');

// ─── Mdoc → plain text ───────────────────────────────────────────────────────

function mdocToPlainText(mdoc: string): string {
  return mdoc
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.+?)\*/g, '$1')        // *italic*
    .replace(/#{1,6}\s+/g, '')          // ### headings
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // [link text](url)
    .replace(/\r\n/g, '\n')
    .trim();
}

function readMdoc(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) return null;
  return mdocToPlainText(content);
}

function readYaml(filePath: string): Record<string, unknown> | null {
  if (!fs.existsSync(filePath)) return null;
  return yaml.load(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
}

function slugFrom(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

function str(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10); // YYYY-MM-DD
  return String(v).trim() || null;
}

function bool(v: unknown, fallback = false): boolean {
  if (v === undefined || v === null) return fallback;
  return Boolean(v);
}

// ─── Releases ─────────────────────────────────────────────────────────────────

async function migrateReleases() {
  const dir = path.join(CONTENT, 'releases');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'));
  let count = 0;

  for (const file of files) {
    const slug = slugFrom(file);
    const data = readYaml(path.join(dir, file));
    if (!data) continue;

    const pl = (data.platformLinks as Record<string, unknown>) ?? {};

    const descPath = path.join(dir, slug, 'description.mdoc');
    const description = readMdoc(descPath);

    const row = {
      slug,
      title: str(data.title) ?? slug,
      catalogNumber: str(data.catalogNumber),
      releaseDate: str(data.releaseDate),
      releaseType: str(data.releaseType) ?? 'single',
      coverArt: null, // YAML stored filenames; use artworkUrl (CDN) instead
      description,
      featured: bool(data.featured, false),
      presave: bool(data.presave, false),
      badgeText: str(data.badgeText),
      sortOrder: 0,
      artistName: str(pl.artistName),
      artworkUrl: str(pl.artworkUrl),
      upc: str(pl.upc),
      layloUrl: str(pl.layloUrl),
      beatportUrl: str(pl.beatportUrl),
      spotifyUrl: str(pl.spotifyUrl),
      soundcloudUrl: str(pl.soundcloudUrl),
      appleMusicUrl: str(pl.appleMusicUrl),
      deezerUrl: str(pl.deezerUrl),
      bandcampUrl: str(pl.bandcampUrl),
      tidalUrl: str(pl.tidalUrl),
      traxsourceUrl: str(pl.traxsourceUrl),
      junoUrl: str(pl.junoUrl),
      boomkatUrl: str(pl.boomkatUrl),
      amazonUrl: str(pl.amazonUrl),
      youtubeUrl: str(pl.youtubeUrl),
      anghamiUrl: str(pl.anghamiUrl),
      mixcloudUrl: str(pl.mixcloudUrl),
      netEaseUrl: str(pl.netEaseUrl),
      pandoraUrl: str(pl.pandoraUrl),
      saavnUrl: str(pl.saavnUrl),
      soundcloudPodcastUrl: str(pl.soundcloudPodcastUrl),
    };

    await db.insert(releases).values(row).onConflictDoNothing();
    count++;
    console.log(`  release: ${slug}`);
  }
  console.log(`✓ ${count} releases migrated`);
}

// ─── Artists ──────────────────────────────────────────────────────────────────

async function migrateArtists() {
  const dir = path.join(CONTENT, 'artists');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'));
  let count = 0;

  for (const file of files) {
    const slug = slugFrom(file);
    const data = readYaml(path.join(dir, file));
    if (!data) continue;

    const bioPath = path.join(dir, slug, 'bio.mdoc');
    const bio = readMdoc(bioPath);

    // YAML stores photo as /images/artists/slug/photo.jpg — keep as-is
    const row = {
      slug,
      name: str(data.name) ?? slug,
      role: str(data.role),
      bio,
      photo: str(data.photo), // already a full /images/... path
      featured: bool(data.featured, true),
      soundcloudUrl: str(data.soundcloudUrl),
      spotifyUrl: str(data.spotifyUrl),
      beatportUrl: str(data.beatportUrl),
      instagramUrl: str(data.instagramUrl),
      residentAdvisorUrl: str(data.residentAdvisorUrl),
      youtubeUrl: str(data.youtubeUrl),
      layloUrl: str(data.layloUrl),
      managementEmail: str(data.managementEmail),
      bookingEmail: str(data.bookingEmail),
      // YAML uses bookingNAEmail/bookingROWEmail (uppercase)
      bookingNaEmail: str(data.bookingNAEmail as unknown),
      bookingRowEmail: str(data.bookingROWEmail as unknown),
      pressKitUrl: str(data.pressKitUrl),
    };

    await db.insert(artists).values(row).onConflictDoNothing();
    count++;
    console.log(`  artist: ${slug}`);
  }
  console.log(`✓ ${count} artists migrated`);
}

// ─── Showcases ────────────────────────────────────────────────────────────────

async function migrateShowcases() {
  const dir = path.join(CONTENT, 'showcases');
  if (!fs.existsSync(dir)) { console.log('✓ no showcases dir'); return; }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'));
  let count = 0;

  for (const file of files) {
    const slug = slugFrom(file);
    const data = readYaml(path.join(dir, file));
    if (!data) continue;

    const artistSlugs = Array.isArray(data.artistSlugs)
      ? (data.artistSlugs as string[])
      : [];

    const row = {
      slug,
      title: str(data.title) ?? slug,
      date: str(data.date),
      venue: str(data.venue),
      city: str(data.city),
      country: str(data.country),
      artistSlugs,
      ticketUrl: str(data.ticketUrl),
      layloSignupUrl: str(data.layloSignupUrl),
      flyer: str(data.flyer), // already a /images/showcases/... path
      aftermovieUrl: str(data.aftermovieUrl),
      soundcloudSetUrl: str(data.soundcloudSetUrl),
    };

    await db.insert(showcases).values(row).onConflictDoNothing();
    count++;
    console.log(`  showcase: ${slug}`);
  }
  console.log(`✓ ${count} showcases migrated`);
}

// ─── Free Downloads ───────────────────────────────────────────────────────────

async function migrateFreeDownloads() {
  const dir = path.join(CONTENT, 'free-downloads');
  if (!fs.existsSync(dir)) { console.log('✓ no free-downloads dir'); return; }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml'));
  let count = 0;

  for (const file of files) {
    const slug = slugFrom(file);
    const data = readYaml(path.join(dir, file));
    if (!data) continue;

    const dl = (data.soundcloudDownload as Record<string, unknown>) ?? {};

    const row = {
      slug,
      title: str(data.title) ?? slug,
      artistName: str(data.artistName),
      description: str(data.description),
      coverImage: str(dl.artworkUrl),
      soundcloudDownloadUrl: str(dl.url),
      active: bool(data.active, true),
    };

    await db.insert(freeDownloads).values(row).onConflictDoNothing();
    count++;
    console.log(`  free-download: ${slug}`);
  }
  console.log(`✓ ${count} free-downloads migrated`);
}

// ─── Site Config ──────────────────────────────────────────────────────────────

async function migrateSiteConfig() {
  const data = readYaml(path.join(CONTENT, 'site-config.yaml'));
  if (!data) { console.log('✗ site-config.yaml not found'); return; }

  await db.insert(siteConfig).values({
    id: 1,
    siteName: str(data.siteName) ?? 'Marginalia',
    tagline: str(data.tagline),
    instagramUrl: str(data.instagramUrl),
    soundcloudUrl: str(data.soundcloudUrl),
    beatportUrl: str(data.beatportUrl),
    youtubeUrl: str(data.youtubeUrl),
    tiktokUrl: str(data.tiktokUrl),
    facebookUrl: str(data.facebookUrl),
    merchUrl: str(data.merchUrl),
    shopifyBuyButtonCode: str(data.shopifyBuyButtonCode),
    demoEmail: str(data.demoEmail) ?? 'elif@marginalialabel.com',
    newsletterProvider: str(data.newsletterProvider),
    layloUrl: str(data.layloUrl),
    soundcloudPlaylistUrl: str(data.soundcloudPlaylistUrl),
    navbarColor: str(data.navbarColor) ?? 'black-70',
    buttonColor: str(data.buttonColor) ?? 'white',
    miniPlayerColor: str(data.miniPlayerColor) ?? 'player-default',
    footerColor: str(data.footerColor) ?? 'surface',
    announcementActive: bool(data.announcementActive, false),
    announcementText: str(data.announcementText),
    announcementUrl: str(data.announcementUrl),
  }).onConflictDoUpdate({
    target: siteConfig.id,
    set: {
      siteName: str(data.siteName) ?? 'Marginalia',
      tagline: str(data.tagline),
      instagramUrl: str(data.instagramUrl),
      soundcloudUrl: str(data.soundcloudUrl),
      beatportUrl: str(data.beatportUrl),
      youtubeUrl: str(data.youtubeUrl),
      tiktokUrl: str(data.tiktokUrl),
      facebookUrl: str(data.facebookUrl),
      merchUrl: str(data.merchUrl),
      demoEmail: str(data.demoEmail) ?? 'elif@marginalialabel.com',
      layloUrl: str(data.layloUrl),
      soundcloudPlaylistUrl: str(data.soundcloudPlaylistUrl),
      navbarColor: str(data.navbarColor) ?? 'black-70',
      buttonColor: str(data.buttonColor) ?? 'white',
      miniPlayerColor: str(data.miniPlayerColor) ?? 'player-default',
      footerColor: str(data.footerColor) ?? 'surface',
      announcementActive: bool(data.announcementActive, false),
      announcementText: str(data.announcementText),
      announcementUrl: str(data.announcementUrl),
    },
  });
  console.log('✓ site-config migrated');
}

// ─── Home Page ────────────────────────────────────────────────────────────────

async function migrateHomePage() {
  const data = readYaml(path.join(CONTENT, 'home.yaml'));
  if (!data) { console.log('✗ home.yaml not found'); return; }

  const desktop = (data.heroVideoDesktop as Record<string, unknown>) ?? {};
  const mobile = (data.heroVideoMobile as Record<string, unknown>) ?? {};
  const featuredArtistSlugs = Array.isArray(data.featuredArtistSlugs)
    ? (data.featuredArtistSlugs as string[])
    : [];

  const row = {
    id: 1,
    heroHeadline: str(data.heroHeadline),
    heroSubtext: str(data.heroSubtext),
    heroVideoDesktopR2Url: str(desktop.r2Url),
    heroVideoDesktopYoutubeUrl: str(desktop.youtubeUrl),
    heroVideoMobileR2Url: str(mobile.r2Url),
    heroVideoMobileYoutubeUrl: str(mobile.youtubeUrl),
    heroVideoStartSecond: data.heroVideoStartSecond != null ? Number(data.heroVideoStartSecond) : null,
    featuredReleaseSlug: str(data.featuredReleaseSlug),
    featuredArtistSlugs,
    beatportAccolade: str(data.beatportAccolade),
    heroLayloEmbedUrl: str(data.heroLayloEmbedUrl),
  };

  await db.insert(homePage).values(row).onConflictDoUpdate({
    target: homePage.id,
    set: {
      heroHeadline: row.heroHeadline,
      heroSubtext: row.heroSubtext,
      heroVideoDesktopR2Url: row.heroVideoDesktopR2Url,
      heroVideoDesktopYoutubeUrl: row.heroVideoDesktopYoutubeUrl,
      heroVideoMobileR2Url: row.heroVideoMobileR2Url,
      heroVideoMobileYoutubeUrl: row.heroVideoMobileYoutubeUrl,
      heroVideoStartSecond: row.heroVideoStartSecond,
      featuredReleaseSlug: row.featuredReleaseSlug,
      featuredArtistSlugs: row.featuredArtistSlugs,
      beatportAccolade: row.beatportAccolade,
      heroLayloEmbedUrl: row.heroLayloEmbedUrl,
    },
  });
  console.log('✓ home page migrated');
}

// ─── About Page ───────────────────────────────────────────────────────────────

async function migrateAboutPage() {
  const data = readYaml(path.join(CONTENT, 'about.yaml'));
  const body = readMdoc(path.join(CONTENT, 'about', 'body.mdoc'));

  const row = {
    id: 1,
    headline: data ? str(data.headline) : null,
    body,
    photo: data ? str(data.photo) : null,
  };

  await db.insert(aboutPage).values(row).onConflictDoUpdate({
    target: aboutPage.id,
    set: { headline: row.headline, body: row.body, photo: row.photo },
  });
  console.log('✓ about page migrated');
}

// ─── Demo Page ────────────────────────────────────────────────────────────────

async function migrateDemoPage() {
  const data = readYaml(path.join(CONTENT, 'demo-page.yaml'));
  const intro = readMdoc(path.join(CONTENT, 'demo-page', 'intro.mdoc'));

  const row = {
    id: 1,
    acceptingDemos: data ? bool(data.acceptingDemos, true) : true,
    heading: data ? (str(data.heading) ?? 'Submit a Demo') : 'Submit a Demo',
    intro,
  };

  await db.insert(demoPage).values(row).onConflictDoUpdate({
    target: demoPage.id,
    set: { acceptingDemos: row.acceptingDemos, heading: row.heading, intro: row.intro },
  });
  console.log('✓ demo page migrated');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting YAML → PostgreSQL migration...\n');

  console.log('── Releases ──');
  await migrateReleases();

  console.log('\n── Artists ──');
  await migrateArtists();

  console.log('\n── Showcases ──');
  await migrateShowcases();

  console.log('\n── Free Downloads ──');
  await migrateFreeDownloads();

  console.log('\n── Singletons ──');
  await migrateSiteConfig();
  await migrateHomePage();
  await migrateAboutPage();
  await migrateDemoPage();

  console.log('\n✅ Migration complete!');
  process.exit(0);
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
