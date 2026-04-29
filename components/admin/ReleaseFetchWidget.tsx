'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FetchResult {
  title?: string | null;
  artistName?: string | null;
  releaseType?: string | null;
  artworkUrl?: string | null;
  coverArt?: string | null;
  releaseDate?: string | null;
  spotifyUrl?: string | null;
  appleMusicUrl?: string | null;
  beatportUrl?: string | null;
  soundcloudUrl?: string | null;
  tidalUrl?: string | null;
  deezerUrl?: string | null;
  amazonUrl?: string | null;
  youtubeUrl?: string | null;
  pandoraUrl?: string | null;
  anghamiUrl?: string | null;
}

const PLATFORM_LABELS: [keyof FetchResult, string][] = [
  ['spotifyUrl', 'Spotify'],
  ['appleMusicUrl', 'Apple Music'],
  ['beatportUrl', 'Beatport'],
  ['soundcloudUrl', 'SoundCloud'],
  ['tidalUrl', 'Tidal'],
  ['deezerUrl', 'Deezer'],
  ['amazonUrl', 'Amazon Music'],
  ['youtubeUrl', 'YouTube'],
  ['pandoraUrl', 'Pandora'],
  ['anghamiUrl', 'Anghami'],
];

function setField(name: string, value: string | null | undefined) {
  if (!value) return;
  const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);
  if (el && !el.value) el.value = value;
}

function fillForm(data: FetchResult) {
  setField('title', data.title);
  setField('artistName', data.artistName);
  setField('artworkUrl', data.artworkUrl);
  setField('coverArt', data.coverArt);
  setField('releaseDate', data.releaseDate);
  setField('spotifyUrl', data.spotifyUrl);
  setField('appleMusicUrl', data.appleMusicUrl);
  setField('beatportUrl', data.beatportUrl);
  setField('soundcloudUrl', data.soundcloudUrl);
  setField('tidalUrl', data.tidalUrl);
  setField('deezerUrl', data.deezerUrl);
  setField('amazonUrl', data.amazonUrl);
  setField('youtubeUrl', data.youtubeUrl);
  setField('pandoraUrl', data.pandoraUrl);
  setField('anghamiUrl', data.anghamiUrl);
  if (data.releaseType) {
    const sel = document.querySelector<HTMLSelectElement>('[name="releaseType"]');
    if (sel) sel.value = data.releaseType;
  }
}

function CardPreview({ data }: { data: FetchResult }) {
  const img = data.coverArt ?? data.artworkUrl?.replace('3000x3000bb', '600x600bb') ?? null;

  return (
    <div className="w-48 shrink-0">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Card Preview</p>
      <div className="relative aspect-square border-2 border-white/70 bg-white/10 overflow-hidden group">
        {img ? (
          <Image src={img} alt="cover" fill sizes="192px" className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-600 text-xs">
            No artwork
          </div>
        )}

        {/* Overlay — always visible in preview */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-3 bg-[rgba(31,31,33,0.70)]">
          {data.releaseType && (
            <span className="text-[#9EFF0A] text-[9px] uppercase tracking-widest font-bold">
              {data.releaseType}
            </span>
          )}
          <span className="text-white font-bold text-center text-xs leading-tight line-clamp-3">
            {data.title ?? '—'}
          </span>
          {data.artistName && (
            <span className="text-white/70 text-center text-[10px] leading-tight">
              {data.artistName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReleaseFetchWidget() {
  const [upc, setUpc] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPresave, setIsPresave] = useState(false);

  // Mirror release-type select changes back into the preview
  useEffect(() => {
    const sel = document.querySelector<HTMLSelectElement>('[name="releaseType"]');
    if (!sel) return;
    const handler = () => setResult(prev => prev ? { ...prev, releaseType: sel.value || null } : null);
    sel.addEventListener('change', handler);
    return () => sel.removeEventListener('change', handler);
  }, []);

  // Mirror the pre-save checkbox state — when checked, only Spotify URL search is allowed
  // (UPC search doesn't return pre-release content from Spotify's public index).
  useEffect(() => {
    const cb = document.querySelector<HTMLInputElement>('input[name="presave"]');
    if (!cb) return;
    const sync = () => setIsPresave(cb.checked);
    sync();
    cb.addEventListener('change', sync);
    return () => cb.removeEventListener('change', sync);
  }, []);

  function buildParams(useUpc: boolean, useUrl: boolean): string {
    const parts: string[] = [];
    if (useUpc && upc) parts.push(`upc=${encodeURIComponent(upc)}`);
    if (useUrl && url) parts.push(`url=${encodeURIComponent(url)}`);
    return parts.join('&');
  }

  async function fetchData(params: string) {
    if (!params) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/fetch-release?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error');
      fillForm(data);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  // When user clicks any fetch button, send BOTH params if BOTH fields are filled
  // (route merges the responses, deduping matching fields and using extras).
  function fetchSmart(focused: 'upc' | 'url') {
    const useUpc = !isPresave && !!upc;
    const useUrl = !!url;
    if (!useUpc && !useUrl) return;
    if (focused === 'upc' && !useUpc) return;
    if (focused === 'url' && !useUrl) return;
    fetchData(buildParams(useUpc, useUrl));
  }

  const filledLinks = result
    ? PLATFORM_LABELS.filter(([key]) => result[key])
    : [];

  return (
    <div className="mb-8 p-4 border border-[#580AFF]/40 bg-[#580AFF]/5">
      <h2 className="text-xs text-[#9EFF0A] uppercase tracking-widest mb-2 flex items-center gap-2">
        <span>⚡</span> Auto-Fill — {isPresave ? 'Spotify / Apple Music URL only' : 'UPC and / or Platform URL'}
      </h2>
      <p className="text-[11px] text-gray-500 mb-4">
        {isPresave
          ? 'Pre-save mode: Spotify search by UPC does not return pre-release tracks. Paste the Spotify or Apple Music URL from your distributor (or Spotify for Artists).'
          : 'Tip — filling both UPC and URL gives the most complete metadata; matching fields are de-duped and extras are merged in.'}
      </p>

      {/* Inputs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!isPresave && (
          <>
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                value={upc}
                onChange={e => setUpc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchSmart('upc')}
                placeholder="UPC code (e.g. 4099964069441)"
                className="flex-1 bg-[#2A2A2C] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#9EFF0A] placeholder:text-gray-600"
              />
              <button
                type="button"
                disabled={!upc || loading}
                onClick={() => fetchSmart('upc')}
                className="px-4 py-2 bg-[#580AFF] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? '...' : 'Fetch'}
              </button>
            </div>

            <span className="text-gray-600 text-xs self-center hidden sm:block">+ or</span>
          </>
        )}

        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchSmart('url')}
            placeholder="Spotify / Apple Music URL"
            className="flex-1 bg-[#2A2A2C] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#9EFF0A] placeholder:text-gray-600"
          />
          <button
            type="button"
            disabled={!url || loading}
            onClick={() => fetchSmart('url')}
            className="px-4 py-2 bg-[#580AFF] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? '...' : 'Fetch'}
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      {/* Result: card preview + platform list */}
      {result && (
        <div className="mt-4 flex gap-5 items-start">
          <CardPreview data={result} />

          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#9EFF0A] mb-3">
              ✓ Fields populated (existing values were not overwritten)
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {filledLinks.map(([key, label]) => (
                <span key={key} className="text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9EFF0A] shrink-0" />
                  {label}
                </span>
              ))}
            </div>
            {filledLinks.length === 0 && (
              <p className="text-xs text-gray-600">No platform links found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
