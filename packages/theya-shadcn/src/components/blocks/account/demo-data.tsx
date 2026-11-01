import { Bell, CreditCard, Lock, Shield, User, Group } from 'iconoir-react';
import type { AccountArea, AttentionItem } from './account-overview';
import type { AccountWorkspace } from './account-menu';
import type { Order } from './order-history';
import type { SavedItem } from './saved-items';
import type { TrackerEvent, TrackerStep } from './status-tracker';

export const DEMO_USER = { name: 'Thea Marlow', email: 'thea@aether.photo', memberSince: 'March 2023', workspace: 'Helios Studio' };

export const DEMO_WORKSPACES: AccountWorkspace[] = [
  { id: 'helios', name: 'Helios Studio', role: 'Owner' },
  { id: 'selene', name: 'Selene Weddings', role: 'Admin' },
  { id: 'personal', name: 'Personal', role: 'Owner' },
];

export const DEMO_ATTENTION: AttentionItem[] = [
  { id: 'card', tone: 'warning', title: 'Your card ending 4242 expires on 31 October', description: 'Add a new card so the 12 November payment goes through.', action: { label: 'Update card', href: '#billing/cards' } },
  { id: '2fa', tone: 'info', title: 'Two-factor authentication is off', description: 'A code from your phone keeps the account safe even if the password leaks.', action: { label: 'Turn on', href: '#security/2fa' } },
];

