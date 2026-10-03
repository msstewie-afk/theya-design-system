import { Bell, CreditCard, Lock, Shield, User, Group } from 'iconoir-react';
import type { AccountArea, AttentionItem } from './account-overview';
import type { AccountWorkspace } from './account-menu';
import type { Order } from './order-history';
import type { SavedItem } from './saved-items';
import type { TrackerEvent, TrackerStep } from './status-tracker';

export const DEMO_USER = { name: 'Dana Kovač', email: 'dana@seashell.shop', memberSince: 'March 2023', workspace: 'Seashell' };

export const DEMO_WORKSPACES: AccountWorkspace[] = [
  { id: 'seashell', name: 'Seashell', role: 'Owner' },
  { id: 'northwind', name: 'Northwind Studio', role: 'Admin' },
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
      { label: 'Name', value: 'Dana Kovač' },
      { label: 'Email', value: 'dana@seashell.shop' },
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
      { label: 'Email', value: 'Billing, security, outages' },
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
  { id: 's1', title: 'Dedicated server', subtitle: '8 cores, 64 GB RAM, NVMe RAID 1', price: 79, savedPrice: 89, savedAt: '2026-09-28', savedLabel: '5 days ago', href: '#dedicated-server', image: '/asset-examples/product-rack-server.svg' },
  { id: 's2', title: 'NVMe storage add-on', subtitle: '1 TB block storage', price: 15, savedAt: '2026-09-30', savedLabel: '3 days ago', href: '#nvme', image: '/asset-examples/product-ssd.svg' },
  { id: 's3', title: 'Firewall appliance (2025)', subtitle: 'Replaced by the 2026 model', price: null, savedAt: '2026-06-02', savedLabel: 'in June', href: '#firewall-2025', image: '/asset-examples/product-router.svg' },
  { id: 's4', title: 'Hardware security key', subtitle: 'USB-C and NFC', price: 3, savedAt: '2026-10-01', savedLabel: '2 days ago', href: '#security-key', image: '/asset-examples/product-security-key.svg' },
];

export const DEMO_ORDERS: Order[] = [
  { id: 'o1', number: 'TH-24817', date: '2026-10-01', dateLabel: '1 Oct 2026', lines: [{ name: 'Site migration', detail: 'seashell.shop from another host', amount: 0 }, { name: 'NVMe storage add-on', detail: '1 TB, monthly', amount: 15 }], total: 15, status: 'processing', payment: 'Visa ending 4242', trackHref: '#track/TH-24817' },
  { id: 'o2', number: 'TH-23990', date: '2026-09-12', dateLabel: '12 Sep 2026', lines: [{ name: 'Business plan', detail: 'Yearly, 12 Sep 2026 – 11 Sep 2027', amount: 588 }], total: 588, status: 'completed', payment: 'Visa ending 4242', invoiceHref: '#invoice/TH-23990.pdf' },
  { id: 'o3', number: 'TH-23412', date: '2026-08-20', dateLabel: '20 Aug 2026', lines: [{ name: 'Hardware security key', detail: '2 pcs', amount: 6 }, { name: 'Shipping', amount: 4 }], total: 10, status: 'completed', payment: 'Visa ending 4242', invoiceHref: '#invoice/TH-23412.pdf' },
  { id: 'o4', number: 'TH-23001', date: '2026-07-30', dateLabel: '30 Jul 2026', lines: [{ name: 'Edge CDN', detail: 'Monthly', amount: 10 }], total: 10, status: 'failed', payment: 'Mastercard ending 8812' },
  { id: 'o5', number: 'TH-22768', date: '2026-07-02', dateLabel: '2 Jul 2026', lines: [{ name: 'Dedicated server', detail: 'Monthly', amount: 89 }, { name: 'Setup fee', amount: 0 }, { name: 'Offsite Copy', detail: 'Monthly', amount: 4 }], total: 93, status: 'refunded', payment: 'Visa ending 4242', invoiceHref: '#invoice/TH-22768.pdf' },
  { id: 'o6', number: 'TH-22011', date: '2026-05-14', dateLabel: '14 May 2026', lines: [{ name: 'Domain: seashell-blog.com', detail: '1 year', amount: 14 }], total: 14, status: 'completed', payment: 'Visa ending 4242', invoiceHref: '#invoice/TH-22011.pdf' },
  { id: 'o7', number: 'TH-21540', date: '2026-04-03', dateLabel: '3 Apr 2026', lines: [{ name: 'Mail Relay', detail: 'Monthly', amount: 5 }], total: 5, status: 'cancelled', payment: 'Visa ending 4242' },
];

export const DEMO_STEPS: TrackerStep[] = [
  { id: 'check', label: 'Checking the source', description: 'Connecting to the old host and listing what to copy' },
  { id: 'files', label: 'Copying files', description: '12,400 of 31,000 files copied' },
  { id: 'db', label: 'Copying databases', description: 'Two databases, 1.4 GB' },
  { id: 'verify', label: 'Checking the copy', description: 'Comparing pages on both hosts' },
  { id: 'dns', label: 'Switching DNS', description: 'Pointing seashell.shop here' },
];

export const DEMO_EVENTS: TrackerEvent[] = [
  { id: 'e3', time: '14:32', text: 'Copying files', detail: '12,400 of 31,000 files', tone: 'info' },
  { id: 'e2', time: '14:20', text: 'Source checked', detail: '31,000 files, 2 databases, 6.8 GB', tone: 'success' },
  { id: 'e1', time: '14:18', text: 'Migration started by Dana Kovač' },
];
