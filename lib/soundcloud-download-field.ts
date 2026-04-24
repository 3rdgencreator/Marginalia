import { SoundcloudDownloadField, type SoundcloudDownloadValue } from '@/components/keystatic/SoundcloudDownloadField';

type Stored = Record<string, string | undefined> | undefined | null;

function toValue(raw: unknown): SoundcloudDownloadValue {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const r = raw as Stored;
  return { url: r?.url, artworkUrl: r?.artworkUrl };
}

export type { SoundcloudDownloadValue };

export function soundcloudDownloadField() {
  return {
    kind: 'form' as const,
    formKind: undefined,
    label: 'SoundCloud Download',
    Input: SoundcloudDownloadField,
    defaultValue: (): SoundcloudDownloadValue => ({}),
    parse: (value: unknown): SoundcloudDownloadValue => toValue(value),
    serialize: (value: SoundcloudDownloadValue) => ({ value }),
    validate: (value: SoundcloudDownloadValue) => value,
    reader: {
      parse: (value: unknown): SoundcloudDownloadValue => toValue(value),
    },
  };
}
