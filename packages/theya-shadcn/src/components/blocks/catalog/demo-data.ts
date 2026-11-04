import type { CatalogItem, CatalogIconKey } from './types';
import type { Review } from './reviews';
import type { SpecGroup } from './spec-sheet';
import type { CategoryTile, CuratedPick } from './category-landing';

/** What the usage count means in each category. */
const USAGE_NOUN: Record<string, string> = {
  Presets: 'installs',
  'Plan add-ons': 'installs',
  'Photo books': 'subscribers',
  'Fine-art prints': 'subscribers',
  'Studio sessions': 'members',
  'Lens rentals': 'renters',
  'Studio gear': 'renters',
};

/** Demo catalog for the Catalog pattern stories: the Aether shop of photo products, billed monthly. */
const RAW: [string, string, string, CatalogIconKey, string, number, number, number, number, string[], string][] = [
  // name, vendor, category, icon, summary, rating, reviews, installs, price, compatibility, added
  ['Golden hour presets', 'Helios Studio', 'Presets', 'preset', 'Twelve warm looks for late-afternoon light.', 4.7, 812, 48200, 0, ['Lightroom', 'Capture One'], '2026-08-12'],
  ['Blue hour presets', 'Selene Weddings', 'Presets', 'preset', 'Cool, low-contrast looks for dusk and night shoots.', 4.4, 356, 21900, 6, ['Lightroom', 'Capture One', 'Photoshop'], '2026-05-03'],
  ['Skin tone essentials', 'Eos Portraits', 'Presets', 'preset', 'Even, natural skin tones in window and mixed light.', 4.8, 1204, 63500, 0, ['Lightroom', 'Photoshop'], '2026-02-20'],
  ['Aether basics', 'Aether', 'Presets', 'preset', 'Clean color and contrast for any shoot, applied on import.', 4.9, 2210, 91000, 0, ['Lightroom', 'Capture One'], '2025-11-08'],
  ['Client proofing', 'Aether', 'Plan add-ons', 'addon', 'Clients pick favorites and leave notes on any gallery.', 4.6, 640, 30100, 8, ['Pro plan', 'Business plan'], '2026-07-01'],
  ['Extra storage', 'Aether', 'Plan add-ons', 'addon', 'Another 1 TB in the Mnemosyne archive for raw files.', 4.3, 211, 9800, 12, ['Pro plan', 'Business plan'], '2026-09-14'],
  ['Watermark studio', 'Quartz', 'Plan add-ons', 'addon', 'Your own watermark on previews and client downloads.', 4.1, 98, 4200, 5, ['Pro plan'], '2026-03-30'],
  ['License manager', 'Fjord', 'Plan add-ons', 'addon', 'A print or web license attached to every client download.', 3.9, 57, 2300, 4, ['Pro plan', 'Business plan'], '2026-06-18'],
  ['Layflat album', 'Phoebe Light Lab', 'Photo books', 'book', 'One 30-page layflat album a month, printed and bound.', 4.5, 930, 52000, 29, ['Pro plan', 'Business plan'], '2025-12-11'],
  ['Wedding album', 'Folio', 'Photo books', 'book', 'Two linen-covered albums a month for wedding clients.', 4.2, 188, 7600, 49, ['Business plan'], '2026-08-29'],
  ['Proof book', 'Folio', 'Photo books', 'book', 'A softcover contact book of a whole shoot, for review.', 4.0, 143, 6100, 12, ['Pro plan', 'Business plan'], '2026-04-22'],
  ['Fine-art print club', 'Phoebe Light Lab', 'Fine-art prints', 'print', 'Two giclée prints a month on cotton rag paper.', 4.7, 1530, 70400, 35, ['Pro plan', 'Business plan'], '2026-01-15'],
  ['Metal prints', 'Lumen', 'Fine-art prints', 'print', 'One 12 × 16 in print on aluminum a month.', 4.6, 702, 38800, 24, ['Pro plan', 'Business plan'], '2026-09-02'],
  ['Canvas prints', 'Fjord', 'Fine-art prints', 'print', 'One stretched 16 × 20 in canvas a month, ready to hang.', 4.4, 455, 25500, 28, ['Pro plan'], '2026-07-19'],
  ['Print proofs', 'Phoebe Light Lab', 'Fine-art prints', 'print', 'Five small test prints a month to check color first.', 4.3, 260, 12800, 0, ['Pro plan', 'Business plan'], '2026-05-27'],
  ['Studio L4 hours', 'Studio L4', 'Studio sessions', 'studio', 'Eight hours a month in Studio L4, lights and backdrops included.', 4.5, 377, 19400, 120, ['Pro plan', 'Business plan'], '2026-02-02'],
  ['Location days', 'Othrys Lodge', 'Studio sessions', 'studio', 'One day a month at Othrys Lodge, rooms and grounds included.', 4.1, 164, 8800, 90, ['Business plan'], '2025-10-21'],
  ['Portrait prime rental', 'Glassworks', 'Lens rentals', 'lens', 'An 85mm f/1.4 prime, swapped for another lens any month.', 4.8, 990, 41700, 45, ['Sony E', 'Canon RF'], '2026-06-05'],
  ['Wide zoom rental', 'Glassworks', 'Lens rentals', 'lens', 'A 16–35mm f/2.8 zoom for interiors and landscapes.', 4.4, 310, 15200, 55, ['Sony E', 'Canon RF', 'Nikon Z'], '2026-08-08'],
  ['Telephoto rental', 'Orbit', 'Lens rentals', 'lens', 'A 70–200mm f/2.8 zoom for ceremonies and events.', 4.0, 120, 5600, 79, ['Sony E', 'Nikon Z'], '2026-03-12'],
  ['Macro lens rental', 'Orbit', 'Lens rentals', 'lens', 'A 100mm f/2.8 macro for rings, details and products.', 3.8, 66, 2900, 39, ['Canon RF'], '2026-09-20'],
  ['Tilt-shift rental', 'Tern', 'Lens rentals', 'lens', 'A 24mm tilt-shift for architecture without converging lines.', 4.6, 540, 22600, 65, ['Sony E', 'Canon RF'], '2026-04-01'],
  ['Film emulation pack', 'Phoebe Light Lab', 'Presets', 'preset', 'Grain and color from six classic film stocks.', 4.2, 233, 11100, 4, ['Lightroom', 'Capture One'], '2026-09-25'],
  ['Black and white set', 'Willow', 'Presets', 'preset', 'Ten monochrome looks, from soft matte to deep contrast.', 4.5, 405, 17300, 0, ['Lightroom', 'Photoshop'], '2026-01-29'],
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
  usageNoun: USAGE_NOUN[category],
  price,
  compatibility,
  added,
}));

