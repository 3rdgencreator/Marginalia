'use server';

import { db } from '@/lib/db';
import { showcases, showcasePhotos, showcaseRecordings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toSlug, formStr, formInt } from './utils';

function parseArtistSlugs(formData: FormData): string[] {
  const raw = formStr(formData, 'artistSlugs') ?? '';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function parseLinks(formData: FormData): Array<{ label: string; url: string }> {
  const labels = formData.getAll('link_label').map(v => String(v).trim()).filter(Boolean);
  const urls = formData.getAll('link_url').map(v => String(v).trim()).filter(Boolean);
  const result: Array<{ label: string; url: string }> = [];
  for (let i = 0; i < Math.min(labels.length, urls.length); i++) {
    if (labels[i] && urls[i]) result.push({ label: labels[i], url: urls[i] });
  }
  return result;
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
    merchHandles: formData.getAll('merch_handles').map(v => String(v)).filter(Boolean),
    links: parseLinks(formData),
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
    merchHandles: formData.getAll('merch_handles').map(v => String(v)).filter(Boolean),
    links: parseLinks(formData),
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

export async function addShowcaseRecording(showcaseId: number) {
  const existing = await db
    .select({ sortOrder: showcaseRecordings.sortOrder })
    .from(showcaseRecordings)
    .where(eq(showcaseRecordings.showcaseId, showcaseId))
    .orderBy(showcaseRecordings.sortOrder);

  const nextOrder = existing.length > 0
    ? (existing[existing.length - 1].sortOrder ?? 0) + 1
    : 0;

  await db.insert(showcaseRecordings).values({
    showcaseId,
    url: '',
    title: '',
    djLabel: null,
    sortOrder: nextOrder,
  });

  revalidatePath('/admin/showcases');
}

export async function updateShowcaseRecording(recordingId: number, formData: FormData) {
  const url = formStr(formData, 'url') ?? '';
  const title = formStr(formData, 'title') ?? '';
  const djLabel = formStr(formData, 'djLabel');
  const sortOrder = formInt(formData, 'sortOrder') ?? 0;

  await db.update(showcaseRecordings).set({
    url,
    title,
    djLabel,
    sortOrder,
  }).where(eq(showcaseRecordings.id, recordingId));

  revalidatePath('/admin/showcases');
}

export async function deleteShowcaseRecording(recordingId: number) {
  await db.delete(showcaseRecordings).where(eq(showcaseRecordings.id, recordingId));
  revalidatePath('/admin/showcases');
}
