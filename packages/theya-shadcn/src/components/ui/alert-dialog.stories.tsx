import type { Meta, StoryObj } from '@storybook/react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';
import { Button } from './button';
import { Trash } from 'iconoir-react';

const meta: Meta<typeof AlertDialog> = {
  title: 'Overlays/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state — pair with `onOpenChange`.',
      table: { category: 'State' },
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Uncontrolled initial open state.',
      table: { category: 'State' },
    },
    onOpenChange: {
      control: false,
      description: 'Fires whenever the dialog opens or closes (trigger click, Cancel, Action, or Escape).',
      table: { category: 'Events' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button appearance="filled" tone="danger">
          Delete server
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this server?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone. All data will be permanently removed.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/** A non-destructive confirm — pass a non-danger intent to AlertDialogAction to override its danger default. */
export const NonDestructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Reissue certificate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reissue certificate?</AlertDialogTitle>
          <AlertDialogDescription>
            shop.seashell.dev gets a fresh 90-day certificate. The current one keeps working until the new one is installed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction appearance="filled" tone="primary">Reissue certificate</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

/**
 * Render-open by default so the layout is visible without interaction. Canvas-only —
 * excluded from the combined autodocs page since an always-open modal traps focus and
 * aria-hides its siblings, which would make the rest of the Docs page unreachable.
 */
export const Open: Story = {
  parameters: { docs: { disable: true } },
  render: () => (
    <AlertDialog defaultOpen>
      <AlertDialogTrigger asChild>
        <Button appearance="filled" tone="danger">
          Delete API token
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this API token?</AlertDialogTitle>
          <AlertDialogDescription>
            Any integration using this token stops working immediately. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep token</AlertDialogCancel>
          <AlertDialogAction>
            <Trash />
            Delete token
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