const byId = (id: string) => DEMO_ITEMS.find((i) => i.id === id)!;

/** The item the ItemPage demo is about. */
export const DEMO_ITEM = byId('client-proofing');

/** Gallery pictures; the alt text describes the bundled placeholder images. */
export const DEMO_IMAGES = [
  { src: '/asset-examples/mesh/blue.webp', alt: 'Pastel blue gradient' },
  { src: '/asset-examples/mesh/blue-portrait.webp', alt: 'Pastel blue gradient' },
  { src: '/asset-examples/mesh/green-portrait.webp', alt: 'Pastel green gradient' },
  { src: '/asset-examples/mesh/lilac-portrait.webp', alt: 'Pastel lilac gradient' },
];

export const DEMO_HIGHLIGHTS = ['Clients pick favorites and send them back in one step', 'Notes on a single frame or the whole gallery', 'Watermarked previews until you approve the picks', 'Works with every gallery you already have'];

export const DEMO_DESCRIPTION = [
  { body: 'Client proofing turns any gallery into a shortlist. Clients mark the photos they want, leave notes on single frames and send their picks back in one step, so nobody has to email lists of file names.' },
  { title: 'Notes on every frame', body: 'Clients can comment on one photo or on the whole gallery. The notes show beside each frame while you edit, and you mark them done as you retouch.' },
  { title: 'Downloads and licenses', body: 'Approved picks download as JPEG or TIFF, each with a web or print license attached. Previews stay watermarked until you approve the selection.' },
  { title: 'Privacy', body: 'Proofing galleries are private by default. Each client opens theirs from a link sent to their email, and you choose when the link expires.' },
];

