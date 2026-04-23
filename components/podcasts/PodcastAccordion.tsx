'use client';

import { useState } from 'react';

interface Episode {
  slug: string;
  title: string;
  artistSlug: string | null;
  date: string | null;
  description: string | null;
  coverImage: string | null;
  embedUrl: string | null;
}

interface PodcastAccordionProps {
  episodes: Episode[];
}

export default function PodcastAccordion({ episodes }: PodcastAccordionProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <ul className="flex flex-col divide-y divide-white/10">
      {episodes.map((ep) => {
        const isOpen = openSlug === ep.slug;
        return (
          <li key={ep.slug}>
            <button
              type="button"
              onClick={() => setOpenSlug(isOpen ? null : ep.slug)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 py-(--space-md) text-left hover:text-(--color-surface-purple) transition-colors duration-150"
            >
              <span className="flex flex-col gap-1">
                <span className="text-(--text-body) font-semibold text-(--color-text-primary)">
                  {ep.title}
                </span>
                {ep.date && (
                  <span className="text-(--text-label) text-(--color-text-muted)">
                    {ep.date}
                  </span>
                )}
              </span>
              <span
                aria-hidden
                className="shrink-0 text-(--color-text-muted) text-xl leading-none"
              >
                {isOpen ? '−' : '+'}
              </span>
            </button>

            {isOpen && (
              <div className="pb-(--space-lg) flex flex-col gap-4">
                {ep.description && (
                  <p className="text-(--text-body) text-(--color-text-secondary)">
                    {ep.description}
                  </p>
                )}
                {ep.embedUrl && (
                  <iframe
                    src={ep.embedUrl}
                    title={ep.title}
                    className="w-full border-0"
                    height={166}
                    loading="lazy"
                    allow="autoplay"
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
