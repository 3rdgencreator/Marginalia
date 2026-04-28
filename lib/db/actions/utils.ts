export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function formStr(data: FormData, key: string): string | null {
  const v = data.get(key);
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export function formBool(data: FormData, key: string): boolean {
  return data.get(key) === 'on';
}

export function formInt(data: FormData, key: string): number | null {
  const v = data.get(key);
  if (!v || typeof v !== 'string') return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}
