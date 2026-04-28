'use server';

import { db } from '@/lib/db';
import { artists } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toSlug, formStr, formBool } from './utils';

export async function createArtist(formData: FormData) {
  const name = formStr(formData, 'name')!;
  const slug = formStr(formData, 'slug') ?? toSlug(name);

  await db.insert(artists).values({
    slug,
    name,
    role: formStr(formData, 'role'),
    bio: formStr(formData, 'bio'),
    photo: formStr(formData, 'photo'),
    featured: formBool(formData, 'featured'),
    soundcloudUrl: formStr(formData, 'soundcloudUrl'),
    spotifyUrl: formStr(formData, 'spotifyUrl'),
    beatportUrl: formStr(formData, 'beatportUrl'),
    instagramUrl: formStr(formData, 'instagramUrl'),
    residentAdvisorUrl: formStr(formData, 'residentAdvisorUrl'),
    youtubeUrl: formStr(formData, 'youtubeUrl'),
    layloUrl: formStr(formData, 'layloUrl'),
    managementEmail: formStr(formData, 'managementEmail'),
    bookingEmail: formStr(formData, 'bookingEmail'),
    bookingNaEmail: formStr(formData, 'bookingNaEmail'),
    bookingRowEmail: formStr(formData, 'bookingRowEmail'),
    pressKitUrl: formStr(formData, 'pressKitUrl'),
  });

  revalidatePath('/admin/artists');
  revalidatePath('/artists');
  redirect('/admin/artists');
}

export async function updateArtist(slug: string, formData: FormData) {
  const newSlug = formStr(formData, 'slug') ?? slug;

  await db.update(artists).set({
    slug: newSlug,
    name: formStr(formData, 'name')!,
    role: formStr(formData, 'role'),
    bio: formStr(formData, 'bio'),
    photo: formStr(formData, 'photo'),
    featured: formBool(formData, 'featured'),
    soundcloudUrl: formStr(formData, 'soundcloudUrl'),
    spotifyUrl: formStr(formData, 'spotifyUrl'),
    beatportUrl: formStr(formData, 'beatportUrl'),
    instagramUrl: formStr(formData, 'instagramUrl'),
    residentAdvisorUrl: formStr(formData, 'residentAdvisorUrl'),
    youtubeUrl: formStr(formData, 'youtubeUrl'),
    layloUrl: formStr(formData, 'layloUrl'),
    managementEmail: formStr(formData, 'managementEmail'),
    bookingEmail: formStr(formData, 'bookingEmail'),
    bookingNaEmail: formStr(formData, 'bookingNaEmail'),
    bookingRowEmail: formStr(formData, 'bookingRowEmail'),
    pressKitUrl: formStr(formData, 'pressKitUrl'),
    updatedAt: new Date(),
  }).where(eq(artists.slug, slug));

  revalidatePath('/admin/artists');
  revalidatePath(`/artists/${newSlug}`);
  revalidatePath('/artists');
  redirect('/admin/artists');
}

export async function deleteArtist(slug: string) {
  await db.delete(artists).where(eq(artists.slug, slug));
  revalidatePath('/admin/artists');
  revalidatePath('/artists');
  redirect('/admin/artists');
}
