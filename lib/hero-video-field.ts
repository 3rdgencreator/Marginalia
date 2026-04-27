import { HeroVideoField, type HeroVideoValue } from '@/components/keystatic/HeroVideoField';

type StoredValue = Record<string, string | undefined> | undefined | null;

function toValue(stored: StoredValue): HeroVideoValue {
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
  return stored as HeroVideoValue;
}

export function heroVideoField(label: string) {
  return {
    kind: 'form' as const,
    formKind: undefined,
    label,
    Input: HeroVideoField,
    defaultValue: (): HeroVideoValue => ({}),
    parse: (value: unknown): HeroVideoValue => toValue(value as StoredValue),
    serialize: (value: HeroVideoValue) => ({ value }),
    validate: (value: HeroVideoValue) => value,
    reader: {
      parse: (value: unknown): HeroVideoValue => toValue(value as StoredValue),
    },
  };
}
