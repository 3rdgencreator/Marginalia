import { db } from './index';
import {
  releases, artists, podcasts, press, showcases, showcasePhotos, showcaseRecordings,
  siteConfig, homePage, aboutPage,
} from './schema';
import { eq, desc, asc, and, gte, lt } from 'drizzle-orm';

// ─── Releases ─────────────────────────────────────────────────────────────────

export async function getAllReleases() {
  return db.select().from(releases).orderBy(desc(releases.releaseDate));
}

export async function getReleaseBySlug(slug: string) {
  const [r] = await db.select().from(releases).where(eq(releases.slug, slug)).limit(1);
  return r ?? null;
}

export async function getFeaturedReleases() {
  return db.select().from(releases)
    .where(eq(releases.featured, true))
    .orderBy(desc(releases.releaseDate));
}

export async function getFooterBadgeReleases() {
  return db.select().from(releases)
    .where(eq(releases.featured, true))
    .orderBy(desc(releases.releaseDate));
}

// ─── Artists ──────────────────────────────────────────────────────────────────

export async function getAllArtists() {
  return db.select().from(artists).orderBy(asc(artists.name));
}

export async function getFeaturedArtists() {
  return db.select().from(artists)
    .where(eq(artists.featured, true))
    .orderBy(asc(artists.name));
}

export async function getArtistBySlug(slug: string) {
  const [a] = await db.select().from(artists).where(eq(artists.slug, slug)).limit(1);
  return a ?? null;
}

// ─── Podcasts ─────────────────────────────────────────────────────────────────

export async function getAllPodcasts() {
  return db.select().from(podcasts).orderBy(desc(podcasts.date));
}

// ─── Press ────────────────────────────────────────────────────────────────────

export async function getAllPress() {
  return db.select().from(press).orderBy(desc(press.date));
}

// ─── Showcases ────────────────────────────────────────────────────────────────

export async function getAllShowcases() {
  return db.select().from(showcases).orderBy(desc(showcases.date));
}

export async function getShowcaseBySlug(slug: string) {
  const [s] = await db.select().from(showcases).where(eq(showcases.slug, slug)).limit(1);
  return s ?? null;
}

export async function getShowcasePhotos(showcaseId: number) {
  return db.select().from(showcasePhotos)
    .where(eq(showcasePhotos.showcaseId, showcaseId))
    .orderBy(showcasePhotos.sortOrder);
}

export async function getShowcaseRecordings(showcaseId: number) {
  return db.select().from(showcaseRecordings)
    .where(eq(showcaseRecordings.showcaseId, showcaseId))
    .orderBy(showcaseRecordings.sortOrder);
}

export function getUpcomingShowcases(all: Awaited<ReturnType<typeof getAllShowcases>>) {
  const today = new Date().toISOString().slice(0, 10);
  return all.filter(s => (s.date ?? '') >= today).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
}

export function getPastShowcases(all: Awaited<ReturnType<typeof getAllShowcases>>) {
  const today = new Date().toISOString().slice(0, 10);
  return all.filter(s => (s.date ?? '') < today).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

// ─── Singletons ───────────────────────────────────────────────────────────────

export async function getSiteConfig() {
  const [cfg] = await db.select().from(siteConfig).limit(1);
  return cfg ?? null;
}

export async function getHomePage() {
  const [h] = await db.select().from(homePage).limit(1);
  return h ?? null;
}

export async function getAboutPage() {
  const [a] = await db.select().from(aboutPage).limit(1);
  return a ?? null;
}

// ─── Image URL helper ─────────────────────────────────────────────────────────
// Covers both legacy local paths and new full URLs

export function resolveImageUrl(
  url: string | null | undefined,
  legacyPrefix?: string
): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('/')) return url;
  return legacyPrefix ? `${legacyPrefix}${url}` : `/${url}`;
}
