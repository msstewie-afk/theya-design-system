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

const meta: Meta<typeof Dialog> = {
  title: 'Overlays/Dialog',
  component: Dialog,
  tags: ['autodocs'],
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
          Create site
        </Button>
      </DialogTrigger>
      <DialogContent gap="none">
        <DialogHeader showDivider={false}>
          <DialogTitle>Create site</DialogTitle>
          <DialogDescription>Point a domain at a new site. You can change the region later.</DialogDescription>
        </DialogHeader>
        <DialogBody showDivider className="flex-none pt-0 pb-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-domain">Domain</Label>
            <TextField id="new-domain" className="font-mono" placeholder="shop.seashell.dev" widthSize="full" />
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
              Create site
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  // Modal contract: named/described dialog, focus moves inside and stays
  // trapped under Tab, the X and Escape both close and return focus to the
  // trigger. Ends closed (an open modal aria-hides #storybook-root).
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const trigger = within(canvasElement).getByRole('button', { name: 'Create site' });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Create site' });
    await expect(dialog).toHaveAccessibleDescription('Point a domain at a new site. You can change the region later.');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.keyboard('{Enter}');
    await body.findByRole('dialog', { name: 'Create site' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
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
          <DialogTitle>Reissue certificate</DialogTitle>
          <DialogDescription>shop.seashell.dev will get a fresh 90-day certificate. This is non-destructive.</DialogDescription>
        </DialogHeader>
        <DialogFooter showDivider={false}>
          <DialogClose asChild>
            <Button appearance="outlined" tone="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="filled" tone="primary">
              Reissue certificate
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * REPRO (bug): a long description plus a row of three NumberFields.
 * DialogContent is a grid + overflow-y-auto, and a scroll container's single
 * implicit column has no min-width constraint, so the track expands to the
 * widest child's max-content (the description and the field row both exceed
 * the box), clipping content past max-w-lg on the right - the Seconds field
 * and footer buttons disappear. Fix: dialogContentVariants already carries
 * [&>*]:min-w-0 to pin the column to the box. Canvas-only like Open, since a
 * render-open dialog traps focus; this story is the VRT guard against the
 * regression returning.
 */
export const OverflowRepro: Story = {
  name: 'Overflow (repro)',
  render: (_args, context) => (
    <Dialog defaultOpen={context.viewMode !== 'docs'}>
      <DialogTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Reopen
        </Button>
      </DialogTrigger>
      <DialogContent gap="none">
        <DialogHeader showDivider={false}>
          <DialogTitle>Test mode</DialogTitle>
          <DialogDescription>
            Applies a new ruleset, then automatically reverts to the previous configuration if you don't confirm within a timeout.
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

const MIGRATION_STEPS = ['Start', 'Approve', 'Migrate', 'Review'];

/** The one forward action each step offers, in the step's own words. */
const MIGRATION_ACTIONS = ['Review plan', 'Start migration', 'View result'];

function MigrationStep({ step }: { step: number }) {
  if (step === 0) {
    return (
      <>
        <div className="flex flex-col gap-2">
          <Label htmlFor="wizard-source">Source configuration</Label>
          <TextField id="wizard-source" className="font-mono" defaultValue="/etc/csf/csf.conf" widthSize="full" />
        </div>
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
          We read the existing csf rules only. Nothing is changed on the server until you approve the plan on the next step.
        </p>
      </>
    );
  }
  if (step === 1) {
    return (
      <>
        <p className="font-body text-body-s text-[var(--color-text-text)]">
          42 allow rules, 18 deny rules and 6 port ranges will be converted. 3 rules have no Shield equivalent and will be skipped.
        </p>
        <div className="rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] p-4 font-mono text-body-s text-[var(--color-text-text-subtler)]">
          TCP_IN = 20,21,22,25,53,80,110,143,443
        </div>
      </>
    );
  }
  if (step === 2) {
    return (
      <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
        Applying the converted ruleset. This takes about a minute and keeps the current firewall active until the switch-over completes.
      </p>
    );
  }
  return (
    <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
      Shield is now enforcing 60 rules on <span className="font-mono">web-01.seashell.dev</span>. The previous csf configuration is kept as a backup for 30 days.
    </p>
  );
}

/**
 * The wizard takeover: DialogContent size="fullscreen" fills the viewport, so
 * a 4-step flow gets a page-like surface without leaving Dialog's modal
 * semantics (overlay, focus trap, Esc). The header carries the title and a
 * "Step n of 4" line; DialogBody takes the rest of the height and scrolls on
 * its own. No DialogFooter here: this flow moves forward on each step's own
 * action (there is no Back - the steps are not reversible once rules are
 * applied), and the X in the header is the single exit.
 */
function MigrationWizard() {
  const [step, setStep] = useState(0);
  const isLast = step === MIGRATION_STEPS.length - 1;

  return (
    <DialogContent size="full">
      <DialogHeader className="gap-2">
        <div className="flex flex-col gap-1 pr-10">
          <DialogTitle>Migrate to Firewall Shield</DialogTitle>
          <DialogDescription>
            Move firewall rules and bans from csf on <span className="font-mono">web-01.seashell.dev</span>.
          </DialogDescription>
        </div>
        <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">
          Step <span className="font-bold">{step + 1}</span> of <span className="font-bold">{MIGRATION_STEPS.length}</span>: {MIGRATION_STEPS[step]}
        </p>
      </DialogHeader>
      <DialogBody>
        <div className="flex w-full max-w-3xl flex-col gap-4">
          <MigrationStep step={step} />
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
              {MIGRATION_ACTIONS[step]}
            </Button>
          )}
        </div>
      </DialogBody>
    </DialogContent>
  );
}

/** A 4-step migration wizard in a fullscreen Dialog. Click to open, then step through. */
export const Fullscreen: Story = {
  name: 'Fullscreen wizard',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button appearance="filled" tone="primary">
          Migrate to Shield
        </Button>
      </DialogTrigger>
      <MigrationWizard />
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
      <MigrationWizard />
    </Dialog>
  ),
};
