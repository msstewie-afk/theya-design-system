import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose } from './drawer';
import { Button } from './button';
import { Label } from './label';
import { TextField } from './text-field';
import { Password } from './password';

const meta: Meta<typeof Drawer> = {
  title: 'Overlays/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A real swipe-gesture bottom sheet on vaul - drag the handle or panel to dismiss. Distinct from Sheet, which has no drag physics.',
      },
    },
  },
  argTypes: {
    direction: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'], description: 'Edge the drawer slides in from. Defaults to bottom.' },
    open: { control: false, description: 'Controlled open state.' },
    onOpenChange: { control: false, description: 'Fires when the drawer opens or closes.' },
    dismissible: { control: 'boolean', description: 'Allows closing by drag/overlay-click/Escape.' },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

function RenameSiteDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Rename site
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Rename site</DrawerTitle>
          <DrawerDescription>The new name is shown in the dashboard and in logs.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-2">
            <Label htmlFor="drawer-site">Site name</Label>
            <TextField id="drawer-site" defaultValue="acme-production" className="font-mono" widthSize="full" />
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button appearance="ghost" tone="secondary">
              Cancel
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button appearance="filled" tone="primary">
              Save changes
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/** Trigger opens a bottom sheet; Esc, the scrim, the X, or a swipe-down close it. */
export const Default: Story = {
  render: () => <RenameSiteDrawer />,
  play: async ({ canvasElement }) => {
    const page = within(document.body);
    const trigger = within(canvasElement).getByRole('button', { name: 'Rename site' });
    await userEvent.click(trigger);
    const drawer = await page.findByRole('dialog', { name: 'Rename site' });
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));
    // The built-in close button closes it and hands focus back.
    await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    // Escape too.
    await userEvent.click(trigger);
    await page.findByRole('dialog', { name: 'Rename site' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
  },
};

/** width="fixed" caps the sheet at a centered max width on larger screens, matching the reference's sheet width, instead of spanning edge-to-edge. */
export const FixedWidth: Story = {
  name: 'Fixed width',
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Rename site
        </Button>
      </DrawerTrigger>
      <DrawerContent width="fixed">
        <DrawerHeader>
          <DrawerTitle>Rename site</DrawerTitle>
          <DrawerDescription>The new name is shown in the dashboard and in logs.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-2">
            <Label htmlFor="drawer-site-fixed">Site name</Label>
            <TextField id="drawer-site-fixed" defaultValue="acme-production" className="font-mono" widthSize="full" />
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button appearance="ghost" tone="secondary">
              Cancel
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button appearance="filled" tone="primary">
              Save changes
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

/**
 * Render-open by default so the layout is visible without interaction.
 * Canvas-only in practice (vaul portals to <body> and traps focus), but kept
 * out of docs.disable via the same viewMode check used on Dialog - closed
 * in Docs, open in Canvas.
 */
export const Open: Story = {
  render: (_args, context) => (
    <Drawer defaultOpen={context.viewMode !== 'docs'}>
      <DrawerTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Reopen
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Rename site</DrawerTitle>
          <DrawerDescription>The new name is shown in the dashboard and in logs.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-2">
            <Label htmlFor="drawer-site-open">Site name</Label>
            <TextField id="drawer-site-open" defaultValue="acme-production" className="font-mono" widthSize="full" />
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button appearance="ghost" tone="secondary">
              Cancel
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button appearance="filled" tone="primary">
              Save changes
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};


function CreateWebsiteDrawer({ direction }: { direction: 'left' | 'right' }) {
  return (
    <Drawer direction={direction}>
      <DrawerTrigger asChild>
        <Button appearance="filled" tone="primary">
          Create website
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pt-7 pb-0">
          <DrawerTitle>Create website</DrawerTitle>
          <DrawerDescription>Set up a new domain and its administrator account.</DrawerDescription>
        </DrawerHeader>
        {/* Outer gap (between General/Administrator groups) is deliberately
            larger than each group's own internal gap, and matches the
            divider-to-"General" distance (pt-6) - so the proximity rule reads
            correctly: content within a group sits closer together than the
            groups sit to each other. */}
        <DrawerBody className="gap-6 pt-6 pb-2">
          <div className="flex flex-col gap-3">
            <h3 className="font-body text-heading-xs font-semibold text-[var(--color-text-text)]">General</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`domain-${direction}`}>Domain name</Label>
              <TextField id={`domain-${direction}`} placeholder="example.com" widthSize="lg" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-body text-heading-xs font-semibold text-[var(--color-text-text)]">Administrator</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`login-${direction}`}>Login</Label>
              <TextField id={`login-${direction}`} defaultValue="John Doe" widthSize="lg" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`password-${direction}`}>Password</Label>
              <div className="flex items-center gap-2">
                <Password id={`password-${direction}`} defaultValue="correct-horse-battery" widthSize="lg" />
                <Button appearance="outlined" tone="secondary">
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button appearance="ghost" tone="secondary">
              Cancel
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button appearance="filled" tone="primary">
              Create
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/** A wide side drawer (~720px) for a multi-section form, matching the reference's optimal width. */
export const SideLeft: Story = {
  name: 'Side (left)',
  render: () => <CreateWebsiteDrawer direction="left" />,
};

/** Same side drawer, opening from the right edge instead. */
export const SideRight: Story = {
  name: 'Side (right)',
  render: () => <CreateWebsiteDrawer direction="right" />,
};
