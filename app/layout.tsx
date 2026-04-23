import type { Metadata } from 'next';
import './globals.css';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com'
  ),
  title: 'Marginalia — Melodic House & Techno Label',
  description: 'Barcelona-based label for melodic house and techno.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
