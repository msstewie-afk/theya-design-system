import type { ComparedFeature, ComparedPlan } from './plan-comparison';
import type { CartLine } from './cart';

/** Shared demo content for the Commerce pattern stories (Aether, a platform for photographers). */
export const DEMO_PLANS: ComparedPlan[] = [
  { id: 'starter', name: 'Starter', description: 'One photographer, the essentials.', monthly: 10, yearly: 8 },
  { id: 'pro', name: 'Pro', description: 'For a busy studio.', monthly: 30, yearly: 24, recommended: true },
  { id: 'business', name: 'Business', description: 'Teams and several studios.', monthly: 75, yearly: 60 },
];

export const DEMO_FEATURES: ComparedFeature[] = [
  { id: 'galleries', label: 'Galleries', values: { starter: '10', pro: '50', business: 'Unlimited' } },
  { id: 'storage', label: 'Storage', values: { starter: '50 GB', pro: '384 GB', business: '2 TB' } },
  { id: 'downloads', label: 'Client downloads', values: { starter: 'Unlimited', pro: 'Unlimited', business: 'Unlimited' } },
  { id: 'portal', label: 'Client portal', values: { starter: true, pro: true, business: true } },
  { id: 'archive', label: 'Archive retention', hint: 'How long deleted galleries stay in the Mnemosyne archive, ready to restore in one click.', values: { starter: '30 days', pro: '1 year', business: 'Unlimited' } },
  { id: 'proofing', label: 'Client proofing', hint: 'Clients pick favorites and leave notes before you deliver the final photos.', values: { starter: false, pro: true, business: true } },
  { id: 'licenses', label: 'Print and web licenses', hint: 'A license attached to each download that says where the photo may be used.', values: { starter: false, pro: true, business: true } },
  { id: 'support', label: 'Support', values: { starter: 'Email', pro: 'Email and chat', business: '24/7 priority' } },
];

export const DEMO_CART: CartLine[] = [
  { id: 'plan-pro', name: 'Pro plan', detail: 'Billed yearly · renews Oct 3, 2027', unitPrice: 288, quantity: 1 },
  { id: 'proof-book', name: 'Proof book', detail: 'Softcover · 40 pages', unitPrice: 14, quantity: 1 },
  { id: 'fine-art-print', name: 'Fine-art print', detail: 'Cotton rag · 12 × 16 in', unitPrice: 36, quantity: 2, quantityEditable: true, maxQuantity: 8 },
];

export const DEMO_SAVED: CartLine[] = [{ id: 'license-manager', name: 'License manager', detail: 'Plan add-on · 1 year', unitPrice: 48, quantity: 1 }];
