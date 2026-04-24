'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

interface SCTrack {
  title: string;
  artwork_url: string | null;
  duration: number;
  username?: string;
}

interface SCWidget {
  bind(event: string, cb: (...args: unknown[]) => void): void;
  play(): void;
  pause(): void;
  skip(index: number): void;
  isPaused(cb: (v: boolean) => void): void;
  getSounds(cb: (sounds: SCTrack[]) => void): void;
  getCurrentSoundIndex(cb: (index: number) => void): void;
  getDuration(cb: (v: number) => void): void;
}

declare global {
  interface Window {
    SC: {
      Widget: ((iframe: HTMLIFrameElement) => SCWidget) & {
        Events: Record<string, string>;
      };
    };
  }
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function PodcastPlayer({
  playlistEmbedUrl,
  playlistUrl,
}: {
  playlistEmbedUrl: string;
  playlistUrl: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const initializedRef = useRef(false);
  const [tracks, setTracks] = useState<SCTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const currentTrack = tracks[currentIndex] ?? null;
  const artworkUrl = currentTrack?.artwork_url
    ? currentTrack.artwork_url.replace(/-large(?=\.|$)|-t\d+x\d+(?=\.|$)/, '-t500x500')
    : null;

  // Fetch full track list from our server-side API (bypasses Widget API 5-track limit)
  useEffect(() => {
    fetch(`/api/soundcloud-playlist?url=${encodeURIComponent(playlistUrl)}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((data: SCTrack[]) => {
        if (Array.isArray(data)) { setTracks(data); setLoaded(true); }
      })
      .catch(() => setLoaded(true));
  }, [playlistUrl]);

  const setupWidget = useCallback(() => {
    if (initializedRef.current) return;
    if (!iframeRef.current || !window.SC?.Widget) return;
    initializedRef.current = true;

    const widget = window.SC.Widget(iframeRef.current);
    widgetRef.current = widget;
    const E = window.SC.Widget.Events;

    widget.bind(E.PLAY, () => {
      setIsPlaying(true);
      widget.getCurrentSoundIndex((idx) => setCurrentIndex(idx));
      widget.getDuration((d) => setDuration(d));
    });
    widget.bind(E.PAUSE, () => setIsPlaying(false));
    widget.bind(E.FINISH, () => { setIsPlaying(false); setProgress(1); });
    widget.bind(E.PLAY_PROGRESS, (e: unknown) => {
      const ev = e as { relativePosition: number };
      setProgress(ev.relativePosition);
    });
  }, []);

  useEffect(() => {
    // Inject SC Widget API script
    if (!document.querySelector('script[src*="soundcloud.com/player/api"]')) {
      const s = document.createElement('script');
      s.src = 'https://w.soundcloud.com/player/api.js';
      s.async = true;
      document.head.appendChild(s);
    }

    // Poll until SC + iframe ready, then init widget for playback control
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.SC?.Widget?.Events && iframeRef.current) {
        clearInterval(interval);
        setupWidget();
      }
      if (attempts >= 20) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [setupWidget]);

  function handleSelect(index: number) {
    if (!widgetRef.current) return;
    widgetRef.current.skip(index);
    setCurrentIndex(index);
    setProgress(0);
    setTimeout(() => widgetRef.current?.play(), 300);
  }

  function togglePlay() {
    if (!widgetRef.current) return;
    widgetRef.current.isPaused((paused) => {
      if (paused) widgetRef.current!.play();
      else widgetRef.current!.pause();
    });
  }

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row items-start">

      {/* Left — sticky player card */}
      <div
        className="w-full lg:sticky lg:top-28 lg:self-start shrink-0"
        style={{ maxWidth: 380 }}
      >
        <div className="rounded-2xl border border-white/20 overflow-hidden bg-white/5 backdrop-blur-sm">
          <div className="relative bg-white/10" style={{ aspectRatio: '1 / 1' }}>
            {artworkUrl ? (
              <Image src={artworkUrl} alt={currentTrack?.title ?? ''} fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 bg-white/10" />
            )}
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors duration-150"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </div>
            </button>
          </div>
          <div className="px-4 pt-3 pb-4">
            <p className="text-sm font-semibold text-(--color-text-primary) truncate">
              {currentTrack?.title ?? (loaded ? '—' : 'Loading…')}
            </p>
            <p className="text-xs text-(--color-text-muted) mt-0.5 truncate">
              {currentTrack?.username ?? ''}
            </p>
            <div className="mt-3 h-1 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%`, backgroundColor: 'var(--color-accent-lime)' }}
              />
            </div>
            {duration > 0 && (
              <p className="text-[10px] text-(--color-text-muted) mt-1.5 text-right tabular-nums">
                {formatDuration(Math.round(progress * duration))} / {formatDuration(duration)}
              </p>
            )}
          </div>
        </div>

        {/* View all — glowing pill button below player card */}
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-white/10 border border-white/40 text-(--color-text-primary) hover:bg-white/20 transition-all duration-150 text-sm font-semibold tracking-wide"
          style={{ boxShadow: '0 0 16px 4px rgba(202,201,249,0.18), 0 0 5px 1px rgba(202,201,249,0.28)' }}
        >
          View all on
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label="SoundCloud">
            <path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z"/>
          </svg>
        </a>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px bg-white/20 self-stretch mx-10 shrink-0" />

      {/* Right — track list */}
      <div className="flex-1 min-w-0 w-full mt-8 lg:mt-0">
        {!loaded && (
          <p className="text-xs text-(--color-text-muted) py-8">Loading tracks…</p>
        )}
        {tracks.map((track, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelect(i)}
            className="w-full flex items-center gap-5 py-5 text-left border-b border-white/10 first:border-t first:border-white/10 hover:bg-white/5 cursor-pointer transition-colors duration-150"
          >
            <span className={`text-xs w-6 shrink-0 text-right tabular-nums ${
              currentIndex === i ? 'text-(--color-accent-lime)' : 'text-(--color-text-muted)'
            }`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {track.artwork_url ? (
              <Image
                src={track.artwork_url.replace(/-large(?=\.|$)|-t\d+x\d+(?=\.|$)/, '-t200x200')}
                alt={track.title}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded shrink-0"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 rounded bg-white/10 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${
                currentIndex === i ? 'text-(--color-text-primary)' : 'text-(--color-text-secondary)'
              }`}>
                {track.title}
              </p>
              <p className="text-xs text-(--color-text-muted) mt-0.5 truncate">
                {track.username}
              </p>
            </div>
            {track.duration > 0 && (
              <span className="text-xs text-(--color-text-muted) shrink-0 tabular-nums">
                {formatDuration(track.duration)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SoundCloud iframe — off-screen, full size for Widget API */}
      <iframe
        ref={iframeRef}
        src={playlistEmbedUrl}
        title="SoundCloud playlist"
        allow="autoplay"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: 300,
          height: 300,
          border: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
