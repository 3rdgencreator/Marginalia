import { db } from '@/lib/db';
import { artists } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { updateArtist, deleteArtist } from '@/lib/db/actions/artists';
import { Field, Textarea, Checkbox, Section, Grid2 } from '@/components/admin/AdminField';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';

type Props = { params: Promise<{ slug: string }> };

export default async function EditArtistPage({ params }: Props) {
  const { slug } = await params;
  const [a] = await db.select().from(artists).where(eq(artists.slug, slug)).limit(1);
  if (!a) notFound();

  const update = updateArtist.bind(null, slug);
  const del = deleteArtist.bind(null, slug);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/artists" className="text-gray-500 hover:text-white text-sm">← Artists</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">{a.name}</h1>
        <a href={`/artists/${slug}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-gray-500 hover:text-[#9EFF0A] shrink-0">View ↗</a>
      </div>
      <form action={update} className="flex flex-col gap-6">
        <Section title="Basic Info">
          <Grid2>
            <Field label="Name" name="name" defaultValue={a.name} required />
            <Field label="Slug" name="slug" defaultValue={a.slug} />
          </Grid2>
          <Field label="Role" name="role" defaultValue={a.role} />
          <Textarea label="Bio" name="bio" defaultValue={a.bio} rows={6} />
          <Field label="Photo URL" name="photo" defaultValue={a.photo} />
          <Checkbox label="Show on Roster" name="featured" defaultChecked={a.featured ?? true} />
        </Section>
        <Section title="Social & Platforms">
          <Grid2>
            <Field label="SoundCloud" name="soundcloudUrl" defaultValue={a.soundcloudUrl} />
            <Field label="Spotify" name="spotifyUrl" defaultValue={a.spotifyUrl} />
            <Field label="Beatport" name="beatportUrl" defaultValue={a.beatportUrl} />
            <Field label="Instagram" name="instagramUrl" defaultValue={a.instagramUrl} />
            <Field label="Resident Advisor" name="residentAdvisorUrl" defaultValue={a.residentAdvisorUrl} />
            <Field label="YouTube" name="youtubeUrl" defaultValue={a.youtubeUrl} />
            <Field label="Laylo" name="layloUrl" defaultValue={a.layloUrl} />
            <Field label="Press Kit URL" name="pressKitUrl" defaultValue={a.pressKitUrl} />
          </Grid2>
        </Section>
        <Section title="Contact">
          <Grid2>
            <Field label="Management Email" name="managementEmail" defaultValue={a.managementEmail} type="email" />
            <Field label="Booking Email (General)" name="bookingEmail" defaultValue={a.bookingEmail} type="email" />
            <Field label="Booking Email — NA" name="bookingNaEmail" defaultValue={a.bookingNaEmail} type="email" />
            <Field label="Booking Email — ROW" name="bookingRowEmail" defaultValue={a.bookingRowEmail} type="email" />
          </Grid2>
        </Section>
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Save Changes</button>
          <Link href="/admin/artists" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">Cancel</Link>
          <div className="ml-auto"><DeleteButton action={del} label="Artist" /></div>
        </div>
      </form>
    </div>
  );
}
