import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { KeyboardShortcuts } from './keyboard-shortcuts';

export const keyboardShortcutsGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A help dialog listing an app’s shortcuts, opened from a menu or with “?”.'],
  whenNotToUse: [
    { text: 'One shortcut next to its action', instead: 'Kbd in the menu item or tooltip' },
  ],
  anatomy: [
    { part: 'Groups', description: <><C>groups</C>, each with a <C>heading</C>: Navigation, Actions…</> },
    { part: 'Row', description: <>description and <C>keys</C> (“then” for sequences).</> },
    { part: 'Hotkey', optional: true, description: <><C>hotkey</C> (e.g. “?”); <C>scopeRef</C> limits it to a work area (WCAG 2.1.4).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <KeyboardShortcuts
            trigger={<Button appearance="outlined" tone="secondary" size="md">Grouped shortcuts</Button>}
            groups={[
              { heading: 'Navigation', shortcuts: [{ keys: ['G', 'then', 'S'], description: 'Go to Sites' }, { keys: ['/'], description: 'Search' }] },
              { heading: 'Actions', shortcuts: [{ keys: ['N'], description: 'New site' }, { keys: ['?'], description: 'Show shortcuts' }] },
            ]}
          />
        ),
        caption: 'Grouped by task, so people scan to the part they need.',
      },
      dont: {
        example: (
          <KeyboardShortcuts
            trigger={<Button appearance="outlined" tone="secondary" size="md">One long list</Button>}
            groups={[
              {
                shortcuts: [
                  { keys: ['N'], description: 'New site' },
                  { keys: ['/'], description: 'Search' },
                  { keys: ['G', 'then', 'S'], description: 'Go to Sites' },
                  { keys: ['E'], description: 'Edit' },
                  { keys: ['?'], description: 'Show shortcuts' },
                  { keys: ['G', 'then', 'B'], description: 'Go to Billing' },
                ],
              },
            ]}
          />
        ),
        caption: 'One ungrouped list in no order — fine for 3 shortcuts, not for 30.',
      },
    },
  ],
  a11y: [
    'A single-character hotkey must be scoped or switchable (WCAG 2.1.4) — pass scopeRef.',
    'The hotkey is ignored while typing in a field.',
    'Keys are read as text, in order (“G then S”).',
  ],
};
