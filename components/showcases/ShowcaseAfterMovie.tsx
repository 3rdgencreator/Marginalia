'use client';

import dynamic from 'next/dynamic';

const AfterMovieEmbed = dynamic(() => import('./AfterMovieEmbed'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full bg-(--color-surface) animate-pulse" />
  ),
});

export default function ShowcaseAfterMovie({ url, title }: { url: string; title: string }) {
  return <AfterMovieEmbed url={url} title={title} />;
}
