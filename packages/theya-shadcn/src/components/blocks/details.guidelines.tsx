import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const detailsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The page of one object — a site, a server, a database — with its status, actions and properties.',
  ],
  whenNotToUse: [
    { text: 'A list of many objects', instead: 'ListView' },
    { text: 'Creating or editing the object', instead: 'ResourceForm' },
  ],
  anatomy: [
    { part: 'Header', description: 'title with its status on the left, actions on the right (they wrap on a phone).' },
    { part: 'Facts', description: 'a row of short facts joined by dots: region, creation date, version.' },
    { part: 'Key numbers', description: 'Stat cards, two per row on a phone and four from sm.', optional: true },
    { part: 'Content', description: 'whatever follows, usually Tabs.' },
  ],
  doDont: [],
  a11y: [
    'The title is the page heading; a domain or an id in it is set in monospace so it reads exactly.',
    'Status is a dot with a word, never color alone.',
  ],
};
