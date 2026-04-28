'use server';

import { db } from '@/lib/db';
import { podcasts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toSlug, formStr, formInt } from './utils';

export async function createPodcast(formData: FormData) {
  const title = formStr(formData, 'title')!;
  const slug = formStr(formData, 'slug') ?? toSlug(title);

  await db.insert(podcasts).values({
    slug,
    title,
    episodeNumber: formInt(formData, 'episodeNumber'),
    episodePart: formStr(formData, 'episodePart') ?? 'single',
    catalogNumber: formStr(formData, 'catalogNumber'),
    date: formStr(formData, 'date'),
    artistSlug: formStr(formData, 'artistSlug'),
    soundcloudUrl: formStr(formData, 'soundcloudUrl'),
    spotifyUrl: formStr(formData, 'spotifyUrl'),
    youtubeUrl: formStr(formData, 'youtubeUrl'),
    applePodcastsUrl: formStr(formData, 'applePodcastsUrl'),
    description: formStr(formData, 'description'),
    coverImage: formStr(formData, 'coverImage'),
  });

  revalidatePath('/admin/podcasts');
  revalidatePath('/podcasts');
  redirect('/admin/podcasts');
}

export async function updatePodcast(slug: string, formData: FormData) {
  const newSlug = formStr(formData, 'slug') ?? slug;

  await db.update(podcasts).set({
    slug: newSlug,
    title: formStr(formData, 'title')!,
    episodeNumber: formInt(formData, 'episodeNumber'),
    episodePart: formStr(formData, 'episodePart') ?? 'single',
    catalogNumber: formStr(formData, 'catalogNumber'),
    date: formStr(formData, 'date'),
    artistSlug: formStr(formData, 'artistSlug'),
    soundcloudUrl: formStr(formData, 'soundcloudUrl'),
    spotifyUrl: formStr(formData, 'spotifyUrl'),
    youtubeUrl: formStr(formData, 'youtubeUrl'),
    applePodcastsUrl: formStr(formData, 'applePodcastsUrl'),
    description: formStr(formData, 'description'),
    coverImage: formStr(formData, 'coverImage'),
    updatedAt: new Date(),
  }).where(eq(podcasts.slug, slug));

  revalidatePath('/admin/podcasts');
  revalidatePath('/podcasts');
  redirect('/admin/podcasts');
}

export async function deletePodcast(slug: string) {
  await db.delete(podcasts).where(eq(podcasts.slug, slug));
  revalidatePath('/admin/podcasts');
  revalidatePath('/podcasts');
  redirect('/admin/podcasts');
}
