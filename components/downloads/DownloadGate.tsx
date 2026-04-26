'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export type DownloadItem = {
  slug: string;
  title: string;
  artistName: string;
  description: string;
  coverImage: string | null;
  downloadUrl: string | null;
  releaseDate: string | null;
};

const STORAGE_KEY = 'mrgnl_downloads_unlocked';

function DownloadCard({ item }: { item: DownloadItem }) {
  return (
    <div
      className="border-2 border-white/70 bg-white/10 backdrop-blur-sm overflow-hidden"
    >
      {item.coverImage && (
        <div className="aspect-square overflow-hidden">
          <Image
            src={item.coverImage}
            alt={`${item.title} cover`}
            width={600}
            height={600}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <p className="font-bold text-(--color-text-primary) text-sm uppercase tracking-wide leading-tight">
          {item.title}
        </p>
        {item.artistName && (
          <p className="text-xs text-(--color-text-secondary) mt-0.5">{item.artistName}</p>
        )}
        {item.description && (
          <p className="text-xs text-(--color-text-muted) mt-2 leading-relaxed">{item.description}</p>
        )}
        {item.downloadUrl && (
          <a
            href={item.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 border-white/70 bg-white/10 text-(--color-text-primary) hover:bg-white/20 transition-all duration-150"
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Download / Listen
          </a>
        )}
      </div>
    </div>
  );
}


export default function DownloadGate({
  items,
  layloUrl,
  newsletterListId,
}: {
  items: DownloadItem[];
  layloUrl: string | null;
  newsletterListId: string | null;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUnlocked(localStorage.getItem(STORAGE_KEY) === '1');
    }
  }, []);

  function unlock() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1');
    }
    setUnlocked(true);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setState('error');
      return;
    }
    setState('loading');
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, listId: newsletterListId }),
      });
    } catch {
      // fire-and-forget — still unlock
    }
    unlock();
  }

  function handleLaylo() {
    unlock();
    if (layloUrl) {
      window.open(layloUrl, '_blank', 'noopener,noreferrer');
    }
  }

  if (unlocked) {
    return (
      <div>
        <p className="text-xs text-(--color-text-muted) mb-(--space-xl) uppercase tracking-widest">
          {items.length} free download{items.length !== 1 ? 's' : ''} unlocked
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-(--space-sm)">
          {items.map((item) => (
            <li key={item.slug}>
              <DownloadCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {/* Gate panel */}
      <div
        className="border-2 border-white/70 bg-white/10 backdrop-blur-sm p-6 sm:p-8 mx-auto max-w-lg text-center"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-(--color-text-muted) mb-2">
          Free Downloads
        </p>
        <h2 className="text-(--text-heading) font-bold text-(--color-text-primary) mb-2">
          Join to unlock
        </h2>
        <p className="text-sm text-(--color-text-secondary) mb-6 leading-relaxed">
          Subscribe to the Marginalia newsletter or join the Laylo community — and get free music instantly.
        </p>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setState('idle'); }}
            placeholder="your@email.com"
            className="flex-1 px-4 py-2.5 text-sm bg-white/10 border border-white/40 text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-white/70 focus:bg-white/15 transition-all"
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-white/20 border border-white/70 text-(--color-text-primary) hover:bg-white/30 transition-all duration-150 disabled:opacity-50"
          >
            {state === 'loading' ? '…' : 'Unlock'}
          </button>
        </form>

        {state === 'error' && (
          <p className="text-xs text-red-400 mb-3">Please enter a valid email address.</p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-xs text-(--color-text-muted) uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Laylo button */}
        <button
          onClick={handleLaylo}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-gradient-to-r from-[#580AFF] to-[#9B30FF] text-white hover:from-[#4A08D6] hover:to-[#8B25EE] transition-all duration-150 text-sm font-semibold"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          Join on Laylo
        </button>
      </div>
    </div>
  );
}
