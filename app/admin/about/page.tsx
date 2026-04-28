import { db } from '@/lib/db';
import { aboutPage } from '@/lib/db/schema';
import { updateAboutPage } from '@/lib/db/actions/singletons';
import { Field, Textarea, Section } from '@/components/admin/AdminField';

export default async function AboutPageAdmin() {
  const [a] = await db.select().from(aboutPage).limit(1);

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-white uppercase tracking-widest mb-8">About Page</h1>
      <form action={updateAboutPage} className="flex flex-col gap-6">
        <Section title="Content">
          <Field label="Headline" name="headline" defaultValue={a?.headline} placeholder="e.g. The Story of Marginalia" />
          <Textarea label="Body Text" name="body" defaultValue={a?.body} rows={12} placeholder="Tell the story of the label..." />
          <Field label="Photo URL" name="photo" defaultValue={a?.photo} placeholder="https://... (R2 or external)" hint="About page photo" />
        </Section>
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Save About Page</button>
        </div>
      </form>
    </div>
  );
}
