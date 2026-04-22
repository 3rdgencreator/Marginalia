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
  const ariaLabel = `${label} — ${releaseTitle}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="inline-flex items-center justify-center p-3 text-[--color-text-secondary] hover:text-[--color-accent-lime] transition-colors duration-150"
    >
      {iconPath ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={iconPath} />
        </svg>
      ) : (
        <span className="text-[--text-label] underline-offset-2 hover:underline">
          {label}
        </span>
      )}
    </a>
  );
}
