import ReleaseCard from './ReleaseCard';

type GridProps = {
  releases: Array<{
    slug: string;
    entry: {
      title: string;
      artistName?: string;
      coverArt: string | null;
      artworkUrl?: string | null;
      presave?: boolean;
      badgeText?: string | null;
    };
  }>;
};

export default function ReleaseGrid({ releases }: GridProps) {
  return (
    <ul
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4"
      aria-label="Releases catalog"
    >
      {releases.map(({ slug, entry }) => (
        <li key={slug}>
          <ReleaseCard slug={slug} entry={entry} />
        </li>
      ))}
    </ul>
  );
}
