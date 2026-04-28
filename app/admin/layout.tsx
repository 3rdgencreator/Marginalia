import { auth, signOut } from '@/auth';
import Link from 'next/link';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/releases', label: 'Releases' },
  { href: '/admin/artists', label: 'Artists' },
  { href: '/admin/podcasts', label: 'Podcasts' },
  { href: '/admin/press', label: 'Press' },
  { href: '/admin/showcases', label: 'Showcases' },
  { href: '/admin/site-config', label: 'Site Config' },
  { href: '/admin/home', label: 'Home Page' },
  { href: '/admin/about', label: 'About' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // No session → render children directly (login page handles its own UI)
  // Proxy middleware already blocks unauthenticated access to other admin routes.
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#1F1F21] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#131315] border-r border-white/5 flex flex-col">
        <div className="px-6 py-5 border-b border-white/5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Marginalia</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{session.user?.email}</p>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-3">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors duration-100"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/admin/login' });
            }}
          >
            <button
              type="submit"
              className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors duration-100"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
