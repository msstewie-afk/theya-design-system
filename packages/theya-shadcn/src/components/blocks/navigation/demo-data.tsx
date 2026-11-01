import type { MegaItem } from './mega-menu';
import type { FooterColumn } from './site-footer';

/** Demo navigation for the Navigation pattern stories: the marketing site of Aether, a platform for photographers. */
export const DEMO_MENU: MegaItem[] = [
  {
    id: 'products',
    label: 'Products',
    overview: { label: 'All products', href: '#products' },
    columns: [
      {
        title: 'Galleries',
        links: [
          { label: 'Client galleries', href: '#galleries', description: 'Share, proof and deliver a shoot in one link' },
          { label: 'Client portals', href: '#portals', description: 'A branded space for each client, on your own address' },
          { label: 'Archive', href: '#archive', description: 'Every original kept safe in Mnemosyne' },
        ],
      },
      {
        title: 'Sell',
        links: [
          { label: 'Print store', href: '#prints' },
          { label: 'Photo books', href: '#books' },
          { label: 'Licensing', href: '#licensing' },
        ],
      },
      {
        title: 'Add-ons',
        links: [
          { label: 'Presets', href: '#presets' },
          { label: 'Lens rentals', href: '#lenses' },
          { label: 'Studio sessions', href: '#sessions', badge: 'New' },
          { label: 'Shop', href: '#shop' },
        ],
      },
    ],
    featured: { title: 'Move your galleries for free', description: 'We copy your galleries, client lists and print orders from your old platform, and switch your portals over when they’re ready.', href: '#migration', cta: 'Start a move' },
  },
  {
    id: 'solutions',
    label: 'Solutions',
    overview: { label: 'All solutions', href: '#solutions' },
    columns: [
      {
        title: 'By need',
        links: [
          { label: 'Wedding photographers', href: '#weddings', description: 'Proofing, albums and delivery on time' },
          { label: 'Portrait studios', href: '#portraits', description: 'Sessions, sales and prints in one place' },
          { label: 'Agencies', href: '#agencies', description: 'Many photographers, one account' },
        ],
      },
      {
        title: 'Works with',
        links: [
          { label: 'Lightroom', href: '#lightroom' },
          { label: 'Capture One', href: '#capture-one' },
          { label: 'Photoshop', href: '#photoshop' },
        ],
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    overview: { label: 'All resources', href: '#resources' },
    columns: [
      {
        title: 'Learn',
        links: [
          { label: 'Help center', href: '#help' },
          { label: 'Guides', href: '#guides' },
          { label: 'API reference', href: '#api' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'Blog', href: '#blog' },
          { label: 'Changelog', href: '#changelog' },
          { label: 'Status', href: '#status' },
        ],
      },
    ],
  },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'contact', label: 'Contact sales', href: '#contact' },
];

export const DEMO_FOOTER_COLUMNS: FooterColumn[] = [
  { title: 'Products', links: [{ label: 'Client galleries', href: '#galleries' }, { label: 'Client portals', href: '#portals' }, { label: 'Print store', href: '#prints' }, { label: 'Archive', href: '#archive' }, { label: 'Shop', href: '#shop' }] },
  { title: 'Support', links: [{ label: 'Help center', href: '#help' }, { label: 'Contact support', href: '#support' }, { label: 'Status', href: '#status' }, { label: 'Report abuse', href: '#abuse' }] },
  { title: 'Developers', links: [{ label: 'API reference', href: '#api' }, { label: 'Guides', href: '#guides' }, { label: 'Changelog', href: '#changelog' }] },
  { title: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Careers', href: '#careers' }, { label: 'Blog', href: '#blog' }, { label: 'Partners', href: '#partners' }] },
];
