import { db } from '@/lib/db';
import { showcases, showcasePhotos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { updateShowcase, deleteShowcase, addShowcasePhoto, deleteShowcasePhoto } from '@/lib/db/actions/showcases';
import { Field, Section, Grid2 } from '@/components/admin/AdminField';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';

type Props = { params: Promise<{ slug: string }> };

export default async function EditShowcasePage({ params }: Props) {
  const { slug } = await params;
  const [s] = await db.select().from(showcases).where(eq(showcases.slug, slug)).limit(1);
  if (!s) notFound();

  const photos = await db.select().from(showcasePhotos)
    .where(eq(showcasePhotos.showcaseId, s.id))
    .orderBy(showcasePhotos.sortOrder);

  const update = updateShowcase.bind(null, slug);
  const del = deleteShowcase.bind(null, slug);
  const addPhoto = addShowcasePhoto.bind(null, s.id);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/showcases" className="text-gray-500 hover:text-white text-sm">← Showcases</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest truncate">{s.title}</h1>
        <a href={`/showcases/${slug}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-gray-500 hover:text-[#9EFF0A] shrink-0">View ↗</a>
      </div>

      <form action={update} className="flex flex-col gap-6 mb-10">
        <Section title="Event Info">
          <Grid2>
            <Field label="Event Name" name="title" defaultValue={s.title} required />
            <Field label="Slug" name="slug" defaultValue={s.slug} />
          </Grid2>
          <Grid2>
            <Field label="Date" name="date" type="date" defaultValue={s.date ?? ''} />
            <Field label="Venue" name="venue" defaultValue={s.venue} />
          </Grid2>
          <Grid2>
            <Field label="City" name="city" defaultValue={s.city} />
            <Field label="Country" name="country" defaultValue={s.country} />
          </Grid2>
          <Field label="Artist Slugs" name="artistSlugs"
            defaultValue={(s.artistSlugs as string[] ?? []).join(', ')}
            hint="Comma-separated artist slugs" />
        </Section>
        <Section title="Links">
          <Grid2>
            <Field label="Ticket URL" name="ticketUrl" defaultValue={s.ticketUrl} />
            <Field label="Laylo Signup URL" name="layloSignupUrl" defaultValue={s.layloSignupUrl} />
          </Grid2>
          <Grid2>
            <Field label="Aftermovie URL" name="aftermovieUrl" defaultValue={s.aftermovieUrl} />
            <Field label="SoundCloud Set URL" name="soundcloudSetUrl" defaultValue={s.soundcloudSetUrl} />
          </Grid2>
          <Field label="Flyer Image URL" name="flyer" defaultValue={s.flyer} hint="R2 or external image URL" />
        </Section>
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Save Changes</button>
          <Link href="/admin/showcases" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">Cancel</Link>
          <div className="ml-auto"><DeleteButton action={del} label="Showcase" /></div>
        </div>
      </form>

      {/* Photo Gallery Manager */}
      <div className="border-t border-white/5 pt-8">
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Recap Photos ({photos.length})</h2>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {photos.map(photo => (
              <div key={photo.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.image ?? ''} alt={photo.caption ?? ''} className="w-full aspect-square object-cover" />
                {photo.caption && <p className="text-xs text-gray-500 mt-1 truncate">{photo.caption}</p>}
                <form action={deleteShowcasePhoto.bind(null, photo.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="submit" className="w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center hover:bg-red-600">✕</button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addPhoto} className="flex flex-col gap-3">
          <Field label="Photo URL" name="image" placeholder="https://... (R2 or external)" />
          <Field label="Caption (optional)" name="caption" placeholder="e.g. Closing set at Pacha" />
          <button type="submit" className="self-start px-4 py-2 bg-white/10 text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">
            + Add Photo
          </button>
        </form>
      </div>
    </div>
  );
}
