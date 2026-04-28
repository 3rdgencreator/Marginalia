'use server';

import { db } from '@/lib/db';
import { showcases, showcasePhotos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toSlug, formStr } from './utils';

function parseArtistSlugs(formData: FormData): string[] {
  const raw = formStr(formData, 'artistSlugs') ?? '';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export async function createShowcase(formData: FormData) {
  const title = formStr(formData, 'title')!;
  const slug = formStr(formData, 'slug') ?? toSlug(title);

  await db.insert(showcases).values({
    slug,
    title,
    date: formStr(formData, 'date'),
    venue: formStr(formData, 'venue'),
    city: formStr(formData, 'city'),
    country: formStr(formData, 'country'),
    artistSlugs: parseArtistSlugs(formData),
    ticketUrl: formStr(formData, 'ticketUrl'),
    layloSignupUrl: formStr(formData, 'layloSignupUrl'),
    flyer: formStr(formData, 'flyer'),
    aftermovieUrl: formStr(formData, 'aftermovieUrl'),
    soundcloudSetUrl: formStr(formData, 'soundcloudSetUrl'),
  });

  revalidatePath('/admin/showcases');
  revalidatePath('/showcases');
  redirect('/admin/showcases');
}

export async function updateShowcase(slug: string, formData: FormData) {
  const newSlug = formStr(formData, 'slug') ?? slug;

  await db.update(showcases).set({
    slug: newSlug,
    title: formStr(formData, 'title')!,
    date: formStr(formData, 'date'),
    venue: formStr(formData, 'venue'),
    city: formStr(formData, 'city'),
    country: formStr(formData, 'country'),
    artistSlugs: parseArtistSlugs(formData),
    ticketUrl: formStr(formData, 'ticketUrl'),
    layloSignupUrl: formStr(formData, 'layloSignupUrl'),
    flyer: formStr(formData, 'flyer'),
    aftermovieUrl: formStr(formData, 'aftermovieUrl'),
    soundcloudSetUrl: formStr(formData, 'soundcloudSetUrl'),
    updatedAt: new Date(),
  }).where(eq(showcases.slug, slug));

  revalidatePath('/admin/showcases');
  revalidatePath(`/showcases/${newSlug}`);
  revalidatePath('/showcases');
  redirect('/admin/showcases');
}

export async function deleteShowcase(slug: string) {
  await db.delete(showcases).where(eq(showcases.slug, slug));
  revalidatePath('/admin/showcases');
  revalidatePath('/showcases');
  redirect('/admin/showcases');
}

export async function addShowcasePhoto(showcaseId: number, formData: FormData) {
  const image = formStr(formData, 'image');
  const caption = formStr(formData, 'caption');
  if (!image) return;

  const existing = await db.select({ sortOrder: showcasePhotos.sortOrder })
    .from(showcasePhotos)
    .where(eq(showcasePhotos.showcaseId, showcaseId))
    .orderBy(showcasePhotos.sortOrder);

  const nextOrder = existing.length > 0
    ? (existing[existing.length - 1].sortOrder ?? 0) + 1
    : 0;

  await db.insert(showcasePhotos).values({
    showcaseId,
    image,
    caption,
    sortOrder: nextOrder,
  });

  revalidatePath('/admin/showcases');
}

export async function deleteShowcasePhoto(photoId: number) {
  await db.delete(showcasePhotos).where(eq(showcasePhotos.id, photoId));
  revalidatePath('/admin/showcases');
}
