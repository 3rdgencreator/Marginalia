'use server';

import { db } from '@/lib/db';
import { press } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toSlug, formStr, formBool } from './utils';

export async function createPress(formData: FormData) {
  const headline = formStr(formData, 'headline')!;
  const slug = formStr(formData, 'slug') ?? toSlug(headline);

  await db.insert(press).values({
    slug,
    headline,
    publication: formStr(formData, 'publication'),
    date: formStr(formData, 'date'),
    url: formStr(formData, 'url'),
    excerpt: formStr(formData, 'excerpt'),
    type: formStr(formData, 'type') ?? 'feature',
    featured: formBool(formData, 'featured'),
  });

  revalidatePath('/admin/press');
  revalidatePath('/press');
  redirect('/admin/press');
}

export async function updatePress(slug: string, formData: FormData) {
  const newSlug = formStr(formData, 'slug') ?? slug;

  await db.update(press).set({
    slug: newSlug,
    headline: formStr(formData, 'headline')!,
    publication: formStr(formData, 'publication'),
    date: formStr(formData, 'date'),
    url: formStr(formData, 'url'),
    excerpt: formStr(formData, 'excerpt'),
    type: formStr(formData, 'type') ?? 'feature',
    featured: formBool(formData, 'featured'),
    updatedAt: new Date(),
  }).where(eq(press.slug, slug));

  revalidatePath('/admin/press');
  revalidatePath('/press');
  redirect('/admin/press');
}

export async function deletePress(slug: string) {
  await db.delete(press).where(eq(press.slug, slug));
  revalidatePath('/admin/press');
  revalidatePath('/press');
  redirect('/admin/press');
}
