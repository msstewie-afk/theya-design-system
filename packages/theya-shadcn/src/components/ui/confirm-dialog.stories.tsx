import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Refresh, WarningCircle } from 'iconoir-react';
import { Alert, AlertDescription } from './alert';
import { ConfirmDialog } from './confirm-dialog';
import { Button } from './button';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Overlays/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Dialog heading.', table: { category: 'Content' } },
    titleSize: { control: 'inline-radio', options: ['default', 'large'], description: 'Size of the title text.', table: { category: 'Appearance' } },
    description: { control: 'text', description: 'Body copy, in place of children.', table: { category: 'Content' } },
    showHeaderDivider: { control: 'boolean', description: 'Divider between the header and body.', table: { category: 'Appearance' } },
    showFooterDivider: { control: 'boolean', description: 'Divider between the body and footer.', table: { category: 'Appearance' } },
    contentGap: { control: 'inline-radio', options: ['default', 'compact', 'none'], description: 'Vertical spacing inside the body.', table: { category: 'Appearance' } },
    confirmValue: { control: 'text', description: 'Require the user to type this string exactly to enable the action.', table: { category: 'Behavior' } },
    confirmValueMono: {
      control: 'boolean',
      description: 'Monospace the typed value (a domain, slug, id, etc). Set false for a non-identifier value like an email. Defaults to true.',
      table: { category: 'Appearance' },
    },
    confirmLabel: { control: 'text', description: 'Label for the confirm button.', table: { category: 'Content' } },
    cancelLabel: { control: 'text', description: 'Label for the cancel button.', table: { category: 'Content' } },
    variant: { control: 'inline-radio', options: ['danger', 'default'], description: 'Color/intent of the confirm action.', table: { category: 'Appearance' } },
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
  render: () => (
    <ConfirmDialog
      title="Delete this server?"
      description="This action cannot be undone."
      trigger={
        <Button type="filled" intent="danger">
          Delete server
        </Button>
      }
      onConfirm={() => alert('Confirmed')}
    />
  ),
};

export const TypedConfirm: Story = {
  name: 'Typed confirm',
  render: () => (
    <ConfirmDialog
      title="Delete shop.seashell.dev?"
      description="This will permanently remove the site and all its data."
      confirmValue="shop.seashell.dev"
      showHeaderDivider={false}
      showFooterDivider={false}
      contentGap="none"
      trigger={
        <Button type="filled" intent="danger">
          Delete site
        </Button>
      }
      onConfirm={() => alert('Confirmed')}
    />
  ),
};

/** Without `confirmValue` and no `children`, it's a plain confirmation — no body at all, action enables immediately. A `default` variant suits a non-destructive decision like a restart. */
export const NonDestructive: Story = {
  name: 'Non-destructive',
  render: () => (
    <ConfirmDialog
      title="Restart server"
      description="Active connections will be dropped during the restart."
      variant="default"
      confirmLabel="Restart"
      confirmIcon={<Refresh />}
      trigger={
        <Button type="outlined" intent="secondary">
          Restart server
        </Button>
      }
      onConfirm={() => alert('Confirmed')}
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
        <Button type="filled" intent="danger">
          Delete api.seashell.dev
        </Button>
      }
      onConfirm={() => alert('Confirmed')}
    >
      <Alert variant="danger">
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
        <Button type="filled" intent="danger" onClick={() => setOpen(true)}>
          Reopen
        </Button>
        <ConfirmDialog
          title="Delete site"
          confirmValue="shop.seashell.dev"
          confirmLabel="Delete site"
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => alert('Confirmed')}
        >
          <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
            This permanently removes <span className="font-mono text-[var(--color-text-text)]">shop.seashell.dev</span> and its backups. This cannot be undone.
          </p>
        </ConfirmDialog>
      </div>
    );
  },
};
