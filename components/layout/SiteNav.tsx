import Logo from '@/components/ui/Logo';
import Container from './Container';
import NavLinks from './NavLinks';
import MobileMenu from './MobileMenu';

const PRIMARY_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/releases', label: 'Releases' },
  { href: '/free-downloads', label: 'Free Downloads' },
  { href: '/merch', label: 'Merch' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/showcases', label: 'Showcases' },
  { href: '/demo', label: 'Demo Submission' },
  { href: '/subscribe', label: 'Subscribe' },
  { href: '/press', label: 'Press' },
] as const;

export default function SiteNav() {
  return (
    <header
      className="sticky top-0 z-50 bg-[--color-surface] h-[var(--nav-height-mobile)] md:h-[var(--nav-height-desktop)]"
      aria-label="Main navigation"
    >
      <Container className="flex h-full items-center justify-between">
        <a href="/" aria-label="Marginalia — Home" className="inline-flex items-center">
          <Logo className="h-8 w-auto text-[--color-text-primary]" />
        </a>
        <NavLinks links={PRIMARY_LINKS} className="hidden md:flex" />
        <MobileMenu links={PRIMARY_LINKS} className="md:hidden" />
      </Container>
    </header>
  );
}
