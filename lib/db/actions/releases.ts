'use server';

import { db } from '@/lib/db';
import { releases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toSlug, formStr, formBool, formInt } from './utils';

export async function createRelease(formData: FormData) {
  const title = formStr(formData, 'title')!;
  const slug = formStr(formData, 'slug') ?? toSlug(title);

  const existing = await db.select({ slug: releases.slug }).from(releases).where(eq(releases.slug, slug)).limit(1);
  if (existing.length > 0) {
    redirect(`/admin/releases/new?error=duplicate-slug&slug=${encodeURIComponent(slug)}`);
  }

  await db.insert(releases).values({
    slug,
    title,
    catalogNumber: formStr(formData, 'catalogNumber'),
    releaseDate: formStr(formData, 'releaseDate'),
    releaseType: formStr(formData, 'releaseType') ?? 'single',
    coverArt: formStr(formData, 'coverArt'),
    description: formStr(formData, 'description'),
    featured: formBool(formData, 'featured'),
    presave: formBool(formData, 'presave'),
    badgeText: formStr(formData, 'badgeText'),
    sortOrder: formInt(formData, 'sortOrder') ?? 0,
    artistName: formStr(formData, 'artistName'),
    artworkUrl: formStr(formData, 'artworkUrl'),
    upc: formStr(formData, 'upc'),
    layloUrl: formStr(formData, 'layloUrl'),
    beatportUrl: formStr(formData, 'beatportUrl'),
    spotifyUrl: formStr(formData, 'spotifyUrl'),
    soundcloudUrl: formStr(formData, 'soundcloudUrl'),
    appleMusicUrl: formStr(formData, 'appleMusicUrl'),
    deezerUrl: formStr(formData, 'deezerUrl'),
    bandcampUrl: formStr(formData, 'bandcampUrl'),
    tidalUrl: formStr(formData, 'tidalUrl'),
    traxsourceUrl: formStr(formData, 'traxsourceUrl'),
    junoUrl: formStr(formData, 'junoUrl'),
    boomkatUrl: formStr(formData, 'boomkatUrl'),
    amazonUrl: formStr(formData, 'amazonUrl'),
    youtubeUrl: formStr(formData, 'youtubeUrl'),
    anghamiUrl: formStr(formData, 'anghamiUrl'),
    mixcloudUrl: formStr(formData, 'mixcloudUrl'),
    netEaseUrl: formStr(formData, 'netEaseUrl'),
    pandoraUrl: formStr(formData, 'pandoraUrl'),
    saavnUrl: formStr(formData, 'saavnUrl'),
    soundcloudPodcastUrl: formStr(formData, 'soundcloudPodcastUrl'),
  });

  revalidatePath('/admin/releases');
  revalidatePath('/releases');
  redirect('/admin/releases');
}

export async function updateRelease(slug: string, formData: FormData) {
  const newSlug = formStr(formData, 'slug') ?? slug;

  await db.update(releases).set({
    slug: newSlug,
    title: formStr(formData, 'title')!,
    catalogNumber: formStr(formData, 'catalogNumber'),
    releaseDate: formStr(formData, 'releaseDate'),
    releaseType: formStr(formData, 'releaseType') ?? 'single',
    coverArt: formStr(formData, 'coverArt'),
    description: formStr(formData, 'description'),
    featured: formBool(formData, 'featured'),
    presave: formBool(formData, 'presave'),
    badgeText: formStr(formData, 'badgeText'),
    sortOrder: formInt(formData, 'sortOrder') ?? 0,
    artistName: formStr(formData, 'artistName'),
    artworkUrl: formStr(formData, 'artworkUrl'),
    upc: formStr(formData, 'upc'),
    layloUrl: formStr(formData, 'layloUrl'),
    beatportUrl: formStr(formData, 'beatportUrl'),
    spotifyUrl: formStr(formData, 'spotifyUrl'),
    soundcloudUrl: formStr(formData, 'soundcloudUrl'),
    appleMusicUrl: formStr(formData, 'appleMusicUrl'),
    deezerUrl: formStr(formData, 'deezerUrl'),
    bandcampUrl: formStr(formData, 'bandcampUrl'),
    tidalUrl: formStr(formData, 'tidalUrl'),
    traxsourceUrl: formStr(formData, 'traxsourceUrl'),
    junoUrl: formStr(formData, 'junoUrl'),
    boomkatUrl: formStr(formData, 'boomkatUrl'),
    amazonUrl: formStr(formData, 'amazonUrl'),
    youtubeUrl: formStr(formData, 'youtubeUrl'),
    anghamiUrl: formStr(formData, 'anghamiUrl'),
    mixcloudUrl: formStr(formData, 'mixcloudUrl'),
    netEaseUrl: formStr(formData, 'netEaseUrl'),
    pandoraUrl: formStr(formData, 'pandoraUrl'),
    saavnUrl: formStr(formData, 'saavnUrl'),
    soundcloudPodcastUrl: formStr(formData, 'soundcloudPodcastUrl'),
    updatedAt: new Date(),
  }).where(eq(releases.slug, slug));

  revalidatePath('/admin/releases');
  revalidatePath(`/releases/${newSlug}`);
  revalidatePath('/releases');
  redirect('/admin/releases');
}

export async function deleteRelease(slug: string) {
  await db.delete(releases).where(eq(releases.slug, slug));
  revalidatePath('/admin/releases');
  revalidatePath('/releases');
  redirect('/admin/releases');
}
