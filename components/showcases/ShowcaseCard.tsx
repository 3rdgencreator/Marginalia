import Image from 'next/image';

type ShowcaseCardProps = {
  entry: {
    title: string;
    date: string | null;
    venue: string | null;
    city: string | null;
    country: string | null;
    status: 'upcoming' | 'past';
    ticketUrl: string | null | undefined;
    aftermovieUrl: string | null | undefined;
    flyer: string | null;
  };
  variant: 'upcoming' | 'past';
};

export default function ShowcaseCard({ entry, variant }: ShowcaseCardProps) {
  return (
    <article
      className={`bg-(--color-surface) p-(--space-lg) ${variant === 'past' ? 'opacity-60' : ''}`}
      style={variant === 'past' ? { filter: 'grayscale(0.4)' } : undefined}
    >
      {/* Flyer image */}
      {entry.flyer && (
        <div className="aspect-video w-full overflow-hidden mb-(--space-md)">
          <Image
            src={`/images/showcases/${entry.flyer}`}
            alt={`${entry.title} flyer`}
            width={800}
            height={450}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-(--text-heading) font-bold text-(--color-text-primary) mb-(--space-sm)">
        {entry.title}
      </h3>

      {/* Venue, city, country */}
      <p className="text-(--text-label) text-(--color-text-secondary)">
        {[entry.venue, entry.city, entry.country].filter(Boolean).join(', ')}
      </p>

      {/* Date */}
      <p
        className={`text-(--text-label) mt-(--space-sm) ${
          variant === 'upcoming'
            ? 'text-(--color-accent-lime)'
            : 'text-(--color-text-muted)'
        }`}
      >
        {entry.date}
      </p>

      {/* Ticket button — upcoming only */}
      {variant === 'upcoming' && entry.ticketUrl && (
        <a
          href={entry.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get tickets for ${entry.title}`}
          className="inline-block mt-(--space-md) px-(--space-lg) py-(--space-sm) bg-(--color-accent-violet) text-white text-(--text-label) font-bold uppercase hover:bg-(--color-accent-lime) hover:text-black transition-colors duration-150"
        >
          GET TICKETS
        </a>
      )}

      {/* Aftermovie link — past only */}
      {variant === 'past' && entry.aftermovieUrl && (
        <a
          href={entry.aftermovieUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-(--space-md) text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150"
        >
          WATCH AFTERMOVIE ↗
        </a>
      )}
    </article>
  );
}
