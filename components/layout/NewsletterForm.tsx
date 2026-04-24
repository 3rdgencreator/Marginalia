'use client';

import { useState, useRef } from 'react';

export default function NewsletterForm({ listId }: { listId: string | null }) {
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
        body: JSON.stringify({ email, listId }),
      });
      setState('ok');
      setEmail('');
    } catch {
      setState('ok'); // degrade gracefully
    }
  }

  if (state === 'ok') {
    return (
      <p className="text-(--text-label) text-(--color-text-secondary)">
        ✓ You&apos;re on the list.
      </p>
    );
  }

  const glow = '0 0 12px 3px rgba(202,201,249,0.18), 0 0 4px 1px rgba(202,201,249,0.25)';

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input
        ref={inputRef}
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); setState('idle'); }}
        placeholder="email"
        className="flex-1 min-w-0 rounded-full px-4 py-2 text-[10px] bg-white/10 border border-white/30 text-(--color-text-primary) placeholder:text-(--color-text-muted) placeholder:text-[10px] focus:outline-none focus:border-white/60 transition-all"
        style={{ boxShadow: glow }}
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 border border-white/30 text-(--color-text-primary) hover:bg-white/20 transition-all duration-150 disabled:opacity-50 shrink-0"
        style={{ boxShadow: glow }}
      >
        {state === 'loading' ? '…' : 'Subscribe'}
      </button>
      {state === 'error' && (
        <span className="sr-only">Please enter a valid email.</span>
      )}
    </form>
  );
}
