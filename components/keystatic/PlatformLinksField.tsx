'use client';

import { useState, useCallback } from 'react';

export type PlatformLinksValue = {
  upc?: string;
  layloUrl?: string;
  // Primary
  beatportUrl?: string;
  spotifyUrl?: string;
  soundcloudUrl?: string;
  appleMusicUrl?: string;
  deezerUrl?: string;
  bandcampUrl?: string;
  // Secondary
  tidalUrl?: string;
  traxsourceUrl?: string;
  junoUrl?: string;
  boomkatUrl?: string;
  amazonUrl?: string;
  youtubeUrl?: string;
  anghamiUrl?: string;
  mixcloudUrl?: string;
  netEaseUrl?: string;
  pandoraUrl?: string;
  saavnUrl?: string;
  facebookUrl?: string;
};

// Odesli linksByPlatform key → our field key
const ODESLI_MAP: Record<string, keyof PlatformLinksValue> = {
  beatport: 'beatportUrl',
  spotify: 'spotifyUrl',
  soundcloud: 'soundcloudUrl',
  appleMusic: 'appleMusicUrl',
  deezer: 'deezerUrl',
  tidal: 'tidalUrl',
  amazonMusic: 'amazonUrl',
  youtube: 'youtubeUrl',
  pandora: 'pandoraUrl',
};

type FieldDef = { key: keyof PlatformLinksValue; label: string };

const PRIMARY: FieldDef[] = [
  { key: 'beatportUrl', label: 'Beatport' },
  { key: 'spotifyUrl', label: 'Spotify' },
  { key: 'soundcloudUrl', label: 'SoundCloud' },
  { key: 'appleMusicUrl', label: 'Apple Music' },
  { key: 'deezerUrl', label: 'Deezer' },
  { key: 'bandcampUrl', label: 'Bandcamp' },
];

const SECONDARY: FieldDef[] = [
  { key: 'tidalUrl', label: 'Tidal' },
  { key: 'traxsourceUrl', label: 'Traxsource' },
  { key: 'junoUrl', label: 'Juno Download' },
  { key: 'boomkatUrl', label: 'Boomkat' },
  { key: 'amazonUrl', label: 'Amazon Music' },
  { key: 'youtubeUrl', label: 'YouTube' },
  { key: 'anghamiUrl', label: 'Anghami' },
  { key: 'mixcloudUrl', label: 'MixCloud' },
  { key: 'netEaseUrl', label: 'NetEase Music' },
  { key: 'pandoraUrl', label: 'Pandora' },
  { key: 'saavnUrl', label: 'JioSaavn' },
  { key: 'facebookUrl', label: 'Facebook' },
];

type Props = {
  value: PlatformLinksValue;
  onChange(value: PlatformLinksValue): void;
  autoFocus: boolean;
  forceValidation: boolean;
};

const s = {
  input: {
    width: '100%',
    padding: '5px 8px',
    borderRadius: 4,
    border: '1px solid #d1d5db',
    fontSize: 12,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    background: '#fff',
    color: '#111',
  },
  label: { fontSize: 11, color: '#6b7280', marginBottom: 3, display: 'block' as const },
  section: {
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#9ca3af',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: 2,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px 12px',
  },
};

export function PlatformLinksField({ value, onChange, autoFocus }: Props) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  const set = useCallback(
    (key: keyof PlatformLinksValue, val: string) =>
      onChange({ ...value, [key]: val || undefined }),
    [value, onChange]
  );

  const handleFetch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setStatus('loading');
    setMsg('');
    try {
      const res = await fetch(`/api/odesli?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatus('err');
        setMsg(data.error ?? 'Not found on Odesli');
        return;
      }
      const byPlatform: Record<string, { url?: string }> =
        data.linksByPlatform ?? {};
      const patch: Partial<PlatformLinksValue> = { upc: q };
      for (const [oKey, fKey] of Object.entries(ODESLI_MAP)) {
        if (byPlatform[oKey]?.url) {
          (patch as Record<string, string>)[fKey] = byPlatform[oKey].url!;
        }
      }
      onChange({ ...value, ...patch });
      const count = Object.keys(patch).filter((k) => k !== 'upc').length;
      setStatus('ok');
      setMsg(`${count} link bulundu`);
    } catch {
      setStatus('err');
      setMsg('Network error');
    }
  }, [query, value, onChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Odesli fetcher ── */}
      <div style={{ ...s.section, background: '#f9fafb' }}>
        <div style={s.sectionTitle}>Odesli ile otomatik doldur</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            placeholder="UPC (ör. 4099964069441) veya herhangi bir platform URL'si"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFetch(); } }}
            style={{ ...s.input, flex: 1 }}
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={status === 'loading' || !query.trim()}
            style={{
              padding: '5px 12px',
              borderRadius: 4,
              border: 'none',
              background: status === 'loading' ? '#9ca3af' : '#2563eb',
              color: '#fff',
              fontSize: 12,
              cursor: status === 'loading' ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}
          >
            {status === 'loading' ? 'Çekiliyor…' : 'Getir'}
          </button>
        </div>
        {msg && (
          <div style={{
            fontSize: 11,
            color: status === 'err' ? '#dc2626' : '#16a34a',
            marginTop: -4,
          }}>
            {status === 'ok' ? '✓ ' : '✗ '}{msg}
          </div>
        )}
        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: -4 }}>
          Otomatik çekilen platformlar: Beatport · Spotify · Apple Music · SoundCloud · Deezer · Tidal · Amazon Music · YouTube · Pandora
        </div>
      </div>

      {/* ── Laylo / Presave ── */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Presave / CTA</div>
        <div>
          <label style={s.label}>UPC</label>
          <input
            type="text"
            value={value.upc ?? ''}
            onChange={(e) => set('upc', e.target.value)}
            placeholder="ör. 4099964069441"
            style={s.input}
          />
        </div>
        <div>
          <label style={s.label}>Laylo URL</label>
          <input
            type="url"
            value={value.layloUrl ?? ''}
            onChange={(e) => set('layloUrl', e.target.value)}
            placeholder="https://laylo.com/..."
            style={s.input}
          />
        </div>
      </div>

      {/* ── Primary platforms ── */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Primary Platformlar</div>
        <div style={s.grid2}>
          {PRIMARY.map(({ key, label }) => (
            <div key={key}>
              <label style={s.label}>{label}</label>
              <input
                type="url"
                value={value[key] ?? ''}
                onChange={(e) => set(key, e.target.value)}
                placeholder="https://..."
                style={s.input}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Secondary platforms ── */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Diğer Platformlar</div>
        <div style={s.grid2}>
          {SECONDARY.map(({ key, label }) => (
            <div key={key}>
              <label style={s.label}>{label}</label>
              <input
                type="url"
                value={value[key] ?? ''}
                onChange={(e) => set(key, e.target.value)}
                placeholder="https://..."
                style={s.input}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
