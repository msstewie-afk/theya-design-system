import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const siteFooterGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The bottom of a site’s pages: contact details, system status, a sitemap of what the top navigation doesn’t fit, legal pages.',
  ],
  whenNotToUse: [
    { text: 'The main way to move around the site', instead: 'MegaMenu' },
    { text: 'A notice every visitor must see', instead: 'AnnouncementBar' },
  ],
  anatomy: [
    { part: 'Brand', description: 'name and a one-line tagline.' },
    { part: 'Contact and status', description: 'ways to reach a person and a link to system status.', optional: true },
    { part: 'Link columns', description: 'titled lists, all visible, nothing folded.' },
    { part: 'Bottom row', description: 'copyright and legal links, with a language picker and social links.' },
  ],
  doDont: [],
  a11y: [
    'Link columns sit in a navigation landmark named “Footer”, and each list is named by its column heading.',
    'Status is a dot with words. The language picker is labelled “Language” and reads the full language name; flags are hidden from screen readers.',
    'Social links are icons with a name that says where they go (“Theya on …”), each a 32px target.',
  ],
};
