import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { labelGuidelines } from './label.guidelines';

const meta: Meta<typeof Label> = {
  title: 'Form Structure/Label',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Names a form control that doesn’t draw its own label — Select, Combobox, DatePicker, custom controls — and marks it required or optional.",
      },
    },
    guidelines: labelGuidelines,
  },
  argTypes: {
    required: { control: 'boolean', description: 'Renders the same asterisk mark used everywhere a label appears.' },
    'data-error': { control: 'boolean', description: 'Danger-styles the label, matching the field it describes.' },
    htmlFor: { control: 'text', description: 'Id of the field this label describes.' },
    children: { control: 'text', description: 'Label text.' },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

/** Interactive example — set the text, `required` and `data-error` in the Controls below. */
export const Playground: Story = {
  args: { children: 'Email address' },
};

/** `data-error` turns the label danger-colored to match a field in error. */
export const Error: Story = {
  args: { children: 'Email address', 'data-error': true },
};
