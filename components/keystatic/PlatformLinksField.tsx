'use client';

import { useState, useCallback, useEffect } from 'react';

export type PlatformLinksValue = {
  artworkUrl?: string;   // iTunes CDN URL — stored in YAML, used as public-page fallback
  artistName?: string;   // Raw artist string e.g. "TAKIRU, Althoff & ELIF"
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
  soundcloudPodcastUrl?: string;
};

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
  { key: 'beatportUrl',   label: 'Beatport' },
  { key: 'spotifyUrl',    label: 'Spotify' },
  { key: 'soundcloudUrl', label: 'SoundCloud' },
  { key: 'appleMusicUrl', label: 'Apple Music' },
  { key: 'deezerUrl',     label: 'Deezer' },
  { key: 'bandcampUrl',   label: 'Bandcamp' },
];

const SECONDARY: FieldDef[] = [
  { key: 'tidalUrl',      label: 'Tidal' },
  { key: 'traxsourceUrl', label: 'Traxsource' },
  { key: 'junoUrl',       label: 'Juno Download' },
  { key: 'boomkatUrl',    label: 'Boomkat' },
  { key: 'amazonUrl',     label: 'Amazon Music' },
  { key: 'youtubeUrl',    label: 'YouTube' },
  { key: 'anghamiUrl',    label: 'Anghami' },
  { key: 'mixcloudUrl',   label: 'MixCloud' },
  { key: 'netEaseUrl',    label: 'NetEase Music' },
  { key: 'pandoraUrl',    label: 'Pandora' },
  { key: 'saavnUrl',             label: 'JioSaavn' },
  { key: 'facebookUrl',          label: 'Facebook' },
  { key: 'soundcloudPodcastUrl', label: 'Podcast SoundCloud' },
];

type Props = {
  value: PlatformLinksValue;
  onChange(value: PlatformLinksValue): void;
  autoFocus: boolean;
  forceValidation: boolean;
};

type ReleaseMeta = {
  title: string;
  artist: string;
  releaseDate: string;
  releaseType: string;
  artworkUrl?: string;
};

// ── Shared styles ──────────────────────────────────────────────
const input: React.CSSProperties = {
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

const fieldLabel: React.CSSProperties = {
  fontSize: 11,
  color: '#9ca3af',
  marginBottom: 3,
  display: 'block',
  fontWeight: 500,
};

const grid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px 12px',
};

