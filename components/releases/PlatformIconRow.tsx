import ReleaseLink from './ReleaseLink';
import { PRIMARY_PLATFORMS, type ReleasePlatform } from './platform-icons';

type PlatformRowProps = {
  releaseTitle: string;
  urls: Partial<Record<ReleasePlatform, string | null | undefined>>;
};

export default function PlatformIconRow({
  releaseTitle,
  urls,
}: PlatformRowProps) {
  const hasAny = PRIMARY_PLATFORMS.some((p) => Boolean(urls[p]));
  if (!hasAny) return null;

  return (
    <ul
      className="flex flex-col gap-2"
      aria-label="Listen on"
    >
      {PRIMARY_PLATFORMS.map((platform) => {
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
  );
}
