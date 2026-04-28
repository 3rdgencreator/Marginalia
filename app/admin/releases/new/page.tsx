import { createRelease } from '@/lib/db/actions/releases';
import { Field, Textarea, Checkbox, Select, Section, Grid2 } from '@/components/admin/AdminField';
import Link from 'next/link';

const RELEASE_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'album', label: 'Album' },
  { value: 'compilation', label: 'Compilation' },
  { value: 'edit', label: 'Edit' },
];

export default function NewReleasePage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/releases" className="text-gray-500 hover:text-white text-sm">← Releases</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">New Release</h1>
      </div>

      <form action={createRelease} className="flex flex-col gap-6">
        <Section title="Basic Info">
          <Grid2>
            <Field label="Title" name="title" required />
            <Field label="Slug" name="slug" hint="Auto-generated from title if left empty" />
          </Grid2>
          <Grid2>
            <Field label="Catalog Number" name="catalogNumber" placeholder="MRGNL001" />
            <Field label="Release Date" name="releaseDate" type="date" />
          </Grid2>
          <Grid2>
            <Select label="Release Type" name="releaseType" options={RELEASE_TYPES} />
            <Field label="Artist Name" name="artistName" placeholder="e.g. TAKIRU, Althoff & ELIF" />
          </Grid2>
          <Textarea label="Description" name="description" rows={4} />
        </Section>

        <Section title="Cover Art">
          <Field label="Cover Art URL" name="coverArt" placeholder="https://..." hint="R2 or external image URL" />
          <Field label="Artwork URL (iTunes CDN)" name="artworkUrl" placeholder="https://is1-ssl.mzstatic.com/..." hint="Auto-filled when using Odesli fetch" />
        </Section>

        <Section title="Flags">
          <Grid2>
            <Checkbox label="Featured on Homepage" name="featured" />
            <Checkbox label="Pre-Save" name="presave" />
          </Grid2>
          <Grid2>
            <Field label="Badge Text" name="badgeText" placeholder="e.g. Out Now, Pre-Save" />
            <Field label="Sort Order" name="sortOrder" type="number" defaultValue={0} />
          </Grid2>
        </Section>

        <Section title="Presave / CTA">
          <Grid2>
            <Field label="UPC" name="upc" placeholder="e.g. 4099964069441" />
            <Field label="Laylo URL" name="layloUrl" placeholder="https://laylo.com/..." />
          </Grid2>
        </Section>

        <Section title="Primary Platform Links">
          <Grid2>
            <Field label="Beatport" name="beatportUrl" placeholder="https://www.beatport.com/..." />
            <Field label="Spotify" name="spotifyUrl" placeholder="https://open.spotify.com/..." />
            <Field label="SoundCloud" name="soundcloudUrl" placeholder="https://soundcloud.com/..." />
            <Field label="Apple Music" name="appleMusicUrl" placeholder="https://music.apple.com/..." />
            <Field label="Deezer" name="deezerUrl" placeholder="https://www.deezer.com/..." />
            <Field label="Bandcamp" name="bandcampUrl" placeholder="https://..." />
          </Grid2>
        </Section>

        <Section title="More Links">
          <Grid2>
            <Field label="Tidal" name="tidalUrl" placeholder="https://tidal.com/..." />
            <Field label="Traxsource" name="traxsourceUrl" placeholder="https://www.traxsource.com/..." />
            <Field label="Juno Download" name="junoUrl" placeholder="https://www.junodownload.com/..." />
            <Field label="Boomkat" name="boomkatUrl" placeholder="https://boomkat.com/..." />
            <Field label="Amazon Music" name="amazonUrl" placeholder="https://music.amazon.com/..." />
            <Field label="YouTube" name="youtubeUrl" placeholder="https://www.youtube.com/..." />
            <Field label="Anghami" name="anghamiUrl" placeholder="https://play.anghami.com/..." />
            <Field label="Mixcloud" name="mixcloudUrl" placeholder="https://www.mixcloud.com/..." />
            <Field label="NetEase Music" name="netEaseUrl" placeholder="https://music.163.com/..." />
            <Field label="Pandora" name="pandoraUrl" placeholder="https://www.pandora.com/..." />
            <Field label="JioSaavn" name="saavnUrl" placeholder="https://www.jiosaavn.com/..." />
            <Field label="SoundCloud Podcast" name="soundcloudPodcastUrl" placeholder="https://soundcloud.com/..." />
          </Grid2>
        </Section>

        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">
            Create Release
          </button>
          <Link href="/admin/releases" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
