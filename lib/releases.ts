import 'server-only';
import { reader } from './keystatic';

export function buildSoundCloudEmbedUrl(premiereUrl: string): string {
  const params = new URLSearchParams({
    url: premiereUrl,
    color: '#9EFF0A',
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'true',
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

export function buildSoundCloudPlaylistEmbedUrl(playlistUrl: string): string {
  const params = new URLSearchParams({
    url: playlistUrl,
    color: '#9EFF0A',
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
    show_artwork: 'true',
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

export function plainTextFromDocument(
  document: unknown,
  maxChars: number
): string {
  if (!Array.isArray(document)) return '';
  const walk = (node: unknown): string => {
    if (node && typeof node === 'object') {
      const n = node as { text?: unknown; children?: unknown };
      if (typeof n.text === 'string') return n.text;
      if (Array.isArray(n.children)) return n.children.map(walk).join('');
    }
    return '';
  };
  const flat = document.map(walk).join(' ').replace(/\s+/g, ' ').trim();
  return flat.length > maxChars ? flat.slice(0, maxChars) : flat;
}

const GENRE_LABELS: Record<string, string> = {
  'melodic-house': 'Melodic House',
  techno: 'Techno',
  'indie-dance': 'Indie Dance',
  'organic-house': 'Organic House',
  'afro-house': 'Afro House',
};

export function genreLabelFor(slug: string): string {
  return GENRE_LABELS[slug] ?? slug;
}

export async function resolveArtistNames(
  artistSlugs: readonly string[]
): Promise<string[]> {
  if (!artistSlugs || artistSlugs.length === 0) return [];
  const resolved = await Promise.all(
    artistSlugs.map(async (slug) => {
      try {
        const artist = await reader.collections.artists.read(slug);
        if (artist) return (artist.name as string) ?? slug;
        return slug;
      } catch {
        return slug;
      }
    })
  );
  return resolved;
}
