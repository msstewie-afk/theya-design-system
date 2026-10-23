import type { ComponentGuidelines } from '../../docs/guidelines';

// Patterns are whole screens: no do / don't pairs (doDont stays empty and the section is skipped).
export const accessTokensGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Letting people create, see and revoke the API keys that act on their behalf.',
    'Any secret that is shown in full once, at creation, and only masked afterwards.',
  ],
  whenNotToUse: [
    { text: 'Showing one existing secret to copy', instead: 'SecretField' },
    { text: 'Managing people and their roles', instead: 'TeamMembers' },
  ],
  anatomy: [
    { part: 'Header', description: 'title, a line of description and the Create key action.' },
    { part: 'Create dialog', description: 'name of the new key; on submit, the full key shown once to copy.' },
    { part: 'Keys table', description: 'name, masked value with copy, created and last-used dates, Revoke per row.' },
    { part: 'Empty state', description: 'when there are no keys yet, with the same Create action.', optional: true },
  ],
  doDont: [],
  a11y: [
    'The new key is shown once, in a dialog, in a SecretField with its own Copy.',
    'Revoke asks for confirmation and offers an undo in the toast, so a slip is recoverable.',
  ],
};
