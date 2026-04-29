'use client';

import { useEffect, useState } from 'react';
import { usePlayer } from '@/lib/player-context';

export default function FirstVisitPrompt({
  embedUrl,
  scUrl,
}: {
  embedUrl: string;
  scUrl: string;
}) {
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { loadPlaylist, togglePlay, playOnReady, isPlaying, dismissed, hasPlayed } = usePlayer();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  function handleClick() {
    if (!loaded) {
      loadPlaylist(embedUrl, scUrl);
      setLoaded(true);
      playOnReady();
      return;
    }
    if (isPlaying) {
      togglePlay();
    } else {
      togglePlay();
      playOnReady();
    }
  }

  // Hide when MiniPlayer is open (hasPlayed && !dismissed); show only before first play or after dismiss
  if (!visible || (hasPlayed && !dismissed)) return null;

  return (
    <>
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: 'absolute', overflow: 'hidden' }}
      >
        <defs>
          <filter id="fvp-glow" x="-50%" y="-200%" width="200%" height="500%">
            <feMorphology in="SourceAlpha" result="expanded" operator="dilate" radius="5" />
            <feGaussianBlur in="expanded" result="softEdge" stdDeviation="10" />
            <feFlood floodColor="rgba(202,201,249,0.5)" result="color" />
            <feComposite in="color" in2="softEdge" operator="in" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>
      </svg>
      <button
        onClick={handleClick}
        aria-label={isPlaying ? 'Pause podcast' : 'Play podcast'}
        style={{
          position: 'fixed',
          top: 'calc(var(--nav-height-mobile) + 6px + 20px + 8px)',
          left: '30px',
          zIndex: 10000,
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          color: 'rgba(255,255,255,0.85)',
          lineHeight: 1,
          opacity: 1,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      >
        {isPlaying ? (
          /* Playing — speaker with waves */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          /* Muted — speaker with X */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </>
  );
}
