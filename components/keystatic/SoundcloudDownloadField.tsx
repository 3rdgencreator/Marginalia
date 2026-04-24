'use client';

import { useState, useCallback } from 'react';

export type SoundcloudDownloadValue = {
  url?: string;
  artworkUrl?: string;
};

type Props = {
  value: SoundcloudDownloadValue;
  onChange(value: SoundcloudDownloadValue): void;
  autoFocus: boolean;
  forceValidation: boolean;
};

type Meta = { title: string | null; artistName: string | null; artworkUrl: string | null };

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

function fillInput(labelText: string, val: string) {
  const labelEl = Array.from(document.querySelectorAll('label')).find(
    (l) => l.textContent?.trim() === labelText
  );
  if (!labelEl) return;
  const forId = labelEl.getAttribute('for');
  const el = (forId ? document.getElementById(forId) : labelEl.closest('div')?.querySelector('input')) as HTMLInputElement | null;
  if (!el) return;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, val);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

export function SoundcloudDownloadField({ value, onChange, autoFocus }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');
  const [meta, setMeta] = useState<Meta | null>(null);

  const handleFetch = useCallback(async () => {
    const url = (value.url ?? '').trim();
    if (!url) return;
    setStatus('loading');
    setMsg('Fetching…');
    setMeta(null);
    try {
      const res = await fetch(`/api/soundcloud-meta?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatus('err');
        setMsg(data.error ?? 'Not found');
        return;
      }
      setMeta(data);
      onChange({ ...value, artworkUrl: data.artworkUrl ?? value.artworkUrl });

      if (data.title) {
        fillInput('Title', data.title);
        // Keystatic slug: click Regenerate to sync slug from new title
        const regenBtn = Array.from(document.querySelectorAll('button')).find(
          (b) => b.textContent?.trim() === 'Regenerate'
        ) as HTMLButtonElement | undefined;
        regenBtn?.click();
      }
      if (data.artistName) fillInput('Artist Name', data.artistName);

      setStatus('ok');
      setMsg('Title, artist & artwork filled');
    } catch {
      setStatus('err');
      setMsg('Network error');
    }
  }, [value, onChange]);

  return (
    <div style={{ fontFamily: 'inherit', fontSize: 12 }}>

      {/* URL row */}
      <div style={{ marginBottom: 8 }}>
        <label style={lbl}>Private SoundCloud URL</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="url"
            autoFocus={autoFocus}
            placeholder="https://soundcloud.com/artist/track?secret_token=s-..."
            value={value.url ?? ''}
            onChange={(e) => { onChange({ ...value, url: e.target.value || undefined }); setStatus('idle'); setMsg(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFetch(); } }}
            style={{ ...inp, flex: 1 }}
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={status === 'loading' || !value.url?.trim()}
            style={{
              padding: '5px 12px', borderRadius: 4, border: 'none',
              background: status === 'loading' ? '#9ca3af' : '#2563eb',
              color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: status === 'loading' ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'loading' ? 'Fetching…' : 'Fetch'}
          </button>
        </div>
      </div>

      {/* Status */}
      {msg && (
        <div style={{ fontSize: 11, color: status === 'err' ? '#dc2626' : '#16a34a', marginBottom: 8 }}>
          {status === 'ok' ? '✓ ' : '✗ '}{msg}
        </div>
      )}

      {/* Preview */}
      {meta && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb' }}>
          {meta.artworkUrl
            ? /* eslint-disable-next-line @next/next/no-img-element */
              <img src={meta.artworkUrl} alt="Cover" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
            : <div style={{ width: 48, height: 48, background: '#e5e7eb', borderRadius: 4, flexShrink: 0 }} />
          }
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: '#111', marginBottom: 2 }}>{meta.title ?? '—'}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{meta.artistName ?? '—'}</div>
          </div>
        </div>
      )}

      {/* Stored artwork hint */}
      {!meta && value.artworkUrl && (
        <div style={{ fontSize: 10, color: '#16a34a' }}>✓ Artwork URL stored from previous fetch</div>
      )}

    </div>
  );
}
