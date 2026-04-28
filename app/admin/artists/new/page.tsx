import { createArtist } from '@/lib/db/actions/artists';
import { Field, Textarea, Checkbox, Section, Grid2 } from '@/components/admin/AdminField';
import Link from 'next/link';

export default function NewArtistPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/artists" className="text-gray-500 hover:text-white text-sm">← Artists</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">New Artist</h1>
      </div>
      <form action={createArtist} className="flex flex-col gap-6">
        <Section title="Basic Info">
          <Grid2>
            <Field label="Name" name="name" required />
            <Field label="Slug" name="slug" hint="Auto-generated from name if left empty" />
          </Grid2>
          <Field label="Role" name="role" placeholder="e.g. Founder & DJ, Producer" />
          <Textarea label="Bio" name="bio" rows={6} />
          <Field label="Photo URL" name="photo" placeholder="https://..." hint="R2 or external image URL" />
          <Checkbox label="Show on Roster" name="featured" defaultChecked />
        </Section>
        <Section title="Social & Platforms">
          <Grid2>
            <Field label="SoundCloud" name="soundcloudUrl" placeholder="https://soundcloud.com/..." />
            <Field label="Spotify" name="spotifyUrl" placeholder="https://open.spotify.com/..." />
            <Field label="Beatport" name="beatportUrl" placeholder="https://www.beatport.com/..." />
            <Field label="Instagram" name="instagramUrl" placeholder="https://www.instagram.com/..." />
            <Field label="Resident Advisor" name="residentAdvisorUrl" placeholder="https://ra.co/dj/..." />
            <Field label="YouTube" name="youtubeUrl" placeholder="https://www.youtube.com/..." />
            <Field label="Laylo" name="layloUrl" placeholder="https://laylo.com/..." />
            <Field label="Press Kit URL" name="pressKitUrl" placeholder="https://drive.google.com/..." />
          </Grid2>
        </Section>
        <Section title="Contact">
          <Grid2>
            <Field label="Management Email" name="managementEmail" type="email" />
            <Field label="Booking Email (General)" name="bookingEmail" type="email" />
            <Field label="Booking Email — NA" name="bookingNaEmail" type="email" />
            <Field label="Booking Email — ROW" name="bookingRowEmail" type="email" />
          </Grid2>
        </Section>
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Create Artist</button>
          <Link href="/admin/artists" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
