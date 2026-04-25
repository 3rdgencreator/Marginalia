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
              width: 4, height: 4, borderRadius: '50%',
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

// Pioneer-style gain knob — drag up to increase, drag down to decrease
function GainKnob({ volume, setVolume }: { volume: number; setVolume: (v: number) => void }) {
  const startY = useRef<number | null>(null);
  const startVol = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    startVol.current = volume;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startY.current === null) return;
    const delta = (startY.current - e.clientY) * 0.9;
    setVolume(Math.round(Math.max(0, Math.min(100, startVol.current + delta))));
  }
  function onPointerUp() { startY.current = null; }

  // Map volume 0-100 → angle -135° to +135° (270° sweep)
  const angle = -135 + (volume / 100) * 270;
  const rad = (angle - 90) * (Math.PI / 180);
  const r = 7; // indicator dot radius from center
  const cx = 11; const cy = 11; // center of 22×22 knob
  const dx = cx + r * Math.cos(rad);
  const dy = cy + r * Math.sin(rad);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      title={`Gain: ${volume}%`}
      style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: 'radial-gradient(circle at 42% 36%, #555 0%, #333 38%, #1e1e1e 68%, #141414 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.5)',
        cursor: 'grab', userSelect: 'none', position: 'relative', touchAction: 'none',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx={dx} cy={dy} r={1.5} fill="rgba(255,255,255,0.85)" />
      </svg>
    </div>
  );
}

export default function MiniPlayer() {
  const pathname = usePathname();
  const {
    isPlaying, hasPlayed, dismissed, volume,
    progress, tracks, currentIndex,
    togglePlay, skipNext, seekTo, setVolume, dismiss,
  } = usePlayer();
  const currentTitle = tracks[currentIndex]?.title ?? '';
  const currentArtwork = tracks[currentIndex]?.artwork_url ?? null;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (!hasPlayed || dismissed) return null;


  return createPortal(
    <>
      {/* Artwork — floats above mini player, bottom-left */}
      {/* Stereo VU meter — floats above the player bar, right side */}
      <div style={{
        position: 'fixed', bottom: 44, right: 56, zIndex: 9999,
        display: 'flex', alignItems: 'flex-end',
      }}>
        <VUMeter isPlaying={isPlaying} volume={volume} />
      </div>

      {/* Gain knob + minimize — vertically centered in bar, below VU meter */}
      <div style={{
        position: 'fixed', bottom: 0, right: 52, zIndex: 10000,
        height: 32, display: 'flex', alignItems: 'flex-end', paddingBottom: 1, gap: 6,
      }}>
        <button
          onClick={dismiss}
          aria-label="Hide player"
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: 13, lineHeight: 1, color: 'rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <GainKnob volume={volume} setVolume={setVolume} />
      </div>


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

          {/* Center — Pioneer CDJ circular transport controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {/* CUE — seeks to track beginning; orange when paused, dim when playing */}
            <button onClick={() => seekTo(0)} aria-label="Cue" style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'radial-gradient(circle at 42% 36%, #555 0%, #333 38%, #1e1e1e 68%, #141414 100%)',
              border: `1px solid ${isPlaying ? 'rgba(255,136,0,0.18)' : '#ff8800'}`,
              boxShadow: isPlaying
                ? 'inset 0 0 4px rgba(0,0,0,0.7)'
                : '0 0 6px rgba(255,136,0,0.6), 0 0 12px rgba(255,136,0,0.2), inset 0 0 4px rgba(0,0,0,0.7)',
              cursor: 'pointer',
              color: isPlaying ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontSize: 6, fontWeight: 700, letterSpacing: '0.04em',
            }}>
              CUE
            </button>

            {/* Play / Pause — green when playing, dim when paused */}
            <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'radial-gradient(circle at 42% 36%, #606060 0%, #383838 35%, #222 62%, #161616 100%)',
              border: `1px solid ${isPlaying ? '#14e014' : 'rgba(20,224,20,0.18)'}`,
              boxShadow: isPlaying
                ? '0 0 7px rgba(20,224,20,0.75), 0 0 15px rgba(20,224,20,0.25), inset 0 0 5px rgba(0,0,0,0.7)'
                : 'inset 0 0 5px rgba(0,0,0,0.7)',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {isPlaying
                ? <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                : <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
            </button>

            {/* Skip next — neutral, smaller */}
            <button onClick={skipNext} aria-label="Next" style={{
              width: 18, height: 18, borderRadius: '50%',
              background: 'radial-gradient(circle at 42% 36%, #555 0%, #333 38%, #1e1e1e 68%, #141414 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: 'inset 0 0 4px rgba(0,0,0,0.7)',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm8.5-6v6h2V6h-2z"/></svg>
            </button>
          </div>

          {/* Right — spacer only; mute + close are fixed below the VU meter */}
          <div style={{ flex: 1 }} />

        </div>
      </div>
    </>,
    document.body
  );
}
