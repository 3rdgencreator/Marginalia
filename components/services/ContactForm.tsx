'use client';

import { useState } from 'react';

export const SERVICES = [
  { id: 'mix-mastering', label: 'Mix & Mastering', enabled: true, description: 'Professional mixing and mastering services with a deep understanding of melodic house and techno. Optimized for club systems, streaming platforms, and vinyl.' },
  { id: 'production-classes', label: 'Production Classes', enabled: true, description: 'One-on-one and group production sessions covering sound design, arrangement, workflow, and the creative process, from beginner to advanced levels.' },
] as const;

export type ServiceId = typeof SERVICES[number]['id'];

const inputClass =
  'w-full px-4 py-2.5 text-sm bg-white/8 border border-white/20 text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-white/50 focus:bg-white/12 transition-all';

const labelClass = 'block text-xs font-semibold text-(--color-text-muted) uppercase tracking-widest mb-1.5';

export default function ContactForm({
  service,
  onServiceChange,
}: {
  service: ServiceId | null;
  onServiceChange: (s: ServiceId) => void;
}) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !email.includes('@') || !message.trim()) return;
    setState('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: SERVICES.find(s => s.id === service)?.label,
          senderEmail: email,
          message,
        }),
      });
      setState(res.ok ? 'ok' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'ok') {
    return (
      <div className="py-4 text-center">
        <p className="text-(--color-text-primary) font-semibold mb-1">Message sent.</p>
        <p className="text-xs text-(--color-text-muted)">We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Your email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Message</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about yourself and what you're looking for…"
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={state === 'loading'}
        className="self-start px-6 py-3 text-sm font-bold uppercase tracking-widest border-2 border-(--color-button) text-(--color-button) hover:opacity-80 transition-all duration-150 disabled:opacity-50"
      >
        {state === 'loading' ? 'Sending…' : 'Send →'}
      </button>

      {state === 'error' && (
        <p className="text-xs text-red-400">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
