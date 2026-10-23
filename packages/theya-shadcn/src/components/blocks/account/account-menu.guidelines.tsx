import type { ComponentGuidelines } from '../../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const accountMenuGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'The signed-in user’s entry in the top bar: who is signed in, in which workspace, and the way to every account area.',
    'Switching between the workspaces or teams a person belongs to without leaving the page.',
  ],
  whenNotToUse: [
    { text: 'A page that lists every account area with its current state', instead: 'AccountOverview' },
    { text: 'Actions on a row or an object', instead: 'DropdownMenu' },
  ],
  anatomy: [
    { part: 'Trigger', description: 'avatar, name and current workspace, with a dot when something needs attention; compact shows the avatar only.' },
    { part: 'Identity', description: 'name and email at the top of the menu.' },
    { part: 'Workspace switch', description: 'one choice per workspace, with the role in each; shown when there is more than one.', optional: true },
    { part: 'Account links', description: 'every area by name, with a count where something needs attention.' },
    { part: 'Theme, help and sign-out', description: 'the theme choice when it’s offered, then help, then Sign out last and on its own.' },
  ],
  doDont: [],
  a11y: [
    'The trigger’s name says who is signed in, the workspace and how many items need attention; the dot itself is hidden from screen readers.',
    'Counts on links are read as “1 item needs attention”, not as a bare number.',
    'Workspace and theme are labelled radio groups, so the current choice is announced as checked.',
  ],
};
