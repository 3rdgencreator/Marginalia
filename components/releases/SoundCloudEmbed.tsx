'use client';

import dynamic from 'next/dynamic';
import EmbedSkeleton from './EmbedSkeleton';

const SoundCloudPlayer = dynamic(() => import('./SoundCloudPlayer'), {
  ssr: false,
  loading: () => <EmbedSkeleton />,
});

// embedUrl is the pre-constructed SoundCloud iframe src (built server-side by
// buildSoundCloudEmbedUrl so this client component stays free of server-only imports).
type SoundCloudEmbedProps = { embedUrl: string; height?: number };

export default function SoundCloudEmbed({ embedUrl, height }: SoundCloudEmbedProps) {
  return <SoundCloudPlayer embedUrl={embedUrl} height={height} />;
}
