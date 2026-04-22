import Link from 'next/link';
import Image from 'next/image';
import { resolveArtistNames } from '@/lib/releases';

type CardProps = {
  slug: string;
  entry: {
    title: string;
    artistSlugs: readonly string[];
    coverArt: string | null;
  };
};

export default async function ReleaseCard({ slug, entry }: CardProps) {
  const artistNames = await resolveArtistNames(entry.artistSlugs);
  const artistsJoined = artistNames.length > 0 ? artistNames.join(', ') : '';
  const artistsForOverlay =
    artistNames.length > 0 ? artistNames.join(' × ') : '';
  const ariaLabel = artistsJoined
    ? `${entry.title} by ${artistsJoined}`
    : entry.title;
  const altText = artistsJoined
    ? `${entry.title} — ${artistsJoined} cover artwork`
    : `${entry.title} cover artwork`;

  return (
    <Link
      href={`/releases/${slug}`}
      aria-label={ariaLabel}
      className="group relative block aspect-square overflow-hidden bg-[--color-surface]"
    >
      {entry.coverArt ? (
        <Image
          src={`/images/releases/${entry.coverArt}`}
          alt={altText}
          width={600}
          height={600}
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center text-[--text-label] text-[--color-text-muted]"
        >
          No artwork
        </span>
      )}

      {/* Desktop-only hover overlay (D-03/D-04). Hidden on mobile via `hidden md:flex`. */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          hidden md:flex flex-col items-center justify-center gap-2 p-4
          bg-[rgba(31,31,33,0.70)]
          opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
          transition-opacity duration-200 ease-out
        "
      >
        <span className="text-[--text-body] font-bold text-center text-[--color-text-primary]">
          {entry.title}
        </span>
        {artistsForOverlay && (
          <span className="text-[--text-label] text-[--color-text-secondary] text-center">
            {artistsForOverlay}
          </span>
        )}
      </div>
    </Link>
  );
}
