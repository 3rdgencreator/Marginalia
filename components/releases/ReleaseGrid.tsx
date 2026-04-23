import ReleaseCard from './ReleaseCard';

type GridProps = {
  releases: Array<{
    slug: string;
    entry: {
      title: string;
      artistName?: string;
      coverArt: string | null;
      artworkUrl?: string | null;
    };
  }>;
};

export default function ReleaseGrid({ releases }: GridProps) {
  return (
    <ul
      className="
        grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5
        gap-4 md:gap-5 lg:gap-6
      "
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
