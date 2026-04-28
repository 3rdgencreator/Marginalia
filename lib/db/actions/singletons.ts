'use server';

import { db } from '@/lib/db';
import { siteConfig, homePage, aboutPage, demoPage } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formStr, formBool } from './utils';

export async function updateSiteConfig(formData: FormData) {
  await db.update(siteConfig).set({
    siteName: formStr(formData, 'siteName') ?? 'Marginalia',
    tagline: formStr(formData, 'tagline'),
    instagramUrl: formStr(formData, 'instagramUrl'),
    soundcloudUrl: formStr(formData, 'soundcloudUrl'),
    beatportUrl: formStr(formData, 'beatportUrl'),
    youtubeUrl: formStr(formData, 'youtubeUrl'),
    tiktokUrl: formStr(formData, 'tiktokUrl'),
    facebookUrl: formStr(formData, 'facebookUrl'),
    merchUrl: formStr(formData, 'merchUrl'),
    shopifyBuyButtonCode: formStr(formData, 'shopifyBuyButtonCode'),
    demoEmail: formStr(formData, 'demoEmail') ?? 'elif@marginalialabel.com',
    newsletterProvider: formStr(formData, 'newsletterProvider'),
    layloUrl: formStr(formData, 'layloUrl'),
    soundcloudPlaylistUrl: formStr(formData, 'soundcloudPlaylistUrl'),
    navbarColor: formStr(formData, 'navbarColor') ?? 'black-70',
    buttonColor: formStr(formData, 'buttonColor') ?? 'white',
    miniPlayerColor: formStr(formData, 'miniPlayerColor') ?? 'player-default',
    footerColor: formStr(formData, 'footerColor') ?? 'surface',
    announcementActive: formBool(formData, 'announcementActive'),
    announcementText: formStr(formData, 'announcementText'),
    announcementUrl: formStr(formData, 'announcementUrl'),
    updatedAt: new Date(),
  }).where(eq(siteConfig.id, 1));

  revalidatePath('/');
  revalidatePath('/admin/site-config');
  redirect('/admin/site-config');
}

export async function updateHomePage(formData: FormData) {
  const rawSlugs = formStr(formData, 'featuredArtistSlugs') ?? '';
  const featuredArtistSlugs = rawSlugs.split(',').map(s => s.trim()).filter(Boolean);

  await db.update(homePage).set({
    heroHeadline: formStr(formData, 'heroHeadline'),
    heroSubtext: formStr(formData, 'heroSubtext'),
    heroVideoDesktopR2Url: formStr(formData, 'heroVideoDesktopR2Url'),
    heroVideoDesktopYoutubeUrl: formStr(formData, 'heroVideoDesktopYoutubeUrl'),
    heroVideoMobileR2Url: formStr(formData, 'heroVideoMobileR2Url'),
    heroVideoMobileYoutubeUrl: formStr(formData, 'heroVideoMobileYoutubeUrl'),
    featuredReleaseSlug: formStr(formData, 'featuredReleaseSlug'),
    featuredArtistSlugs,
    beatportAccolade: formStr(formData, 'beatportAccolade'),
    heroLayloEmbedUrl: formStr(formData, 'heroLayloEmbedUrl'),
    updatedAt: new Date(),
  }).where(eq(homePage.id, 1));

  revalidatePath('/');
  revalidatePath('/admin/home');
  redirect('/admin/home');
}

export async function updateAboutPage(formData: FormData) {
  await db.update(aboutPage).set({
    headline: formStr(formData, 'headline'),
    body: formStr(formData, 'body'),
    photo: formStr(formData, 'photo'),
    updatedAt: new Date(),
  }).where(eq(aboutPage.id, 1));

  revalidatePath('/about');
  revalidatePath('/admin/about');
  redirect('/admin/about');
}

export async function updateDemoPage(formData: FormData) {
  await db.update(demoPage).set({
    acceptingDemos: formBool(formData, 'acceptingDemos'),
    heading: formStr(formData, 'heading') ?? 'Submit a Demo',
    intro: formStr(formData, 'intro'),
    updatedAt: new Date(),
  }).where(eq(demoPage.id, 1));

  revalidatePath('/demo');
  revalidatePath('/admin/demo');
  redirect('/admin/site-config');
}
