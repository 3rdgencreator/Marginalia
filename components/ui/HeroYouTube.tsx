'use client';

import { useState } from 'react';

type Props = {
  embedUrl: string;
  thumbnailUrl: string;
};

export default function HeroYouTube({ embedUrl, thumbnailUrl }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Thumbnail — visible until iframe fires onLoad */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.8s ease',
        }}
      />
      <iframe
        src={embedUrl}
        title="Marginalia hero background video"
        aria-hidden="true"
        allow="autoplay; encrypted-media"
        loading="eager"
        onLoad={() => setLoaded(true)}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      />
    </div>
  );
}
