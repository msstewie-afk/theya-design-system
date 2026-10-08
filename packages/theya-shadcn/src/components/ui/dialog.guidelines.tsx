import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';

/** Static stand-in for an open dialog, for the do/don't examples. */
function DialogMock({ title, children, actions }: { title: string; children?: React.ReactNode; actions: React.ReactNode }) {
  return (
    <div className="flex w-72 flex-col gap-4 rounded-[var(--size-border-radius-border-radius-3xl)] border border-solid border-[var(--color-border-border)] bg-[var(--color-bg-surface-bg-surface-overlay)] p-5 shadow-elevation-xl">
      <p className="m-0 font-body text-heading-xs font-semibold text-[var(--color-text-text)]">{title}</p>
      {children && <div className="font-body text-body-m text-[var(--color-text-text-subtle)]">{children}</div>}
      <div className="flex justify-end gap-2">{actions}</div>
    </div>
  );
}

export const dialogGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A short, focused task that needs an answer before going on: rename, invite, a form of a few fields.', 'When leaving the page for it would lose context.'],
  whenNotToUse: [
    { text: 'Confirming something destructive', instead: 'ConfirmDialog / AlertDialog' },
    { text: 'Long forms, or content people compare with the page', instead: 'Drawer or a page' },
    { text: 'A message that needs no answer', instead: 'Toaster or Alert' },
    { text: 'Extra detail next to a control', instead: 'Popover' },
  ],
  anatomy: [
    { part: 'Overlay', description: 'dims and blocks the page.' },
    { part: 'Header', description: <><C>DialogTitle</C> (required) and <C>DialogDescription</C>.</> },
    { part: 'Body', description: 'the content or form.' },
    { part: 'Footer', description: 'actions, primary last (right).' },
    { part: 'Close button', description: <>top right; <C>showCloseButton</C> to hide it when the footer has Cancel.</> },
  ],
  doDont: [
    {
      do: {
        example: <DialogMock title="Invite people" actions={<><Button appearance="outlined" tone="secondary" size="md">Cancel</Button><Button size="md">Send invites</Button></>} />,
        caption: 'Title names the task; the primary button repeats the verb.',
      },
      dont: {
        example: <DialogMock title="Are you sure?" actions={<><Button appearance="outlined" tone="secondary" size="md">No</Button><Button size="md">Yes</Button></>} />,
        caption: '“Are you sure?” + Yes/No says nothing about what will happen.',
      },
    },
    {
      do: {
        example: <DialogMock title="Rename database" actions={<><Button appearance="outlined" tone="secondary" size="md">Cancel</Button><Button size="md">Rename</Button></>}>One field, one decision.</DialogMock>,
        caption: 'Small and finishable in one go.',
      },
      dont: {
        example: <DialogMock title="Edit site settings" actions={<Button size="md">Next</Button>}>Step 1 of 6 — General, Domains, Environment, Build, SSL, Backups…</DialogMock>,
        caption: 'A wizard in a dialog: no room, no URL, easy to lose with one Escape.',
      },
    },
  ],
  a11y: [
    'Focus moves into the dialog on open, stays inside while it’s open, and returns to the trigger on close.',
    <>Escape closes. <C>DialogTitle</C> is required — it’s the dialog’s accessible name.</>,
    'Don’t open a dialog from another dialog.',
    'The first focus goes to the first field, or to the least destructive action when there’s no field.',
  ],
};
