import { db } from '@/lib/db';
import { showcases } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function ShowcasesAdmin() {
  const all = await db.select().from(showcases).orderBy(desc(showcases.date));
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">Showcases</h1>
        <Link href="/admin/showcases/new" className="px-5 py-2 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">+ New</Link>
      </div>
      <div className="flex flex-col gap-2">
        {all.map(s => {
          const isPast = (s.date ?? '') < today;
          return (
            <Link key={s.slug} href={`/admin/showcases/${s.slug}`}
              className="flex items-center gap-4 bg-[#2A2A2C] border border-white/5 px-5 py-4 hover:border-white/20 transition-colors duration-150">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{s.title}</p>
                <p className="text-xs text-gray-500">{[s.venue, s.city, s.country].filter(Boolean).join(', ')} · {s.date}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 font-bold uppercase shrink-0 ${isPast ? 'text-gray-500 border border-white/10' : 'bg-[#9EFF0A] text-black'}`}>
                {isPast ? 'Past' : 'Upcoming'}
              </span>
            </Link>
          );
        })}
        {all.length === 0 && <p className="text-gray-500 text-sm">No showcases yet.</p>}
      </div>
    </div>
  );
}
