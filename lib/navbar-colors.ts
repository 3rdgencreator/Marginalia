export const NAVBAR_COLORS: Record<string, string> = {
  'player-default':'rgba(10,10,12,0.85)',
  'black-70':      'rgba(0,0,0,0.70)',
  'black':         '#000000',
  'bg':            '#1F1F21',
  'surface':       '#2A2A2C',
  'violet':        '#580AFF',
  'surface-purple':'#8656FF',
  'lime':          '#9EFF0A',
  'pink':          '#ef6b8e',
  'orange':        '#f29753',
  'yellow':        '#f9c432',
  'olive':         '#c0c020',
  'mint':          '#66cc99',
  'green-light':   '#7ed35e',
  'green-dark':    '#599f56',
  'lavender':      '#b088d0',
  'purple-tag':    '#bd63ee',
  'blue':          '#2086c0',
  'sky':           '#a9c2e7',
};

export function resolveNavbarColor(key: string | null | undefined): string {
  return NAVBAR_COLORS[key ?? 'black-70'] ?? NAVBAR_COLORS['black-70'];
}

export function resolveMiniPlayerColor(key: string | null | undefined): string {
  return NAVBAR_COLORS[key ?? 'player-default'] ?? NAVBAR_COLORS['player-default'];
}
