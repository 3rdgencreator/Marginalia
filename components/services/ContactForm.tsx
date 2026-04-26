'use client';

import { useState } from 'react';

export const SERVICES = [
  { id: 'management', label: 'Management', enabled: false, description: 'Full artist management — bookings, strategy, brand development, and career guidance tailored for emerging and established acts in the underground dance music scene.' },
  { id: 'mix-mastering', label: 'Mix & Mastering', enabled: true, description: 'Professional mixing and mastering services with a deep understanding of melodic house and techno. Optimized for club systems, streaming platforms, and vinyl.' },
  { id: 'production-classes', label: 'Production Classes', enabled: true, description: 'One-on-one and group production sessions covering sound design, arrangement, workflow, and the creative process — from beginner to advanced levels.' },
  { id: 'mentoring', label: 'Mentoring', enabled: false, description: 'Direct mentoring from industry professionals inside the Marginalia network. Navigate the music industry, build your identity, and accelerate your growth as an artist.' },
] as const;

export type ServiceId = typeof SERVICES[number]['id'];
type Instructor = 'Predex' | 'Liminal MX';

export default function ContactForm({
  service,
  onServiceChange,
}: {
  service: ServiceId | null;
  onServiceChange: (s: ServiceId) => void;
}) {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
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
          instructor: service === 'production-classes' ? instructor : null,
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
      <div
        className="border-2 border-white/40 bg-white/5 backdrop-blur-sm p-8 text-center"
      >
        <p className="text-(--color-text-primary) font-semibold text-lg mb-1">Message sent.</p>
        <p className="text-sm text-(--color-text-muted)">We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* Step 1 — Instructor (only for Production Classes) */}
      {service === 'production-classes' && (
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-(--color-text-muted) mb-4">
            Who would you like to work with?
          </p>
          <div className="flex gap-3">
            {(['Predex', 'Liminal MX'] as Instructor[]).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setInstructor(name)}
                className={`px-6 py-4 text-sm font-semibold tracking-wide border transition-all duration-150
                  ${instructor === name ? 'border-white/70 bg-white/15 text-(--color-text-primary)' : 'border-white/30 bg-white/5 text-(--color-text-secondary) hover:bg-white/10 hover:border-white/50'}
                `}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Email + Message */}
      {service && (service !== 'production-classes' || instructor) && (
        <>
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-(--color-text-muted) mb-4">
              Your email
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-5 py-4 text-base bg-white/10 border border-white/30 text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-white/60 transition-all"
            />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-(--color-text-muted) mb-4">
              Message
            </p>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about yourself and what you're looking for…"
              rows={5}
              className="w-full px-5 py-4 text-base bg-white/10 border border-white/30 text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-white/60 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={state === 'loading'}
            className="self-start px-9 py-4 text-sm font-bold uppercase tracking-widest border-2 border-white/70 bg-white/10 text-(--color-text-primary) hover:bg-white/20 transition-all duration-150 disabled:opacity-50"
          >
            {state === 'loading' ? 'Sending…' : 'Send →'}
          </button>

          {state === 'error' && (
            <p className="text-xs text-red-400">Something went wrong. Please try again.</p>
          )}
        </>
      )}
    </form>
  );
}
