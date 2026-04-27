'use client';

import { useState } from 'react';
import Image from 'next/image';
import SoundCloudEmbed from '@/components/releases/SoundCloudEmbed';
import PodcastPlayer from './PodcastPlayer';

type Episode = {
  slug: string;
  title: string;
  artistName: string | null;
  date: string | null;
  description: string | null;
  coverImage: string | null;
  embedUrl: string | null;
};

export default function PodcastAccordion({
  episodes,
  playlistEmbedUrl,
  playlistUrl,
}: {
  episodes: Episode[];
  playlistEmbedUrl?: string | null;
  playlistUrl?: string | null;
}) {
  const defaultUrl = playlistEmbedUrl ?? episodes[0]?.embedUrl ?? null;
  const [activeUrl, setActiveUrl] = useState<string | null>(defaultUrl);
  const [activeSlug, setActiveSlug] = useState<string | null>(
    !playlistEmbedUrl && episodes[0]?.embedUrl ? episodes[0].slug : null
  );

  function selectEpisode(ep: Episode) {
    if (!ep.embedUrl) return;
    setActiveUrl(ep.embedUrl);
    setActiveSlug(ep.slug);
  }

  // Playlist-only mode: use Widget API custom player
  if (playlistEmbedUrl && playlistUrl && episodes.length === 0) {
    return <PodcastPlayer playlistEmbedUrl={playlistEmbedUrl} playlistUrl={playlistUrl} />;
  }

  return (
    <div className="flex flex-col md:flex-row items-start">

      {/* Left — player card */}
      {activeUrl && (
        <div className="w-full md:w-[340px] shrink-0">
          <div className="overflow-hidden border border-black/20">
            <SoundCloudEmbed embedUrl={activeUrl} height={420} />
          </div>
        </div>
      )}

      {/* Vertical divider */}
      {activeUrl && episodes.length > 0 && (
        <div className="hidden md:block w-px bg-white/20 self-stretch mx-10" />
      )}

      {/* Right — episode list */}
      {episodes.length > 0 && (
        <div className="flex-1 min-w-0 w-full mt-8 md:mt-0">
          {episodes.map((ep, i) => (
            <button
              key={ep.slug}
              type="button"
              onClick={() => selectEpisode(ep)}
              disabled={!ep.embedUrl}
              className={`w-full flex items-center gap-5 py-5 text-left border-b border-white/10 bg-transparent transition-colors duration-150 first:border-t first:border-white/10 ${
                ep.embedUrl ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default opacity-40'
              } ${activeSlug === ep.slug ? 'opacity-100' : 'opacity-100'}`}
            >
              {/* Number */}
              <span className={`text-xs w-6 shrink-0 text-right tabular-nums transition-colors ${
                activeSlug === ep.slug ? 'text-(--color-accent-lime)' : 'text-(--color-text-muted)'
              }`}>
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Thumbnail */}
              {ep.coverImage ? (
                <Image
                  src={`/images/releases/${ep.coverImage}`}
                  alt={ep.title}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 bg-white/10 shrink-0" />
              )}

              {/* Title + artist */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate transition-colors ${
                  activeSlug === ep.slug ? 'text-(--color-text-primary)' : 'text-(--color-text-secondary)'
                }`}>
                  {ep.title}
                </p>
                {ep.artistName && (
                  <p className="text-xs text-(--color-text-muted) truncate mt-0.5">
                    {ep.artistName}
                  </p>
                )}
              </div>

              {/* Date */}
              {ep.date && (
                <span className="text-xs text-(--color-text-muted) shrink-0 tabular-nums">
                  {ep.date}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
