import fs from 'fs/promises';
import path from 'path';

function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]*$/.test(slug);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!isSafeSlug(slug)) {
    return Response.json({ error: 'Invalid slug' }, { status: 400 });
  }
  const dir = path.join(process.cwd(), 'content/releases');
  try {
    await fs.unlink(path.join(dir, `${slug}.yaml`)).catch(() => {});
    await fs.unlink(path.join(dir, `${slug}.yml`)).catch(() => {});
    await fs.rm(path.join(dir, slug), { recursive: true, force: true }).catch(() => {});
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
