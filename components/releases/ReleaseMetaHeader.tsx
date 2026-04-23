type MetaHeaderProps = {
  title: string;
  artistName?: string;
  releaseDate: string | null;
};

export default function ReleaseMetaHeader({
  title,
  artistName,
  releaseDate,
}: MetaHeaderProps) {
  const formattedDate = releaseDate
    ? new Date(releaseDate + 'T00:00:00Z').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null;

  return (
    <header className="flex flex-col gap-4">
      <h1 className="text-(--text-heading) md:text-[2rem] font-bold tracking-[-0.02em] leading-tight text-(--color-text-primary)">
        {title}
      </h1>
      {artistName && (
        <p className="text-(--text-body) text-(--color-text-primary)">
          {artistName}
        </p>
      )}
      {formattedDate && (
        <time
          dateTime={releaseDate ?? undefined}
          className="text-(--text-label) text-(--color-text-secondary)"
        >
          Out {formattedDate}
        </time>
      )}
    </header>
  );
}
