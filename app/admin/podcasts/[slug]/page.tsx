import { db } from '@/lib/db';
import { podcasts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { updatePodcast, deletePodcast } from '@/lib/db/actions/podcasts';
import { Field, Textarea, Select, Section, Grid2 } from '@/components/admin/AdminField';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';

const PARTS = [
  { value: 'single', label: 'Single (no parts)' },
  { value: 'a', label: 'Part A' },
  { value: 'b', label: 'Part B' },
  { value: 'c', label: 'Part C' },
];

type Props = { params: Promise<{ slug: string }> };

export default async function EditPodcastPage({ params }: Props) {
  const { slug } = await params;
  const [p] = await db.select().from(podcasts).where(eq(podcasts.slug, slug)).limit(1);
  if (!p) notFound();

  const update = updatePodcast.bind(null, slug);
  const del = deletePodcast.bind(null, slug);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/podcasts" className="text-gray-500 hover:text-white text-sm">← Podcasts</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest truncate">{p.title}</h1>
      </div>
      <form action={update} className="flex flex-col gap-6">
        <Section title="Episode Info">
          <Grid2>
            <Field label="Title" name="title" defaultValue={p.title} required />
            <Field label="Slug" name="slug" defaultValue={p.slug} />
          </Grid2>
          <Grid2>
            <Field label="Episode Number" name="episodeNumber" type="number" defaultValue={p.episodeNumber ?? ''} />
            <Select label="Episode Part" name="episodePart" defaultValue={p.episodePart} options={PARTS} />
          </Grid2>
          <Grid2>
            <Field label="Date" name="date" type="date" defaultValue={p.date ?? ''} />
            <Field label="Artist Slug" name="artistSlug" defaultValue={p.artistSlug} />
          </Grid2>
          <Field label="Catalog Number" name="catalogNumber" defaultValue={p.catalogNumber} />
          <Textarea label="Description" name="description" defaultValue={p.description} rows={4} />
          <Field label="Cover Image URL" name="coverImage" defaultValue={p.coverImage} />
        </Section>
        <Section title="Platform Links">
          <Field label="SoundCloud URL" name="soundcloudUrl" defaultValue={p.soundcloudUrl} />
          <Field label="Spotify URL" name="spotifyUrl" defaultValue={p.spotifyUrl} />
          <Field label="YouTube URL" name="youtubeUrl" defaultValue={p.youtubeUrl} />
          <Field label="Apple Podcasts URL" name="applePodcastsUrl" defaultValue={p.applePodcastsUrl} />
        </Section>
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Save Changes</button>
          <Link href="/admin/podcasts" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">Cancel</Link>
          <div className="ml-auto"><DeleteButton action={del} label="Podcast" /></div>
        </div>
      </form>
    </div>
  );
}
