import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const listViewGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A screen of many records people search, filter, select and act on: users, sites, domains.',
  ],
  whenNotToUse: [
    { text: 'A few static rows', instead: 'Table' },
    { text: 'The page of one record', instead: 'Details' },
  ],
  anatomy: [
    { part: 'Toolbar', description: 'search and filters in one field; bulk actions once rows are selected.' },
    { part: 'Table', description: 'a DataTable with sorting, paging and selection.' },
    { part: 'Row actions', description: 'a menu per row; destructive ones confirm and offer undo.', optional: true },
  ],
  doDont: [],
  a11y: [
    'Selected rows switch the toolbar to bulk actions in the same place, so focus and reading order stay put.',
    'Destructive actions confirm first and can be undone from the toast.',
    'On a phone rows stack into items instead of scrolling sideways.',
  ],
};
