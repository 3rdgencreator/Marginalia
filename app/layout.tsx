import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import MiniPlayer from '@/components/layout/MiniPlayer';
import { resolveMiniPlayerColor, resolveButtonColor } from '@/lib/navbar-colors';
import FirstVisitPrompt from '@/components/ui/FirstVisitPrompt';
import { PlayerProvider } from '@/lib/player-context';
import { CartProvider } from '@/lib/cart-context';
import CartDrawer from '@/components/merch/CartDrawer';
import { getCart } from '@/lib/cart-actions';
import { getAllPodcasts, getSiteConfig } from '@/lib/db/queries';
import { buildSoundCloudPlaylistEmbedUrl, buildSoundCloudEmbedUrl } from '@/lib/releases';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com'
  ),
  title: 'Marginalia | Melodic House & Techno Label',
  description: 'Barcelona-based label for melodic house and techno.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [podcasts, siteConfig, initialCart] = await Promise.all([
    getAllPodcasts(),
    getSiteConfig(),
    getCart(),
  ]);

  const latest = podcasts
    .filter(p => p.soundcloudUrl)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];

  // Prefer playlist URL so the embed URL matches what PodcastPlayer uses —
  // loadPlaylist skips reinit when URL is unchanged, keeping music playing on nav.
  const playlistUrl = siteConfig?.soundcloudPlaylistUrl ?? null;
  const episodeUrl = latest?.soundcloudUrl ?? null;
  const scUrl = playlistUrl ?? episodeUrl ?? null;
  const latestEmbedUrl = playlistUrl
    ? buildSoundCloudPlaylistEmbedUrl(playlistUrl)
    : (episodeUrl ? buildSoundCloudEmbedUrl(episodeUrl) : null);
  const latestTitle = latest?.title ?? 'Marginalia Podcasts';

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
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
      <body
        className="min-h-full flex flex-col font-sans text-(--color-text-primary)"
        style={{ '--color-button': resolveButtonColor(siteConfig?.buttonColor) } as React.CSSProperties}>
        <CartProvider initialCart={initialCart}>
          <PlayerProvider>
            <SiteNav />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <MiniPlayer bgColor={resolveMiniPlayerColor(siteConfig?.miniPlayerColor)} />
            {latestEmbedUrl && scUrl && (
              <div className="hidden md:block">
                <FirstVisitPrompt
                  embedUrl={latestEmbedUrl}
                  scUrl={scUrl}
                  trackTitle={latestTitle}
                />
              </div>
            )}
          </PlayerProvider>
          <CartDrawer />
          <Toaster theme="dark" position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  );
}
