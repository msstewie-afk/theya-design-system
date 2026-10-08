import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Refresh, WarningCircle } from 'iconoir-react';
import { Alert, AlertDescription } from './alert';
import { ConfirmDialog } from './confirm-dialog';
import { Button } from './button';
import { confirmDialogGuidelines } from './confirm-dialog.guidelines';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Overlays/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: { guidelines: confirmDialogGuidelines },
  argTypes: {
    title: { control: 'text', description: 'Dialog heading.', table: { category: 'Content' } },
    titleSize: { control: 'inline-radio', options: ['md', 'lg'], description: 'Size of the title text.', table: { category: 'Appearance' } },
    description: { control: 'text', description: 'Body copy, in place of children.', table: { category: 'Content' } },
    showHeaderDivider: { control: 'boolean', description: 'Divider between the header and body.', table: { category: 'Appearance' } },
    showFooterDivider: { control: 'boolean', description: 'Divider between the body and footer.', table: { category: 'Appearance' } },
    contentGap: { control: 'inline-radio', options: ['md', 'sm', 'none'], description: 'Vertical spacing inside the body.', table: { category: 'Appearance' } },
    confirmValue: { control: 'text', description: 'Require the user to type this string exactly to enable the action.', table: { category: 'Behavior' } },
    confirmValueMono: {
      control: 'boolean',
      description: 'Monospace the typed value (a domain, slug, id, etc). Set false for a non-identifier value like an email. Defaults to true.',
      table: { category: 'Appearance' },
    },
    confirmLabel: { control: 'text', description: 'Label for the confirm button.', table: { category: 'Content' } },
    cancelLabel: { control: 'text', description: 'Label for the cancel button.', table: { category: 'Content' } },
    tone: { control: 'inline-radio', options: ['danger', 'neutral'], description: 'Color/tone of the confirm action.', table: { category: 'Appearance' } },
    confirmIcon: { control: false, description: 'Optional icon on the confirm button.', table: { category: 'Content' } },
    onConfirm: { control: false, description: 'Called when the confirm action is activated.', table: { category: 'Events' } },
    trigger: { control: false, description: 'Element that opens the dialog when clicked.', table: { category: 'Content' } },
    open: { control: false, description: 'Controlled open state.', table: { category: 'State' } },
    onOpenChange: { control: false, description: 'Fires when the dialog opens or closes.', table: { category: 'Events' } },
    children: { control: false, description: 'Custom body content, in place of the description prop.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  args: { onConfirm: fn() },
  render: (args) => (
    <ConfirmDialog
      title="Delete this server?"
      description="This action cannot be undone."
      trigger={
        <Button appearance="filled" tone="danger">
          Delete server
        </Button>
      }
      onConfirm={args.onConfirm}
    />
  ),
  // Opens as a modal alertdialog with focus inside; Escape cancels and
  // returns focus to the trigger; the action confirms and closes.
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Delete server' });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('alertdialog', { name: 'Delete this server?' });
    await expect(dialog).toHaveAccessibleDescription('This action cannot be undone.');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(args.onConfirm).not.toHaveBeenCalled();

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('button', { name: 'Delete' }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull());
  },

};

export const TypedConfirm: Story = {
  name: 'Typed confirm',
  args: { onConfirm: fn() },
  render: (args) => (
    <ConfirmDialog
      title="Delete shop.seashell.dev?"
      description="This will permanently remove the site and all its data."
      confirmValue="shop.seashell.dev"
      showHeaderDivider={false}
      showFooterDivider={false}
      contentGap="none"
      trigger={
        <Button appearance="filled" tone="danger">
          Delete site
        </Button>
      }
      onConfirm={args.onConfirm}
    />
  ),
  // The action stays disabled until the exact value is typed; the field
  // resets when the dialog closes.
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Delete site' }));
    const dialog = await body.findByRole('alertdialog', { name: 'Delete shop.seashell.dev?' });
    const field = within(dialog).getByRole('textbox', { name: /to confirm/ });
    const action = within(dialog).getByRole('button', { name: 'Delete' });
    await expect(action).toBeDisabled();

    await userEvent.type(field, 'shop.seashell');
    await expect(action).toBeDisabled();
    await userEvent.type(field, '.dev');
    await expect(action).toBeEnabled();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull());
    await expect(args.onConfirm).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Delete site' }));
    const reopened = await body.findByRole('alertdialog');
    await expect(within(reopened).getByRole('textbox', { name: /to confirm/ })).toHaveValue('');
    // Leave it closed: an open modal aria-hides #storybook-root, which the
    // post-play axe scan would read as aria-hidden-focus on the trigger.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('alertdialog')).toBeNull());
  },

};

/** Without `confirmValue` and no `children`, it's a plain confirmation — no body at all, action enables immediately. A `neutral` tone suits a non-destructive decision like a restart. */
export const NonDestructive: Story = {
  name: 'Non-destructive',
  render: () => (
    <ConfirmDialog
      title="Restart server"
      description="Active connections will be dropped during the restart."
      tone="neutral"
      confirmLabel="Restart"
      confirmIcon={<Refresh />}
      trigger={
        <Button appearance="outlined" tone="secondary">
          Restart server
        </Button>
      }
      onConfirm={() => console.log('Confirmed')}
    />
  ),
};

/** A short consequences summary in `children` sits above the typed-confirm field, announcing the cost of the action before the user commits. */
export const WithConsequences: Story = {
  name: 'With consequences',
  render: () => (
    <ConfirmDialog
      title="Delete api.seashell.dev?"
      confirmValue="api.seashell.dev"
      showHeaderDivider={false}
      showFooterDivider={false}
      contentGap="none"
      trigger={
        <Button appearance="filled" tone="danger">
          Delete api.seashell.dev
        </Button>
      }
      onConfirm={() => console.log('Confirmed')}
    >
      <Alert tone="danger">
        <WarningCircle />
        <AlertDescription>
          Deleting <span className="font-mono text-[var(--color-text-text)]">api.seashell.dev</span> removes 902,540 requests/day of routing,
          its TLS certificate, and 12 deploy snapshots. This cannot be undone.
        </AlertDescription>
      </Alert>
    </ConfirmDialog>
  ),
};

/**
 * Controlled + open by default so the layout is visible without interaction.
 * Canvas-only (not meant for the combined autodocs page): an always-open alertdialog
 * traps focus and aria-hides its siblings, which would make the rest of the Docs
 * page unreachable.
 */
export const Open: Story = {
  parameters: { docs: { disable: true } },
  render: function OpenStory() {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex flex-col items-center gap-3">
        <Button appearance="filled" tone="danger" onClick={() => setOpen(true)}>
          Reopen
        </Button>
        <ConfirmDialog
          title="Delete site"
          confirmValue="shop.seashell.dev"
          confirmLabel="Delete site"
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => console.log('Confirmed')}
        >
          <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
            This permanently removes <span className="font-mono text-[var(--color-text-text)]">shop.seashell.dev</span> and its backups. This cannot be undone.
          </p>
        </ConfirmDialog>
      </div>
    );
  },
};
