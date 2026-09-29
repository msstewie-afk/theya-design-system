import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { NumberField } from './number-field';

const meta: Meta<typeof NumberField> = {
  title: 'Forms/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'No Radix (or other headless-primitive) equivalent exists — built from scratch. Deferred: ' +
          'Alt-for-smaller-step, Home/End jump-to-bound, press-and-hold repeat on the buttons.',
      },
    },
  },
  argTypes: {
    value: { control: false, description: 'Controlled value.', table: { category: 'State' } },
    defaultValue: { control: { type: 'number' }, description: 'Uncontrolled initial value.', table: { category: 'State' } },
    onValueChange: { control: false, description: 'Fires with the new value on change.', table: { category: 'Events' } },
    min: { control: { type: 'number' }, description: 'Minimum allowed value.', table: { category: 'Behavior' } },
    max: { control: { type: 'number' }, description: 'Maximum allowed value.', table: { category: 'Behavior' } },
    step: { control: { type: 'number' }, description: 'Increment/decrement amount.', table: { category: 'Behavior' } },
    disabled: { control: 'boolean', description: 'Disables the field and its stepper buttons.', table: { category: 'State' } },
    placeholder: { control: 'text', description: 'Placeholder text shown when empty.', table: { category: 'Content' } },
    widthSize: { control: false, description: "Matches TextField's width scale. Defaults to 'full'.", table: { category: 'Appearance' } },
    decrementLabel: { control: 'text', description: 'Accessible label for the decrement button.', table: { category: 'Content' } },
    incrementLabel: { control: 'text', description: 'Accessible label for the increment button.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Playground: Story = {
  args: { defaultValue: 0, 'aria-label': 'Quantity' },
  render: (args) => (
    <div className="w-[160px]">
      <NumberField {...args} />
    </div>
  ),
};

export const WithMinMax: Story = {
  name: 'With min/max',
  args: { defaultValue: 5, min: 0, max: 10, 'aria-label': 'Quantity (0-10)', onValueChange: fn() },
  render: (args) => (
    <div className="w-[160px]">
      <NumberField {...args} />
    </div>
  ),
  // Arrow keys step (Shift = 10x), values clamp to min/max, the stepper
  // buttons disable at the bounds, and the spinbutton reports its range.
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: 'Quantity (0-10)' });
    const increase = canvas.getByRole('button', { name: 'Increase' });
    const decrease = canvas.getByRole('button', { name: 'Decrease' });
    await expect(input).toHaveAttribute('aria-valuemin', '0');
    await expect(input).toHaveAttribute('aria-valuemax', '10');

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveAttribute('aria-valuenow', '6');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(6);

    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await expect(input).toHaveValue('10');
    await expect(increase).toBeDisabled();

    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');
    await expect(input).toHaveValue('0');
    await expect(decrease).toBeDisabled();

    await userEvent.click(increase);
    await userEvent.click(increase);
    await expect(input).toHaveAttribute('aria-valuenow', '2');
    await expect(decrease).toBeEnabled();
  },
};

export const Invalid: Story = {
  args: { defaultValue: 0, 'aria-label': 'Quantity', 'aria-invalid': true },
  render: (args) => (
    <div className="w-[160px]">
      <NumberField {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: 5, disabled: true, 'aria-label': 'Quantity' },
  render: (args) => (
    <div className="w-[160px]">
      <NumberField {...args} />
    </div>
  ),
};
