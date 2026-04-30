import { db } from '@/lib/db';
import { showcases, showcasePhotos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { updateShowcase, deleteShowcase, addShowcasePhoto, deleteShowcasePhoto, addShowcaseRecording, updateShowcaseRecording, deleteShowcaseRecording } from '@/lib/db/actions/showcases';
import { getShowcaseRecordings } from '@/lib/db/queries';
import { Field, Section, Grid2 } from '@/components/admin/AdminField';
import { DeleteButton } from '@/components/admin/DeleteButton';
import ShowcaseMerchPicker from '@/components/admin/ShowcaseMerchPicker';
import Link from 'next/link';

type Props = { params: Promise<{ slug: string }> };

export default async function EditShowcasePage({ params }: Props) {
  const { slug } = await params;
  const [s] = await db.select().from(showcases).where(eq(showcases.slug, slug)).limit(1);
  if (!s) notFound();

  const photos = await db.select().from(showcasePhotos)
    .where(eq(showcasePhotos.showcaseId, s.id))
    .orderBy(showcasePhotos.sortOrder);

  const recordings = await getShowcaseRecordings(s.id);

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
          </Grid2>
          <Field label="Flyer Image URL" name="flyer" defaultValue={s.flyer} hint="R2 or external image URL" />
        </Section>

        <Section title="Links">
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <span className="flex-1 text-xs text-gray-500 uppercase tracking-widest">Label</span>
              <span className="flex-1 text-xs text-gray-500 uppercase tracking-widest">URL</span>
            </div>
            {/* Render existing links as editable pairs */}
            {((s.links as Array<{ label: string; url: string }> | null) ?? []).map((link, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input
                  name="link_label"
                  defaultValue={link.label}
                  placeholder="Label"
                  className="flex-1 bg-transparent border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#9EFF0A]"
                />
                <input
                  name="link_url"
                  type="url"
                  defaultValue={link.url}
                  placeholder="https://..."
                  className="flex-1 bg-transparent border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#9EFF0A]"
                />
              </div>
            ))}
            {/* Always one empty row to add a new link */}
            <div className="flex gap-3 items-center">
              <input
                name="link_label"
                defaultValue=""
                placeholder="+ New label"
                className="flex-1 bg-transparent border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#9EFF0A]"
              />
              <input
                name="link_url"
                type="url"
                defaultValue=""
                placeholder="https://..."
                className="flex-1 bg-transparent border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#9EFF0A]"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Empty rows are ignored on save. To remove a link, clear its label and URL then save.
          </p>
        </Section>

        <Section title="Event Merch">
          <ShowcaseMerchPicker
            currentHandles={(s.merchHandles as string[] | null) ?? []}
          />
        </Section>

        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Save Changes</button>
          <Link href="/admin/showcases" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">Cancel</Link>
          <div className="ml-auto"><DeleteButton action={del} label="Showcase" /></div>
        </div>
      </form>

      {/* ── Recordings Manager ───────────────────────────────────────── */}
      <div className="border-t border-white/5 pt-8 mb-10">
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4">
          Recordings ({recordings.length})
        </h2>

        {recordings.length > 0 && (
          <div className="flex flex-col gap-4 mb-6">
            {recordings.map(rec => (
              <div key={rec.id} className="flex items-end gap-3">
                <form action={updateShowcaseRecording.bind(null, rec.id)} className="flex items-end gap-3 flex-1">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Title</label>
                    <input
                      name="title"
                      defaultValue={rec.title}
                      required
                      placeholder="e.g. Closing Set"
                      className="w-full bg-transparent border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#9EFF0A]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">DJ / Artists</label>
                    <input
                      name="djLabel"
                      defaultValue={rec.djLabel ?? ''}
                      placeholder="e.g. Beswerda B2B NVRMĪND"
                      className="w-full bg-transparent border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#9EFF0A]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">SoundCloud URL</label>
                    <input
                      name="url"
                      defaultValue={rec.url}
                      required
                      placeholder="https://soundcloud.com/..."
                      className="w-full bg-transparent border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#9EFF0A]"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Order</label>
                    <input
                      name="sortOrder"
                      type="number"
                      defaultValue={rec.sortOrder ?? 0}
                      className="w-full bg-transparent border border-white/10 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#9EFF0A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="self-end px-3 py-2 bg-[#580AFF] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150 shrink-0"
                  >
                    Save
                  </button>
                </form>
                <form action={deleteShowcaseRecording.bind(null, rec.id)} className="self-end">
                  <button
                    type="submit"
                    aria-label="Remove recording"
                    className="px-2 py-2 text-xs text-(--color-destructive) border border-(--color-destructive)/30 hover:bg-(--color-destructive)/10 transition-colors duration-150"
                  >
                    ✕
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addShowcaseRecording.bind(null, s.id)}>
          <button
            type="submit"
            className="px-4 py-2 bg-white/10 text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150"
          >
            + Add Recording
          </button>
        </form>
      </div>

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
