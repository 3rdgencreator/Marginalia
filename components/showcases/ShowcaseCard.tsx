import Image from 'next/image';

function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('https://') || url.startsWith('http://') ? url : null;
}

type ShowcaseCardProps = {
  entry: {
    title: string;
    date: string | null;
    venue: string | null;
    city: string | null;
    country: string | null;
    ticketUrl: string | null | undefined;
    aftermovieUrl: string | null | undefined;
    soundcloudSetUrl: string | null | undefined;
    flyer: string | null;
  };
  variant: 'upcoming' | 'past';
};

export default function ShowcaseCard({ entry, variant }: ShowcaseCardProps) {
  const isUpcoming = variant === 'upcoming';
  return (
    <article
      className="overflow-hidden bg-(--color-surface) border p-(--space-lg) transition-all duration-300"
      style={
        isUpcoming
          ? { borderColor: 'rgba(158,255,10,0.3)' }
          : { borderColor: 'rgba(255,255,255,0.06)', opacity: 0.45, filter: 'grayscale(0.5)' }
      }
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

      {/* Date — only render when non-null to avoid empty paragraph spacing */}
      {entry.date && (
        <p
          className={`text-(--text-label) mt-(--space-sm) ${
            variant === 'upcoming'
              ? 'text-(--color-accent-lime)'
              : 'text-(--color-text-muted)'
          }`}
        >
          {entry.date}
        </p>
      )}

      {/* Ticket button — upcoming only */}
      {variant === 'upcoming' && safeHref(entry.ticketUrl) && (
        <a
          href={safeHref(entry.ticketUrl)!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get tickets for ${entry.title}`}
          className="inline-block mt-(--space-md) px-(--space-lg) py-(--space-sm) bg-(--color-accent-violet) text-white text-(--text-label) font-bold uppercase hover:bg-(--color-accent-lime) hover:text-black transition-colors duration-150"
        >
          GET TICKETS
        </a>
      )}

      {/* Listen link — past only */}
      {variant === 'past' && safeHref(entry.soundcloudSetUrl) && (
        <a
          href={safeHref(entry.soundcloudSetUrl)!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-(--space-md) text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150"
        >
          LISTEN ↗
        </a>
      )}

      {/* Aftermovie link — past only */}
      {variant === 'past' && safeHref(entry.aftermovieUrl) && (
        <a
          href={safeHref(entry.aftermovieUrl)!}
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
