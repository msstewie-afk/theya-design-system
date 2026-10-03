import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { NumberField } from './number-field';
import { numberFieldGuidelines } from './number-field.guidelines';

const meta: Meta<typeof NumberField> = {
  title: 'Text Input/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  parameters: {
    guidelines: numberFieldGuidelines,
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
    widthSize: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'], description: 'sm 128px (default), md 224, lg 348, xl 500, full = container width.', table: { category: 'Appearance' } },
    heightSize: { control: 'inline-radio', options: ['md', 'sm'], description: 'md 40px (default), sm 32px for dense rows.', table: { category: 'Appearance' } },
    decrementLabel: { control: 'text', description: 'Accessible label for the decrement button.', table: { category: 'Content' } },
    incrementLabel: { control: 'text', description: 'Accessible label for the increment button.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Playground: Story = {
  args: { defaultValue: 0, 'aria-label': 'Quantity' },
  render: (args) => <NumberField {...args} />,
};

export const WithMinMax: Story = {
  name: 'With min/max',
  args: { defaultValue: 5, min: 0, max: 10, 'aria-label': 'Quantity (0-10)', onValueChange: fn() },
  render: (args) => <NumberField {...args} />,
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

/**
 * Typing edits a draft; the value is parsed, clamped and reported once on
 * blur or Enter. Empty input reverts, Escape discards, arrows step from the
 * draft. With min=5 you can type "12" without it snapping to 5 midway.
 */
export const TypingCommitsOnBlur: Story = {
  name: 'Typing commits on blur/Enter',
  args: { defaultValue: 10, min: 5, max: 50, 'aria-label': 'Replicas (5-50)', onValueChange: fn() },
  render: (args) => <NumberField {...args} />,
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('spinbutton', { name: 'Replicas (5-50)' });

    // "12" with min=5: no snapping while typing, one report on blur.
    await userEvent.clear(input);
    await userEvent.type(input, '12');
    await expect(input).toHaveValue('12');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(input).toHaveAttribute('aria-valuenow', '12');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(12);

    // Over max + Enter: clamped on commit.
    await userEvent.clear(input);
    await userEvent.type(input, '99{Enter}');
    await expect(input).toHaveValue('50');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(50);

    // Emptied then blurred: reverts, no report.
    await userEvent.clear(input);
    await expect(input).toHaveValue('');
    await userEvent.tab();
    await expect(input).toHaveValue('50');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);

    // Escape discards the draft.
    await userEvent.clear(input);
    await userEvent.type(input, '7{Escape}');
    await expect(input).toHaveValue('50');

    // Arrow steps from the draft on screen, not the last committed value.
    await userEvent.clear(input);
    await userEvent.type(input, '7');
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('8');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(8);
  },
};

export const Invalid: Story = {
  args: { defaultValue: 0, 'aria-label': 'Quantity', 'aria-invalid': true },
  render: (args) => <NumberField {...args} />,
};

export const Disabled: Story = {
  args: { defaultValue: 5, disabled: true, 'aria-label': 'Quantity' },
  render: (args) => <NumberField {...args} />,
};

/**
 * The width comes from the component, not its parent: sm by default, full
 * only when a fixed-width cell or column should decide. In a squeezed flex
 * row it stops at buttons + a 48px input instead of collapsing.
 */
export const Widths: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      {(['sm', 'md', 'lg'] as const).map((w) => (
        <NumberField key={w} widthSize={w} defaultValue={8} aria-label={`Width ${w}`} />
      ))}
      <NumberField heightSize="sm" defaultValue={8} aria-label="Width sm, height sm" />
      <div className="flex w-[200px] items-center gap-2 border border-dashed border-[var(--color-border-border-subtle)] p-2">
        <span className="font-body text-body-s text-[var(--color-text-text-subtle)]">Squeezed row</span>
        <NumberField defaultValue={8} aria-label="In a squeezed row" />
      </div>
    </div>
  ),
};
