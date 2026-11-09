import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ArrowRight } from 'iconoir-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';
import { Button } from './button';
import { Label } from './label';
import { TextField } from './text-field';
import { NumberField } from './number-field';
import { dialogGuidelines } from './dialog.guidelines';

const meta: Meta<typeof Dialog> = {
  title: 'Overlays/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A short, focused task that needs an answer before going on — rename, invite, a form of a few fields — without leaving the page.",
      },
    },
    guidelines: dialogGuidelines,
  },
  argTypes: {
    open: { control: false, description: 'Controlled open state.' },
    defaultOpen: { control: false, description: 'Uncontrolled initial open state.' },
    onOpenChange: { control: false, description: 'Fires when the dialog opens or closes (trigger click, Cancel, overlay click, or Escape).' },
    modal: { control: 'boolean', description: 'Modal (default): traps focus, scroll-locks, blocks outside interaction. False for a non-modal dialog.' },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

/**
 * A form modal: trigger -> header -> body -> footer. Header/footer dividers
 * are off and the single divider sits between body and footer (the same
 * pattern established on ConfirmDialog's "With consequences" story), with
 * gap="none" on DialogContent so it reads as one continuous line.
 */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button appearance="filled" tone="primary">
          Create gallery
        </Button>
      </DialogTrigger>
      <DialogContent gap="none">
        <DialogHeader showDivider={false}>
          <DialogTitle>Create gallery</DialogTitle>
          <DialogDescription>Add a gallery for a client shoot. You can move it to another studio later.</DialogDescription>
        </DialogHeader>
        <DialogBody showDivider className="flex-none pt-0 pb-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-gallery">Gallery name</Label>
            <TextField id="new-gallery" placeholder="Golden hour" widthSize="full" />
          </div>
        </DialogBody>
        <DialogFooter showDivider={false}>
          <DialogClose asChild>
            <Button appearance="outlined" tone="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="filled" tone="primary">
              Create gallery
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  // Modal contract: named/described dialog, focus moves inside and stays
  // trapped under Tab, the X and Escape both close and return focus to the
  // trigger. Ends closed (an open modal aria-hides #storybook-root).,
};

/**
 * Render-open by default so the layout is visible without interaction.
 * Canvas-only (docs.disable): an always-open Radix Dialog traps focus and
 * aria-hides siblings, which would make the other stories, prose, and
 * Controls on the Docs page unreachable.
 */
