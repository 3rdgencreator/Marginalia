'use client';

import { useState } from 'react';
import ContactForm, { SERVICES, type ServiceId } from './ContactForm';

const glow = '0 0 20px 6px rgba(202,201,249,0.15), 0 0 6px 2px rgba(202,201,249,0.25)';

export default function ServicesContent() {
  const [service, setService] = useState<ServiceId | null>(null);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">

      {/* Service selector — 4 full-width rows */}
      <div className="flex flex-col gap-3">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={!s.enabled}
            onClick={() => setService(s.id)}
            className={`w-full flex items-start gap-5 rounded-2xl border-2 px-7 py-5 text-left transition-all duration-150 bg-white/5 backdrop-blur-sm
              ${!s.enabled ? 'cursor-not-allowed border-white/20' : 'cursor-pointer hover:bg-white/10'}
              ${service === s.id ? 'border-white/70' : s.enabled ? 'border-white/40' : 'border-white/20'}
            `}
            style={s.enabled ? { boxShadow: glow } : {}}
          >
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold uppercase tracking-[-0.02em] ${service === s.id ? 'text-(--color-text-primary)' : 'text-(--color-text-secondary)'}`}>
                {s.label}
              </p>
              <p className="text-xs text-(--color-text-muted) leading-relaxed mt-1">
                {s.description}
              </p>
            </div>
            {!s.enabled && (
              <span className="text-xs font-bold uppercase tracking-widest shrink-0 mt-0.5 text-(--color-text-muted) opacity-60">
                Not available
              </span>
            )}
            {s.enabled && (
              <span className={`text-xs font-bold uppercase tracking-widest shrink-0 mt-0.5 transition-colors ${service === s.id ? 'text-(--color-accent-lime)' : 'text-(--color-text-muted)'}`}>
                {service === s.id ? 'Selected' : 'Select →'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Form — appears when service selected */}
      {!service ? (
        <p className="text-center text-sm text-(--color-text-muted) py-4">
          Select one to enter the family. <span className="text-red-400">♥</span>
        </p>
      ) : (
        <div className="border-t border-white/10 pt-8">
          <ContactForm service={service} onServiceChange={setService} />
        </div>
      )}

    </div>
  );
}
