import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { MaskedInput } from './masked-input';
import { maskedInputGuidelines } from './masked-input.guidelines';

const meta: Meta<typeof MaskedInput> = {
  title: 'Text Input/MaskedInput',
  component: MaskedInput,
  tags: ['autodocs'],
  parameters: {
    guidelines: maskedInputGuidelines,
    docs: {
      description: {
        component:
          'Not in the reference repo, and no headless library covers this shape — built from scratch. ' +
          'Formats as you type against a fixed pattern (phone, card, date, IP).',
      },
    },
  },
  argTypes: {
    mask: { control: 'text', description: 'Mask template, e.g. "+1 (___) ___-____" or "__/__/____".', table: { category: 'Behavior' } },
    replacement: {
      control: false,
      description: 'Placeholder-char to allowed-pattern map. Default { _: /\\d/ }. Pass a string like "#" as shorthand for { "#": /./ }.',
      table: { category: 'Behavior' },
    },
    showMask: { control: 'boolean', description: 'Show the full mask template while empty.', table: { category: 'Appearance' } },
    separate: { control: 'boolean', description: 'Keep entered characters in place when deleting in the middle.', table: { category: 'Behavior' } },
    track: { control: false, description: 'Conditionally transform the entered value before masking.', table: { category: 'Behavior' } },
    modify: { control: false, description: 'Conditionally tweak mask/replacement/showMask/separate before masking.', table: { category: 'Behavior' } },
    value: { control: 'text', description: 'Controlled masked value.', table: { category: 'State' } },
    defaultValue: { control: 'text', description: 'Uncontrolled initial masked value.', table: { category: 'State' } },
    onChange: { control: false, description: 'Fires with the change event on every input.', table: { category: 'Events' } },
    onUnmaskedChange: { control: false, description: 'Called with the raw value (mask literals stripped) on every change.', table: { category: 'Events' } },
    error: { control: 'text', description: 'Same error prop as TextField — turns the field danger-styled and can carry a message.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof MaskedInput>;

export const Default: Story = {
  args: {
    mask: '+1 (___) ___-____',
    defaultValue: '+1 (415) 555-2671',
    'aria-label': 'Phone number',
    className: 'w-[220px]',
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Phone number' });
    // The "1" in the mask prefix must not be re-read as user input.
    await expect(input).toHaveValue('+1 (415) 555-2671');
  },
};

export const Typing: Story = {
  args: {
    mask: '+1 (___) ___-____',
    'aria-label': 'Phone number',
    className: 'w-[220px]',
    onUnmaskedChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Phone number' });
    await expect(input).toHaveValue('');

    await userEvent.type(input, '4');
    await expect(input).toHaveValue('+1 (4');

    // Letters can't fill a digit slot — ignored.
    await userEvent.type(input, 'ab');
    await expect(input).toHaveValue('+1 (4');

    await userEvent.type(input, '15');
    // No trailing ") " after a finished group, so Backspace deletes the digit.
    await expect(input).toHaveValue('+1 (415');
    await userEvent.type(input, '{Backspace}');
    await expect(input).toHaveValue('+1 (41');
    await userEvent.type(input, '5');

    await userEvent.type(input, '5552671');
    await expect(input).toHaveValue('+1 (415) 555-2671');
    await expect(args.onUnmaskedChange).toHaveBeenLastCalledWith('4155552671');

    // Mask is full — extra digits are dropped.
    await userEvent.type(input, '9');
    await expect(input).toHaveValue('+1 (415) 555-2671');

    // Clearing leaves an empty field, not a stuck "+1 (" prefix.
    await userEvent.clear(input);
    await expect(input).toHaveValue('');
    await expect(args.onUnmaskedChange).toHaveBeenLastCalledWith('');
  },
};

export const Formats: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[220px]">
      <div>
        <p className="font-body text-body-s mb-1 text-[var(--color-text-text)]">Card number</p>
        <MaskedInput mask="____ ____ ____ ____" defaultValue="4242 4242 4242 4242" aria-label="Card number" />
      </div>
      <div>
        <p className="font-body text-body-s mb-1 text-[var(--color-text-text)]">Expiry</p>
        <MaskedInput mask="__/__" defaultValue="04/27" aria-label="Expiry" />
      </div>
      <div>
        <p className="font-body text-body-s mb-1 text-[var(--color-text-text)]">IPv4 address</p>
        <MaskedInput mask="___.___.___.___" defaultValue="192.168.000.001" aria-label="IPv4 address" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Card number' })).toHaveValue('4242 4242 4242 4242');
    await expect(canvas.getByRole('textbox', { name: 'IPv4 address' })).toHaveValue('192.168.000.001');

    const expiry = canvas.getByRole('textbox', { name: 'Expiry' });
    await expect(expiry).toHaveValue('04/27');
    await userEvent.clear(expiry);
    await userEvent.type(expiry, '1229');
    await expect(expiry).toHaveValue('12/29');
  },
};

export const Invalid: Story = {
  args: {
    mask: '+1 (___) ___-____',
    defaultValue: '+1 (415) 555',
    error: true,
    'aria-label': 'Phone number',
    className: 'w-[220px]',
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Phone number' });
    await expect(input).toHaveValue('+1 (415) 555');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};
