import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const megaMenuGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The main navigation of a site with many destinations, grouped into a few sections.',
    'When each section has its own landing page and sub-areas that need a heading or a line of description to tell apart.',
  ],
  whenNotToUse: [
    { text: 'A handful of top-level links with no sub-areas', instead: 'NavigationMenu' },
    { text: 'An app people work in, with its own side navigation', instead: 'WorkspaceLayout' },
  ],
  anatomy: [
    { part: 'Top-level items', description: 'sections that open a panel, and plain links.' },
    { part: 'Panel', description: 'sub-areas in titled columns, with an icon, a description or a badge where useful.' },
    { part: 'Featured item', description: 'one highlighted destination beside the columns.', optional: true },
    { part: 'Section page link', description: 'the section’s own “All …” page, at the bottom of every panel.' },
    { part: 'Drawer', description: 'on narrow screens the same tree behind Menu, one section open at a time, the current one open first.' },
  ],
  doDont: [],
  a11y: [
    'The bar and the drawer are both navigation landmarks named “Main”; only one of them is shown at a time.',
    'In a panel and in the drawer, each column heading is a real heading (h3 in the bar, h4 under the drawer’s section headers) and names the list of links under it.',
    'The current section is announced as “current section”, and a current top-level link is marked as the current page. In the bar both also get a tinted fill, and in the drawer a current link gets the same fill, so the mark doesn’t rely on text color alone (WCAG 1.4.1).',
  ],
};
