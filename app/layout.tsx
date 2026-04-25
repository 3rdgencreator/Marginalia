import type { Metadata } from 'next';
import './globals.css';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import MiniPlayer from '@/components/layout/MiniPlayer';
import FirstVisitPrompt from '@/components/ui/FirstVisitPrompt';
import { PlayerProvider } from '@/lib/player-context';
import { reader } from '@/lib/keystatic';
import { buildSoundCloudPlaylistEmbedUrl, buildSoundCloudEmbedUrl } from '@/lib/releases';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com'
  ),
  title: 'Marginalia — Melodic House & Techno Label',
  description: 'Barcelona-based label for melodic house and techno.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [podcasts, siteConfig] = await Promise.all([
    reader.collections.podcasts.all(),
    reader.singletons.siteConfig.read(),
  ]);

  const latest = podcasts
    .filter(p => p.entry.soundcloudUrl)
    .sort((a, b) => (b.entry.date ?? '').localeCompare(a.entry.date ?? ''))[0];

  // Prefer playlist URL so the embed URL matches what PodcastPlayer uses —
  // loadPlaylist skips reinit when URL is unchanged, keeping music playing on nav.
  const playlistUrl = siteConfig?.soundcloudPlaylistUrl ?? null;
  const episodeUrl = latest?.entry.soundcloudUrl ?? null;
  const scUrl = playlistUrl ?? episodeUrl ?? null;
  const latestEmbedUrl = playlistUrl
    ? buildSoundCloudPlaylistEmbedUrl(playlistUrl)
    : (episodeUrl ? buildSoundCloudEmbedUrl(episodeUrl) : null);
  const latestTitle = latest?.entry.title ?? 'Marginalia Podcasts';

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* AMENDMENT 5: preload both woff2 weights for LCP (replaces next/font/local's auto-preload) */}
        <link
          rel="preload"
          href="/fonts/NimbusSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/NimbusSans-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-(--color-text-primary)">
        <PlayerProvider>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <MiniPlayer />
          {latestEmbedUrl && scUrl && (
            <FirstVisitPrompt
              embedUrl={latestEmbedUrl}
              scUrl={scUrl}
              trackTitle={latestTitle}
            />
          )}
        </PlayerProvider>
      </body>
    </html>
  );
}
