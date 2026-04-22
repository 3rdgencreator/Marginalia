import ArtistLink from './ArtistLink';

type MetaHeaderProps = {
  title: string;
  artistSlugs: readonly string[];
  artistNames: readonly string[];
  releaseDate: string | null;
};

export default function ReleaseMetaHeader({
  title,
  artistSlugs,
  artistNames,
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
      <h1 className="text-[--text-heading] md:text-[2rem] font-bold tracking-[-0.02em] leading-tight text-[--color-text-primary]">
        {title}
      </h1>
      {artistSlugs.length > 0 && (
        <p className="text-[--text-body] text-[--color-text-primary]">
          {artistSlugs.map((slug, index) => {
            const name = artistNames[index] ?? slug;
            return (
              <span key={slug}>
                <ArtistLink slug={slug} name={name} />
                {index < artistSlugs.length - 1 && (
                  <span className="text-[--color-text-secondary]"> × </span>
                )}
              </span>
            );
          })}
        </p>
      )}
      {formattedDate && (
        <time
          dateTime={releaseDate ?? undefined}
          className="text-[--text-label] text-[--color-text-secondary]"
        >
          Out {formattedDate}
        </time>
      )}
    </header>
  );
}
