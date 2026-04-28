import { createPodcast } from '@/lib/db/actions/podcasts';
import { Field, Textarea, Select, Section, Grid2 } from '@/components/admin/AdminField';
import Link from 'next/link';

const PARTS = [
  { value: 'single', label: 'Single (no parts)' },
  { value: 'a', label: 'Part A' },
  { value: 'b', label: 'Part B' },
  { value: 'c', label: 'Part C' },
];

export default function NewPodcastPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/podcasts" className="text-gray-500 hover:text-white text-sm">← Podcasts</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">New Podcast</h1>
      </div>
      <form action={createPodcast} className="flex flex-col gap-6">
        <Section title="Episode Info">
          <Grid2>
            <Field label="Title" name="title" required placeholder="e.g. Marginalia Podcast 012" />
            <Field label="Slug" name="slug" hint="Auto-generated if empty" />
          </Grid2>
          <Grid2>
            <Field label="Episode Number" name="episodeNumber" type="number" />
            <Select label="Episode Part" name="episodePart" options={PARTS} />
          </Grid2>
          <Grid2>
            <Field label="Date" name="date" type="date" />
            <Field label="Artist Slug" name="artistSlug" placeholder="e.g. elif" />
          </Grid2>
          <Field label="Catalog Number" name="catalogNumber" placeholder="Links to release" />
          <Textarea label="Description" name="description" rows={4} />
          <Field label="Cover Image URL" name="coverImage" placeholder="https://..." />
        </Section>
        <Section title="Platform Links">
          <Field label="SoundCloud URL" name="soundcloudUrl" placeholder="https://soundcloud.com/..." />
          <Field label="Spotify URL" name="spotifyUrl" placeholder="https://open.spotify.com/..." />
          <Field label="YouTube URL" name="youtubeUrl" placeholder="https://www.youtube.com/..." />
          <Field label="Apple Podcasts URL" name="applePodcastsUrl" placeholder="https://podcasts.apple.com/..." />
        </Section>
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Create Podcast</button>
          <Link href="/admin/podcasts" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