// ── Collapsible folder section (VS Code Explorer style) ────────
function Folder({
  title,
  badge,
  accent,
  defaultOpen = true,
  children,
}: {
  title: string;
  badge?: string | number;
  accent?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #f3f4f6' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '7px 4px 7px 2px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          userSelect: 'none',
        }}
      >
        {/* Chevron */}
        <span style={{
          display: 'inline-block',
          fontSize: 8,
          color: '#9ca3af',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.12s ease',
          flexShrink: 0,
          width: 10,
          lineHeight: 1,
        }}>▶</span>
        {/* Title */}
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: accent ?? '#374151',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          flex: 1,
        }}>{title}</span>
        {/* Badge */}
        {badge !== undefined && badge !== '' && (
          <span style={{
            fontSize: 10,
            color: '#9ca3af',
            fontWeight: 500,
            marginRight: 2,
          }}>{badge}</span>
        )}
      </button>
      {open && (
        <div style={{ paddingLeft: 16, paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export function PlatformLinksField({ value, onChange, autoFocus }: Props) {
  const [query, setQuery]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg]       = useState('');
  const [meta, setMeta]     = useState<ReleaseMeta | null>(null);
  const [refilling, setRefilling] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  // Hide Release Date / Release Type / Cover Art after a successful fetch;
  // show them again when showManual is toggled or meta is cleared.
  const AUTO_HIDDEN = ['Release Date', 'Release Type', 'Cover Art'] as const;

  const setFieldVisibility = useCallback((label: string, visible: boolean) => {
    const labels = Array.from(document.querySelectorAll('label'));
    const el = labels.find(l => l.textContent?.trim() === label) as HTMLElement | undefined;
    if (!el) return;
    let node: HTMLElement = el;
    for (let i = 0; i < 10; i++) {
      if (!node.parentElement) return;
      if ((node.parentElement.children.length ?? 0) > 1) {
        node.style.display = visible ? '' : 'none';
        return;
      }
      node = node.parentElement as HTMLElement;
    }
  }, []);

  useEffect(() => {
    if (meta && !showManual) {
      // Hide after a short delay so Keystatic has finished rendering
      const t = setTimeout(() => {
        AUTO_HIDDEN.forEach(f => setFieldVisibility(f, false));
      }, 200);
      return () => clearTimeout(t);
    } else {
      AUTO_HIDDEN.forEach(f => setFieldVisibility(f, true));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, showManual, setFieldVisibility]);

  const set = useCallback(
    (key: keyof PlatformLinksValue, val: string) =>
      onChange({ ...value, [key]: val || undefined }),
    [value, onChange]
  );

  const handleReset = useCallback(() => {
    if (!window.confirm('Clear all fetched data and reset the form?')) return;
    onChange({});
    setMeta(null);
    setQuery('');
    setStatus('idle');
    setMsg('');
    setShowManual(false);
  }, [onChange]);

  const handleSave = useCallback(() => {
    // Warn loudly if the Title (slug) is empty
    const allLabels = Array.from(document.querySelectorAll('label'));
    const titleLabel = allLabels.find(l => l.textContent?.trim() === 'Title');
    if (titleLabel) {
      const forId = titleLabel.getAttribute('for');
      const titleInput = (forId
        ? document.getElementById(forId)
        : titleLabel.closest('div')?.querySelector('input')
      ) as HTMLInputElement | null;
      if (titleInput && !titleInput.value.trim()) {
        alert('Title is empty — fill in the Title field first.\n\nThe Title generates the URL slug (e.g. "Medusa" → /releases/medusa).');
        titleInput.focus();
        return;
      }
    }
    // Keystatic uses these exact form IDs for collection items
    const form = (
      document.getElementById('item-create-form') ??
      document.getElementById('item-edit-form') ??
      document.getElementById('singleton-form')
    ) as HTMLFormElement | null;
    if (form) { form.requestSubmit(); return; }
    (document.querySelector('[type="submit"]') as HTMLButtonElement | null)?.click();
  }, []);

  const handleDelete = useCallback(() => {
    if (!window.confirm('Delete this release? This cannot be undone.')) return;
    const btns = Array.from(document.querySelectorAll('button'));
    const delBtn = btns.find(b => {
      const t = b.textContent?.trim() ?? '';
      return t === 'Delete' || t === 'Delete entry';
    });
    delBtn?.click();
  }, []);

  const fillField = useCallback((labelText: string, val: string): boolean => {
    const labels = Array.from(document.querySelectorAll('label'));
    const labelEl = labels.find(l => l.textContent?.trim() === labelText);
    if (!labelEl) return false;
    const forId = labelEl.getAttribute('for');
    const inp = (forId
      ? document.getElementById(forId)
      : labelEl.closest('div')?.querySelector('input')
    ) as HTMLInputElement | null;
    if (!inp) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(inp, val);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, []);

  const fillReleaseType = useCallback((val: string) => {
    const labels = Array.from(document.querySelectorAll('label'));
    const labelEl = labels.find(l => l.textContent?.trim() === 'Release Type');
    if (!labelEl) return;
    const forId = labelEl.getAttribute('for');
    const sel = (forId
      ? document.getElementById(forId)
      : labelEl.closest('div')?.querySelector('select')
    ) as HTMLSelectElement | null;
    if (!sel) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
    setter?.call(sel, val);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, []);

  const handleFetch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setStatus('loading');
    setMsg('Fetching…');
    setMeta(null);
    try {
      const res  = await fetch(`/api/odesli?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatus('err');
        setMsg(data.error ?? 'Not found');
        return;
      }
      const byPlatform: Record<string, { url?: string }> = data.linksByPlatform ?? {};
      const isUrl = /^https?:\/\//i.test(q);
      const patch: Partial<PlatformLinksValue> = isUrl ? {} : { upc: q };
      for (const [oKey, fKey] of Object.entries(ODESLI_MAP)) {
        if (byPlatform[oKey]?.url) (patch as Record<string, string>)[fKey] = byPlatform[oKey].url!;
      }
      const m = data.meta as ReleaseMeta | undefined;
      if (m?.artworkUrl)  patch.artworkUrl  = m.artworkUrl;
      if (m?.artist)      patch.artistName  = m.artist;
      onChange({ ...value, ...patch });
      const linkCount = Object.keys(patch).filter(k => k !== 'upc' && k !== 'artworkUrl' && k !== 'artistName').length;
      setStatus('ok');
      if (m) {
        setMeta(m);
        if (m.title) {
          fillField('Title', m.title);
          // Click Regenerate so Keystatic syncs the slug from the new title
          const regenBtn = Array.from(document.querySelectorAll('button'))
            .find(b => b.textContent?.trim() === 'Regenerate') as HTMLButtonElement | undefined;
          regenBtn?.click();
        }
        if (m.releaseDate) fillField('Release Date', m.releaseDate);
        if (m.releaseType) fillReleaseType(m.releaseType);
        setMsg(`${linkCount} links + metadata filled`);
      } else {
        setMsg(`${linkCount} links found`);
      }
    } catch {
      setStatus('err');
      setMsg('Network error');
    }
  }, [query, value, onChange, fillField, fillReleaseType]);

  // Counts
  const primaryFilled   = PRIMARY.filter(f => !!value[f.key]).length;
  const secondaryFilled = SECONDARY.filter(f => !!value[f.key]).length;
  const filledLinks = Object.entries(value).filter(
    ([k, v]) => k.endsWith('Url') && k !== 'artworkUrl' && k !== 'layloUrl' && !!v
  );

  return (
    <div style={{ fontFamily: 'inherit', fontSize: 12 }}>

      {/* ── Fixed release preview (current session only) ── */}
      {meta && (
        <div style={{
          position: 'fixed', top: 72, right: 20, width: 200, zIndex: 9999,
          background: '#1F1F21', borderRadius: 8, overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)', fontFamily: 'inherit',
        }}>
          {meta.artworkUrl
            ? /* eslint-disable-next-line @next/next/no-img-element */
              <img src={meta.artworkUrl.replace('3000x3000bb', '400x400bb')} alt="Cover"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', aspectRatio: '1', background: '#2a2a2c' }} />
          }
          <div style={{ padding: '10px 10px 8px' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 2 }}>
              {meta.title || '—'}
            </div>
            <div style={{ color: '#9EFF0A', fontSize: 11, marginBottom: 4 }}>{meta.artist || '—'}</div>
            {meta.releaseDate && (
              <div style={{ color: '#6b7280', fontSize: 10, marginBottom: 6 }}>
                {meta.releaseDate} · {meta.releaseType}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
              {filledLinks.map(([k]) => (
                <span key={k} style={{ fontSize: 9, fontWeight: 600, background: '#2a2a2c', color: '#9ca3af', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {k.replace('Url', '')}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={handleSave}
                style={{ flex: 1, padding: '6px 0', borderRadius: 5, border: 'none', background: '#9EFF0A', color: '#111', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em' }}>
                Save
              </button>
              <button type="button" onClick={handleDelete}
                style={{ padding: '6px 10px', borderRadius: 5, border: '1px solid #3f3f41', background: 'transparent', color: '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ Folders ════ */}

      {/* 1. Auto-fill */}
      <Folder title="Auto-fill" badge={status === 'ok' ? msg : undefined} accent={status === 'err' ? '#dc2626' : undefined}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            placeholder="UPC or Spotify / Apple Music URL"
            value={query}
            autoFocus={autoFocus}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleFetch(); } }}
            style={{ ...input, flex: 1 }}
          />
          <button type="button" onClick={handleFetch} disabled={status === 'loading' || !query.trim()}
            style={{ padding: '5px 12px', borderRadius: 4, border: 'none', background: status === 'loading' ? '#9ca3af' : '#2563eb', color: '#fff', fontSize: 12, cursor: status === 'loading' ? 'default' : 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {status === 'loading' ? 'Fetching…' : 'Fetch'}
          </button>
          {Object.values(value).some(Boolean) && (
            <button type="button" onClick={handleReset} title="Clear all"
              style={{ padding: '5px 9px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', color: '#9ca3af', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              ✕
            </button>
          )}
        </div>
        {msg && (
          <div style={{ fontSize: 11, color: status === 'err' ? '#dc2626' : '#16a34a' }}>
            {status === 'ok' ? '✓ ' : '✗ '}{msg}
          </div>
        )}
        <div style={{ fontSize: 10, color: '#d1d5db' }}>
          Spotify · Apple Music · Deezer · Tidal · Amazon · YouTube · title · artist · date · type · artwork
        </div>
      </Folder>

      {/* 2. Release Info */}
      <Folder title="Release Info" badge={value.artistName || undefined}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {value.artworkUrl
            ? /* eslint-disable-next-line @next/next/no-img-element */
              <img src={value.artworkUrl.replace('3000x3000bb', '80x80bb')} alt="Cover"
                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
            : <div style={{ width: 48, height: 48, background: '#e5e7eb', borderRadius: 4, flexShrink: 0 }} />
          }
          <div style={{ flex: 1 }}>
            <label style={fieldLabel}>Artist Name</label>
            <input type="text" value={value.artistName ?? ''} onChange={e => set('artistName', e.target.value)}
              placeholder="e.g. TAKIRU, Althoff & ELIF" style={input} />
          </div>
        </div>
        {value.artworkUrl && (
          <div style={{ fontSize: 10, color: '#6b7280', display: 'flex', gap: 4 }}>
            <span style={{ color: '#16a34a' }}>✓</span>
            Artwork URL saved ·{' '}
            <a href={value.artworkUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'none' }}>Download full res →</a>
          </div>
        )}
        {meta && (
          <button type="button" onClick={() => setShowManual(v => !v)}
            style={{ fontSize: 10, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', textDecoration: 'underline' }}>
            {showManual ? '↑ Hide manual fields' : '↓ Show manual fields (date / type / cover art)'}
          </button>
        )}
        {meta && ([
          { label: 'Title',        val: meta.title,       fill: () => fillField('Title', meta.title) },
          { label: 'Release Date', val: meta.releaseDate, fill: () => fillField('Release Date', meta.releaseDate) },
          { label: 'Release Type', val: meta.releaseType, fill: () => fillReleaseType(meta.releaseType) },
        ]).filter(row => !!row.val).map(({ label, val, fill }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#16a34a', fontSize: 11 }}>✓</span>
            <span style={{ ...fieldLabel, marginBottom: 0, minWidth: 80 }}>{label}</span>
            <span style={{ flex: 1, color: '#374151', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
            <button type="button"
              onClick={() => { setRefilling(label); fill(); setTimeout(() => setRefilling(null), 1500); }}
              style={{ padding: '2px 7px', borderRadius: 3, border: '1px solid #e5e7eb', background: refilling === label ? '#16a34a' : '#fff', color: refilling === label ? '#fff' : '#9ca3af', fontSize: 10, cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
              {refilling === label ? '✓' : 'Re-fill'}
            </button>
          </div>
        ))}
      </Folder>

      {/* 5. Presave */}
      <Folder title="Presave / CTA" defaultOpen={!!(value.upc || value.layloUrl)}>
        <div>
          <label style={fieldLabel}>UPC</label>
          <input type="text" value={value.upc ?? ''} onChange={e => set('upc', e.target.value)}
            placeholder="e.g. 4099964069441" style={input} />
        </div>
        <div>
          <label style={fieldLabel}>Laylo URL</label>
          <input type="url" value={value.layloUrl ?? ''} onChange={e => set('layloUrl', e.target.value)}
            placeholder="https://laylo.com/..." style={input} />
        </div>
      </Folder>

      {/* 6. Primary Links */}
      <Folder title="Primary Links" badge={`${primaryFilled}/${PRIMARY.length}`}>
        <div style={grid2}>
          {PRIMARY.map(({ key, label }) => (
            <div key={key}>
              <label style={fieldLabel}>{label}</label>
              <input type="url" value={value[key] ?? ''} onChange={e => set(key, e.target.value)}
                placeholder="https://..." style={{ ...input, borderColor: value[key] ? '#a7f3d0' : '#e5e7eb' }} />
            </div>
          ))}
        </div>
      </Folder>

      {/* 7. More Links */}
      <Folder title="More Links" defaultOpen={false} badge={secondaryFilled > 0 ? `${secondaryFilled}/${SECONDARY.length}` : undefined}>
        <div style={grid2}>
          {SECONDARY.map(({ key, label }) => (
            <div key={key}>
              <label style={fieldLabel}>{label}</label>
              <input type="url" value={value[key] ?? ''} onChange={e => set(key, e.target.value)}
                placeholder="https://..." style={{ ...input, borderColor: value[key] ? '#a7f3d0' : '#e5e7eb' }} />
            </div>
          ))}
        </div>
      </Folder>

    </div>
  );
}
