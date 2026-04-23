// Custom Keystatic field that groups all platform URLs + UPC into one
// compound field with an Odesli auto-fill widget.
//
// Keystatic 0.5.x has no public fields.custom() — we construct the
// BasicFormField object directly (matches the internal interface shape).
// The `as any` cast in keystatic.config.ts bypasses structural type-checking;
// Keystatic validates fields by their `kind: 'form'` property at runtime.

import { PlatformLinksField, type PlatformLinksValue } from '@/components/keystatic/PlatformLinksField';

export type { PlatformLinksValue };

type StoredValue = Record<string, string | undefined> | undefined | null;

function toValue(stored: StoredValue): PlatformLinksValue {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  return stored as PlatformLinksValue;
}

export function platformLinksField() {
  return {
    kind: 'form' as const,
    formKind: undefined,
    label: 'Platform Links',
    Input: PlatformLinksField,
    defaultValue: (): PlatformLinksValue => ({ layloUrl: 'https://laylo.com/marginalialabel/QER7RS@b0t' }),
    parse: (value: unknown): PlatformLinksValue => toValue(value as StoredValue),
    serialize: (value: PlatformLinksValue) => ({ value }),
    validate: (value: PlatformLinksValue) => value,
    reader: {
      parse: (value: unknown): PlatformLinksValue =>
        toValue(value as StoredValue),
    },
  };
}
