'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavLink = { href: string; label: string };

export default function NavLinks({
  links,
  className = '',
}: {
  links: readonly NavLink[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <ul className={`flex items-center gap-6 ${className}`}>
      {links.map(({ href, label }) => {
        const isActive =
          pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <li key={href}>
            <Link
              href={href}
              className={`whitespace-nowrap text-(--text-label) text-(--color-text-primary) hover:text-(--color-surface-purple) transition-colors duration-150 py-2 ${
                isActive
                  ? 'border-b-2 border-(--color-accent-lime)'
                  : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
