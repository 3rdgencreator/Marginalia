'use client';

import { useState } from 'react';

interface FetchResult {
  title?: string | null;
  artistName?: string | null;
  artworkUrl?: string | null;
  coverArt?: string | null;
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
}

export function ReleaseFetchWidget() {
  const [upc, setUpc] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchData(params: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/fetch-release?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Hata');
      fillForm(data);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-8 p-4 border border-[#580AFF]/40 bg-[#580AFF]/5 rounded">
      <h2 className="text-xs text-[#9EFF0A] uppercase tracking-widest mb-4 flex items-center gap-2">
        <span>⚡</span> Auto-Fill — UPC veya Platform URL
      </h2>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* UPC */}
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={upc}
            onChange={e => setUpc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && upc && fetchData(`upc=${encodeURIComponent(upc)}`)}
            placeholder="UPC kodu (ör. 4099964069441)"
            className="flex-1 bg-[#2A2A2C] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#9EFF0A] placeholder:text-gray-600"
          />
          <button
            type="button"
            disabled={!upc || loading}
            onClick={() => fetchData(`upc=${encodeURIComponent(upc)}`)}
            className="px-4 py-2 bg-[#580AFF] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? '...' : 'Çek'}
          </button>
        </div>

        <span className="text-gray-600 text-xs self-center hidden sm:block">veya</span>

        {/* URL */}
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && url && fetchData(`url=${encodeURIComponent(url)}`)}
            placeholder="Spotify / Apple Music URL"
            className="flex-1 bg-[#2A2A2C] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#9EFF0A] placeholder:text-gray-600"
          />
          <button
            type="button"
            disabled={!url || loading}
            onClick={() => fetchData(`url=${encodeURIComponent(url)}`)}
            className="px-4 py-2 bg-[#580AFF] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#9EFF0A] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? '...' : 'Çek'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}

      {result && (
        <div className="mt-3 flex items-center gap-3">
          {result.coverArt && (
            <img src={result.coverArt} alt="cover" className="w-12 h-12 object-cover shrink-0" />
          )}
          <div>
            <p className="text-sm text-white font-bold">{result.title}</p>
            <p className="text-xs text-gray-400">{result.artistName}</p>
            <p className="text-xs text-[#9EFF0A] mt-0.5">
              ✓ Veriler forma dolduruldu (dolu alanlar değiştirilmedi)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
