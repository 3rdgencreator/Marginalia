import { MetadataRoute } from 'next';
import { getAllReleases, getAllArtists, getAllShowcases } from '@/lib/db/queries';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [releases, artists, showcases] = await Promise.all([
    getAllReleases(),
    getAllArtists(),
    getAllShowcases(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/releases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/artists`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/podcasts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/press`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/showcases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/demo`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  const releaseRoutes: MetadataRoute.Sitemap = releases.map((r) => ({
    url: `${BASE_URL}/releases/${r.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const artistRoutes: MetadataRoute.Sitemap = artists.map((a) => ({
    url: `${BASE_URL}/artists/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const showcaseRoutes: MetadataRoute.Sitemap = showcases.map((s) => ({
    url: `${BASE_URL}/showcases/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...releaseRoutes,
    ...artistRoutes,
    ...showcaseRoutes,
  ];
}
