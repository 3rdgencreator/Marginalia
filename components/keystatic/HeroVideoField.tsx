'use client';

import { useEffect, useState } from 'react';

export type HeroVideoValue = {
  directUrl?: string;
  youtubeUrl?: string;
};

type Props = {
  value: HeroVideoValue;
  onChange(v: HeroVideoValue): void;
  autoFocus: boolean;
  forceValidation: boolean;
};

const inp: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  borderRadius: 4,
  border: '1px solid #e5e7eb',
  fontSize: 12,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: '#fafafa',
  color: '#111',
  outline: 'none',
};

const lbl: React.CSSProperties = {
  fontSize: 11,
  color: '#9ca3af',
  marginBottom: 3,
  display: 'block',
  fontWeight: 500,
};

export function HeroVideoField({ value, onChange, autoFocus }: Props) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [thumbState, setThumbState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  const directUrl = value.directUrl ?? '';
  const youtubeUrl = value.youtubeUrl ?? '';

  useEffect(() => {
    if (!directUrl) { setThumb(null); setThumbState('idle'); return; }
    setThumbState('loading');
    setThumb(null);

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;
    video.src = directUrl + '#t=0.001';

    const onData = () => { video.currentTime = 0.001; };
    const onSeeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 192;
      canvas.height = 108;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setThumbState('err'); return; }
      try {
        ctx.drawImage(video, 0, 0, 192, 108);
        setThumb(canvas.toDataURL('image/jpeg', 0.8));
        setThumbState('ok');
      } catch {
        setThumbState('err');
      }
    };
    const onError = () => { setThumbState('err'); };

    video.addEventListener('loadeddata', onData);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('loadeddata', onData);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.src = '';
    };
  }, [directUrl]);

  return (
    <div style={{ fontFamily: 'inherit', fontSize: 12 }}>
      {/* Direct MP4 */}
      <div style={{ marginBottom: 12 }}>
        <label style={lbl}>Direct MP4/WebM URL — öncelikli</label>
        <input
          type="url"
          autoFocus={autoFocus}
          placeholder="https://... (Google Drive, Dropbox, CDN)"
          value={directUrl}
          onChange={e => { onChange({ ...value, directUrl: e.target.value || undefined }); }}
          style={inp}
        />
        {directUrl && (
          <div style={{ marginTop: 6 }}>
            {thumbState === 'loading' && (
              <span style={{ fontSize: 10, color: '#6b7280' }}>Önizleme yükleniyor…</span>
            )}
            {thumbState === 'ok' && thumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="İlk kare" style={{ width: 192, height: 108, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb', display: 'block' }} />
            )}
            {thumbState === 'err' && (
              <div style={{ fontSize: 10, color: '#92400e', padding: '3px 7px', background: '#fef3c7', borderRadius: 4, border: '1px solid #fde68a', display: 'inline-block' }}>
                ✓ URL girildi — önizleme yüklenemedi (CORS), video sayfada çalışabilir
              </div>
            )}
          </div>
        )}
      </div>

      {/* YouTube fallback */}
      <div>
        <label style={lbl}>YouTube URL — yedek (Direct URL boşsa kullanılır)</label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={youtubeUrl}
          onChange={e => { onChange({ ...value, youtubeUrl: e.target.value || undefined }); }}
          style={inp}
        />
      </div>
    </div>
  );
}
