import Image from 'next/image';
import Link from 'next/link';
import { reader } from '@/lib/keystatic';
import NavLinks from './NavLinks';
import MobileMenu from './MobileMenu';
import SocialIcon, { type Platform } from '@/components/ui/SocialIcon';
import { resolveNavbarColor } from '@/lib/navbar-colors';

const PRIMARY_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/releases', label: 'Releases' },
  { href: '/free-downloads', label: 'Free Downloads' },
  { href: '/merch', label: 'Merch' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/showcases', label: 'Showcases' },
  { href: '/demo', label: 'Demo Submission' },
  { href: '/subscribe', label: 'Subscribe' },
  { href: '/press', label: 'Press' },
  { href: '/services', label: 'Services' },
] as const;

const SOCIAL_PLATFORMS: Platform[] = [
  'newsletter',
  'instagram',
  'soundcloud',
  'beatport',
  'youtube',
  'tiktok',
];

export default async function SiteNav() {
  const config = await reader.singletons.siteConfig.read();

  const socials: Array<{ platform: Platform; url: string | null | undefined }> =
    SOCIAL_PLATFORMS.map((platform) => ({
      platform,
      url: platform === 'newsletter'
        ? '#newsletter'
        : config?.[`${platform}Url` as keyof typeof config] as string | null | undefined,
    }));

  return (
    <header
      className="sticky top-0 z-50 h-[var(--nav-height-mobile)] md:h-[var(--nav-height-desktop)]"
      style={{ backgroundColor: resolveNavbarColor(config?.navbarColor) }}
      aria-label="Main navigation"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '0 20px 0 36px',
        }}
      >
        {/* Left — logo + nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '64px', flexShrink: 0 }}>
          <Link href="/" aria-label="Marginalia, Home" style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            <Image src="/hero-logo.webp" alt="Marginalia" width={120} height={120} style={{ height: '32px', width: 'auto' }} priority />
          </Link>
          <div className="hidden md:flex">
            <NavLinks links={PRIMARY_LINKS} />
          </div>
        </div>

        {/* Right — social icons + mobile menu */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <ul className="hidden md:flex" style={{ alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
            {socials.map(({ platform, url }) => (
              <li key={platform}>
                <SocialIcon platform={platform} url={url} size={16} className="inline-flex items-center justify-center p-2 text-[#444] hover:text-(--color-accent-lime) transition-colors duration-150" />
              </li>
            ))}
          </ul>
          <MobileMenu links={PRIMARY_LINKS} className="md:hidden" />
        </div>
      </div>
    </header>
  );
}
