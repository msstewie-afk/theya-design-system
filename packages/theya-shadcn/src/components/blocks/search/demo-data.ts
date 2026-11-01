import type { SearchItem } from './types';

/**
 * Demo index for the Search pattern stories: what Aether, a platform for
 * photographers, can find. No title, context or snippet contains "ce": the
 * screen-reader scenario types "ce" into SearchBox and expects only the
 * "Search for" option.
 */
export const DEMO_INDEX: SearchItem[] = [
  { id: 'g1', type: 'gallery', title: 'Moonrise over Othrys', context: 'Selene Weddings · 214 photos', meta: 'Shared', href: '#g1' },
  { id: 'g2', type: 'gallery', title: 'Blue hour', context: 'Selene Weddings · 96 photos', meta: 'Draft', href: '#g2' },
  { id: 'g3', type: 'gallery', title: 'Golden hour', context: 'Helios Studio · 412 photos', meta: 'Shared', href: '#g3' },
  { id: 'g4', type: 'gallery', title: 'First light', context: 'Eos Portraits · 128 photos', meta: 'Shared', href: '#g4' },
  { id: 'g5', type: 'gallery', title: 'Wide-shining', context: 'Selene Weddings · 340 photos', meta: 'Archived', href: '#g5' },
  { id: 'ph1', type: 'photo', title: 'DAWN_0412.jpg', context: 'First light · Eos Portraits', meta: '24 MB', href: '#ph1' },
  { id: 'ph2', type: 'photo', title: 'GOLDEN_0907.tif', context: 'Golden hour · Helios Studio', meta: '182 MB', href: '#ph2' },
  { id: 'ph3', type: 'photo', title: 'L4_moonrise.raw', context: 'Moonrise over Othrys · Studio L4', meta: '61 MB', href: '#ph3' },
  { id: 'c1', type: 'client', title: 'Rhea Okafor', context: 'Selene Weddings · rhea.okafor@example.com', href: '#c1' },
  { id: 'c2', type: 'client', title: 'Theo Amari', context: 'Helios Studio · theo.amari@example.com', href: '#c2' },
  { id: 'c3', type: 'client', title: 'Layla Haddad', context: 'Eos Portraits · layla.haddad@example.com', href: '#c3' },
  { id: 'l1', type: 'license', title: 'Print rights for GOLDEN_0907.tif', context: 'Theo Amari · until Mar 2027', meta: 'Active', href: '#l1' },
  { id: 'l2', type: 'license', title: 'Web rights for DAWN_0412.jpg', context: 'Layla Haddad · until Dec 2026', meta: 'Active', href: '#l2' },
  { id: 'l3', type: 'license', title: 'Web rights for Moonrise over Othrys', context: 'Rhea Okafor · Selene Weddings', meta: 'Expired', href: '#l3' },
  { id: 's1', type: 'setting', title: 'Archive retention', context: 'Settings › Archive', snippet: 'How long deleted galleries stay in Mnemosyne before they go for good.', href: '#s1' },
  { id: 's2', type: 'setting', title: 'Archive storage', context: 'Settings › Archive', snippet: 'Where the archive keeps its copies: Aether storage or your own S3 bucket.', href: '#s2' },
  { id: 's3', type: 'setting', title: 'Default usage rights', context: 'Settings › Rights', snippet: 'The print and web rights that go with each client download.', href: '#s3' },
  { id: 's4', type: 'setting', title: 'Watermark', context: 'Gallery › Settings', snippet: 'The mark shown on previews until a client buys the photo.', href: '#s4' },
  { id: 's5', type: 'setting', title: 'Download notifications', context: 'Settings › Notifications', snippet: 'Who hears when a client downloads photos, and where.', href: '#s5' },
  { id: 's6', type: 'setting', title: 'Two-factor authentication', context: 'Account › Security', snippet: 'Require a code from an app when signing in.', href: '#s6' },
  { id: 'a1', type: 'article', title: 'Restore a gallery from the archive', context: 'Help › Archive', snippet: 'Pick a date, choose what to restore and where. You can restore one gallery or a single photo.', href: '#a1' },
  { id: 'a2', type: 'article', title: 'Move the archive to your own storage', context: 'Help › Archive', snippet: 'Connect an S3-compatible bucket and keep a copy outside Aether.', href: '#a2' },
  { id: 'a3', type: 'article', title: 'Why did my export fail?', context: 'Help › Exports', snippet: 'Open the export log, find the photo that stopped it and try again.', href: '#a3' },
  { id: 'a4', type: 'article', title: 'Use your own portal address', context: 'Help › Client portals', snippet: 'Show your portal at an address you own instead of selene-weddings.aether.photo.', href: '#a4' },
  { id: 'a5', type: 'article', title: 'Import photos from Lightroom', context: 'Help › Galleries', snippet: 'Upload a catalog export and turn its collections into galleries.', href: '#a5' },
  { id: 'a6', type: 'article', title: 'Archive a single gallery', context: 'Help › Archive', snippet: 'Send one gallery to Mnemosyne without the rest of the studio.', href: '#a6' },
];

/** Searches people ran recently (newest first). */
export const DEMO_RECENT = ['archive retention', 'golden hour', 'watermark'];

/** Shown when nothing matches: the pages people look for most. */
export const DEMO_POPULAR = DEMO_INDEX.filter((i) => ['s1', 's3', 'a1', 'a4'].includes(i.id));
