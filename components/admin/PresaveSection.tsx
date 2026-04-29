'use client';

import { useEffect, useState } from 'react';

/**
 * Wraps the pre-save-only fields (UPC, Hypeddit, Laylo) and toggles
 * their visibility based on the [name="presave"] checkbox state.
 *
 * Fields stay mounted (hidden via CSS) so previously-saved values
 * persist when the user toggles pre-save off and on again, and so
 * they always submit with the form.
 */
export function PresaveSection({
  defaultOpen = false,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const cb = document.querySelector<HTMLInputElement>('input[name="presave"]');
    if (!cb) return;
    const sync = () => setOpen(cb.checked);
    sync();
    cb.addEventListener('change', sync);
    return () => cb.removeEventListener('change', sync);
  }, []);

  return (
    <div
      aria-hidden={!open}
      className={`mt-3 overflow-hidden transition-all duration-200 ease-out ${
        open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      }`}
    >
      <div className="p-4 border-l-2 border-[#580AFF] bg-[#580AFF]/5 flex flex-col gap-4">
        <p className="text-[10px] text-[#9EFF0A] uppercase tracking-widest">
          Pre-Save Targets
        </p>
        {children}
      </div>
    </div>
  );
}
