import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, Radio } from './radio';

const meta: Meta<typeof Radio> = {
  title: 'Forms/Radio',
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
};

export const WithDescription: Story = {
  render: () => (
    <RadioGroup defaultValue="monthly" className="flex flex-col gap-3">
      <Radio value="monthly" label="Monthly" description="Billed every month." />
      <Radio value="yearly" label="Yearly" description="Billed once a year, save 20%." />
    </RadioGroup>
  ),
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
