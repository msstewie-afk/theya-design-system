import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const siteHeaderGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'The top bar of a landing or marketing page: the logo home, the site navigation, and the main action.',
    'Pair it with MegaMenu for the navigation: panels on wide screens, a drawer below md.',
  ],
  whenNotToUse: [
    { text: 'The top of a screen inside the product', instead: 'AppShell with its own top bar' },
  ],
  anatomy: [
    { part: 'Skip link', description: '“Skip to content”, first in the Tab order, visible only on focus.', optional: true },
    { part: 'Logo', description: 'the product mark as a link to the home page.' },
    { part: 'Navigation', description: 'a MegaMenu with drawerTrigger="icon"; on phones only its Menu button is left, at the end of the bar.', optional: true },
    { part: 'Actions', description: '“Log in” (hidden on phones) and one primary button.', optional: true },
  ],
  doDont: [],
  a11y: [
    'A <header> landmark with the navigation inside it, named “Main”.',
    'With `skipToId`, keyboard users reach the page content in one Tab instead of going through every menu item.',
    'Sticky by default: 64px high, so it never covers more than a sliver of the page; the background appears only after scrolling, so the hero is not cut by a band.',
  ],
};
