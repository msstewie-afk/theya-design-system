import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Filter, ControlSlider } from 'iconoir-react';
import { KebabIconHorizontal } from './kebab-icon';
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from './popover';
import { Button } from './button';
import { TextField } from './text-field';
import { NumberField } from './number-field';
import { Label } from './label';
import { Checkbox } from './checkbox';
import { Separator } from './separator';

/**
 * Popover — a floating panel anchored to a trigger, on @radix-ui/react-popover.
 * The base for toolbar filters, faceted pickers and lightweight inline forms
 * (Combobox and Date picker compose it). Radix manages focus, ARIA
 * (aria-expanded/aria-controls), Esc + outside-click dismissal, and keeps the
 * portalled panel on-screen via collision handling. It's non-modal by
 * default; set `modal` to trap focus / block the page. For hover-only
 * preview cards use HoverCard; for a backdrop-blocking task use Dialog or
 * Drawer.
 */
const meta: Meta<typeof Popover> = {
  title: 'Overlays/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    modal: { control: 'boolean', description: 'Trap focus and block outside interaction while open.' },
    defaultOpen: { control: 'boolean', description: 'Open uncontrolled on mount.' },
    open: { control: false, description: 'Controlled open state.' },
    onOpenChange: { control: false, description: 'Fires when the popover opens or closes.' },
    children: { control: false, description: 'PopoverTrigger and PopoverContent.' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const page = () => within(document.body);

export const Playground: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Open popover
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Dimensions</p>
            <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">Set the dimensions for the layer.</p>
          </div>
          <TextField label="Width" placeholder="100%" widthSize="full" />
          <TextField label="Height" placeholder="25px" widthSize="full" />
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/** The default pattern: a trigger button opens a small panel of controls. */
export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button appearance="outlined" tone="secondary" leftIcon={<Filter />}>
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="flex flex-col gap-3">
          <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Filter sites</p>
          <fieldset className="flex flex-col gap-2.5">
            <legend className="sr-only">Status</legend>
            <Label className="items-center gap-2">
              <Checkbox defaultChecked />
              Running
            </Label>
            <Label className="items-center gap-2">
              <Checkbox />
              Suspended
            </Label>
            <Label className="items-center gap-2">
              <Checkbox />
              Error
            </Label>
          </fieldset>
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Filters' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    // The panel is named by its trigger, not an anonymous "dialog".
    const panel = await page().findByRole('dialog', { name: 'Filters' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Focus moves into the panel; Escape closes and returns it.
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page().queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

/** An inline edit form. A PopoverClose cancel + a save button anchor the footer. */
export const InlineForm: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button appearance="outlined" tone="secondary" leftIcon={<ControlSlider />}>
          Edit limits
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Resource limits</p>
            <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">Applies to shop.seashell.dev in eu-west-1.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="popover-cpu">CPU cores</Label>
            <NumberField id="popover-cpu" defaultValue={2} min={1} max={8} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="popover-memory">Memory (GB)</Label>
            <NumberField id="popover-memory" defaultValue={4} min={1} max={32} />
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <PopoverClose asChild>
              <Button appearance="outlined" tone="secondary">
                Cancel
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button appearance="filled" tone="primary">
                Save limits
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/** An icon-only trigger MUST carry an accessible name (aria-label) — Radix wires the rest of the ARIA relationship. */
export const IconTrigger: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button appearance="outlined" tone="secondary" iconOnly aria-label="More options" leftIcon={<KebabIconHorizontal />} className="[&_svg]:text-[var(--color-text-text)]" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <div className="flex flex-col gap-1">
          <Button appearance="ghost" tone="secondary" className="justify-start">
            View details
          </Button>
          <Button appearance="ghost" tone="secondary" className="justify-start">
            Reissue certificate
          </Button>
          <PopoverClose asChild>
            <Button appearance="ghost" tone="danger" className="justify-start">
              Suspend site
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/** Controlled open state: the parent owns `open` via `onOpenChange`, with a live readout. */
export const Controlled: Story = {
  render: function ControlledPopover(args) {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex flex-col items-center gap-3">
        <Popover {...args} open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button appearance="outlined" tone="secondary">
              {open ? 'Close panel' : 'Open panel'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">This panel&apos;s open state is owned by the parent component.</p>
            <PopoverClose asChild>
              <Button appearance="outlined" tone="secondary" className="mt-3 w-full">
                Done
              </Button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
        <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">
          State: <span className="font-mono text-[var(--color-text-text)]">{String(open)}</span>
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open panel' }));
    await expect(canvas.getByText('true')).toBeInTheDocument();
    // PopoverClose closes through onOpenChange, and focus returns.
    await userEvent.click(await page().findByRole('button', { name: 'Done' }));
    await waitFor(() => expect(page().queryByRole('dialog')).toBeNull());
    await expect(canvas.getByText('false')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Open panel' })).toHaveFocus();
  },
};

/** Render-open on mount via defaultOpen so the panel layout is visible without interaction. */
export const Open: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">Filter sites by status and region.</p>
      </PopoverContent>
    </Popover>
  ),
};
