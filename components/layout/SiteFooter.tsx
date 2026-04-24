import Link from 'next/link';
import { reader } from '@/lib/keystatic';
import Container from './Container';
import Logo from '@/components/ui/Logo';
import SocialIcon, { type Platform } from '@/components/ui/SocialIcon';
import NewsletterForm from './NewsletterForm';

const FALLBACK_TAGLINE = 'Barcelona · Melodic House & Techno';

const QUICK_LINKS = [
  { href: '/releases', label: 'Releases' },
  { href: '/artists', label: 'Artists' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/press', label: 'Press' },
  { href: '/showcases', label: 'Showcases' },
  { href: '/about', label: 'About' },
] as const;

const INCUBATION_LABELS = [
  'Management',
  'Mix & Mastering',
  'Production Classes',
  'Mentoring',
] as const;

export default async function SiteFooter() {
  // AMENDMENT 1: read() returns null if YAML missing; readOrThrow() would crash.
  const config = await reader.singletons.siteConfig.read();

  const tagline = config?.tagline || FALLBACK_TAGLINE;
  const socials: Array<{ platform: Platform; url: string | null | undefined }> = [
    { platform: 'instagram', url: config?.instagramUrl },
    { platform: 'soundcloud', url: config?.soundcloudUrl },
    { platform: 'beatport', url: config?.beatportUrl },
    { platform: 'youtube', url: config?.youtubeUrl },
    { platform: 'tiktok', url: config?.tiktokUrl },
    { platform: 'facebook', url: config?.facebookUrl },
  ];
  const newsletterListId = config?.newsletterProvider ?? null;
  const year = new Date().getFullYear();

  return (
    <footer
      className="bg-(--color-surface) pt-12 pb-8 mt-auto"
      aria-label="Site footer"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 — Brand + Newsletter */}
          <div>
            <Logo className="h-10 w-auto text-(--color-text-primary)" />
            <div
              id="newsletter"
              className="mt-6 rounded-xl border border-white/70 bg-white/10 backdrop-blur-sm px-4 py-3 max-w-xs"
              style={{ boxShadow: '0 0 20px 6px rgba(202,201,249,0.25), 0 0 6px 2px rgba(202,201,249,0.35)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-primary) mb-1">
                Newsletter
              </p>
              <p className="text-[11px] text-(--color-text-secondary) leading-relaxed mb-0">
                New releases, free downloads &amp; events — straight to your inbox.
              </p>
              <NewsletterForm listId={newsletterListId} />
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <nav aria-label="Footer quick links">
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-(--text-label) text-(--color-text-secondary) hover:text-(--color-surface-purple) transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3 — Connect (Social + Incubation) */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-(--text-label) text-(--color-text-primary) font-bold mb-3">
                Connect
              </h2>
              <ul className="flex flex-wrap gap-1">
                {socials.map(({ platform, url }) => (
                  <li key={platform}>
                    <SocialIcon platform={platform} url={url} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-(--text-label) font-bold mb-3">
                <Link href="/services" className="text-(--color-text-primary) hover:text-(--color-accent-lime) transition-colors duration-150">
                  Incubation
                </Link>
              </h2>
              <ul className="flex flex-col gap-2">
                {INCUBATION_LABELS.map((label) => (
                  <li key={label}>
                    <Link
                      href="/services"
                      className="text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-(--text-label) text-(--color-text-secondary)">
            © {year} Marginalia. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
