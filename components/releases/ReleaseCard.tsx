import Link from 'next/link';
import Image from 'next/image';

type CardProps = {
  slug: string;
  entry: {
    title: string;
    artistName?: string;
    coverArt: string | null;
    artworkUrl?: string | null;
  };
};

export default function ReleaseCard({ slug, entry }: CardProps) {
  const artistsForOverlay = entry.artistName ?? '';
  const ariaLabel = entry.artistName
    ? `${entry.title} by ${entry.artistName}`
    : entry.title;
  const altText = entry.artistName
    ? `${entry.title} — ${entry.artistName} cover artwork`
    : `${entry.title} cover artwork`;

  return (
    <Link
      href={`/releases/${slug}`}
      aria-label={ariaLabel}
      className="group relative block aspect-square overflow-hidden border-2 border-white/70 bg-white/10"
    >
      {(() => {
        const src = entry.coverArt
          ? `/images/releases/${entry.coverArt}`
          : entry.artworkUrl?.replace('3000x3000bb', '600x600bb') ?? null;
        return src ? (
          <Image
            src={src}
            alt={altText}
            width={600}
            height={600}
            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-(--text-label) text-(--color-text-muted)"
          >
            No artwork
          </span>
        );
      })()}

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
        <span className="text-(--text-body) font-bold text-center text-white">
          {entry.title}
        </span>
        {artistsForOverlay && (
          <span className="text-(--text-label) text-white text-center">
            {artistsForOverlay}
          </span>
        )}
      </div>
    </Link>
  );
}
