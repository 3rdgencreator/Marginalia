import { genreLabelFor } from '@/lib/releases';

type GenreChipProps = { genre: string };

type ChipStyle = { bg: string; fg: string };

const GENRE_STYLE: Record<string, ChipStyle> = {
  'melodic-house': {
    bg: 'bg-(--color-tag-lavender)',
    fg: 'text-(--color-bg)',
  },
  techno: { bg: 'bg-(--color-tag-blue)', fg: 'text-(--color-text-primary)' },
  'indie-dance': {
    bg: 'bg-(--color-tag-pink)',
    fg: 'text-(--color-bg)',
  },
  'organic-house': {
    bg: 'bg-(--color-tag-mint)',
    fg: 'text-(--color-bg)',
  },
  'afro-house': {
    bg: 'bg-(--color-tag-orange)',
    fg: 'text-(--color-bg)',
  },
};

const FALLBACK_STYLE: ChipStyle = {
  bg: 'bg-(--color-surface)',
  fg: 'text-(--color-text-secondary)',
};

export default function GenreChip({ genre }: GenreChipProps) {
  const style = GENRE_STYLE[genre] ?? FALLBACK_STYLE;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-(--text-label) ${style.bg} ${style.fg}`}
    >
      {genreLabelFor(genre)}
    </span>
  );
}
