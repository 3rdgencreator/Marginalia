'use client';

import Image from 'next/image';
import SoundCloudEmbed from '@/components/releases/SoundCloudEmbed';

type Episode = {
  slug: string;
  title: string;
  artistSlug: string | null;
  date: string | null;
  description: string | null;
  coverImage: string | null;
  embedUrl: string | null;
};

export default function PodcastRow({
  episode,
  isOpen,
  onToggle,
}: {
  episode: Episode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      {/* Collapsed header — entire row is the interactive button (per D-09, UI-SPEC line 147) */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`podcast-panel-${episode.slug}`}
        id={`podcast-btn-${episode.slug}`}
        className={`w-full flex items-center justify-between py-(--space-md) px-(--space-lg) cursor-pointer hover:bg-(--color-surface) transition-colors duration-150 text-left ${
          isOpen ? 'border-l-4 border-(--color-accent-violet)' : 'border-l-4 border-transparent'
        }`}
      >
        {/* Left: title + artist stacked */}
        <div className="flex flex-col gap-(--space-xs) min-w-0">
          <span className="text-(--text-body) font-bold text-(--color-text-primary) truncate">
            {episode.title}
          </span>
          {episode.artistSlug && (
            <span className="text-(--text-label) text-(--color-text-muted)">
              {episode.artistSlug}
            </span>
          )}
        </div>

        {/* Right: date + chevron */}
        <div className="flex items-center gap-(--space-sm) shrink-0 ml-(--space-md)">
          {episode.date && (
            <span className="text-(--text-label) text-(--color-text-muted)">
              {episode.date}
            </span>
          )}
          {/* Chevron rotates on expand — text-based per UI-SPEC */}
          <span
            className="text-(--color-text-muted) transition-transform duration-200"
            style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          >
            ▾
          </span>
        </div>
      </button>

      {/* Expanded panel — CSS max-height transition (per D-12 + UI-SPEC line 155) */}
      <div
        id={`podcast-panel-${episode.slug}`}
        role="region"
        aria-labelledby={`podcast-btn-${episode.slug}`}
        className={`overflow-hidden transition-all duration-200 ease-out ${
          isOpen ? 'max-h-[700px]' : 'max-h-0'
        }`}
      >
        {/* Only render inner content when open — avoids mounting SoundCloudEmbed for all rows */}
        {isOpen && (
          <div className="flex flex-col md:flex-row gap-(--space-lg) p-(--space-lg) bg-(--color-surface)">

            {/* Left: square artwork — hidden if no coverImage */}
            {episode.coverImage && (
              <div className="shrink-0">
                <Image
                  src={`/images/releases/${episode.coverImage}`}
                  alt={episode.title}
                  width={192}
                  height={192}
                  className="w-48 h-48 object-cover"
                />
              </div>
            )}

            {/* Right: SoundCloudEmbed + description */}
            <div className="flex flex-col gap-(--space-md) flex-1 min-w-0">
              {/* SoundCloudEmbed handles next/dynamic ssr:false + EmbedSkeleton internally */}
              {episode.embedUrl && <SoundCloudEmbed embedUrl={episode.embedUrl} />}
              {episode.description && (
                <p className="text-(--text-body) text-(--color-text-secondary) leading-relaxed">
                  {episode.description}
                </p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
