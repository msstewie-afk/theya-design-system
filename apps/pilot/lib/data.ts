// Demo data for the pilot: a client proofing portal on Aether (the Theya demo
// theme, see the project doc claude/demo-theme-light.md). Photos are drawn
// as small SVG scenes, so the app needs no image hosting.

export interface Photo {
  id: string;
  file: string;
  alt: string;
  src: string;
}

export interface Album {
  slug: string;
  title: string;
  photographer: string;
  shotOn: string;
  pickLimit: number;
  dueBy: string;
  photos: Photo[];
}

export const STUDIO = { name: 'Selene Weddings', portal: 'selene-weddings.aether.photo' };
export const CLIENT = { name: 'Rhea Okafor', initials: 'RO' };

// One scene per light condition: sky gradient, sun or moon, horizon tint.
const LIGHT = {
  golden: { sky: ['#f6c87a', '#e0874f'], body: '#fff1c9', ground: '#5b3a2a', moon: false },
  blue: { sky: ['#2c4f8f', '#7aa3d6'], body: '#e8f0ff', ground: '#1d2a44', moon: true },
  dawn: { sky: ['#f3b6b0', '#9fb6e3'], body: '#fff6e8', ground: '#4a4560', moon: false },
} as const;
type Light = keyof typeof LIGHT;

function scene(light: Light, seed: number): string {
  const l = LIGHT[light];
  const x = 60 + ((seed * 47) % 200);
  const y = 40 + ((seed * 29) % 70);
  const hill = 150 + ((seed * 13) % 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${l.sky[0]}"/><stop offset="1" stop-color="${l.sky[1]}"/></linearGradient></defs><rect width="320" height="240" fill="url(#s)"/><circle cx="${x}" cy="${y}" r="${l.moon ? 14 : 22}" fill="${l.body}" opacity="0.9"/><path d="M0 ${hill} Q 80 ${hill - 30} 160 ${hill} T 320 ${hill - 10} V240 H0Z" fill="${l.ground}"/><path d="M0 ${hill + 30} Q 120 ${hill + 10} 320 ${hill + 34} V240 H0Z" fill="${l.ground}" opacity="0.7"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const MOMENTS = [
  'the couple on the ridge',
  'rings on an open palm',
  'guests raising glasses',
  'the first dance',
  'a veil caught by the wind',
  'the bride laughing with her sister',
  'a kiss under the arch',
  'the table set for dinner',
];

function photos(prefix: string, light: Light, count: number): Photo[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(400 + i * 7).padStart(4, '0');
    const file = `${prefix}_${n}.jpg`;
    const moment = MOMENTS[i % MOMENTS.length];
    return { id: file, file, alt: `${moment[0].toUpperCase()}${moment.slice(1)}, ${light} light`, src: scene(light, i + 1) };
  });
}

export const ALBUMS: Album[] = [
  {
    slug: 'moonrise-over-othrys',
    title: 'Moonrise over Othrys',
    photographer: 'Selin Arda',
    shotOn: '2026-09-19',
    pickLimit: 12,
    dueBy: '2026-11-14',
    photos: photos('MOON', 'blue', 24),
  },
  {
    slug: 'golden-hour',
    title: 'Golden hour',
    photographer: 'Selin Arda',
    shotOn: '2026-09-19',
    pickLimit: 8,
    dueBy: '2026-11-14',
    photos: photos('GOLDEN', 'golden', 16),
  },
  {
    slug: 'first-light',
    title: 'First light',
    photographer: 'Elio Sanz',
    shotOn: '2026-09-20',
    pickLimit: 6,
    dueBy: '2026-11-21',
    photos: photos('DAWN', 'dawn', 12),
  },
];

export function getAlbum(slug: string): Album | undefined {
  return ALBUMS.find((a) => a.slug === slug);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));
}
