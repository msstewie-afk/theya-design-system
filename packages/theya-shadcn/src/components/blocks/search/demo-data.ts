import type { SearchItem } from './types';

/** Demo index for the Search pattern stories: what a hosting panel can find. */
export const DEMO_INDEX: SearchItem[] = [
  { id: 'd1', type: 'domain', title: 'seashell.shop', context: 'Subscription: Seashell', meta: 'Active', href: '#d1' },
  { id: 'd2', type: 'domain', title: 'staging.seashell.shop', context: 'Subscription: Seashell', meta: 'Active', href: '#d2' },
  { id: 'd3', type: 'domain', title: 'seashell-blog.com', context: 'Subscription: Seashell', meta: 'Suspended', href: '#d3' },
  { id: 'd4', type: 'domain', title: 'northwind.dev', context: 'Subscription: Northwind', meta: 'Active', href: '#d4' },
  { id: 'd5', type: 'domain', title: 'shop.northwind.dev', context: 'Subscription: Northwind', meta: 'Active', href: '#d5' },
  { id: 'db1', type: 'database', title: 'seashell_shop', context: 'seashell.shop · MariaDB 10.11', meta: '1.2 GB', href: '#db1' },
  { id: 'db2', type: 'database', title: 'seashell_blog', context: 'seashell-blog.com · MariaDB 10.11', meta: '310 MB', href: '#db2' },
  { id: 'db3', type: 'database', title: 'shop_staging', context: 'staging.seashell.shop · MariaDB 10.11', meta: '1.1 GB', href: '#db3' },
  { id: 'db4', type: 'database', title: 'northwind_app', context: 'northwind.dev · PostgreSQL 16', meta: '4.8 GB', href: '#db4' },
  { id: 'm1', type: 'mailbox', title: 'hello@seashell.shop', context: 'seashell.shop', meta: '2.1 of 5 GB', href: '#m1' },
  { id: 'm2', type: 'mailbox', title: 'orders@seashell.shop', context: 'seashell.shop', meta: '4.6 of 5 GB', href: '#m2' },
  { id: 'm3', type: 'mailbox', title: 'support@northwind.dev', context: 'northwind.dev', meta: '0.8 of 10 GB', href: '#m3' },
  { id: 'u1', type: 'user', title: 'Dana Kovač', context: 'Administrator · dana@seashell.shop', href: '#u1' },
  { id: 'u2', type: 'user', title: 'Marco Pellegrini', context: 'Developer · marco@northwind.dev', href: '#u2' },
  { id: 's1', type: 'setting', title: 'Backup schedule', context: 'Tools & Settings › Backups', snippet: 'When backups run and how many copies to keep.', href: '#s1' },
  { id: 's2', type: 'setting', title: 'Backup storage', context: 'Tools & Settings › Backups', snippet: 'Where backups are stored: this server or S3-compatible storage.', href: '#s2' },
  { id: 's3', type: 'setting', title: 'SSL/TLS certificates', context: 'Tools & Settings › Security', snippet: 'Issue, renew and assign certificates to domains.', href: '#s3' },
  { id: 's4', type: 'setting', title: 'PHP settings', context: 'Domains › Hosting', snippet: 'PHP version, memory limit and upload size per domain.', href: '#s4' },
  { id: 's5', type: 'setting', title: 'Mail server settings', context: 'Tools & Settings › Mail', snippet: 'Outgoing limits, spam filter and DKIM signing.', href: '#s5' },
  { id: 's6', type: 'setting', title: 'Two-factor authentication', context: 'Account › Security', snippet: 'Require a code from an app when signing in.', href: '#s6' },
  { id: 'a1', type: 'article', title: 'Restore a site from a backup', context: 'Help › Backups', snippet: 'Pick a backup, choose what to restore and where. You can restore a single database or file.', href: '#a1' },
  { id: 'a2', type: 'article', title: 'Move backups to S3 storage', context: 'Help › Backups', snippet: 'Connect an S3-compatible bucket and keep backups off the server.', href: '#a2' },
  { id: 'a3', type: 'article', title: 'Why is my mailbox full?', context: 'Help › Mail', snippet: 'Find what takes space in a mailbox and raise its quota.', href: '#a3' },
  { id: 'a4', type: 'article', title: 'Connect a domain you bought elsewhere', context: 'Help › Domains', snippet: 'Point the domain’s name servers here, or add the records at your registrar.', href: '#a4' },
  { id: 'a5', type: 'article', title: 'Import a database', context: 'Help › Databases', snippet: 'Upload a dump file and import it into a new or existing database.', href: '#a5' },
  { id: 'a6', type: 'article', title: 'Back up a single database', context: 'Help › Backups', snippet: 'Run a backup of one database without the rest of the site.', href: '#a6' },
];

/** Searches people ran recently (newest first). */
export const DEMO_RECENT = ['backup schedule', 'seashell.shop', 'php version'];

/** Shown when nothing matches: the pages people look for most. */
export const DEMO_POPULAR = DEMO_INDEX.filter((i) => ['s1', 's3', 'a1', 'a4'].includes(i.id));