export const DEMO_AREAS: AccountArea[] = [
  {
    id: 'profile',
    title: 'Profile',
    icon: <User />,
    href: '#profile',
    facts: [
      { label: 'Name', value: 'Thea Marlow' },
      { label: 'Email', value: 'thea@aether.photo' },
      { label: 'Language', value: 'English' },
    ],
    tasks: [
      { label: 'Edit name and photo', href: '#profile/edit' },
      { label: 'Change email', href: '#profile/email' },
    ],
  },
  {
    id: 'security',
    title: 'Sign-in and security',
    icon: <Shield />,
    href: '#security',
    facts: [
      { label: 'Password', value: 'Changed 4 months ago' },
      { label: 'Two-factor', value: 'Off', tone: 'warning' },
      { label: 'Signed-in devices', value: '3' },
    ],
    tasks: [
      { label: 'Change password', href: '#security/password' },
      { label: 'Set up two-factor', href: '#security/2fa' },
      { label: 'See devices and sign out', href: '#security/devices' },
    ],
  },
  {
    id: 'billing',
    title: 'Billing and plan',
    icon: <CreditCard />,
    href: '#billing',
    facts: [
      { label: 'Plan', value: 'Business, yearly' },
      { label: 'Next payment', value: '$588 on 12 Nov' },
      { label: 'Card', value: 'Visa ending 4242', tone: 'warning' },
    ],
    tasks: [
      { label: 'Change plan', href: '#billing/plan' },
      { label: 'Update payment method', href: '#billing/cards' },
      { label: 'Orders and invoices', href: '#billing/orders' },
    ],
  },
  {
    id: 'team',
    title: 'Team',
    icon: <Group />,
    href: '#team',
    facts: [
      { label: 'Members', value: '6 of 10 seats' },
      { label: 'Pending invites', value: '1' },
    ],
    tasks: [
      { label: 'Invite people', href: '#team/invite' },
      { label: 'Manage roles', href: '#team/roles' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <Bell />,
    href: '#notifications',
    facts: [
      { label: 'Email', value: 'Billing, security, client activity' },
      { label: 'Weekly report', value: 'On', tone: 'success' },
    ],
    tasks: [{ label: 'Choose what we email you', href: '#notifications' }],
  },
  {
    id: 'privacy',
    title: 'Data and privacy',
    icon: <Lock />,
    href: '#privacy',
    facts: [
      { label: 'Last export', value: 'Never' },
      { label: 'Data region', value: 'EU (Frankfurt)' },
    ],
    tasks: [
      { label: 'Download your data', href: '#privacy/export' },
      { label: 'Close account', href: '#privacy/close' },
    ],
  },
];

export const DEMO_SAVED: SavedItem[] = [
  { id: 's1', title: 'Lens rental: 85 mm f/1.4', subtitle: 'Portrait prime, shipped to your studio', price: 79, savedPrice: 89, savedAt: '2026-09-28', savedLabel: '5 days ago', href: '#lens-85mm' },
  { id: 's2', title: 'Extra storage add-on', subtitle: '1 TB more for the Mnemosyne archive', price: 15, savedAt: '2026-09-30', savedLabel: '3 days ago', href: '#extra-storage' },
  { id: 's3', title: 'Film scanning (2025)', subtitle: 'Replaced by the 2026 scanning service', price: null, savedAt: '2026-06-02', savedLabel: 'in June', href: '#film-scanning-2025' },
  { id: 's4', title: 'Watermark presets', subtitle: 'Six layouts for web previews', price: 3, savedAt: '2026-10-01', savedLabel: '2 days ago', href: '#watermark-presets' },
];

export const DEMO_ORDERS: Order[] = [
  { id: 'o1', number: 'TH-24817', date: '2026-10-01', dateLabel: '1 Oct 2026', lines: [{ name: 'Archive import', detail: '4,500 photos from another service', amount: 0 }, { name: 'Extra storage add-on', detail: '1 TB, monthly', amount: 15 }], total: 15, status: 'processing', payment: 'Visa ending 4242', trackHref: '#track/TH-24817' },
  { id: 'o2', number: 'TH-23990', date: '2026-09-12', dateLabel: '12 Sep 2026', lines: [{ name: 'Business plan', detail: 'Yearly, 12 Sep 2026 – 11 Sep 2027', amount: 588 }], total: 588, status: 'completed', payment: 'Visa ending 4242', invoiceHref: '#invoice/TH-23990.pdf' },
  { id: 'o3', number: 'TH-23412', date: '2026-08-20', dateLabel: '20 Aug 2026', lines: [{ name: 'Fine-art print, 40 × 60 cm', detail: '2 pcs', amount: 96 }, { name: 'Shipping', amount: 8 }], total: 104, status: 'completed', payment: 'Visa ending 4242', invoiceHref: '#invoice/TH-23412.pdf' },
  { id: 'o4', number: 'TH-23001', date: '2026-07-30', dateLabel: '30 Jul 2026', lines: [{ name: 'Client proofing add-on', detail: 'Monthly', amount: 10 }], total: 10, status: 'failed', payment: 'Mastercard ending 8812' },
  { id: 'o5', number: 'TH-22768', date: '2026-07-02', dateLabel: '2 Jul 2026', lines: [{ name: 'Lens rental: 85 mm f/1.4', detail: '7 days', amount: 89 }, { name: 'Delivery', amount: 0 }, { name: 'Damage waiver', detail: '7 days', amount: 4 }], total: 93, status: 'refunded', payment: 'Visa ending 4242', invoiceHref: '#invoice/TH-22768.pdf' },
  { id: 'o6', number: 'TH-22011', date: '2026-05-14', dateLabel: '14 May 2026', lines: [{ name: 'Photo book, 30 × 30 cm', detail: '40 pages, linen cover', amount: 64 }], total: 64, status: 'completed', payment: 'Visa ending 4242', invoiceHref: '#invoice/TH-22011.pdf' },
  { id: 'o7', number: 'TH-21540', date: '2026-04-03', dateLabel: '3 Apr 2026', lines: [{ name: 'Preset pack: Golden hour', detail: 'Digital download', amount: 5 }], total: 5, status: 'cancelled', payment: 'Visa ending 4242' },
];

export const DEMO_STEPS: TrackerStep[] = [
  { id: 'check', label: 'Checking the source', description: 'Connecting to the old service and listing what to copy' },
  { id: 'photos', label: 'Copying photos', description: '1,800 of 4,500 photos copied' },
  { id: 'albums', label: 'Copying albums', description: 'Six albums with captions and client picks' },
  { id: 'verify', label: 'Checking the copy', description: 'Comparing every file on both services' },
  { id: 'portal', label: 'Opening the client portal', description: 'Publishing helios.aether.photo' },
];

export const DEMO_EVENTS: TrackerEvent[] = [
  { id: 'e3', time: '14:32', text: 'Copying photos', detail: '1,800 of 4,500 photos', tone: 'info' },
  { id: 'e2', time: '14:20', text: 'Source checked', detail: '4,500 photos, 6 albums, 96 GB', tone: 'success' },
  { id: 'e1', time: '14:18', text: 'Import started by Thea Marlow' },
];
