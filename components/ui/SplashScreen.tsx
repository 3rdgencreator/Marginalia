'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const DURATION = 3000;
const TICK = 30;

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);
  const initiated = useRef(false);

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(Math.round((elapsed / DURATION) * 100), 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, TICK);

    const exitTimer = setTimeout(() => setExiting(true), DURATION + 100);
    const doneTimer = setTimeout(() => setDone(true), DURATION + 750);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (done) return null;

  // Square-root easing: reaches ~77% opacity at 60% progress, full at 100%
  const logoOpacity = Math.sqrt(progress / 100);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1F1F21',
        transform: exiting ? 'translateY(-100%)' : 'translateY(0)',
        transition: exiting ? 'transform 650ms cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
        pointerEvents: exiting ? 'none' : 'all',
      }}
    >
      {/* Logo — square-root eased opacity */}
      <Image
        src="/logo.png"
        alt="Marginalia"
        width={305}
        height={96}
        priority
        style={{
          height: 'clamp(64px, 10vw, 96px)',
          width: 'auto',
          opacity: logoOpacity,
          transition: 'opacity 60ms linear',
        }}
      />

      {/* Progress bar — Apple style, bottom-center */}
      <div
        style={{
          position: 'absolute',
          bottom: '52px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(260px, 60vw)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
            fontSize: '12px',
            fontWeight: 300,
            letterSpacing: '0.02em',
            color: 'rgba(255,255,255,0.35)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {progress}%
        </span>

        <div
          style={{
            width: '100%',
            height: '2px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: '999px',
              backgroundColor: 'rgba(255,255,255,0.6)',
              transition: `width ${TICK}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
