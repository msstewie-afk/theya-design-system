import { type ComponentGuidelines } from '../../docs/guidelines';
import { Kbd } from './kbd';

const TEXT = 'font-body text-body-m text-[var(--color-text-text)]';

export const kbdGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Showing a keyboard key or shortcut in text, menus, tooltips and help: ⌘ K, Esc, ?.'],
  whenNotToUse: [
    { text: 'Code or command-line text', instead: 'inline code' },
    { text: 'A list of all shortcuts', instead: 'KeyboardShortcuts' },
  ],
  anatomy: [
    { part: 'Key', description: 'one Kbd per key; combinations are several Kbd side by side.' },
  ],
  doDont: [
    {
      do: {
        example: <p className={TEXT}>Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search.</p>,
        caption: 'One cap per key, inside a sentence that says what it does.',
      },
      dont: {
        example: <p className={TEXT}>Press <Kbd>Command + K on Mac or Control + K on Windows</Kbd> to search.</p>,
        caption: 'A whole phrase in one cap — the key styling stops meaning “a key”.',
      },
    },
  ],
  a11y: [
    'Kbd only shows the shortcut; the shortcut must actually work and be described in text.',
    'Symbols like ⌘ are read inconsistently — add the word in surrounding text for important shortcuts.',
  ],
};
