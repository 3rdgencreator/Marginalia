import { createShowcase } from '@/lib/db/actions/showcases';
import { Field, Section, Grid2 } from '@/components/admin/AdminField';
import Link from 'next/link';

export default function NewShowcasePage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/showcases" className="text-gray-500 hover:text-white text-sm">← Showcases</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">New Showcase</h1>
      </div>
      <form action={createShowcase} className="flex flex-col gap-6">
        <Section title="Event Info">
          <Grid2>
            <Field label="Event Name" name="title" required />
            <Field label="Slug" name="slug" hint="Auto-generated if empty" />
          </Grid2>
          <Grid2>
            <Field label="Date" name="date" type="date" />
            <Field label="Venue" name="venue" />
          </Grid2>
          <Grid2>
            <Field label="City" name="city" />
            <Field label="Country" name="country" />
          </Grid2>
          <Field label="Artist Slugs" name="artistSlugs" placeholder="elif, takiru" hint="Comma-separated artist slugs" />
        </Section>
        <Section title="Links">
          <Grid2>
            <Field label="Ticket URL" name="ticketUrl" placeholder="https://ra.co/..." />
            <Field label="Laylo Signup URL" name="layloSignupUrl" placeholder="https://laylo.com/..." />
          </Grid2>
          <Grid2>
            <Field label="Aftermovie URL" name="aftermovieUrl" placeholder="https://www.youtube.com/..." />
            <Field label="SoundCloud Set URL" name="soundcloudSetUrl" placeholder="https://soundcloud.com/..." />
          </Grid2>
          <Field label="Flyer Image URL" name="flyer" placeholder="https://..." hint="R2 or external image URL" />
        </Section>
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Create Showcase</button>
          <Link href="/admin/showcases" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
