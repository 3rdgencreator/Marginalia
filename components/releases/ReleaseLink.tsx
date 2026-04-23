import {
  PLATFORM_ICON_PATHS,
  PLATFORM_LABELS,
  type ReleasePlatform,
} from './platform-icons';

type ReleaseLinkProps = {
  platform: ReleasePlatform;
  url: string | null | undefined;
  releaseTitle: string;
};

export default function ReleaseLink({
  platform,
  url,
  releaseTitle,
}: ReleaseLinkProps) {
  if (!url) return null;

  const iconPath = PLATFORM_ICON_PATHS[platform];
  const label = PLATFORM_LABELS[platform];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Listen on ${label} — ${releaseTitle}`}
      className="group flex items-center gap-4 rounded-lg border border-(--color-surface) bg-(--color-surface) px-5 py-4 text-(--color-text-primary) hover:border-(--color-accent-lime) hover:text-(--color-accent-lime) transition-all duration-150"
    >
      {iconPath && (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <path d={iconPath} />
        </svg>
      )}
      <span className="text-base font-semibold tracking-tight">
        Listen on {label}
      </span>
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="ml-auto shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150"
      >
        <path d="M2 6h8M6 2l4 4-4 4" />
      </svg>
    </a>
  );
}
