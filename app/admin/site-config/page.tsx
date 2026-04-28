import { db } from '@/lib/db';
import { siteConfig } from '@/lib/db/schema';
import { updateSiteConfig } from '@/lib/db/actions/singletons';
import { Field, Textarea, Checkbox, Select, Section, Grid2 } from '@/components/admin/AdminField';

const NAVBAR_COLORS = [
  { value: 'black-70', label: 'Black — semi-transparent (default)' },
  { value: 'black', label: 'Black — solid' },
  { value: 'bg', label: 'Charcoal (#1F1F21)' },
  { value: 'surface', label: 'Dark Gray (#2A2A2C)' },
  { value: 'violet', label: 'Violet (#580AFF)' },
  { value: 'lime', label: 'Lime (#9EFF0A)' },
  { value: 'pink', label: 'Pink (#ef6b8e)' },
  { value: 'orange', label: 'Orange (#f29753)' },
];

const BUTTON_COLORS = [
  { value: 'white', label: 'White (default)' },
  { value: 'lime', label: 'Lime (#9EFF0A)' },
  { value: 'violet', label: 'Violet (#580AFF)' },
  { value: 'pink', label: 'Pink (#ef6b8e)' },
  { value: 'orange', label: 'Orange (#f29753)' },
];

const FOOTER_COLORS = [
  { value: 'surface', label: 'Dark Gray (#2A2A2C) (default)' },
  { value: 'black', label: 'Black — solid' },
  { value: 'bg', label: 'Charcoal (#1F1F21)' },
  { value: 'violet', label: 'Violet (#580AFF)' },
  { value: 'lime', label: 'Lime (#9EFF0A)' },
];

export default async function SiteConfigAdmin() {
  const [cfg] = await db.select().from(siteConfig).limit(1);

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-white uppercase tracking-widest mb-8">Site Config</h1>
      <form action={updateSiteConfig} className="flex flex-col gap-6">
        <Section title="Basic">
          <Grid2>
            <Field label="Site Name" name="siteName" defaultValue={cfg?.siteName ?? 'Marginalia'} />
            <Field label="Tagline" name="tagline" defaultValue={cfg?.tagline} />
          </Grid2>
          <Field label="Demo Email" name="demoEmail" type="email" defaultValue={cfg?.demoEmail ?? 'elif@marginalialabel.com'} />
          <Field label="Newsletter Provider (Brevo List ID)" name="newsletterProvider" defaultValue={cfg?.newsletterProvider} />
        </Section>

        <Section title="Social Links">
          <Grid2>
            <Field label="Instagram" name="instagramUrl" defaultValue={cfg?.instagramUrl} />
            <Field label="SoundCloud" name="soundcloudUrl" defaultValue={cfg?.soundcloudUrl} />
            <Field label="Beatport" name="beatportUrl" defaultValue={cfg?.beatportUrl} />
            <Field label="YouTube" name="youtubeUrl" defaultValue={cfg?.youtubeUrl} />
            <Field label="TikTok" name="tiktokUrl" defaultValue={cfg?.tiktokUrl} />
            <Field label="Facebook" name="facebookUrl" defaultValue={cfg?.facebookUrl} />
            <Field label="Laylo Community" name="layloUrl" defaultValue={cfg?.layloUrl} />
            <Field label="SoundCloud Playlist URL" name="soundcloudPlaylistUrl" defaultValue={cfg?.soundcloudPlaylistUrl} />
          </Grid2>
        </Section>

        <Section title="Merch">
          <Field label="Merch Store URL" name="merchUrl" defaultValue={cfg?.merchUrl} />
          <Textarea label="Shopify Buy Button Embed Code" name="shopifyBuyButtonCode" defaultValue={cfg?.shopifyBuyButtonCode} rows={4} hint="Paste the full Shopify embed code" />
        </Section>

        <Section title="Colors">
          <Grid2>
            <Select label="Navbar Color" name="navbarColor" defaultValue={cfg?.navbarColor} options={NAVBAR_COLORS} />
            <Select label="Button Color" name="buttonColor" defaultValue={cfg?.buttonColor} options={BUTTON_COLORS} />
            <Select label="Footer Color" name="footerColor" defaultValue={cfg?.footerColor} options={FOOTER_COLORS} />
          </Grid2>
        </Section>

        <Section title="Announcement Bar">
          <Checkbox label="Show Announcement Bar" name="announcementActive" defaultChecked={cfg?.announcementActive ?? false} />
          <Field label="Announcement Text" name="announcementText" defaultValue={cfg?.announcementText} placeholder="e.g. MRGNL037 out now! Click to listen." />
          <Field label="Announcement Link URL" name="announcementUrl" defaultValue={cfg?.announcementUrl} />
        </Section>

        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Save Config</button>
        </div>
      </form>
    </div>
  );
}
