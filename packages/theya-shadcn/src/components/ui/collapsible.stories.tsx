import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { NavArrowDown } from 'iconoir-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';
import { Button } from './button';
import { TextField } from './text-field';
import { collapsibleGuidelines } from './collapsible.guidelines';

const meta: Meta<typeof Collapsible> = {
  title: 'Layout/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
  parameters: { guidelines: collapsibleGuidelines },
  argTypes: {
    open: { control: false, description: 'Controlled open state.' },
    defaultOpen: { control: false, description: 'Uncontrolled initial open state.' },
    onOpenChange: { control: false, description: 'Fires when the region opens or closes.' },
    disabled: { control: 'boolean', description: 'Prevents opening/closing.' },
  },
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-[320px]">
      <CollapsibleTrigger asChild>
        <Button appearance="outlined" size="md" rightIcon={<NavArrowDown className={open ? 'rotate-180' : undefined} />}>
          Advanced settings
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2 font-body text-body-m text-[var(--color-text-text-subtler)]">
          Advanced settings content goes here.
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Controlled via `open`/`onOpenChange` — the parent owns the toggle and can drive it from anywhere (this is also the shape a real "show advanced settings" trigger uses). */
export const Default: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Advanced settings' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('Advanced settings content goes here.')).toBeNull();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // The trigger points at the region it controls.
    const content = canvas.getByText('Advanced settings content goes here.');
    await expect(content.closest(`#${CSS.escape(trigger.getAttribute('aria-controls') ?? '')}`)).not.toBeNull();

    // Keyboard toggles it closed again.
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Reveal optional fields under a form. The trigger sits inline below the always-visible field so the region reads as part of the form, not a separate panel. */
function ShowAdvancedSettingsDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-[320px]">
      <TextField label="Domain" placeholder="shop.seashell.dev" />
      <CollapsibleTrigger asChild>
        <Button appearance="outlined" size="md" className="mt-4" rightIcon={<NavArrowDown className={open ? 'rotate-180' : undefined} />}>
          Show advanced settings
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 pt-3">
          <TextField label="Custom hostname" placeholder="www.shop.seashell.dev" />
          <TextField label="Region" placeholder="eu-west-1" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export const ShowAdvancedSettings: Story = {
  name: 'Show advanced settings',
  render: () => <ShowAdvancedSettingsDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show advanced settings' }));
    // Revealed fields are real, reachable form fields.
    const host = await canvas.findByRole('textbox', { name: 'Custom hostname' });
    await userEvent.tab();
    await expect(host).toHaveFocus();
  },
};

/** `defaultOpen` — starts open uncontrolled, no `open`/`onOpenChange` needed. Collapsible is non-modal (no focus trap, doesn't hide siblings), so it's safe to render open here. */
export const Open: Story = {
  render: () => (
    <Collapsible defaultOpen className="w-[320px]">
      <CollapsibleTrigger asChild>
        <Button appearance="outlined" size="md" rightIcon={<NavArrowDown className="rotate-180" />}>
          Advanced settings
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2 font-body text-body-m text-[var(--color-text-text-subtler)]">
          Advanced settings content goes here.
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Advanced settings' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Advanced settings content goes here.')).toBeVisible();
  },
};

/** `disabled` on `Collapsible` blocks toggling and dims the trigger button; the region stays in whatever state it was last in. */
export const Disabled: Story = {
  render: () => (
    <Collapsible disabled className="w-[320px]">
      <CollapsibleTrigger asChild>
        <Button appearance="outlined" size="md" disabled rightIcon={<NavArrowDown />}>
          Advanced settings
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2 font-body text-body-m text-[var(--color-text-text-subtler)]">
          Advanced settings content goes here.
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Advanced settings' });
    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
