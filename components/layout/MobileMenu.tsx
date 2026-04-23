'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavLink = { href: string; label: string };

export default function MobileMenu({
  links,
  className = '',
}: {
  links: readonly NavLink[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close when route changes (link navigation)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-overlay"
        className="p-3 text-(--color-text-primary)"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>
      <div
        id="mobile-nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-(--color-bg) transition-all duration-200 ease-in-out ${
          open
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <nav
          aria-label="Mobile navigation"
          className="pt-[var(--nav-height-mobile)] px-5 flex flex-col gap-6"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-(--text-heading) font-bold text-(--color-text-primary) ${
                pathname === href ? 'text-(--color-accent-lime)' : ''
              }`}
              aria-current={pathname === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
