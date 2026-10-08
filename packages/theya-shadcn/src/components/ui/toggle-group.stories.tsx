import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'iconoir-react';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { toggleGroupGuidelines } from './toggle-group.guidelines';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Actions/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  parameters: { guidelines: toggleGroupGuidelines },
  argTypes: {
    appearance: { control: 'radio', options: ['tonal', 'outlined', 'ghost'], description: 'Flows to every item via context. Default ghost.' },
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Flows to every item via context.' },
    type: { control: 'inline-radio', options: ['single', 'multiple'], description: 'Single or multiple selection.' },
    value: { control: false, description: 'Controlled value(s) — a string for type="single", an array for type="multiple".' },
    defaultValue: { control: false, description: 'Uncontrolled initial value(s).' },
    onValueChange: { control: false, description: 'Fires with the new value(s) on selection change.' },
    disabled: { control: 'boolean', description: 'Disables every item in the group.' },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="left" appearance="outlined" aria-label="Text alignment">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole('radiogroup', { name: 'Text alignment' }));
    // type="single": Radix renders a radiogroup of radios, one checked at a time.
    const left = group.getByRole('radio', { name: 'Align left' });
    const center = group.getByRole('radio', { name: 'Align center' });
    await expect(left).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(center);
    await expect(center).toHaveAttribute('aria-checked', 'true');
    await expect(left).toHaveAttribute('aria-checked', 'false');
    // Roving focus: one tab stop, arrows move between items.
    await expect(center).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(group.getByRole('radio', { name: 'Align right' })).toHaveFocus();
  },
};

export const Tonal: Story = {
  render: () => (
    <ToggleGroup type="multiple" appearance="tonal" aria-label="Text style">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole('toolbar', { name: 'Text style' }));
    // type="multiple": Radix renders a toolbar of independent pressed buttons.
    const bold = group.getByRole('button', { name: 'Bold' });
    const italic = group.getByRole('button', { name: 'Italic' });
    await userEvent.click(bold);
    await userEvent.click(italic);
    await expect(bold).toHaveAttribute('aria-pressed', 'true');
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(bold);
    await expect(bold).toHaveAttribute('aria-pressed', 'false');
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Ghost: Story = {
  render: () => (
    <ToggleGroup type="multiple" appearance="ghost" aria-label="Text style">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
