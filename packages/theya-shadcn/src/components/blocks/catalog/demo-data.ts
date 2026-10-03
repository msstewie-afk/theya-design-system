import type { CatalogItem, CatalogIconKey } from './types';
import type { Review } from './reviews';
import type { SpecGroup } from './spec-sheet';
import type { CategoryTile, CuratedPick } from './category-landing';

/** Demo catalog for the Catalog pattern stories: extensions for a hosting panel. */
const RAW: [string, string, string, CatalogIconKey, string, number, number, number, number, string[], string][] = [
  // name, vendor, category, icon, summary, rating, reviews, installs, price, compatibility, added
  ['Shieldwall', 'Seashell Labs', 'Security', 'shield', 'Web application firewall with managed rules.', 4.7, 812, 48200, 0, ['Nginx', 'Apache'], '2026-08-12'],
  ['Malware Sweep', 'Northwind', 'Security', 'bug', 'Daily scans and one-click cleanup.', 4.4, 356, 21900, 6, ['Nginx', 'Apache', 'WordPress'], '2026-05-03'],
  ['Login Guard', 'Kestrel', 'Security', 'shield', 'Two-factor and brute-force protection for sign-in.', 4.8, 1204, 63500, 0, ['WordPress', 'Joomla'], '2026-02-20'],
  ['CertPilot', 'Seashell Labs', 'Security', 'shield', 'Issues and renews SSL certificates automatically.', 4.9, 2210, 91000, 0, ['Nginx', 'Apache'], '2025-11-08'],
  ['Vault Backup', 'Arbor', 'Backups', 'backup', 'Incremental backups to any S3-compatible storage.', 4.6, 640, 30100, 8, ['Nginx', 'Apache'], '2026-07-01'],
  ['Snapshot Pro', 'Northwind', 'Backups', 'backup', 'Hourly snapshots with point-in-time restore.', 4.3, 211, 9800, 12, ['Nginx'], '2026-09-14'],
  ['Restore Point', 'Quartz', 'Backups', 'backup', 'Site and database backups with a staging restore.', 4.1, 98, 4200, 5, ['WordPress'], '2026-03-30'],
  ['Offsite Copy', 'Fjord', 'Backups', 'cloud', 'Second copy of every backup in another region.', 3.9, 57, 2300, 4, ['Nginx', 'Apache'], '2026-06-18'],
  ['Rank Booster', 'Lumen', 'SEO', 'search', 'Meta tags, sitemaps and redirects in one place.', 4.5, 930, 52000, 0, ['WordPress', 'Joomla'], '2025-12-11'],
  ['Site Audit', 'Quartz', 'SEO', 'stats', 'Finds broken links, slow pages and missing tags.', 4.2, 188, 7600, 9, ['Nginx', 'WordPress'], '2026-08-29'],
  ['Translate Kit', 'Babel', 'SEO', 'language', 'Multilingual sites with hreflang done right.', 4.0, 143, 6100, 7, ['WordPress', 'Joomla'], '2026-04-22'],
  ['Turbo Cache', 'Kestrel', 'Performance', 'speed', 'Page and object caching tuned for the panel.', 4.7, 1530, 70400, 0, ['Nginx', 'Apache', 'WordPress'], '2026-01-15'],
  ['Image Slim', 'Lumen', 'Performance', 'speed', 'Converts images to WebP and AVIF on upload.', 4.6, 702, 38800, 3, ['WordPress', 'Joomla'], '2026-09-02'],
  ['Edge CDN', 'Fjord', 'Performance', 'cloud', 'Global CDN with one switch, no DNS changes.', 4.4, 455, 25500, 10, ['Nginx', 'Apache'], '2026-07-19'],
  ['Uptime Watch', 'Arbor', 'Performance', 'stats', 'Checks every minute and alerts by email or chat.', 4.3, 260, 12800, 0, ['Nginx', 'Apache'], '2026-05-27'],
  ['Mail Relay', 'Postbox', 'Email', 'mail', 'Reliable sending with SPF, DKIM and DMARC set up.', 4.5, 377, 19400, 5, ['Nginx', 'Apache'], '2026-02-02'],
  ['Spam Filter', 'Postbox', 'Email', 'mail', 'Learns your mail and quarantines junk.', 4.1, 164, 8800, 2, ['Nginx', 'Apache'], '2025-10-21'],
  ['Git Deploy', 'Forge', 'Developer tools', 'code', 'Push to deploy from GitHub, GitLab or Bitbucket.', 4.8, 990, 41700, 0, ['Nginx', 'Apache'], '2026-06-05'],
  ['Node Toolkit', 'Forge', 'Developer tools', 'code', 'Node.js versions, process manager and logs.', 4.4, 310, 15200, 0, ['Nginx'], '2026-08-08'],
  ['Log Viewer', 'Orbit', 'Developer tools', 'stats', 'Search and tail server logs in the browser.', 4.0, 120, 5600, 4, ['Nginx', 'Apache'], '2026-03-12'],
  ['Cron Studio', 'Orbit', 'Developer tools', 'code', 'Schedule, test and monitor cron jobs.', 3.8, 66, 2900, 0, ['Nginx', 'Apache'], '2026-09-20'],
  ['DB Studio', 'Tern', 'Developer tools', 'code', 'Browse and query databases with history.', 4.6, 540, 22600, 6, ['Nginx', 'Apache'], '2026-04-01'],
  ['Bot Blocker', 'Kestrel', 'Security', 'bug', 'Blocks scrapers and bad bots at the edge.', 4.2, 233, 11100, 4, ['Nginx', 'WordPress'], '2026-09-25'],
  ['Form Shield', 'Willow', 'Security', 'shield', 'Invisible spam protection for every form.', 4.5, 405, 17300, 0, ['WordPress', 'Joomla'], '2026-01-29'],
];

