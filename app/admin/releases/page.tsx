'use client';
import { useEffect, useState, useCallback } from 'react';

type Release = { slug: string; title: string; catalogNumber: string };

export default function ReleasesAdminPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/releases');
    const data = await res.json();
    const sorted = (Array.isArray(data) ? data as Release[] : []).sort((a, b) => {
      if (a.catalogNumber && b.catalogNumber) return a.catalogNumber.localeCompare(b.catalogNumber);
      if (a.catalogNumber) return -1;
      if (b.catalogNumber) return 1;
      return (a.title || a.slug).localeCompare(b.title || b.slug);
    });
    setReleases(sorted);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (slug: string, label: string) => {
    if (!window.confirm(`Delete "${label}"?\n\nThis permanently removes the release file and cannot be undone.`)) return;
    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/admin/releases/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        await load();
      } else {
        const err = await res.json().catch(() => ({})) as { error?: string };
        alert(`Delete failed: ${err.error ?? 'unknown error'}`);
      }
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1F1F21', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Release Manager</h1>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>{releases.length} release{releases.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/keystatic/collection/releases/create"
              style={{ padding: '7px 14px', borderRadius: 6, background: '#9EFF0A', color: '#111', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              + Add
            </a>
            <a href="/keystatic/collection/releases"
              style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #3f3f41', color: '#9ca3af', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              Keystatic →
            </a>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#6b7280', fontSize: 13 }}>Loading…</p>
        ) : releases.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: 13 }}>No releases found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {releases.map(r => {
              const label = r.catalogNumber
                ? `${r.catalogNumber} — ${r.title || r.slug}`
                : (r.title || r.slug);
              const isDel = deletingSlug === r.slug;
              return (
                <li key={r.slug} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', background: '#2a2a2c', borderRadius: 6,
                  opacity: isDel ? 0.5 : 1, transition: 'opacity 0.15s',
                }}>
                  <a href={`/keystatic/collection/releases/${r.slug}`}
                    style={{ flex: 1, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                    {label}
                    {!r.title && (
                      <span style={{ marginLeft: 8, fontSize: 10, color: '#f59e0b', fontWeight: 600, background: '#2d2410', padding: '1px 5px', borderRadius: 3 }}>
                        NO TITLE
                      </span>
                    )}
                    {!r.catalogNumber && (
                      <span style={{ marginLeft: 4, fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>
                        no cat#
                      </span>
                    )}
                  </a>
                  <span style={{ fontSize: 10, color: '#4b5563', fontFamily: 'monospace' }}>{r.slug}</span>
                  <button
                    onClick={() => handleDelete(r.slug, label)}
                    disabled={isDel}
                    style={{
                      padding: '4px 10px', borderRadius: 4,
                      border: '1px solid #3f3f41', background: 'transparent',
                      color: isDel ? '#6b7280' : '#ef4444',
                      fontSize: 11, fontWeight: 600,
                      cursor: isDel ? 'default' : 'pointer',
                    }}>
                    {isDel ? '…' : 'Delete'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
