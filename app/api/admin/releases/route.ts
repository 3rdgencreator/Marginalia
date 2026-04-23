import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'content/releases');
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const slugs = new Set<string>();

    // Folder-based entries (Keystatic stores data in {slug}/index.yaml)
    for (const e of entries) {
      if (e.isDirectory()) slugs.add(e.name);
    }
    // Flat-file fallback ({slug}.yaml at root level)
    for (const e of entries) {
      if (!e.isDirectory() && (e.name.endsWith('.yaml') || e.name.endsWith('.yml'))) {
        slugs.add(e.name.replace(/\.(yaml|yml)$/, ''));
      }
    }

    const releases = await Promise.all(
      Array.from(slugs).map(async (slug) => {
        // Prefer folder-based index.yaml, fall back to flat file
        const candidates = [
          path.join(dir, slug, 'index.yaml'),
          path.join(dir, `${slug}.yaml`),
          path.join(dir, `${slug}.yml`),
        ];
        let content = '';
        let mtime = 0;
        for (const candidate of candidates) {
          try {
            const stat = await fs.stat(candidate);
            mtime = stat.mtimeMs;
            content = await fs.readFile(candidate, 'utf-8');
            break;
          } catch { /* try next */ }
        }
        const titleMatch = content.match(/^title:\s*(.+)$/m);
        const catMatch = content.match(/^catalogNumber:\s*(.+)$/m);
        return {
          slug,
          title: (() => {
            const raw = titleMatch?.[1]?.replace(/^['"]|['"]$/g, '').trim() ?? '';
            return raw ? raw[0].toUpperCase() + raw.slice(1) : '';
          })(),
          catalogNumber: catMatch?.[1]?.replace(/^['"]|['"]$/g, '').trim() ?? '',
          mtime,
        };
      })
    );
    return Response.json(releases);
  } catch {
    return Response.json([], { status: 200 });
  }
}
