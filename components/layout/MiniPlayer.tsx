'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { usePlayer } from '@/lib/player-context';

// Simulated stereo VU meter — SoundCloud iframe is cross-origin so real audio
// analysis isn't possible; L and R channels animate independently.
function VUMeter({ isPlaying, volume }: { isPlaying: boolean; volume: number }) {
  const [levels, setLevels] = useState<[number, number]>([0, 0]);
  const lRef = useRef(0);
  const rRef = useRef(0);
  const lTargetRef = useRef(0);
  const rTargetRef = useRef(0);
  const volumeRef = useRef(volume);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  useEffect(() => {
    function nextTarget() {
      const r = Math.random();
      if (r < 0.006) return 85 + Math.random() * 15;
      if (r < 0.10)  return 55 + Math.random() * 20;
      if (r < 0.35)  return Math.random() * 12;
      return 15 + Math.random() * 30;
    }
    const id = setInterval(() => {
      if (!isPlaying) {
        lRef.current = Math.max(0, lRef.current - 10);
        rRef.current = Math.max(0, rRef.current - 10);
      } else {
        if (Math.random() < 0.22) lTargetRef.current = nextTarget();
        if (Math.random() < 0.22) rTargetRef.current = nextTarget();
        lRef.current = lTargetRef.current > lRef.current
          ? Math.min(100, lRef.current + 32)
          : Math.max(0, lRef.current - 18);
        rRef.current = rTargetRef.current > rRef.current
          ? Math.min(100, rRef.current + 32)
          : Math.max(0, rRef.current - 18);
      }
      const scale = volumeRef.current / 100;
      setLevels([Math.round(lRef.current * scale), Math.round(rRef.current * scale)]);
    }, 60);
    return () => clearInterval(id);
  }, [isPlaying]);

  const SEGS = 12;
  function renderColumn(level: number) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2 }}>
        {Array.from({ length: SEGS }, (_, i) => {
          const lit = level >= ((i + 1) / SEGS) * 100;
          // V10-style: 6 orange (bottom) → 4 white → 2 red (top)
          const litColor = i >= 10 ? '#ff2828' : i >= 6 ? 'rgba(255,255,255,0.92)' : '#9EFF0A';
          const dimColor = i >= 10 ? 'rgba(255,40,40,0.07)' : i >= 6 ? 'rgba(255,255,255,0.06)' : 'rgba(158,255,10,0.08)';
          return (
            <div key={i} style={{
              width: 4, height: 4,
              backgroundColor: lit ? litColor : dimColor,
              transition: lit ? 'none' : 'background-color 0.08s',
            }} />
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
      {renderColumn(levels[0])}
      {renderColumn(levels[1])}
    </div>
  );
}


export default function MiniPlayer({ bgColor }: { bgColor?: string }) {
  const pathname = usePathname();
  const {
    isPlaying, hasPlayed, dismissed, volume,
    progress, tracks, currentIndex,
    togglePlay, skipNext, seekTo, dismiss,
  } = usePlayer();
  const currentTitle = tracks[currentIndex]?.title ?? '';
  const currentArtwork = tracks[currentIndex]?.artwork_url ?? null;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (!hasPlayed || dismissed) return null;


  return createPortal(
    <div className="hidden md:block">
      {/* Artwork — floats above mini player, bottom-left */}
      {/* Stereo VU meter — floats above the player bar, right side */}
      <div style={{
        position: 'fixed', bottom: 52, right: 56, zIndex: 9999,
        display: 'flex', alignItems: 'flex-end',
      }}>
        <VUMeter isPlaying={isPlaying} volume={volume} />
      </div>

      {/* Minimize — sits where gain knob was, below VU meter */}
      <div style={{
        position: 'fixed', bottom: 0, right: 52, zIndex: 10000,
        height: 32, display: 'flex', alignItems: 'center',
      }}>
        <button
          onClick={dismiss}
          aria-label="Hide player"
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>


      {currentArtwork && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentArtwork}
          alt={currentTitle}
          style={{
            position: 'fixed', bottom: 48, left: 20, zIndex: 9998,
            width: 60, height: 60, objectFit: 'cover',
          }}
        />
      )}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        transform: 'translateZ(0)',
        background: bgColor ?? 'rgba(10,10,12,0.85)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'inherit', color: 'inherit',
      }}>
        {/* Seekable progress line */}
        <div
          style={{ height: 2, width: '100%', background: 'rgba(255,255,255,0.12)', cursor: 'pointer' }}
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo((e.clientX - r.left) / r.width); }}
        >
          <div style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: 'var(--color-accent-lime)', transition: 'width 300ms' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 20px', maxWidth: 1280, margin: '0 auto' }}>

          {/* Left — now playing + track title */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 8 }}>
            {isPlaying && (
              <span style={{ fontSize: 8, fontWeight: 300, color: '#9EFF0A', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
                Now Playing
              </span>
            )}
            {currentTitle && (
              <span style={{
                fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.9)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                letterSpacing: '0.01em',
              }}>
                {currentTitle}
              </span>
            )}
          </div>

          {/* Center — Spotify-style transport controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            {/* Skip to beginning */}
            <button onClick={() => seekTo(0)} aria-label="Restart" style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center',
              transition: 'color 150ms',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            </button>

            {/* Play / Pause — white circle */}
            <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#fff', border: 'none',
              cursor: 'pointer', color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'transform 150ms',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isPlaying
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
            </button>

            {/* Skip next */}
            <button onClick={skipNext} aria-label="Next" style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center',
              transition: 'color 150ms',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2z"/></svg>
            </button>
          </div>

          {/* Right — spacer only; mute + close are fixed below the VU meter */}
          <div style={{ flex: 1 }} />

        </div>
      </div>
    </div>,
    document.body
  );
}
