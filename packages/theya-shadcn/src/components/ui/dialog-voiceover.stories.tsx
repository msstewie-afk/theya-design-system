import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './dialog';
import { Button } from './button';
import { TextField } from './text-field';

/**
 * Temporary test page for the VoiceOver + Safari 26 dialog problem
 * (WebKit bugs 311125 and 282773): the VoiceOver cursor stays behind an open
 * modal, so the title and description can't be reached with VO + arrows.
 * Five ways of opening the same dialog; the one that works goes into
 * Dialog / AlertDialog / ConfirmDialog, and this file is removed.
 */
const meta: Meta = {
  title: 'Overlays/Dialog/VoiceOver test',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

function Body({ fieldRef }: { fieldRef?: React.Ref<HTMLInputElement> }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Create site</DialogTitle>
        <DialogDescription>Point a domain at a new site. You can change the region later.</DialogDescription>
      </DialogHeader>
      <TextField ref={fieldRef} label="Domain" placeholder="example.com" />
      <DialogFooter>
        <DialogClose asChild>
          <Button appearance="outlined" tone="secondary">Cancel</Button>
        </DialogClose>
        <Button>Create</Button>
      </DialogFooter>
    </>
  );
}

/** A: today's Dialog, unchanged. Radix focuses the first field. */
function VariantA() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>A — current</Button></DialogTrigger>
      <DialogContent><Body /></DialogContent>
    </Dialog>
  );
}

/** B: aria-modal="true" on the dialog (Radix doesn't set it). */
function VariantB() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>B — aria-modal</Button></DialogTrigger>
      <DialogContent aria-modal="true"><Body /></DialogContent>
    </Dialog>
  );
}

/** C: aria-modal, and focus goes to the dialog itself, not the first field. */
function VariantC() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>C — focus the dialog</Button></DialogTrigger>
      <DialogContent
        aria-modal="true"
        className="focus-visible:outline-none"
        onOpenAutoFocus={(event) => {
          // The event is dispatched on the dialog element itself.
          event.preventDefault();
          (event.target as HTMLElement | null)?.focus();
        }}
      >
        <Body />
      </DialogContent>
    </Dialog>
  );
}

/** D: aria-modal, and focus moves to the first field a moment later (300 ms). */
function VariantD() {
  const field = useRef<HTMLInputElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild><Button>D — delayed focus</Button></DialogTrigger>
      <DialogContent
        aria-modal="true"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          window.setTimeout(() => field.current?.focus(), 300);
        }}
      >
        <Body fieldRef={field} />
      </DialogContent>
    </Dialog>
  );
}

/** E: the browser's own <dialog> with showModal(), no Radix, as a baseline. */
function VariantE() {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button onClick={() => ref.current?.showModal()}>E — native dialog</Button>
      <dialog
        ref={ref}
        aria-labelledby="vo-native-title"
        aria-describedby="vo-native-desc"
        className="m-auto max-w-md rounded-[var(--size-border-radius-border-radius-xl)] border-0 bg-[var(--color-bg-surface-bg-surface-overlay)] p-6 text-[var(--color-text-text)] backdrop:bg-black/50"
      >
        <div className="flex flex-col gap-4">
          <h2 id="vo-native-title" className="m-0 font-heading text-heading-s">Create site</h2>
          <p id="vo-native-desc" className="m-0 text-body-m text-[var(--color-text-text-subtle)]">Point a domain at a new site. You can change the region later.</p>
          <TextField label="Domain" placeholder="example.com" />
          <div className="flex justify-end gap-2">
            <Button appearance="outlined" tone="secondary" onClick={() => ref.current?.close()}>Cancel</Button>
            <Button onClick={() => ref.current?.close()}>Create</Button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/** Open each one with VoiceOver on (Tab to the button, then Space) and note which one reads the title and description, and lets VO + arrows reach them. */
export const Variants: StoryObj = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <VariantA />
      <VariantB />
      <VariantC />
      <VariantD />
      <VariantE />
    </div>
  ),
};
