import ReleaseLink from './ReleaseLink';
import {
  SECONDARY_PLATFORMS,
  type ReleasePlatform,
} from './platform-icons';

type MorePlatformsProps = {
  releaseTitle: string;
  urls: Partial<Record<ReleasePlatform, string | null | undefined>>;
};

export default function MorePlatforms({
  releaseTitle,
  urls,
}: MorePlatformsProps) {
  const hasAny = SECONDARY_PLATFORMS.some((p) => Boolean(urls[p]));
  if (!hasAny) return null;

  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden">
      <summary
        className="
          list-none cursor-pointer
          inline-flex items-center gap-2
          text-[--text-label] text-[--color-text-secondary]
          uppercase tracking-[0.08em]
          hover:text-[--color-text-primary]
          transition-colors duration-150
        "
      >
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className="transition-transform duration-150 group-open:rotate-90"
        >
          <path d="M2 1 L8 5 L2 9 Z" />
        </svg>
        Also available on
      </summary>
      <ul
        className="mt-4 flex flex-wrap items-center gap-3"
        aria-label="Also available on"
      >
        {SECONDARY_PLATFORMS.map((platform) => {
          const url = urls[platform];
          if (!url) return null;
          return (
            <li key={platform}>
              <ReleaseLink
                platform={platform}
                url={url}
                releaseTitle={releaseTitle}
              />
            </li>
          );
        })}
      </ul>
    </details>
  );
}
