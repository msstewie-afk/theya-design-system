import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const integrationsSectionGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'The services a product connects to, on a landing page: "Works with the tools you already use".',
    'Grid: up to twelve cards with a name and one line of what connecting does; with two or more categories a chip filter appears (each category is a tab panel).',
    'Hub: six to ten services around the product\'s mark — a picture of "connects to everything" for a first impression; the names are there for screen readers only, so put the grid on the integrations page.',
  ],
  whenNotToUse: [
    { text: 'Customer or press logos', instead: 'LogoStrip' },
    { text: 'More than twelve services', instead: 'the grid with a link to the full list (action)' },
  ],
  anatomy: [
    { part: 'Section head', description: 'eyebrow, title, description, centred.' },
    { part: 'Filter', description: 'Tabs chips: All + one per category (grid, two or more categories).', optional: true },
    { part: 'Integration card', description: 'a tonal tile with the mark, the name, one line; a link when it has href.' },
    { part: 'Hub', description: 'the product mark in the middle, services evenly on a ring, two quiet rings; no motion.' },
    { part: 'Action', description: '"Browse all integrations".', optional: true },
  ],
  doDont: [],
  a11y: [
    'The section is named by its title; services are a list. Marks are decorative, the name names each one.',
    'Filter chips are tabs with panels; arrow keys move between them.',
    'Hub tiles are links (or plain items) named by the service; the ring is decoration.',
  ],
};
