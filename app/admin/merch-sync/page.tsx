'use client';

import { useState } from 'react';

export default function MerchSyncPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function sync() {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/admin/sync-merch', { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        setStatus('success');
        setMessage(`Synced ${json.count} products from Shopify. Restart the dev server to see changes.`);
      } else {
        setStatus('error');
        setMessage(json.error ?? 'Unknown error');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Request failed');
    }
  }

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text-primary) p-12">
      <h1 className="text-2xl font-bold uppercase tracking-[-0.02em] mb-2">
        Sync Merch from Shopify
      </h1>
      <p className="text-(--color-text-muted) text-sm mb-8">
        Fetches all products from{' '}
        <span className="text-(--color-text-secondary)">qkvft1-1y.myshopify.com</span>{' '}
        and updates <code className="font-mono text-xs bg-(--color-surface) px-1 py-0.5">lib/merch-data.ts</code>.
        Run this whenever you add or update products in Shopify.
      </p>

      <button
        onClick={sync}
        disabled={status === 'loading'}
        className="px-(--space-xl) py-(--space-md) bg-(--color-accent-violet) text-white text-(--text-label) font-bold uppercase tracking-widest hover:bg-(--color-accent-lime) hover:text-black transition-colors duration-150 disabled:opacity-50 disabled:cursor-wait"
      >
        {status === 'loading' ? 'Syncing…' : 'Sync Products from Shopify'}
      </button>

      {status === 'success' && (
        <p className="mt-6 text-sm text-green-400">{message}</p>
      )}
      {status === 'error' && (
        <div className="mt-6">
          <p className="text-sm text-red-400 mb-2">Sync failed:</p>
          <pre className="text-xs bg-(--color-surface) p-4 text-red-300 overflow-x-auto max-w-2xl">
            {message}
          </pre>
          <p className="text-xs text-(--color-text-muted) mt-2">
            Make sure you are logged in: run{' '}
            <code className="font-mono bg-(--color-surface) px-1">
              shopify store auth --store qkvft1-1y.myshopify.com --scopes read_products
            </code>{' '}
            in your terminal first.
          </p>
        </div>
      )}
    </div>
  );
}
