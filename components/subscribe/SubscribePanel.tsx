'use client';

import { useState, useRef } from 'react';

export default function SubscribePanel({
  layloUrl,
  newsletterListId,
}: {
  layloUrl: string | null;
  newsletterListId: string | null;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { setState('error'); return; }
    setState('loading');
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, listId: newsletterListId }),
      });
      setState('ok');
      setEmail('');
    } catch {
      setState('ok');
    }
  }

  return (
    <div
      className="border-2 border-white/70 bg-white/10 backdrop-blur-sm p-6 sm:p-10 w-full max-w-lg text-center"
    >
      <h1 className="text-(--text-heading) font-bold text-(--color-text-primary) mb-2">
        Stay in the loop
      </h1>
      <p className="text-sm text-(--color-text-secondary) mb-8 leading-relaxed">
        New releases, free downloads &amp; events — straight to your inbox.
      </p>

      {/* Email form */}
      {state !== 'ok' && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
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
            {state === 'loading' ? '…' : 'Subscribe'}
          </button>
        </form>
      )}

      {state === 'ok' && (
        <p className="text-sm text-(--color-text-secondary) mb-4">✓ You&apos;re on the list.</p>
      )}

      {state === 'error' && (
        <p className="text-xs text-red-400 mb-3">Please enter a valid email address.</p>
      )}

      {/* Divider */}
      {newsletterListId && layloUrl && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-xs text-(--color-text-muted) uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>
      )}

      {/* Laylo button */}
      {layloUrl && (
        <a
          href={layloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-gradient-to-r from-[#580AFF] to-[#9B30FF] text-white hover:from-[#4A08D6] hover:to-[#8B25EE] transition-all duration-150 text-sm font-semibold"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          Join on Laylo
        </a>
      )}
    </div>
  );
}
