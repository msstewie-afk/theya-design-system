import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';

// Radix RadioGroup checks the newly focused radio only while an arrow key is
// still held down (it moves focus a frame later and reads a keydown/keyup
// flag). userEvent's instant down+up releases the key before that frame, so
// hold it like a real key press until the move has landed.
async function pressArrow(key: 'ArrowDown' | 'ArrowUp', target: () => HTMLElement) {
  await userEvent.keyboard(`{${key}>}`);
  await waitFor(() => expect(target()).toHaveFocus());
  await userEvent.keyboard(`{/${key}}`);
}
import { RadioGroup, Radio } from './radio';

const meta: Meta<typeof Radio> = {
  title: 'Selection/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: { component: 'Built on Radix RadioGroup. Wrap `Radio` items in `RadioGroup`.' },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Label text next to the radio.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Secondary helper line under the label.', table: { category: 'Content' } },
    disabled: { control: 'boolean', description: 'Disables the radio.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Playground: Story = {
  render: () => (
    <RadioGroup defaultValue="a" className="flex flex-col gap-3">
      <Radio value="a" label="Option A" />
      <Radio value="b" label="Option B" />
      <Radio value="c" label="Option C" />
    </RadioGroup>
  ),
  // One Tab stop on the checked radio; arrows move AND select, wrapping.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [a, b, c] = ['Option A', 'Option B', 'Option C'].map((name) => canvas.getByRole('radio', { name }));

    await userEvent.tab();
    await expect(a).toHaveFocus();
    await expect(a).toBeChecked();

    await pressArrow('ArrowDown', () => b);
    await waitFor(() => expect(b).toBeChecked());
    await expect(a).not.toBeChecked();

    await pressArrow('ArrowDown', () => c);
    await pressArrow('ArrowDown', () => a);
    await waitFor(() => expect(a).toBeChecked());

    await userEvent.click(canvas.getByText('Option C'));
    await expect(c).toBeChecked();
  },
};

export const WithDescription: Story = {
  render: () => (
    <RadioGroup defaultValue="monthly" className="flex flex-col gap-3">
      <Radio value="monthly" label="Monthly" description="Billed every month." />
      <Radio value="yearly" label="Yearly" description="Billed once a year, save 20%." />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('radio', { name: 'Yearly' })).toHaveAccessibleDescription('Billed once a year, save 20%.');
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <RadioGroup defaultValue="checked" className="flex flex-col gap-3">
        <Radio value="unchecked" label="Unchecked" />
        <Radio value="checked" label="Checked" />
      </RadioGroup>
      <RadioGroup defaultValue="none" className="flex flex-col gap-3">
        <Radio value="disabled-unchecked" label="Disabled" disabled />
      </RadioGroup>
      <RadioGroup defaultValue="disabled-checked" className="flex flex-col gap-3">
        <Radio value="disabled-checked" label="Disabled + checked" disabled />
      </RadioGroup>
    </div>
  ),
};
