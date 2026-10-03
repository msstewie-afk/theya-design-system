import type { MegaItem } from './mega-menu';
import type { FooterColumn } from './site-footer';

export const DEMO_MENU: MegaItem[] = [
  {
    id: 'products',
    label: 'Products',
    overview: { label: 'All products', href: '#products' },
    columns: [
      {
        title: 'Hosting',
        links: [
          { label: 'Shared hosting', href: '#shared', description: 'Sites and stores up to ~50k visits a month' },
          { label: 'VPS', href: '#vps', description: 'Your own server, managed for you' },
          { label: 'Dedicated servers', href: '#dedicated', description: 'Whole machines for heavy workloads' },
        ],
      },
      {
        title: 'Domains',
        links: [
          { label: 'Register a domain', href: '#register' },
          { label: 'Transfer a domain', href: '#transfer' },
          { label: 'DNS hosting', href: '#dns' },
        ],
      },
      {
        title: 'Add-ons',
        links: [
          { label: 'Backups', href: '#backups' },
          { label: 'Email', href: '#email' },
          { label: 'CDN', href: '#cdn', badge: 'New' },
          { label: 'Extensions catalog', href: '#extensions' },
        ],
      },
    ],
    featured: { title: 'Move your site for free', description: 'We copy files, databases and email from your old host, and switch DNS when it’s ready.', href: '#migration', cta: 'Start a migration' },
  },
  {
    id: 'solutions',
    label: 'Solutions',
    overview: { label: 'All solutions', href: '#solutions' },
    columns: [
      {
        title: 'By need',
        links: [
          { label: 'Online stores', href: '#stores', description: 'Fast checkout, PCI-ready' },
          { label: 'Agencies', href: '#agencies', description: 'Many clients, one panel' },
          { label: 'Developers', href: '#developers', description: 'Git deploys, SSH, staging' },
        ],
      },
      {
        title: 'By platform',
        links: [
          { label: 'WordPress', href: '#wordpress' },
          { label: 'Joomla', href: '#joomla' },
          { label: 'Node.js', href: '#node' },
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
  { title: 'Products', links: [{ label: 'Shared hosting', href: '#shared' }, { label: 'VPS', href: '#vps' }, { label: 'Dedicated servers', href: '#dedicated' }, { label: 'Domains', href: '#domains' }, { label: 'Extensions', href: '#extensions' }] },
  { title: 'Support', links: [{ label: 'Help center', href: '#help' }, { label: 'Contact support', href: '#support' }, { label: 'Status', href: '#status' }, { label: 'Report abuse', href: '#abuse' }] },
  { title: 'Developers', links: [{ label: 'API reference', href: '#api' }, { label: 'Guides', href: '#guides' }, { label: 'Changelog', href: '#changelog' }] },
  { title: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Careers', href: '#careers' }, { label: 'Blog', href: '#blog' }, { label: 'Partners', href: '#partners' }] },
];
