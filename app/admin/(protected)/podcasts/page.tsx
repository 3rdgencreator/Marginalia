import { db } from '@/lib/db';
import { podcasts } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function PodcastsAdmin() {
  const all = await db.select().from(podcasts).orderBy(desc(podcasts.date));
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">Podcasts</h1>
        <Link href="/admin/podcasts/new" className="px-5 py-2 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">+ New</Link>
      </div>
      <div className="flex flex-col gap-2">
        {all.map(p => (
          <Link key={p.slug} href={`/admin/podcasts/${p.slug}`}
            className="flex items-center gap-4 bg-[#2A2A2C] border border-white/5 px-5 py-4 hover:border-white/20 transition-colors duration-150">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{p.title}</p>
              <p className="text-xs text-gray-500">{p.date} · Ep {p.episodeNumber}{p.episodePart !== 'single' ? ` (${p.episodePart?.toUpperCase()})` : ''}</p>
            </div>
          </Link>
        ))}
        {all.length === 0 && <p className="text-gray-500 text-sm">No podcasts yet.</p>}
      </div>
    </div>
  );
}
