'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { usePlayer } from '@/lib/player-context';

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 19L19 20.27 20.27 19 5.27 4 4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>
    </svg>
  );
  if (volume < 50) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  );
}

export default function MiniPlayer() {
  const pathname = usePathname();
  const {
    isPlaying, hasPlayed, dismissed, volume,
    progress, tracks, currentIndex,
    togglePlay, skipPrev, skipNext, seekTo, dismiss, setVolume,
  } = usePlayer();
  const currentTitle = tracks[currentIndex]?.title ?? '';
  const currentArtwork = tracks[currentIndex]?.artwork_url ?? null;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (pathname === '/podcasts') return null;
  if (!hasPlayed || dismissed) return null;

  const btn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.55)', padding: 4, display: 'flex',
    alignItems: 'center', justifyContent: 'center', lineHeight: 1,
  };

  return createPortal(
    <>
      {/* Artwork — floats above mini player, bottom-left */}
      {currentArtwork && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentArtwork}
          alt={currentTitle}
          style={{
            position: 'fixed', bottom: 48, left: 20, zIndex: 9998,
            width: 60, height: 60, borderRadius: 6, objectFit: 'cover',
            boxShadow: '0 0 20px 6px rgba(158,255,10,0.18), 0 0 6px 2px rgba(158,255,10,0.3)',
          }}
        />
      )}
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      transform: 'translateZ(0)',
      background: 'rgba(10,10,12,0.10)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      fontFamily: 'inherit', color: 'inherit',
    }}>
      <style>{`
        .mp-vol {
          -webkit-appearance: none;
          appearance: none;
          width: 72px;
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(to right,
            #9EFF0A 0%,
            #9EFF0A var(--vol, 80%),
            rgba(255,255,255,0.18) var(--vol, 80%),
            rgba(255,255,255,0.18) 100%
          );
          cursor: pointer;
          outline: none;
          vertical-align: middle;
          flex-shrink: 0;
        }
        .mp-vol::-webkit-slider-runnable-track {
          height: 3px;
          border-radius: 2px;
        }
        .mp-vol::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          margin-top: -3.5px;
          transition: background 0.15s, transform 0.15s;
        }
        .mp-vol:hover::-webkit-slider-thumb {
          background: #9EFF0A;
          transform: scale(1.15);
        }
        .mp-vol::-moz-range-track {
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.18);
        }
        .mp-vol::-moz-range-progress {
          height: 3px;
          border-radius: 2px;
          background: #9EFF0A;
        }
        .mp-vol::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fff;
          border: none;
          cursor: pointer;
        }
        .mp-vol:hover::-moz-range-thumb {
          background: #9EFF0A;
        }
      `}</style>

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
            <span style={{ fontSize: 8, fontWeight: 300, color: 'rgba(220,50,50,0.85)', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
              Now Playing
            </span>
          )}
          {currentTitle && (
            <span style={{
              fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.55)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '0.01em',
            }}>
              {currentTitle}
            </span>
          )}
        </div>

        {/* Center — playback controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button onClick={skipPrev} aria-label="Previous" style={btn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} style={{ ...btn, color: 'rgba(255,255,255,0.9)' }}>
            {isPlaying
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
          </button>
          <button onClick={skipNext} aria-label="Next" style={btn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2z"/></svg>
          </button>
        </div>

        {/* Right — volume + close */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setVolume(volume === 0 ? 80 : 0)}
            style={{ ...btn, color: 'rgba(255,255,255,0.4)' }}
            aria-label="Toggle mute"
          >
            <VolumeIcon volume={volume} />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="mp-vol"
            style={{ '--vol': `${volume}%` } as React.CSSProperties}
          />
          <div style={{ width: 12 }} />
          <button onClick={dismiss} aria-label="Close" style={{ ...btn, color: 'rgba(255,255,255,0.35)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

      </div>
    </div>
    </>,
    document.body
  );
}
