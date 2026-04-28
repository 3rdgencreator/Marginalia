import { db } from '@/lib/db';
import { releases, artists, podcasts, press, showcases } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import Link from 'next/link';

const CARDS = [
  { href: '/admin/releases', label: 'Releases', color: '#580AFF' },
  { href: '/admin/artists', label: 'Artists', color: '#9EFF0A' },
  { href: '/admin/podcasts', label: 'Podcasts', color: '#ef6b8e' },
  { href: '/admin/press', label: 'Press', color: '#f29753' },
  { href: '/admin/showcases', label: 'Showcases', color: '#66cc99' },
];

export default async function AdminDashboard() {
  const [
    [releaseCount],
    [artistCount],
    [podcastCount],
    [pressCount],
    [showcaseCount],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(releases),
    db.select({ count: sql<number>`count(*)` }).from(artists),
    db.select({ count: sql<number>`count(*)` }).from(podcasts),
    db.select({ count: sql<number>`count(*)` }).from(press),
    db.select({ count: sql<number>`count(*)` }).from(showcases),
  ]);

  const counts: Record<string, number> = {
    Releases: Number(releaseCount.count),
    Artists: Number(artistCount.count),
    Podcasts: Number(podcastCount.count),
    Press: Number(pressCount.count),
    Showcases: Number(showcaseCount.count),
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {CARDS.map(({ href, label, color }) => (
          <Link
            key={href}
            href={href}
            className="block bg-[#2A2A2C] border border-white/5 p-6 hover:border-white/20 transition-colors duration-150"
          >
            <p className="text-3xl font-bold mb-1" style={{ color }}>{counts[label] ?? 0}</p>
            <p className="text-sm text-gray-400 uppercase tracking-widest">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/site-config" className="block bg-[#2A2A2C] border border-white/5 p-5 hover:border-white/20 transition-colors duration-150">
          <p className="text-sm font-bold text-white mb-1">Site Config</p>
          <p className="text-xs text-gray-500">Nav, footer, colors, announcement</p>
        </Link>
        <Link href="/admin/home" className="block bg-[#2A2A2C] border border-white/5 p-5 hover:border-white/20 transition-colors duration-150">
          <p className="text-sm font-bold text-white mb-1">Home Page</p>
          <p className="text-xs text-gray-500">Hero video, featured releases, accolade</p>
        </Link>
        <Link href="/admin/about" className="block bg-[#2A2A2C] border border-white/5 p-5 hover:border-white/20 transition-colors duration-150">
          <p className="text-sm font-bold text-white mb-1">About Page</p>
          <p className="text-xs text-gray-500">Headline, body text, photo</p>
        </Link>
      </div>
    </div>
  );
}
