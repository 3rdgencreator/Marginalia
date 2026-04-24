'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { usePlayer } from '@/lib/player-context';

export default function MiniPlayer() {
  const pathname = usePathname();
  const {
    tracks, currentIndex, isPlaying, hasPlayed, dismissed,
    progress, togglePlay, skipPrev, skipNext, seekTo, dismiss,
  } = usePlayer();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (pathname === '/podcasts') return null;
  if (!hasPlayed || dismissed) return null;

  const currentTrack = tracks[currentIndex];

  const btnBase: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.4)', padding: 3, display: 'flex', lineHeight: 1,
  };

  const shell: React.CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
    transform: 'translateZ(0)',
    background: 'rgba(10,10,12,0.94)',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    fontFamily: 'inherit', color: 'inherit',
  };

  return createPortal(
    <div style={shell}>
      {/* Progress bar */}
      <div
        style={{ height: 2, width: '100%', background: 'rgba(255,255,255,0.12)', cursor: 'pointer' }}
        onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width); }}
      >
        <div style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: 'var(--color-accent-lime)', transition: 'width 300ms' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 20px', maxWidth: 1280, margin: '0 auto' }}>
        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTrack?.title ?? ''}
          </p>
        </div>

        {/* Playback */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={skipPrev} aria-label="Previous" style={{ ...btnBase, color: 'rgba(255,255,255,0.55)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} style={{ ...btnBase, color: 'rgba(255,255,255,0.9)' }}>
            {isPlaying
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
          </button>
          <button onClick={skipNext} aria-label="Next" style={{ ...btnBase, color: 'rgba(255,255,255,0.55)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2z"/></svg>
          </button>
        </div>

        {/* Close only */}
        <button onClick={dismiss} aria-label="Close" style={{ ...btnBase, marginLeft: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
