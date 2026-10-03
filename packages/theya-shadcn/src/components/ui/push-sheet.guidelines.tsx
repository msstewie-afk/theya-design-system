import { useState, type ReactNode } from 'react';
import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Button } from './button';
import { PushSheet, PushSheetBody, PushSheetClose, PushSheetHeader, PushSheetTitle } from './push-sheet';

const ROW = 'rounded-[var(--size-border-radius-border-radius-md)] px-2 py-1 text-left text-[var(--color-text-text)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtler)] focus-visible:outline-none focus-visible:focus-ring';

function Example({ title, body }: { title: string; body: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-56 w-[30rem] max-w-full overflow-hidden rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)]">
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 font-body text-body-m">
        {['shop.seashell.dev', 'api.seashell.dev', 'docs.seashell.dev'].map((s) => (
          <button key={s} type="button" className={ROW} onClick={() => setOpen(true)}>{s}</button>
        ))}
      </div>
      <PushSheet open={open} onOpenChange={setOpen} width="14rem">
        <PushSheetHeader>
          <PushSheetTitle>{title}</PushSheetTitle>
          <PushSheetClose asChild><Button appearance="ghost" tone="secondary" size="sm">Close</Button></PushSheetClose>
        </PushSheetHeader>
        <PushSheetBody>{body}</PushSheetBody>
      </PushSheet>
    </div>
  );
}

export const pushSheetGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Details of a selected item beside the list, while the list stays usable: inspect, compare, pick the next one.'],
  whenNotToUse: [
    { text: 'Tasks that must be finished or cancelled', instead: 'Dialog' },
    { text: 'Confirmations', instead: 'AlertDialog' },
  ],
  anatomy: [
    { part: 'Panel', description: <>in the page flow, pushes content aside; <C>side</C>, <C>width</C>. Below md it turns into a modal.</> },
    { part: 'Header', description: <><C>PushSheetTitle</C> and <C>PushSheetClose</C>.</> },
    { part: 'Body / footer', description: 'scrolls on its own.' },
  ],
  doDont: [
    {
      do: {
        example: <Example title="shop.seashell.dev" body={<p className="font-body text-body-s text-[var(--color-text-text-subtle)]">Running · eu-west-1. Click another site to switch.</p>} />,
        caption: 'Click a site: details open beside the list, which stays clickable.',
      },
      dont: {
        example: <Example title="Delete site?" body={<Button appearance="filled" tone="danger" size="sm">Delete</Button>} />,
        caption: 'A destructive confirmation in a non-modal panel: easy to ignore, easy to hit by accident.',
      },
    },
  ],
  a11y: [
    'Not modal: no focus trap, the page stays interactive.',
    'Opening should move focus into the panel; Close returns it to what opened it.',
  ],
};