export const DEMO_SPECS: SpecGroup[] = [
  {
    title: 'Proofing',
    specs: [
      { label: 'Galleries in proofing', value: 'Unlimited' },
      { label: 'Clients per gallery', value: 'Up to 20' },
      { label: 'Default selection limit', value: '50', unit: 'photos', hint: 'You can raise it for each gallery, up to 500 photos.' },
      { label: 'Download formats', value: 'JPEG, TIFF' },
      { label: 'Link expiry', value: 'Up to 90', unit: 'days' },
    ],
  },
  {
    title: 'Requirements',
    specs: [
      { label: 'Plan', value: 'Pro or Business' },
      { label: 'Largest photo', value: '200', unit: 'MB' },
      { label: 'Preview size', value: '2,048', unit: 'px', hint: 'The long edge of the watermarked previews clients see.' },
      { label: 'Client browsers', value: 'Current Chrome, Safari, Firefox, Edge' },
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
  { id: 'r1', author: 'Dana K.', rating: 5, date: 'Sep 20, 2026', isoDate: '2026-09-20', title: 'Cut a week out of every wedding', body: 'Couples used to email me lists of file names. Now they mark the frames they want and I get one clean shortlist. Exactly what proofing should be.', helpful: 41 },
  { id: 'r2', author: 'Marco P.', rating: 4, date: 'Sep 2, 2026', isoDate: '2026-09-02', title: 'Solid, setup could be clearer', body: 'Works well on our Business plan. It took me a while to find where to set the selection limit — the first screen only shows the gallery picker.', helpful: 18, reply: { author: 'Aether', body: 'Thanks, Marco — the next version puts the limit on the first screen.', date: 'Sep 4, 2026' } },
  { id: 'r3', author: 'Lina S.', rating: 5, date: 'Aug 28, 2026', isoDate: '2026-08-28', body: 'Forty galleries in proofing at once and nothing gets lost. Clients find their way without instructions.', helpful: 25 },
  { id: 'r4', author: 'Tom W.', rating: 2, date: 'Aug 15, 2026', isoDate: '2026-08-15', title: 'Picks are all or nothing', body: 'A client can send their picks but can’t save a draft and come back later. For albums with 300 photos that matters.', helpful: 12, reply: { author: 'Aether', body: 'Saved drafts are in beta now — write to support and we’ll turn them on.', date: 'Aug 16, 2026' } },
  { id: 'r5', author: 'Priya R.', rating: 5, date: 'Jul 30, 2026', isoDate: '2026-07-30', body: 'Set it up once two years ago and it just works. The email when a client sends their picks is useful.', helpful: 9 },
  { id: 'r6', author: 'Jonas B.', rating: 3, date: 'Jul 12, 2026', isoDate: '2026-07-12', title: 'Fine, a bit pricey for a small studio', body: 'Great for wedding studios; for a few portrait clients a month the price is hard to justify.', helpful: 7 },
  { id: 'r7', author: 'Elif A.', rating: 4, date: 'Jun 21, 2026', isoDate: '2026-06-21', body: 'Reliable. Would love a dark mode for the client view.', helpful: 3 },
  { id: 'r8', author: 'Sam O.', rating: 1, date: 'Jun 3, 2026', isoDate: '2026-06-03', title: 'The selection limit stopped my client', body: 'The default limit is 50 photos and my client hit it halfway through the gallery. Check the limit before you send the link.', helpful: 15 },
];

export const DEMO_REVIEW_SUMMARY = { average: 4.6, count: 640, distribution: { 5: 452, 4: 118, 3: 38, 2: 17, 1: 15 } } as const;

const CATEGORY_ICON: Record<string, CatalogIconKey> = { Presets: 'preset', 'Plan add-ons': 'addon', 'Photo books': 'book', 'Fine-art prints': 'print', 'Studio sessions': 'studio', 'Lens rentals': 'lens' };

export const DEMO_CATEGORIES: CategoryTile[] = Object.entries(CATEGORY_ICON).map(([label, icon]) => ({
  id: label.toLowerCase().replace(/\s+/g, '-'),
  label,
  icon,
  count: DEMO_ITEMS.filter((i) => i.category === label).length,
  href: `#category-${label.toLowerCase().replace(/\s+/g, '-')}`,
}));

const presets = DEMO_ITEMS.filter((i) => i.category === 'Presets');
export const DEMO_POPULAR = { category: 'Presets', items: [...presets].sort((a, b) => b.installs - a.installs).slice(0, 4), total: presets.length, href: '#category-presets' };

export const DEMO_PICKS: CuratedPick[] = [
  { item: byId('portrait-prime-rental'), note: 'The lens most portrait sessions are shot on, without buying one. Swap it for another focal length any month.' },
  { item: byId('metal-prints'), note: 'Deep blacks and bright highlights that paper can’t match. Clients hang them without a frame.' },
  { item: byId('print-proofs'), note: 'Free on every paid plan. Check the color on a small print before you order the big one.' },
];

/** Studio gear with product shots on white — for ItemCard's `image` with `imageFit="contain"`. */
export const DEMO_HARDWARE: (CatalogItem & { image: string })[] = [
  { id: 'on-site-archive', name: 'On-site archive', vendor: 'Arbor', category: 'Studio gear', usageNoun: 'renters', icon: 'cloud', summary: 'A rack unit that keeps a local copy of the Mnemosyne archive in your studio.', rating: 4.8, reviewCount: 312, installs: 2100, price: 89, compatibility: ['Mac', 'Windows'], added: '2026-08-01', image: '/asset-examples/mesh/cyan-square.webp' },
  { id: 'portable-ssd', name: 'Portable SSD rental', vendor: 'Fjord', category: 'Studio gear', usageNoun: 'renters', icon: 'backup', summary: '2 TB of fast storage for offloading cards on location.', rating: 4.6, reviewCount: 148, installs: 5400, price: 15, compatibility: ['USB-C', 'Thunderbolt'], added: '2026-06-12', image: '/asset-examples/mesh/green-square.webp' },
  { id: 'tethering-hub', name: 'Tethering hub rental', vendor: 'Kestrel', category: 'Studio gear', usageNoun: 'renters', icon: 'cloud', summary: 'Wireless tethering from camera to laptop on set, set up for you.', rating: 4.4, reviewCount: 87, installs: 940, price: 29, compatibility: ['Sony', 'Canon', 'Nikon'], added: '2026-04-18', image: '/asset-examples/mesh/lilac-square.webp' },
  { id: 'security-key', name: 'Hardware security key', vendor: 'Aether', category: 'Studio gear', usageNoun: 'renters', icon: 'shield', summary: 'Phishing-proof sign-in for your account. Shipped to your door.', rating: 4.9, reviewCount: 523, installs: 8800, price: 3, compatibility: ['USB-C', 'NFC'], added: '2026-09-10', image: '/asset-examples/mesh/grey-lilac-square.webp' },
];

/** Cover pictures for products — `imageFit="cover"`. */
export const DEMO_SCREENSHOTS = ['/asset-examples/mesh/blue.webp', '/asset-examples/mesh/blue-portrait.webp', '/asset-examples/mesh/green-portrait.webp', '/asset-examples/mesh/lilac-portrait.webp'];
