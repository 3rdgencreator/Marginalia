import type { Metadata } from 'next';
import './globals.css';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import MiniPlayer from '@/components/layout/MiniPlayer';
import FirstVisitPrompt from '@/components/ui/FirstVisitPrompt';
import { PlayerProvider } from '@/lib/player-context';
import { reader } from '@/lib/keystatic';

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

  const scUrl = latest?.entry.soundcloudUrl ?? siteConfig?.soundcloudPlaylistUrl ?? null;
  const isPlaylist = !latest?.entry.soundcloudUrl && !!siteConfig?.soundcloudPlaylistUrl;

  function buildEmbed(url: string, playlist: boolean) {
    const params = new URLSearchParams({
      url, color: '#9EFF0A', auto_play: 'false',
      hide_related: 'true', show_comments: 'false',
      show_user: 'true', show_reposts: 'false',
      show_teaser: 'false',
      visual: playlist ? 'false' : 'true',
    });
    return `https://w.soundcloud.com/player/?${params}`;
  }

  const latestEmbedUrl = scUrl ? buildEmbed(scUrl, isPlaylist) : null;
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
