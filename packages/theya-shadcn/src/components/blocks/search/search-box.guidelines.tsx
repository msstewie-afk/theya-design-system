import { C, type ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const searchBoxGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The search in the top bar: recent searches on focus, completions and direct matches while typing.',
    'Jumping straight to one item by name, or running a full search for what was typed.',
  ],
  whenNotToUse: [
    { text: 'Commands and actions as well as navigation', instead: 'Command' },
    { text: 'Filtering a list already on the page', instead: 'FilterField' },
    { text: 'The full results page', instead: 'SearchResults' },
  ],
  anatomy: [
    { part: 'Field', description: 'the search icon, a placeholder and the shortcut key.' },
    { part: 'Recent searches', description: 'when the field is empty, with Clear recent searches.', optional: true },
    { part: 'Suggestions', description: 'completions of what was typed; the part not typed is emphasized.', optional: true },
    { part: 'Go to', description: 'direct matches with their type.', optional: true },
    { part: 'Search everything', description: 'the last option: a full search for what is in the field.' },
  ],
  doDont: [],
  a11y: [
    'It is a combobox: arrow keys move through the options, Enter picks the highlighted one or searches what was typed, Escape closes the list and then clears the field.',
    'The number of options is announced as the list opens and changes.',
    <>
      The <C>/</C> shortcut never fires while typing in another field; turn it off or change it with <C>shortcut</C>, ideally from a user setting.
    </>,
  ],
};
