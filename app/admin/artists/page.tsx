import { db } from '@/lib/db';
import { artists } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import Link from 'next/link';

export default async function ArtistsAdmin() {
  const all = await db.select().from(artists).orderBy(asc(artists.name));
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">Artists</h1>
        <Link href="/admin/artists/new" className="px-5 py-2 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">+ New</Link>
      </div>
      <div className="flex flex-col gap-2">
        {all.map(a => (
          <Link key={a.slug} href={`/admin/artists/${a.slug}`}
            className="flex items-center gap-4 bg-[#2A2A2C] border border-white/5 px-5 py-4 hover:border-white/20 transition-colors duration-150">
            {a.photo && <img src={a.photo} alt="" className="w-10 h-10 object-cover rounded-full shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">{a.name}</p>
              <p className="text-xs text-gray-500">{a.role}</p>
            </div>
            {!a.featured && <span className="text-[10px] text-gray-600 border border-white/10 px-2 py-0.5">Hidden</span>}
          </Link>
        ))}
        {all.length === 0 && <p className="text-gray-500 text-sm">No artists yet.</p>}
      </div>
    </div>
  );
}
