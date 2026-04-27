'use client';

import { useState } from 'react';
import ContactForm, { SERVICES, type ServiceId } from './ContactForm';

export default function ServicesContent() {
  const [service, setService] = useState<ServiceId | null>(null);

  return (
    <div className="border border-white/20 bg-white/8 backdrop-blur-sm p-5 sm:p-8 w-full max-w-2xl mx-auto flex flex-col gap-6">

      {/* Service selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setService(s.id)}
            className={`flex flex-col justify-between border px-6 py-6 text-left transition-all duration-150 cursor-pointer
              ${service === s.id ? 'border-black/20 bg-black/6' : 'border-white/20 bg-white/5 hover:bg-white/10'}
            `}
          >
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold uppercase tracking-[-0.02em] mb-2 text-(--color-text-primary)">
                {s.label}
              </p>
              <p className="text-xs text-(--color-text-muted) leading-relaxed">
                {s.description}
              </p>
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest mt-5 transition-colors ${service === s.id ? 'text-(--color-accent-lime)' : 'text-(--color-text-muted)'}`}>
              {service === s.id ? 'Selected' : 'Select →'}
            </span>
          </button>
        ))}
      </div>

      {!service ? (
        <p className="text-center text-xs text-(--color-text-muted) py-2">
          Select a service to continue. <span className="text-red-400">♥</span>
        </p>
      ) : (
        <div className="border-t border-white/10 pt-6">
          <ContactForm service={service} onServiceChange={setService} />
        </div>
      )}
    </div>
  );
}
