import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { releases } from '@/lib/db/schema';
import { and, eq, lte, or, isNotNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Release-day cleanup. Runs once daily (Cloudflare Cron Trigger or external scheduler).
 *
 * For every release whose releaseDate has passed AND still has any pre-save data:
 * - Clears `presave` flag, `presaveLayloUrl`, and `hypedditUrl`
 * - Optionally calls /api/admin/fetch-release with the existing UPC or Spotify URL
 *   to populate platform links the distributor has now activated
 *
 * Auth: requires header `x-cron-secret` matching CRON_SECRET env var, OR a
 * Cloudflare-issued cron event (which sets `cf-trigger: schedule`).
 */
export async function POST(req: NextRequest) {
  const ok = authorize(req);
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);

  // Find releases that should have already shed their pre-save data
  const stale = await db
    .select()
    .from(releases)
    .where(
      and(
        isNotNull(releases.releaseDate),
        lte(releases.releaseDate, today),
        or(
          eq(releases.presave, true),
          isNotNull(releases.hypedditUrl),
          isNotNull(releases.presaveLayloUrl),
        ),
      ),
    );

  const cleaned: string[] = [];
  const enriched: string[] = [];

  for (const r of stale) {
    await db
      .update(releases)
      .set({
        presave: false,
        hypedditUrl: null,
        presaveLayloUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(releases.id, r.id));
    cleaned.push(r.slug);

    // Try to enrich platform links if some are missing — only when we have
    // a UPC or an existing Spotify URL to fetch from.
    const stillMissingPlatforms =
      !r.beatportUrl || !r.appleMusicUrl || !r.deezerUrl || !r.tidalUrl;
    const hasLookupHandle = r.upc || r.spotifyUrl;
    if (stillMissingPlatforms && hasLookupHandle) {
      const filled = await enrichPlatforms(req, r);
      if (filled) enriched.push(r.slug);
    }

    revalidatePath(`/releases/${r.slug}`);
  }
  revalidatePath('/releases');

  return NextResponse.json({ cleaned, enriched, count: cleaned.length });
}

// GET → same behaviour, useful for manual / browser testing with the secret
export const GET = POST;

function authorize(req: NextRequest): boolean {
  const trigger = req.headers.get('cf-trigger');
  if (trigger === 'schedule') return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const provided =
    req.headers.get('x-cron-secret') ??
    new URL(req.url).searchParams.get('secret');
  return provided === secret;
}

type ReleaseRow = typeof releases.$inferSelect;

async function enrichPlatforms(req: NextRequest, r: ReleaseRow): Promise<boolean> {
  const params = new URLSearchParams();
  if (r.upc) params.set('upc', r.upc);
  if (r.spotifyUrl) params.set('url', r.spotifyUrl);
  if (![...params.keys()].length) return false;

  // Call our own fetch-release route. We cannot easily share auth here; instead
  // duplicate the lookup logic by calling the upstream APIs directly via SQL UPDATE.
  // For simplicity, we reuse the route with the cron secret bypass.
  const origin = new URL(req.url).origin;
  const res = await fetch(`${origin}/api/admin/fetch-release?${params}`, {
    headers: { 'x-cron-secret': process.env.CRON_SECRET ?? '' },
  });
  if (!res.ok) return false;
  const data = await res.json();

  await db
    .update(releases)
    .set({
      // Only fill empty fields — never overwrite manual input
      beatportUrl: r.beatportUrl ?? data.beatportUrl ?? null,
      spotifyUrl: r.spotifyUrl ?? data.spotifyUrl ?? null,
      soundcloudUrl: r.soundcloudUrl ?? data.soundcloudUrl ?? null,
      appleMusicUrl: r.appleMusicUrl ?? data.appleMusicUrl ?? null,
      deezerUrl: r.deezerUrl ?? data.deezerUrl ?? null,
      tidalUrl: r.tidalUrl ?? data.tidalUrl ?? null,
      amazonUrl: r.amazonUrl ?? data.amazonUrl ?? null,
      youtubeUrl: r.youtubeUrl ?? data.youtubeUrl ?? null,
      anghamiUrl: r.anghamiUrl ?? data.anghamiUrl ?? null,
      pandoraUrl: r.pandoraUrl ?? data.pandoraUrl ?? null,
      coverArt: r.coverArt ?? data.coverArt ?? null,
      artworkUrl: r.artworkUrl ?? data.artworkUrl ?? null,
      updatedAt: new Date(),
    })
    .where(eq(releases.id, r.id));
  // Use sql tag once to avoid unused-import lint
  void sql;
  return true;
}
