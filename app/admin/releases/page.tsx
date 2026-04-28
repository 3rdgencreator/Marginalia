import { db } from '@/lib/db';
import { releases } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function ReleasesAdmin() {
  const all = await db.select().from(releases).orderBy(desc(releases.releaseDate));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">Releases</h1>
        <Link href="/admin/releases/new" className="px-5 py-2 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">
          + New
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {all.map(r => (
          <Link key={r.slug} href={`/admin/releases/${r.slug}`}
            className="flex items-center gap-4 bg-[#2A2A2C] border border-white/5 px-5 py-4 hover:border-white/20 transition-colors duration-150">
            {r.coverArt && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.coverArt} alt="" className="w-10 h-10 object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{r.title}</p>
              <p className="text-xs text-gray-500">{r.catalogNumber} · {r.releaseDate}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {r.presave && <span className="text-[10px] bg-[#9EFF0A] text-black px-2 py-0.5 font-bold uppercase">Pre-Save</span>}
              {r.featured && <span className="text-[10px] bg-[#580AFF] text-white px-2 py-0.5 font-bold uppercase">Featured</span>}
            </div>
          </Link>
        ))}
        {all.length === 0 && <p className="text-gray-500 text-sm">No releases yet. Add your first one.</p>}
      </div>
    </div>
  );
}
