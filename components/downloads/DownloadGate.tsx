'use client';

import Image from 'next/image';

export type DownloadItem = {
  slug: string;
  title: string;
  artistName: string;
  description: string;
  coverImage: string | null;
  downloadUrl: string | null;
  releaseDate: string | null;
};

function DownloadCard({ item }: { item: DownloadItem }) {
  return (
    <div className="border-2 border-white/70 bg-white/10 backdrop-blur-sm overflow-hidden flex flex-col h-full">
      {item.coverImage && (
        <div className="aspect-square overflow-hidden flex-shrink-0">
          <Image
            src={item.coverImage}
            alt={`${item.title} cover`}
            width={600}
            height={600}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <p className="font-bold text-(--color-text-primary) text-sm uppercase tracking-wide leading-tight">
          {item.title}
        </p>
        {item.artistName && (
          <p className="text-xs text-(--color-text-secondary) mt-0.5">{item.artistName}</p>
        )}
        {item.description && (
          <p className="text-xs text-(--color-text-muted) mt-2 leading-relaxed">{item.description}</p>
        )}
        {item.downloadUrl && (
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 border-(--color-button) bg-white/10 text-(--color-button) hover:opacity-80 transition-all duration-150"
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Download / Listen
          </a>
        )}
      </div>
    </div>
  );
}

export default function DownloadGate({ items }: { items: DownloadItem[] }) {
  return (
    <div>
      <p className="text-xs text-(--color-text-muted) mb-(--space-xl) uppercase tracking-widest">
        {items.length} free track{items.length !== 1 ? 's' : ''} available
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-(--space-sm)">
        {items.map((item) => (
          <li key={item.slug} className="h-full">
            <DownloadCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
