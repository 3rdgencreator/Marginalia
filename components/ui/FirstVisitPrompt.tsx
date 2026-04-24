'use client';

import { useEffect, useState } from 'react';
import { usePlayer } from '@/lib/player-context';

const SESSION_KEY = 'mrgnl_prompted';

export default function FirstVisitPrompt({
  embedUrl,
  scUrl,
  trackTitle,
}: {
  embedUrl: string;
  scUrl: string;
  trackTitle: string;
}) {
  const [visible, setVisible] = useState(false);
  const { loadPlaylist, playOnReady } = usePlayer();

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
  }

  function play() {
    loadPlaylist(embedUrl, scUrl);
    playOnReady();
    dismiss();
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 64,
      left: 20,
      zIndex: 10000,
      width: 'max-content',
      opacity: 0.8,
      maxWidth: 'calc(100vw - 32px)',
    }}>
      <div style={{
        background: 'rgba(20,20,24,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 0,
        padding: '10px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontFamily: 'inherit',
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>
            Want to listen our latest podcast while you browse?
          </p>
        </div>

        <button
          onClick={play}
          style={{
            background: 'none',
            border: 'none',
            borderRadius: 0,
            padding: '5px 14px',
            fontSize: 11, fontWeight: 700,
            color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap',
            letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0,
          }}
        >
          ▶ Play
        </button>

        <button
          onClick={dismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', fontSize: 11, padding: 0,
            flexShrink: 0, whiteSpace: 'nowrap',
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
