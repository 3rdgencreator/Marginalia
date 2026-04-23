const BADGE_CLASSES: Record<string, string> = {
  review: 'bg-(--color-tag-lavender) text-white',
  interview: 'bg-(--color-tag-sky) text-black',
  feature: 'bg-(--color-accent-lime) text-black',
  chart: 'bg-(--color-tag-yellow) text-black',
  mention: 'bg-(--color-surface) text-(--color-text-secondary)',
};

type PressEntryProps = {
  entry: {
    headline: string;
    publication: string;
    date: string | null;
    url: string | null;
    excerpt: string | null;
    type: 'review' | 'interview' | 'feature' | 'mention' | 'chart';
  };
};

export default function PressEntry({ entry }: PressEntryProps) {
  const badgeClass = BADGE_CLASSES[entry.type] ?? BADGE_CLASSES.mention;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-(--space-sm) py-(--space-lg) px-(--space-md)">
      {/* Left / main area */}
      <div className="flex-1 min-w-0">
        {/* Type badge */}
        <span
          className={`inline-block text-(--text-label) uppercase px-2 py-1 rounded-full mb-(--space-sm) ${badgeClass}`}
        >
          {entry.type}
        </span>

        {/* Headline link */}
        {entry.url ? (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read ${entry.headline} at ${entry.publication} (opens in new tab)`}
            className="block text-(--text-body) font-bold text-(--color-text-primary) hover:text-(--color-accent-lime) transition-colors duration-150"
          >
            {entry.headline}
          </a>
        ) : (
          <span className="block text-(--text-body) font-bold text-(--color-text-primary)">
            {entry.headline}
          </span>
        )}

        {/* Publication + date */}
        <span className="block text-(--text-label) text-(--color-text-secondary) mt-(--space-xs)">
          {entry.publication}
          {entry.date ? ` · ${entry.date}` : ''}
        </span>

        {/* Excerpt */}
        {entry.excerpt && (
          <p className="text-(--text-body) text-(--color-text-secondary) line-clamp-2 mt-(--space-sm)">
            {entry.excerpt}
          </p>
        )}
      </div>

      {/* Right area — Read article link */}
      {entry.url && (
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150"
        >
          Read article ↗
        </a>
      )}
    </div>
  );
}
