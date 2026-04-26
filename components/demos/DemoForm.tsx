'use client';

import { useState } from 'react';
import { DocumentRenderer } from '@keystatic/core/renderer';

type DocumentNode = Parameters<typeof DocumentRenderer>[0]['document'][number];

type Field = {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  hint?: string;
};

const FIELDS: Field[] = [
  { name: 'artistName', label: 'Artist Name', placeholder: 'Your artist name', required: true },
  { name: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email', required: true },
  {
    name: 'soundcloudLink',
    label: 'SoundCloud Link',
    placeholder: 'https://soundcloud.com/yourname/track',
    required: true,
    hint: 'Must be a private, download-enabled link',
  },
  { name: 'instagram', label: 'Instagram', placeholder: '@yourhandle' },
  { name: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/artist/…' },
];

const inputClass =
  'w-full px-4 py-2.5 text-sm bg-white/8 border border-white/20 text-white placeholder:text-(--color-text-muted) focus:outline-none focus:border-white/50 focus:bg-white/12 transition-all';

export default function DemoForm({
  heading = 'Submit a Demo',
  introNodes,
  acceptingDemos = true,
}: {
  heading?: string;
  introNodes?: DocumentNode[] | null;
  acceptingDemos?: boolean;
}) {
  const [fields, setFields] = useState({
    artistName: '', email: '', soundcloudLink: '', instagram: '', spotify: '', message: '',
  });
  const [hp, setHp] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update(key: string, value: string) {
    setFields(f => ({ ...f, [key]: value }));
    if (state === 'error') setState('idle');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, _hp: hp }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setState('ok');
      } else {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
        setState('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setState('error');
    }
  }

  if (state === 'ok') {
    return (
      <div
        className="border border-white/20 bg-white/8 backdrop-blur-sm p-8 w-full max-w-lg text-center"
      >
        <div className="text-3xl mb-4">✓</div>
        <h2 className="text-lg font-bold text-white mb-2">Demo received</h2>
        <p className="text-sm text-(--color-text-secondary) leading-relaxed">
          Thanks for submitting. We listen to every demo and will be in touch if it&apos;s a fit.
        </p>
      </div>
    );
  }

  return (
    <div
      className="border border-white/20 bg-white/8 backdrop-blur-sm p-5 sm:p-8 w-full max-w-lg"
    >
      {!acceptingDemos && (
        <div className="mb-5 border border-white/20 bg-white/6 px-4 py-4 text-sm text-(--color-text-secondary) leading-relaxed space-y-2">
          <p>We are no longer accepting demos for 2026 — you are more than welcome to send demos for consideration for 2027 onwards.</p>
          <p>Please send as a download enabled private SoundCloud link with correctly tagged metadata.</p>
          <p>Thank you for your music and your patience!</p>
        </div>
      )}
      <h1 className="text-2xl font-bold text-white mb-1">{heading}</h1>
      {introNodes && introNodes.length > 0 ? (
        <div className="prose prose-invert prose-sm max-w-none mb-5 text-(--color-text-secondary)">
          <DocumentRenderer document={introNodes} />
        </div>
      ) : (
        <p className="text-sm text-(--color-text-secondary) mb-5 leading-relaxed">
          Share your music with Marginalia. We listen to everything — please give us time to respond.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        {/* Honeypot — hidden from humans */}
        <input
          type="text"
          name="website"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
          autoComplete="off"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.slice(0, 2).map(f => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest mb-1.5">
                {f.label}{f.required && <span className="text-(--color-accent-lime) ml-0.5">*</span>}
              </label>
              <input
                type={f.type ?? 'text'}
                required={f.required}
                placeholder={f.placeholder}
                value={fields[f.name as keyof typeof fields]}
                onChange={(e) => update(f.name, e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        {/* SoundCloud — full width */}
        <div>
          <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest mb-1.5">
            SoundCloud Link<span className="text-(--color-accent-lime) ml-0.5">*</span>
          </label>
          <input
            type="url"
            required
            placeholder="https://soundcloud.com/yourname/track"
            value={fields.soundcloudLink}
            onChange={(e) => update('soundcloudLink', e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-(--color-text-muted) mt-1.5">Must be a private, download-enabled link</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.slice(3).map(f => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest mb-1.5">
                {f.label} <span className="text-(--color-text-muted) normal-case font-normal">optional</span>
              </label>
              <input
                type="text"
                placeholder={f.placeholder}
                value={fields[f.name as keyof typeof fields]}
                onChange={(e) => update(f.name, e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest mb-1.5">
            Message <span className="text-(--color-text-muted) normal-case font-normal">optional</span>
          </label>
          <textarea
            rows={3}
            placeholder="Tell us a bit about yourself or the track..."
            value={fields.message}
            onChange={(e) => update('message', e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        {state === 'error' && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={state === 'loading'}
          className="mt-1 px-6 py-3 text-sm font-bold uppercase tracking-widest bg-(--color-accent-lime) text-(--color-bg) hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {state === 'loading' ? 'Sending…' : 'Submit Demo'}
        </button>

        <p className="text-xs text-(--color-text-muted) text-center leading-relaxed">
          We receive a high volume of demos. Response time may vary — thank you for your patience.
        </p>
      </form>
    </div>
  );
}
