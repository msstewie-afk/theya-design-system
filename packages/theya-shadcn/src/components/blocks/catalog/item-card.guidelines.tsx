import { C, type ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const itemCardGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'One entry in a catalog people browse and compare: extensions, plugins, servers, templates.',
    'Grid for browsing by eye, list for scanning many items; the facts appear in the same order in both.',
  ],
  whenNotToUse: [
    { text: 'Records people manage, sort and act on in bulk', instead: 'DataTable' },
    { text: 'A card with none of the catalog facts (rating, installs, price)', instead: 'Card' },
  ],
  anatomy: [
    { part: 'Picture or icon', description: 'a product picture at a fixed ratio, or the item’s icon tile.' },
    { part: 'Name and vendor', description: 'what it is and who makes it; the summary follows.' },
    { part: 'Facts', description: 'what it works with, the rating with its review count, and installs.' },
    { part: 'Price', description: '“Free” or a monthly price, at the bottom of every card.' },
    { part: 'Compare', description: 'a checkbox for collecting items into a comparison.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The whole card is one link named by the item and its vendor; the Compare checkbox sits above that link as its own control, named “Compare” plus the item.',
    'The rating is read as one sentence (“Rated 4.7 out of 5 from 812 reviews”); the stars themselves are hidden from screen readers.',
    <>The icon tile and pictures are decorative by default, since the name already says what the item is. Pass <C>image.alt</C> only when the picture shows something the text doesn’t, like a color or a variant.</>,
  ],
};
