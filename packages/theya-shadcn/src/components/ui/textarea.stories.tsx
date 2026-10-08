import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { TextArea } from './textarea';
import { textareaGuidelines } from './textarea.guidelines';

const meta: Meta<typeof TextArea> = {
  title: 'Text Input/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  args: { widthSize: 'lg' },
  parameters: {
    guidelines: textareaGuidelines,
    docs: {
      description: {
        component:
          'Multi-line text input, vertically resizable. Shares border/focus/error/disabled/read-only ' +
          'treatment with TextField (no success state, no left/right icons here).',
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Field label, rendered above the textarea.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Helper text below the field.', table: { category: 'Content' } },
    placeholder: { control: 'text', description: 'Placeholder text shown when the field is empty.', table: { category: 'Content' } },
    required: { control: 'boolean', description: 'Renders the required asterisk on the label.', table: { category: 'Content' } },
    error: { control: 'text', description: 'Error message; turns the field danger-styled.', table: { category: 'State' } },
    disabled: { control: 'boolean', description: 'Disables the textarea.', table: { category: 'State' } },
    widthSize: {
      control: 'select',
      options: ['full', 'sm', 'md', 'lg', 'xl'],
      description: 'full (default, fills container) | sm 60px | md 240px | lg 348px | xl 500px',
      table: { category: 'Appearance' },
    },
    heightSize: {
      control: 'radio',
      options: ['md', 'sm'],
      description: "m (default) body-m — s body-s. Doesn't touch the box height (that's min-h-[80px] + resize), only label/value text size.",
      table: { category: 'Appearance' },
    },
    labelPosition: {
      control: 'radio',
      options: ['top', 'left'],
      description: "top (default) stacks label above. left uses TextField's 216px horizontal Formfield column.",
      table: { category: 'Appearance' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Playground: Story = {
  args: { label: 'Bio', placeholder: 'Tell us about yourself' },
};

export const Bare: Story = {
  name: 'No label',
  args: { placeholder: 'Tell us about yourself', 'aria-label': 'Bio' },
};

export const Required: Story = {
  args: { label: 'Bio', required: true, placeholder: 'Tell us about yourself' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Bio' })).toBeRequired();
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Feedback',
    description: 'Max 500 characters.',
    placeholder: 'What did you think?',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Feedback' })).toHaveAccessibleDescription('Max 500 characters.');
  },
};

export const WithError: Story = {
  name: 'With error message',
  args: {
    label: 'Feedback',
    required: true,
    error: 'This field can\u2019t be empty.',
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('textbox', { name: 'Feedback' });
    await expect(field).toBeInvalid();
    await expect(field).toBeRequired();
    await expect(field).toHaveAccessibleDescription('This field can\u2019t be empty.');
  },
};

export const LeftLabel: Story = {
  name: 'Left label (horizontal)',
  args: {
    label: 'Field label',
    required: true,
    labelPosition: 'left',
    placeholder: 'Tell us about yourself',
  },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { label: 'Feedback', readOnly: true, defaultValue: 'Submitted feedback, cannot be edited.' },
};

export const Widths: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TextArea label="sm — 60px" widthSize="sm" placeholder="Type here" />
      <TextArea label="md — 240px" widthSize="md" placeholder="Type here" />
      <TextArea label="lg — 348px" widthSize="lg" placeholder="Type here" />
      <TextArea label="xl — 500px" widthSize="xl" placeholder="Type here" />
    </div>
  ),
};

export const States: Story = {
  name: 'States (from TextField)',
  render: () => (
    <div className="flex flex-col gap-4 w-[320px] max-w-full">
      <TextArea label="Default" placeholder="Type here" />
      {/* Same fix as TextField's own "Active focus" story: native
          `autoFocus` scrolls the whole Docs page to this field on mount
          (every story's Canvas renders inline there). A callback ref
          calling `.focus({ preventScroll: true })` keeps this a genuinely
          focused field without that page-jump side effect. */}
      <TextArea label="Active focus" placeholder="Type here" ref={(el) => el?.focus({ preventScroll: true })} />
      <TextArea label="Disabled" disabled defaultValue="Locked value" />
      <TextArea label="Error" error="This field can't be empty." placeholder="Type here" />
      <TextArea label="Read-only" readOnly defaultValue="Can't edit this" />
    </div>
  ),
};
