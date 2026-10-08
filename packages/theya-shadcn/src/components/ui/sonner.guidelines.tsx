import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { toast } from './sonner';

function Fire({ label, run }: { label: string; run: () => void }) {
  return <Button appearance="outlined" tone="secondary" onClick={run}>{label}</Button>;
}

export const toasterGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [
    'Short feedback on an action just taken: saved, sent, copied, failed.',
    <>A background task’s progress (<C>toast.progress</C>) or result (<C>toast.promise</C>).</>,
  ],
  whenNotToUse: [
    { text: 'An error people must fix on this page (form, field)', instead: 'Alert or the field’s error' },
    { text: 'Something that needs a decision', instead: 'AlertDialog' },
    { text: 'Undo after a destructive action', instead: 'UndoToast' },
    { text: 'Site-wide news', instead: 'AnnouncementBar' },
  ],
  anatomy: [
    { part: 'Icon', description: 'by type: success, info, warning, error.', optional: true },
    { part: 'Title', description: 'what happened, in past tense.' },
    { part: 'Description', description: 'the object or detail.', optional: true },
    { part: 'Action', description: 'one: Retry, View, Open.', optional: true },
    { part: 'Close', description: 'on every toast by default.' },
  ],
  doDont: [
    {
      do: {
        example: <Fire label="Show good toast" run={() => toast.success('Certificate issued', { description: 'shop.seashell.dev · valid 90 days' })} />,
        caption: 'What happened, to what.',
      },
      dont: { example: <Fire label="Show vague toast" run={() => toast.success('Success!')} />, caption: '“Success!” — of what?' },
    },
    {
      do: {
        example: <Fire label="Show error toast" run={() => toast.error('Couldn’t reissue certificate', { description: 'DNS check failed for shop.seashell.dev', action: { label: 'Retry', onClick: () => {} } })} />,
        caption: 'Errors stay until closed and offer a retry.',
      },
      dont: {
        example: <Fire label="Show field error as toast" run={() => toast.error('Email is invalid')} />,
        caption: 'A field error in a toast: it’s far from the field and the user has to find it.',
      },
    },
  ],
  a11y: [
    'Toasts are announced politely; errors don’t auto-close, so there is time to read and act.',
    'Never put the only path to something in a toast — it may be gone before people get to it.',
    <>Mount <C>{'<Toaster />'}</C> once at the app root and use <C>toast</C> from this module.</>,
  ],
};