export const DEMO_ITEMS: CatalogItem[] = RAW.map(([name, vendor, category, icon, summary, rating, reviewCount, installs, price, compatibility, added]) => ({
  id: name.toLowerCase().replace(/\s+/g, '-'),
  name,
  vendor,
  category,
  icon,
  summary,
  rating,
  reviewCount,
  installs,
  price,
  compatibility,
  added,
}));

const byId = (id: string) => DEMO_ITEMS.find((i) => i.id === id)!;

/** The item the ItemPage demo is about. */
export const DEMO_ITEM = byId('vault-backup');

export const DEMO_IMAGES = [
  { src: '/asset-examples/nova-web.jpg', alt: 'Backup dashboard with the latest runs' },
  { src: '/asset-examples/login-carousel-01.jpg', alt: 'Storage targets' },
  { src: '/asset-examples/login-carousel-02.jpg', alt: 'Restore wizard' },
  { src: '/asset-examples/login-carousel-03.jpg', alt: 'Retention settings' },
];

export const DEMO_HIGHLIGHTS = ['Incremental: only changed files after the first run', 'Any S3-compatible storage, including your own', 'Restore one file, one database or the whole site', 'Encrypted before it leaves the server'];

export const DEMO_DESCRIPTION = [
  { body: 'Vault Backup copies your sites, databases and mail to the storage you choose, on the schedule you choose. After the first full run it only sends what changed, so backups finish in minutes and storage costs stay low.' },
  { title: 'Restore what you need', body: 'Pick a point in time and restore a single file, one database or everything. Restores can go to a staging copy first, so you can check before you overwrite.' },
  { title: 'Storage', body: 'Works with Amazon S3, Backblaze B2, Wasabi, MinIO and any other S3-compatible service. Keep a second copy in another region with one switch.' },
  { title: 'Security', body: 'Archives are encrypted with AES-256 before upload. The key stays on your server; we never see it.' },
];

export const DEMO_SPECS: SpecGroup[] = [
  {
    title: 'Backups',
    specs: [
      { label: 'Smallest interval', value: '1', unit: 'hour' },
      { label: 'Retention', value: 'Up to 365', unit: 'days' },
      { label: 'Backup type', value: 'Full, then incremental' },
      { label: 'Encryption', value: 'AES-256, client-side' },
      { label: 'Compression', value: 'zstd' },
    ],
  },
  {
    title: 'Requirements',
    specs: [
      { label: 'Web server', value: 'Apache 2.4+ or Nginx 1.20+' },
      { label: 'Free disk space', value: '2', unit: 'GB', hint: 'For the local staging area during a run.' },
      { label: 'Memory', value: '512', unit: 'MB' },
      { label: 'Operating system', value: 'Linux (64-bit)' },
    ],
  },
  {
    title: 'Support',
    specs: [
      { label: 'Languages', value: 'English, German, Spanish, French' },
      { label: 'Response time', value: '1 business day' },
      { label: 'Version', value: '3.4.2' },
      { label: 'Last updated', value: 'Sep 18, 2026' },
    ],
  },
];

