import { createPress } from '@/lib/db/actions/press';
import { Field, Textarea, Checkbox, Select, Section, Grid2 } from '@/components/admin/AdminField';
import Link from 'next/link';

const TYPES = [
  { value: 'review', label: 'Review' },
  { value: 'interview', label: 'Interview' },
  { value: 'feature', label: 'Feature' },
  { value: 'mention', label: 'Mention' },
  { value: 'chart', label: 'Chart' },
];

export default function NewPressPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/press" className="text-gray-500 hover:text-white text-sm">← Press</Link>
        <h1 className="text-xl font-bold text-white uppercase tracking-widest">New Press Entry</h1>
      </div>
      <form action={createPress} className="flex flex-col gap-6">
        <Section title="Press Info">
          <Field label="Headline" name="headline" required />
          <Field label="Slug" name="slug" hint="Auto-generated if empty" />
          <Grid2>
            <Field label="Publication" name="publication" placeholder="e.g. Resident Advisor" />
            <Field label="Date" name="date" type="date" />
          </Grid2>
          <Grid2>
            <Select label="Type" name="type" options={TYPES} />
            <Checkbox label="Featured (show on homepage)" name="featured" />
          </Grid2>
          <Field label="Article URL" name="url" placeholder="https://..." />
          <Textarea label="Excerpt / Pull Quote" name="excerpt" rows={3} />
        </Section>
        <div className="flex gap-4 pt-4 border-t border-white/5">
          <button type="submit" className="px-6 py-3 bg-[#580AFF] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors duration-150">Create Entry</button>
          <Link href="/admin/press" className="px-6 py-3 border border-white/10 text-gray-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors duration-150">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
