import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { ConfirmDialog } from './confirm-dialog';

export const confirmDialogGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [<>High-stakes, irreversible deletes where a click isn’t enough: <C>confirmValue</C> makes people type the name.</>, 'Deleting a domain, a database, an organisation.'],
  whenNotToUse: [
    { text: 'Ordinary confirmations', instead: 'AlertDialog' },
    { text: 'Reversible actions', instead: 'UndoToast' },
  ],
  anatomy: [
    { part: 'Title and description', description: 'the object and what’s lost.' },
    { part: 'Type-to-confirm', optional: true, description: <><C>confirmValue</C>; the action enables only on an exact match.</> },
    { part: 'Actions', description: <><C>confirmLabel</C> with the verb; <C>tone="danger"</C>.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <ConfirmDialog
            title="Delete seashell.dev?"
            description="All DNS records, mailboxes and certificates for this domain are removed."
            confirmValue="seashell.dev"
            confirmLabel="Delete domain"
            tone="danger"
            trigger={<Button appearance="outlined" tone="danger" size="md">Delete domain</Button>}
          />
        ),
        caption: 'Typing the domain makes deleting the wrong one unlikely.',
      },
      dont: {
        example: (
          <ConfirmDialog
            title="Archive this draft?"
            confirmValue="Q3 newsletter draft"
            confirmValueMono={false}
            confirmLabel="Archive"
            tone="neutral"
            trigger={<Button appearance="outlined" tone="secondary" size="md">Archive draft</Button>}
          />
        ),
        caption: 'Typing a title to archive a draft that can be restored: friction with no protection.',
      },
    },
  ],
  a11y: [
    'The field says exactly what to type; the action stays disabled until it matches.',
    'If the deleted row held the trigger, focus moves to its nearest surviving ancestor instead of falling to the page.',
  ],
};
