import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { undoToast } from './undo-toast';

export const undoToastGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'A destructive action that can be held back for a few seconds: delete a file, archive a site, remove a member.',
    'Replacing a confirm dialog for frequent, low-risk removals.',
  ],
  whenNotToUse: [
    { text: 'The action can’t be rolled back (data wiped, email sent, payment)', instead: 'ConfirmDialog' },
    { text: 'Plain success feedback', instead: 'Toaster (toast.success)' },
  ],
  anatomy: [
    { part: 'Title', description: 'what was done: “Site archived”.' },
    { part: 'Description', description: 'the object, if the title doesn’t name it.', optional: true },
    { part: 'Undo', description: <>rolls back via <C>onUndo</C>; otherwise <C>onCommit</C> runs when the toast closes.</> },
  ],
  doDont: [
    {
      do: {
        example: <Button appearance="outlined" tone="secondary" onClick={() => undoToast({ title: 'Moved to trash', description: 'invoice-0923.pdf' })}>Delete file</Button>,
        caption: 'The file is still recoverable — Undo is real.',
      },
      dont: {
        example: <Button appearance="outlined" tone="secondary" onClick={() => undoToast({ title: 'Database deleted', description: 'shop_prod' })}>Delete database</Button>,
        caption: 'Undo on something already gone for good is a broken promise — confirm first.',
      },
    },
  ],
  a11y: [
    <>The window is 10 s by default (<C>duration</C>) — long enough to reach Undo with a keyboard or screen reader. Don’t shorten it.</>,
    'Commit happens on close, so people who navigate away still get the action done.',
    'After Undo, the item returns to its place; restore focus there if it was focused.',
  ],
};
