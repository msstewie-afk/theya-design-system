import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose } from './drawer';
import { Button } from './button';
import { Label } from './label';
import { TextField } from './text-field';
import { drawerGuidelines } from './drawer.guidelines';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   A real swipe-gesture bottom sheet on vaul - drag the handle or panel to
//   dismiss. Distinct from Sheet, which has no drag physics.
const meta: Meta<typeof Drawer> = {
  title: 'Overlays/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    guidelines: drawerGuidelines,
    docs: {
      description: {
        component: "A panel that slides up from the bottom of a phone screen for short, touch-first tasks — sort, filters, share — and is dismissed with a swipe.",
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

function RenameGalleryDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Rename gallery
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Rename gallery</DrawerTitle>
          <DrawerDescription>Clients see the new name in their portal.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-2">
            <Label htmlFor="drawer-gallery">Gallery name</Label>
            <TextField id="drawer-gallery" defaultValue="Golden hour" widthSize="full" />
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
  render: () => <RenameGalleryDrawer />,
};

/** width="fixed" caps the sheet at a centered max width on larger screens instead of spanning edge-to-edge. */
export const FixedWidth: Story = {
  name: 'Fixed width',
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Rename gallery
        </Button>
      </DrawerTrigger>
      <DrawerContent width="fixed">
        <DrawerHeader>
          <DrawerTitle>Rename gallery</DrawerTitle>
          <DrawerDescription>Clients see the new name in their portal.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-2">
            <Label htmlFor="drawer-gallery-fixed">Gallery name</Label>
            <TextField id="drawer-gallery-fixed" defaultValue="Golden hour" widthSize="full" />
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
          <DrawerTitle>Rename gallery</DrawerTitle>
          <DrawerDescription>Clients see the new name in their portal.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <div className="flex flex-col gap-2">
            <Label htmlFor="drawer-gallery-open">Gallery name</Label>
            <TextField id="drawer-gallery-open" defaultValue="Golden hour" widthSize="full" />
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


function AddGalleryDrawer({ direction }: { direction: 'left' | 'right' }) {
  return (
    <Drawer direction={direction}>
      <DrawerTrigger asChild>
        <Button appearance="filled" tone="primary">
          Add gallery
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pt-7 pb-0">
          <DrawerTitle>Add gallery</DrawerTitle>
          <DrawerDescription>Create a gallery and choose who manages its exports.</DrawerDescription>
        </DrawerHeader>
        {/* Outer gap (between Gallery/Ownership groups) is deliberately
            larger than each group's own internal gap, and matches the
            divider-to-"Gallery" distance (pt-6) - so the proximity rule reads
            correctly: content within a group sits closer together than the
            groups sit to each other. */}
        <DrawerBody className="gap-6 pt-6 pb-2">
          <div className="flex flex-col gap-3">
            <h3 className="font-body text-heading-xs font-semibold text-[var(--color-text-text)]">Gallery</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`gallery-name-${direction}`}>Gallery name</Label>
              <TextField id={`gallery-name-${direction}`} placeholder="Moonrise over Othrys" widthSize="lg" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-body text-heading-xs font-semibold text-[var(--color-text-text)]">Ownership</h3>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`owner-${direction}`}>Owner</Label>
              <TextField id={`owner-${direction}`} defaultValue="selin@aether.photo" widthSize="lg" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`client-link-${direction}`}>Client link</Label>
              <div className="flex items-center gap-2">
                <TextField id={`client-link-${direction}`} defaultValue="https://selene-weddings.aether.photo/g/4f9a2c" readOnly className="font-mono" widthSize="lg" />
                <Button appearance="outlined" tone="secondary">
                  Copy
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
              Add gallery
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/** A side drawer (up to 560px wide) for a form with a couple of sections. */
export const SideLeft: Story = {
  name: 'Side (left)',
  render: () => <AddGalleryDrawer direction="left" />,
};

/** Same side drawer, opening from the right edge instead. */
export const SideRight: Story = {
  name: 'Side (right)',
  render: () => <AddGalleryDrawer direction="right" />,
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const page = within(document.body);
    const trigger = within(canvasElement).getByRole('button', { name: 'Rename gallery' });
    await userEvent.click(trigger);
    const drawer = await page.findByRole('dialog', { name: 'Rename gallery' });
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true));
    // The built-in close button closes it and hands focus back.
    await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    // Escape too.
    await userEvent.click(trigger);
    await page.findByRole('dialog', { name: 'Rename gallery' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
  },
};
