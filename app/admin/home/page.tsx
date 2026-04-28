import { db } from '@/lib/db';
import { homePage } from '@/lib/db/schema';
import { updateHomePage } from '@/lib/db/actions/singletons';
import { Field, Section, Grid2 } from '@/components/admin/AdminField';

export default async function HomePageAdmin() {
  const [h] = await db.select().from(homePage).limit(1);

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-white uppercase tracking-widest mb-8">Home Page</h1>
      <form action={updateHomePage} className="flex flex-col gap-6">
        <Section title="Hero Text">
          <Field label="Hero Headline" name="heroHeadline" defaultValue={h?.heroHeadline} />
          <Field label="Hero Subtext" name="heroSubtext" defaultValue={h?.heroSubtext} />
        </Section>

        <Section title="Hero Video — Desktop (16:9)">
          <Field label="Cloudflare R2 URL" name="heroVideoDesktopR2Url" defaultValue={h?.heroVideoDesktopR2Url} placeholder="https://pub-xxx.r2.dev/video.mp4" />
          <Field label="YouTube URL (fallback)" name="heroVideoDesktopYoutubeUrl" defaultValue={h?.heroVideoDesktopYoutubeUrl} placeholder="https://www.youtube.com/watch?v=..." />
        </Section>

        <Section title="Hero Video — Mobile (9:16)">
          <Field label="Cloudflare R2 URL" name="heroVideoMobileR2Url" defaultValue={h?.heroVideoMobileR2Url} placeholder="https://pub-xxx.r2.dev/video-mobile.mp4" />
          <Field label="YouTube URL (fallback)" name="heroVideoMobileYoutubeUrl" defaultValue={h?.heroVideoMobileYoutubeUrl} placeholder="https://www.youtube.com/shorts/..." />
        </Section>

        <Section title="Featured Content">
          <Grid2>
            <Field label="Featured Release Slug" name="featuredReleaseSlug" defaultValue={h?.featuredReleaseSlug} placeholder="e.g. medusa" />
            <Field label="Beatport Accolade" name="beatportAccolade" defaultValue={h?.beatportAccolade} placeholder="Hype Label of the Month, March 2025" />
          </Grid2>
          <Field label="Featured Artist Slugs" name="featuredArtistSlugs"
            defaultValue={(h?.featuredArtistSlugs as string[] ?? []).join(', ')}
            hint="Comma-separated slugs for roster preview" />
          <Field label="Hero Laylo Embed URL" name="heroLayloEmbedUrl" defaultValue={h?.heroLayloEmbedUrl} placeholder="https://laylo.com/marginalialabel/embed" />
        </Section>

        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Save Home Page</button>
        </div>
      </form>
    </div>
  );
}
