import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { labelGuidelines } from './label.guidelines';

const meta: Meta<typeof Label> = {
  title: 'Form Structure/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: { guidelines: labelGuidelines },
  argTypes: {
    required: { control: 'boolean', description: 'Renders the same asterisk mark used everywhere a label appears.' },
    'data-error': { control: 'boolean', description: 'Danger-styles the label, matching the field it describes.' },
    htmlFor: { control: 'text', description: 'Id of the field this label describes.' },
    children: { control: 'text', description: 'Label text.' },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Playground: Story = {
  args: { children: 'Email address' },
};

export const Error: Story = {
  args: { children: 'Email address', 'data-error': true },
};
