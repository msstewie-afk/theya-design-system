import type { ComparedFeature, ComparedPlan } from './plan-comparison';
import type { CartLine } from './cart';

/** Shared demo content for the Commerce pattern stories (Seashell hosting). */
export const DEMO_PLANS: ComparedPlan[] = [
  { id: 'starter', name: 'Starter', description: 'One site, the essentials.', monthly: 10, yearly: 8 },
  { id: 'pro', name: 'Pro', description: 'For a few busy sites.', monthly: 30, yearly: 24, recommended: true },
  { id: 'business', name: 'Business', description: 'Teams and many sites.', monthly: 75, yearly: 60 },
];

export const DEMO_FEATURES: ComparedFeature[] = [
  { id: 'sites', label: 'Sites', values: { starter: '1', pro: '5', business: 'Unlimited' } },
  { id: 'storage', label: 'SSD storage', values: { starter: '10 GB', pro: '25 GB', business: '100 GB' } },
  { id: 'bandwidth', label: 'Bandwidth', values: { starter: 'Unmetered', pro: 'Unmetered', business: 'Unmetered' } },
  { id: 'ssl', label: 'Free SSL certificates', values: { starter: true, pro: true, business: true } },
  { id: 'backups', label: 'Backups', hint: 'Full copies of files and databases you can restore in one click.', values: { starter: 'Weekly', pro: 'Daily', business: 'Hourly' } },
  { id: 'staging', label: 'Staging sites', hint: 'A private copy of a site to try changes before they go live.', values: { starter: false, pro: true, business: true } },
  { id: 'ssh', label: 'SSH access', hint: 'Command-line access to your server.', values: { starter: false, pro: true, business: true } },
  { id: 'support', label: 'Support', values: { starter: 'Email', pro: 'Email and chat', business: '24/7 priority' } },
];

export const DEMO_CART: CartLine[] = [
  { id: 'plan-pro', name: 'Pro plan', detail: 'Billed yearly · renews Oct 3, 2027', unitPrice: 288, quantity: 1 },
  { id: 'domain', name: 'seashell.shop', detail: 'Domain registration · 1 year', unitPrice: 14, quantity: 1 },
  { id: 'ipv4', name: 'Dedicated IPv4 address', detail: '1 year', unitPrice: 36, quantity: 2, quantityEditable: true, maxQuantity: 8 },
];

export const DEMO_SAVED: CartLine[] = [{ id: 'backups-plus', name: 'Backups Plus', detail: '90-day retention · 1 year', unitPrice: 48, quantity: 1 }];
