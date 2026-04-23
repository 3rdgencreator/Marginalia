'use client';

import { useState } from 'react';
import PodcastRow from './PodcastRow';

type Episode = {
  slug: string;
  title: string;
  artistName: string | null;
  date: string | null;
  description: string | null;
  coverImage: string | null;
  embedUrl: string | null;
};

export default function PodcastAccordion({ episodes }: { episodes: Episode[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Single-open: opening an episode closes the previously open one (per D-12)
  const toggle = (slug: string) =>
    setActiveSlug(prev => (prev === slug ? null : slug));

  return (
    <div className="divide-y divide-(--color-surface)">
      {episodes.map(ep => (
        <PodcastRow
          key={ep.slug}
          episode={ep}
          isOpen={activeSlug === ep.slug}
          onToggle={() => toggle(ep.slug)}
        />
      ))}
    </div>
  );
}
