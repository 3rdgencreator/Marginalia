import { db } from '@/lib/db';
import { press } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { updatePress, deletePress } from '@/lib/db/actions/press';
import { Field, Textarea, Checkbox, Select, Section, Grid2 } from '@/components/admin/AdminField';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';

const TYPES = [
  { value: 'review', label: 'Review' },
  { value: 'interview', label: 'Interview' },
  { value: 'feature', label: 'Feature' },
  { value: 'mention', label: 'Mention' },
  { value: 'chart', label: 'Chart' },
];

type Props = { params: Promise<{ slug: string }> };

export default async function EditPressPage({ params }: Props) {
  const { slug } = await params;
  const [p] = await db.select().from(press).where(eq(press.slug, slug)).limit(1);
  if (!p) notFound();

  const update = updatePress.bind(null, slug);
  const del = deletePress.bind(null, slug);

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/press" className="text-gray-500 hover:text-white text-sm">← Press</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest truncate">{p.headline}</h1>
      </div>
      <form action={update} className="flex flex-col gap-6">
        <Section title="Press Info">
          <Field label="Headline" name="headline" defaultValue={p.headline} required />
          <Field label="Slug" name="slug" defaultValue={p.slug} />
          <Grid2>
            <Field label="Publication" name="publication" defaultValue={p.publication} />
            <Field label="Date" name="date" type="date" defaultValue={p.date ?? ''} />
          </Grid2>
          <Grid2>
            <Select label="Type" name="type" defaultValue={p.type} options={TYPES} />
            <Checkbox label="Featured (show on homepage)" name="featured" defaultChecked={p.featured ?? false} />
          </Grid2>
          <Field label="Article URL" name="url" defaultValue={p.url} />
          <Textarea label="Excerpt / Pull Quote" name="excerpt" defaultValue={p.excerpt} rows={3} />
        </Section>
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Save Changes</button>
          <Link href="/admin/press" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">Cancel</Link>
          <div className="ml-auto"><DeleteButton action={del} label="Press Entry" /></div>
        </div>
      </form>
    </div>
  );
}