export const DEMO_REVIEWS: Review[] = [
  { id: 'r1', author: 'Dana K.', rating: 5, date: 'Sep 20, 2026', isoDate: '2026-09-20', title: 'Saved a client site in five minutes', body: 'A plugin update broke the store. Restored last night’s database to staging, checked it, pushed it live. Exactly what a backup tool should be.', helpful: 41 },
  { id: 'r2', author: 'Marco P.', rating: 4, date: 'Sep 2, 2026', isoDate: '2026-09-02', title: 'Solid, setup could be clearer', body: 'Works well with Wasabi. It took me a while to find where to paste the endpoint — the first screen only mentions Amazon.', helpful: 18, reply: { author: 'Arbor', body: 'Thanks, Marco — the next version shows every provider on the first screen.', date: 'Sep 4, 2026' } },
  { id: 'r3', author: 'Lina S.', rating: 5, date: 'Aug 28, 2026', isoDate: '2026-08-28', body: 'Incremental runs take under two minutes for 40 sites. Storage bill went down by half.', helpful: 25 },
  { id: 'r4', author: 'Tom W.', rating: 2, date: 'Aug 15, 2026', isoDate: '2026-08-15', title: 'Mail restore is all or nothing', body: 'I can restore a single file but not a single mailbox. For hosting with lots of mail that matters.', helpful: 12, reply: { author: 'Arbor', body: 'Per-mailbox restore is in beta now — write to support and we’ll turn it on.', date: 'Aug 16, 2026' } },
  { id: 'r5', author: 'Priya R.', rating: 5, date: 'Jul 30, 2026', isoDate: '2026-07-30', body: 'Set it up once two years ago and it just runs. Alerts when a run fails are useful.', helpful: 9 },
  { id: 'r6', author: 'Jonas B.', rating: 3, date: 'Jul 12, 2026', isoDate: '2026-07-12', title: 'Fine, a bit pricey for one site', body: 'Great for agencies; for a single small site the price is hard to justify.', helpful: 7 },
  { id: 'r7', author: 'Elif A.', rating: 4, date: 'Jun 21, 2026', isoDate: '2026-06-21', body: 'Restores are reliable. Would love a dark mode for the dashboard.', helpful: 3 },
  { id: 'r8', author: 'Sam O.', rating: 1, date: 'Jun 3, 2026', isoDate: '2026-06-03', title: 'First run filled my disk', body: 'The first full backup used the local staging area and ran out of space. Check the disk requirement before installing.', helpful: 15 },
];

export const DEMO_REVIEW_SUMMARY = { average: 4.6, count: 640, distribution: { 5: 452, 4: 118, 3: 38, 2: 17, 1: 15 } } as const;

const CATEGORY_ICON: Record<string, CatalogIconKey> = { Security: 'shield', Backups: 'backup', SEO: 'search', Performance: 'speed', Email: 'mail', 'Developer tools': 'code' };

export const DEMO_CATEGORIES: CategoryTile[] = Object.entries(CATEGORY_ICON).map(([label, icon]) => ({
  id: label.toLowerCase().replace(/\s+/g, '-'),
  label,
  icon,
  count: DEMO_ITEMS.filter((i) => i.category === label).length,
  href: `#category-${label.toLowerCase().replace(/\s+/g, '-')}`,
}));

const security = DEMO_ITEMS.filter((i) => i.category === 'Security');
export const DEMO_POPULAR = { category: 'Security', items: [...security].sort((a, b) => b.installs - a.installs).slice(0, 4), total: security.length, href: '#category-security' };

export const DEMO_PICKS: CuratedPick[] = [
  { item: byId('git-deploy'), note: 'The fastest way from a repository to a live site. Push to a branch and it deploys — with rollbacks one click away.' },
  { item: byId('image-slim'), note: 'Halves page weight on most image-heavy sites without anyone changing how they upload.' },
  { item: byId('uptime-watch'), note: 'Free, quiet and accurate. You hear from it only when something is actually down.' },
];

/** Hardware add-ons with product shots on white — for ItemCard's `image` with `imageFit="contain"`. */
export const DEMO_HARDWARE: (CatalogItem & { image: string })[] = [
  { id: 'dedicated-server', name: 'Dedicated server', vendor: 'Arbor', category: 'Hardware', icon: 'cloud', summary: '8 cores, 64 GB RAM, two NVMe drives in RAID 1.', rating: 4.8, reviewCount: 312, installs: 2100, price: 89, compatibility: ['Linux', 'Windows'], added: '2026-08-01', image: '/asset-examples/product-rack-server.svg' },
  { id: 'nvme-storage', name: 'NVMe storage add-on', vendor: 'Fjord', category: 'Hardware', icon: 'backup', summary: '1 TB of fast block storage you can attach to any server.', rating: 4.6, reviewCount: 148, installs: 5400, price: 15, compatibility: ['Linux', 'Windows'], added: '2026-06-12', image: '/asset-examples/product-ssd.svg' },
  { id: 'firewall-appliance', name: 'Firewall appliance', vendor: 'Kestrel', category: 'Hardware', icon: 'shield', summary: 'Hardware firewall in front of your servers, managed for you.', rating: 4.4, reviewCount: 87, installs: 940, price: 29, compatibility: ['Any server'], added: '2026-04-18', image: '/asset-examples/product-router.svg' },
  { id: 'security-key', name: 'Hardware security key', vendor: 'Seashell Labs', category: 'Hardware', icon: 'shield', summary: 'Phishing-proof sign-in for the panel. Shipped to your door.', rating: 4.9, reviewCount: 523, installs: 8800, price: 3, compatibility: ['USB-C', 'NFC'], added: '2026-09-10', image: '/asset-examples/product-security-key.svg' },
];

/** Screenshots for extensions — `imageFit="cover"`. */
export const DEMO_SCREENSHOTS = ['/asset-examples/nova-web.jpg', '/asset-examples/login-carousel-01.jpg', '/asset-examples/login-carousel-02.jpg', '/asset-examples/login-carousel-03.jpg'];
