import { db } from '@/lib/db';
import { releases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { updateRelease, deleteRelease } from '@/lib/db/actions/releases';
import { Field, Textarea, Checkbox, Select, Section, Grid2 } from '@/components/admin/AdminField';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';

const RELEASE_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'album', label: 'Album' },
  { value: 'compilation', label: 'Compilation' },
  { value: 'edit', label: 'Edit' },
];

type Props = { params: Promise<{ slug: string }> };

export default async function EditReleasePage({ params }: Props) {
  const { slug } = await params;
  const [r] = await db.select().from(releases).where(eq(releases.slug, slug)).limit(1);
  if (!r) notFound();

  const update = updateRelease.bind(null, slug);
  const del = deleteRelease.bind(null, slug);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/releases" className="text-gray-500 hover:text-white text-sm">← Releases</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest truncate">{r.title}</h1>
        <a href={`/releases/${slug}`} target="_blank" rel="noopener noreferrer"
          className="ml-auto text-xs text-gray-500 hover:text-[#9EFF0A] shrink-0">View ↗</a>
      </div>

      <form action={update} className="flex flex-col gap-6">
        <Section title="Basic Info">
          <Grid2>
            <Field label="Title" name="title" defaultValue={r.title} required />
            <Field label="Slug" name="slug" defaultValue={r.slug} />
          </Grid2>
          <Grid2>
            <Field label="Catalog Number" name="catalogNumber" defaultValue={r.catalogNumber} />
            <Field label="Release Date" name="releaseDate" type="date" defaultValue={r.releaseDate ?? ''} />
          </Grid2>
          <Grid2>
            <Select label="Release Type" name="releaseType" defaultValue={r.releaseType} options={RELEASE_TYPES} />
            <Field label="Artist Name" name="artistName" defaultValue={r.artistName} />
          </Grid2>
          <Textarea label="Description" name="description" defaultValue={r.description} rows={4} />
        </Section>

        <Section title="Cover Art">
          <Field label="Cover Art URL" name="coverArt" defaultValue={r.coverArt} placeholder="https://..." />
          <Field label="Artwork URL (iTunes CDN)" name="artworkUrl" defaultValue={r.artworkUrl} />
        </Section>

        <Section title="Flags">
          <Grid2>
            <Checkbox label="Featured on Homepage" name="featured" defaultChecked={r.featured ?? false} />
            <Checkbox label="Pre-Save" name="presave" defaultChecked={r.presave ?? false} />
          </Grid2>
          <Grid2>
            <Field label="Badge Text" name="badgeText" defaultValue={r.badgeText} />
            <Field label="Sort Order" name="sortOrder" type="number" defaultValue={r.sortOrder ?? 0} />
          </Grid2>
        </Section>

        <Section title="Presave / CTA">
          <Grid2>
            <Field label="UPC" name="upc" defaultValue={r.upc} />
            <Field label="Laylo URL" name="layloUrl" defaultValue={r.layloUrl} />
          </Grid2>
        </Section>

        <Section title="Primary Platform Links">
          <Grid2>
            <Field label="Beatport" name="beatportUrl" defaultValue={r.beatportUrl} />
            <Field label="Spotify" name="spotifyUrl" defaultValue={r.spotifyUrl} />
            <Field label="SoundCloud" name="soundcloudUrl" defaultValue={r.soundcloudUrl} />
            <Field label="Apple Music" name="appleMusicUrl" defaultValue={r.appleMusicUrl} />
            <Field label="Deezer" name="deezerUrl" defaultValue={r.deezerUrl} />
            <Field label="Bandcamp" name="bandcampUrl" defaultValue={r.bandcampUrl} />
          </Grid2>
        </Section>

        <Section title="More Links">
          <Grid2>
            <Field label="Tidal" name="tidalUrl" defaultValue={r.tidalUrl} />
            <Field label="Traxsource" name="traxsourceUrl" defaultValue={r.traxsourceUrl} />
            <Field label="Juno Download" name="junoUrl" defaultValue={r.junoUrl} />
            <Field label="Boomkat" name="boomkatUrl" defaultValue={r.boomkatUrl} />
            <Field label="Amazon Music" name="amazonUrl" defaultValue={r.amazonUrl} />
            <Field label="YouTube" name="youtubeUrl" defaultValue={r.youtubeUrl} />
            <Field label="Anghami" name="anghamiUrl" defaultValue={r.anghamiUrl} />
            <Field label="Mixcloud" name="mixcloudUrl" defaultValue={r.mixcloudUrl} />
            <Field label="NetEase Music" name="netEaseUrl" defaultValue={r.netEaseUrl} />
            <Field label="Pandora" name="pandoraUrl" defaultValue={r.pandoraUrl} />
            <Field label="JioSaavn" name="saavnUrl" defaultValue={r.saavnUrl} />
            <Field label="SoundCloud Podcast" name="soundcloudPodcastUrl" defaultValue={r.soundcloudPodcastUrl} />
          </Grid2>
        </Section>

        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">
            Save Changes
          </button>
          <Link href="/admin/releases" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">
            Cancel
          </Link>
          <div className="ml-auto"><DeleteButton action={del} label="Release" /></div>
        </div>
      </form>
    </div>
  );
}
