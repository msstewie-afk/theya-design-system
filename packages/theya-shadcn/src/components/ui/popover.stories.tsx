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
import { popoverGuidelines } from './popover.guidelines';
import { testOnly } from '../../lib/test-only';

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
  parameters: {
    docs: {
      description: {
        component:
          "A small panel tied to a control: a quick setting, a filter, a picker, extra details. People can close it without losing anything.",
      },
    },
    guidelines: popoverGuidelines,
    // Padded, not centred: the trigger sits at the start like in a real UI, so a
    // start-aligned panel lines up with it on a phone too.
    layout: 'padded',
  },
  argTypes: {
    modal: { control: 'boolean', description: 'Trap focus and block outside interaction while open.' },
    defaultOpen: { control: 'boolean', description: 'Open uncontrolled on mount.' },
    open: { control: false, description: 'Controlled open state.' },
    onOpenChange: { control: false, description: 'Fires when the popover opens or closes.' },
    children: { control: false, description: 'PopoverTrigger and PopoverContent.' },
    sheet: { control: 'boolean', description: 'Below 640px open as a bottom sheet (Drawer) instead of a floating panel. PopoverContent then takes `sheetTitle` (visible title) and `sheetClassName` (body classes). For lists, calendars and forms; not for suggestions under a field being typed in.' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const page = () => within(document.body);

/** A basic popover: the button opens a small panel with a title, a hint and two fields, and Escape or a click outside closes it. */
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
          <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Filter galleries</p>
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Status</legend>
            <Label className="items-center gap-2">
              <Checkbox defaultChecked />
              Published
            </Label>
            <Label className="items-center gap-2">
              <Checkbox />
              Draft
            </Label>
            <Label className="items-center gap-2">
              <Checkbox />
              Archived
            </Label>
          </fieldset>
        </div>
      </PopoverContent>
    </Popover>
  ),
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
            <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Download limits</p>
            <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">Applies to Golden hour on selene-weddings.aether.photo.</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="popover-downloads">Downloads per client</Label>
            <NumberField id="popover-downloads" defaultValue={50} min={1} max={500} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="popover-expiry">Link expiry (days)</Label>
            <NumberField id="popover-expiry" defaultValue={30} min={1} max={365} />
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <PopoverClose asChild>
              <Button size="md" appearance="outlined" tone="secondary">
                Cancel
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button size="md" appearance="filled" tone="primary">
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
        <Button appearance="outlined" tone="secondary" iconOnly aria-label="More options" leftIcon={<KebabIconHorizontal />} className="[&_svg]:text-[var(--color-icon-icon)]" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <div className="flex flex-col gap-1">
          <Button size="md" appearance="ghost" tone="secondary" className="justify-start">
            View details
          </Button>
          <Button size="md" appearance="ghost" tone="secondary" className="justify-start">
            Edit license
          </Button>
          <PopoverClose asChild>
            <Button size="md" appearance="ghost" tone="danger" className="justify-start">
              Unpublish gallery
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
              <Button size="md" appearance="outlined" tone="secondary" className="mt-3 w-full">
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
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open panel' }));
    await expect(canvas.getByText('true')).toBeInTheDocument();
    // PopoverClose closes through onOpenChange, and focus returns.
    await userEvent.click(await page().findByRole('button', { name: 'Done' }));
    await waitFor(() => expect(page().queryByRole('dialog')).toBeNull());
    await expect(canvas.getByText('false')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Open panel' })).toHaveFocus();
  }),
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
        <p className="font-body text-body-m text-[var(--color-text-text-subtler)]">Filter galleries by status and studio.</p>
      </PopoverContent>
    </Popover>
  ),
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
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