export const Open: Story = {
  render: (_args, context) => (
    <Dialog defaultOpen={context.viewMode !== 'docs'}>
      <DialogTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Reopen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader showDivider={false}>
          <DialogTitle>Renew license</DialogTitle>
          <DialogDescription>Rhea Okafor’s print license for Golden hour is renewed for 12 months. This is non-destructive.</DialogDescription>
        </DialogHeader>
        <DialogFooter showDivider={false}>
          <DialogClose asChild>
            <Button appearance="outlined" tone="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="filled" tone="primary">
              Renew license
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * A long description and a row of three NumberFields stay inside the
 * dialog: the content column never grows past `max-w-lg`, so the last field
 * and the footer buttons stay in view. Opens on the canvas only, like Open,
 * because an open dialog traps focus; the visual test watches this layout.
 */
export const OverflowRepro: Story = {
  name: 'Long content',
  render: (_args, context) => (
    <Dialog defaultOpen={context.viewMode !== 'docs'}>
      <DialogTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Reopen
        </Button>
      </DialogTrigger>
      <DialogContent gap="none">
        <DialogHeader showDivider={false}>
          <DialogTitle>Preview link</DialogTitle>
          <DialogDescription>
            Sends the client a preview of the gallery, then automatically turns the link off if it isn't opened within this time.
          </DialogDescription>
        </DialogHeader>
        <DialogBody showDivider className="flex-none pt-0 pb-5">
          {/* Row of three on wide screens; stacks to one column under sm. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="repro-hours">Hours</Label>
              <NumberField id="repro-hours" className="w-full" defaultValue={0} min={0} max={23} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="repro-minutes">Minutes</Label>
              <NumberField id="repro-minutes" className="w-full" defaultValue={5} min={0} max={59} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="repro-seconds">Seconds</Label>
              <NumberField id="repro-seconds" className="w-full" defaultValue={0} min={0} max={59} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter showDivider={false}>
          <DialogClose asChild>
            <Button appearance="outlined" tone="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="filled" tone="primary">
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

const MOVE_STEPS = ['Start', 'Approve', 'Move', 'Review'];

/** The one forward action each step offers, in the step's own words. */
const MOVE_ACTIONS = ['Review plan', 'Start move', 'View result'];

function MoveStep({ step }: { step: number }) {
  if (step === 0) {
    return (
      <>
        <div className="flex flex-col gap-2">
          <Label htmlFor="wizard-target">Target studio</Label>
          <TextField id="wizard-target" defaultValue="Studio L4" widthSize="full" />
        </div>
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
          We only read the gallery's files at this point. Nothing changes for clients until you approve the plan on the next step.
        </p>
      </>
    );
  }
  if (step === 1) {
    return (
      <>
        <p className="font-body text-body-s text-[var(--color-text-text)]">
          412 photos (38.6 GB), 24 client favorites and 3 print licenses will be moved. 1 client portal needs its link updated afterwards.
        </p>
        <div className="rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] p-4 font-body text-body-s text-[var(--color-text-text-subtler)]">
          Moonrise over Othrys · Othrys Lodge → Studio L4
        </div>
      </>
    );
  }
  if (step === 2) {
    return (
      <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
        Copying photos and switching client access. This takes a few minutes; the current studio keeps serving the gallery until the switch-over completes.
      </p>
    );
  }
  return (
    <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
      Moonrise over Othrys now lives in Studio L4. The copy in Othrys Lodge is kept for 30 days.
    </p>
  );
}

/**
 * The wizard takeover: DialogContent size="fullscreen" fills the viewport, so
 * a 4-step flow gets a page-like surface without leaving Dialog's modal
 * semantics (overlay, focus trap, Esc). The header carries the title and a
 * "Step n of 4" line; DialogBody takes the rest of the height and scrolls on
 * its own. No DialogFooter here: this flow moves forward on each step's own
 * action (there is no Back - the steps are not reversible once client
 * access has switched), and the X in the header is the single exit.
 */
function MoveWizard() {
  const [step, setStep] = useState(0);
  const isLast = step === MOVE_STEPS.length - 1;

  return (
    <DialogContent size="full">
      <DialogHeader className="gap-2">
        <div className="flex flex-col gap-1 pr-10">
          <DialogTitle>Move gallery to another studio</DialogTitle>
          <DialogDescription>
            Move Moonrise over Othrys from Othrys Lodge with its photos and settings.
          </DialogDescription>
        </div>
        <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">
          Step <span className="font-bold">{step + 1}</span> of <span className="font-bold">{MOVE_STEPS.length}</span>: {MOVE_STEPS[step]}
        </p>
      </DialogHeader>
      <DialogBody>
        <div className="flex w-full max-w-3xl flex-col gap-4">
          <MoveStep step={step} />
          {isLast ? (
            <DialogClose asChild>
              <Button appearance="filled" tone="primary" className="mt-2 self-start">
                Done
              </Button>
            </DialogClose>
          ) : (
            <Button
              appearance="filled"
              tone="primary"
              className="mt-2 self-start"
              rightIcon={<ArrowRight />}
              onClick={() => setStep((s) => s + 1)}
            >
              {MOVE_ACTIONS[step]}
            </Button>
          )}
        </div>
      </DialogBody>
    </DialogContent>
  );
}

/** A 4-step wizard in a fullscreen Dialog. Click to open, then step through. */
export const Fullscreen: Story = {
  name: 'Fullscreen wizard',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button appearance="filled" tone="primary">
          Move gallery
        </Button>
      </DialogTrigger>
      <MoveWizard />
    </Dialog>
  ),
};

/**
 * Render-open so the fullscreen layout is visible without interaction, and
 * canvas-only (docs.disable) for the same reason as Open: an always-open
 * Dialog traps focus and aria-hides the rest of the Docs page.
 */
export const FullscreenOpen: Story = {
  name: 'Fullscreen wizard (open)',
  render: (_args, context) => (
    <Dialog defaultOpen={context.viewMode !== 'docs'}>
      <DialogTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Reopen
        </Button>
      </DialogTrigger>
      <MoveWizard />
    </Dialog>
  ),
};

/** The Figma component's own sample, open at rest: what the Figma visual diff compares against (scripts/figma-visual). */
function FigmaReferenceDialog({ size, open }: { size: 'md' | 'full'; open: boolean }) {
  return (
    <Dialog defaultOpen={open}>
      <DialogTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Reopen
        </Button>
      </DialogTrigger>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>Short description of what this dialog is for.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="h-[120px] rounded-[var(--size-border-radius-border-radius-lg)] border border-dashed border-[var(--color-border-border)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]" />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button appearance="tonal" tone="neutral" size="md">
              Cancel
            </Button>
          </DialogClose>
          <Button size="md">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const FigmaReference: Story = {
  name: 'Figma reference',
  tags: ['!autodocs'],
  render: (_args, context) => <FigmaReferenceDialog size="md" open={context.viewMode !== 'docs'} />,
};

/** The full-screen Figma sample, open at rest (scripts/figma-visual). */
export const FigmaReferenceFull: Story = {
  name: 'Figma reference (full)',
  tags: ['!autodocs'],
  render: (_args, context) => <FigmaReferenceDialog size="full" open={context.viewMode !== 'docs'} />,
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const trigger = within(canvasElement).getByRole('button', { name: 'Create gallery' });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Create gallery' });
    await expect(dialog).toHaveAccessibleDescription('Add a gallery for a client shoot. You can move it to another studio later.');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.keyboard('{Enter}');
    await body.findByRole('dialog', { name: 'Create gallery' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
