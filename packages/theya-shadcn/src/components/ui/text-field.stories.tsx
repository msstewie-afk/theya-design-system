import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Star, Search, User, Mail, Lock, Heart, Home, Settings, Xmark } from 'iconoir-react';

const iconMap = { Star, Search, User, Mail, Lock, Heart, Home, Settings, Xmark, None: null } as const;
type IconName = keyof typeof iconMap;
import { TextField } from './text-field';

const meta: Meta<typeof TextField> = {
  title: 'Forms/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: { widthSize: 'md' },
  parameters: {
    docs: {
      description: {
        component:
          'Sourced from Figma (node 6709:7414 + sibling states), Type=Outline / Height=Large only. ' +
          'Value/label text uses body-m (14px, the project default) rather than the file\u2019s literal ' +
          'body/l (16px). Enabled border uses border-default (matching Checkbox) rather than the ' +
          'file\u2019s literal border-subtle.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Field label, rendered above the input.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Helper text below the field.', table: { category: 'Content' } },
    placeholder: { control: 'text', description: 'Placeholder text shown when the field is empty.', table: { category: 'Content' } },
    leftIcon: { control: false, description: 'Leading icon inside the field.', table: { category: 'Content' } },
    rightIcon: { control: false, description: 'Trailing icon inside the field, overridden by the built-in clear button when clearable.', table: { category: 'Content' } },
    required: { control: 'boolean', description: 'Renders the required asterisk on the label.', table: { category: 'Content' } },
    error: { control: 'text', description: 'Error message; turns the field danger-styled.', table: { category: 'State' } },
    success: { control: 'text', description: 'Success message; turns the field success-styled.', table: { category: 'State' } },
    disabled: { control: 'boolean', description: 'Disables the field.', table: { category: 'State' } },
    widthSize: {
      control: 'select',
      options: ['full', 'sm', 'md', 'lg', 'xl'],
      description: 'full (default, fills container) | sm 60px | md 200px | lg 348px | xl 500px',
      table: { category: 'Appearance' },
    },
    heightSize: {
      control: 'radio',
      options: ['md', 'sm', 'lg'],
      description: 'md (default) 40px, body-m | sm 32px, body-s | lg 48px, body-m — label/value text follows.',
      table: { category: 'Appearance' },
    },
    labelPosition: {
      control: 'radio',
      options: ['top', 'left'],
      description: "top (default) stacks label above. left uses Figma's 216px horizontal Formfield column.",
      table: { category: 'Appearance' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Playground: Story = {
  args: { label: 'Email', placeholder: 'you@example.com' },
  // Uncontrolled: the clear button appears once there's text, clears it,
  // disappears, and leaves focus in the field.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(canvas.queryByRole('button', { name: 'Clear input' })).toBeNull();

    await userEvent.type(input, 'maria@theya.dev');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear input' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(canvas.queryByRole('button', { name: 'Clear input' })).toBeNull();
  },
};

export const Bare: Story = {
  name: 'No label',
  args: { placeholder: 'Search…', 'aria-label': 'Search' },
};

export const Required: Story = {
  args: { label: 'Workspace name', required: true, placeholder: 'my-team' },
  // "Required" must reach the input itself, not only the (aria-hidden) asterisk.
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Workspace name' })).toBeRequired();
  },
};

export const Clearable: Story = {
  name: 'Clearable (built-in clear button)',
  parameters: { controls: { disable: true } },
  // Uncontrolled TextFields already show the built-in clear button on their
  // own once they have a value — no wiring needed there. This story exists
  // to demo the CONTROLLED case, since that's the one that needs an
  // onChange handler for the clear button (and typing) to actually work.
  render: function ClearableExample(args) {
    const [value, setValue] = useState('Clear me');
    return (
      <TextField
        {...args}
        label="Search"
        placeholder="Type something…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
  // Controlled: clearing goes through onChange, typing brings the button back.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Search' });
    await expect(input).toHaveValue('Clear me');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear input' }));
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();

    await userEvent.type(input, 'abc');
    await expect(canvas.getByRole('button', { name: 'Clear input' })).toBeInTheDocument();
  },
};

export const WithLeftIcon: Story = {
  name: 'With left icon',
  args: { label: 'Favorite', placeholder: 'Text', iconName: 'Star' } as never,
  argTypes: {
    iconName: {
      control: 'select',
      options: Object.keys(iconMap),
      description: 'Storybook-only control — swaps which icon is passed as `leftIcon`.',
      table: { category: 'Content' },
    },
  } as any,
  render: ({ iconName, ...args }: any) => {
    const Icon = iconMap[iconName as IconName] ?? Star;
    return <TextField {...args} leftIcon={Icon ? <Icon /> : undefined} />;
  },
};

export const WithRightIcon: Story = {
  name: 'With right icon',
  args: { label: 'Favorite', placeholder: 'Text', iconName: 'Star' } as never,
  argTypes: {
    iconName: {
      control: 'select',
      options: Object.keys(iconMap),
      description: 'Storybook-only control — swaps which icon is passed as `rightIcon`. A decorative icon, not a button — overrides (and replaces) the built-in clear button. See the "Clearable" story for that.',
      table: { category: 'Content' },
    },
  } as any,
  render: ({ iconName, ...args }: any) => {
    const Icon = iconMap[iconName as IconName] ?? Star;
    return <TextField {...args} rightIcon={Icon ? <Icon /> : undefined} />;
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Workspace URL',
    description: 'This will be your unique workspace address.',
    placeholder: 'my-team',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('textbox', { name: 'Workspace URL' })).toHaveAccessibleDescription(
      'This will be your unique workspace address.',
    );
  },
};

export const WithError: Story = {
  name: 'With error message',
  args: {
    label: 'Email',
    required: true,
    error: 'This required field contains an error. Please fix it',
    defaultValue: 'not-an-email',
  },
  // The error is exposed, not just painted red: invalid + read as the description.
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Email' });
    await expect(input).toBeInvalid();
    await expect(input).toBeRequired();
    await expect(input).toHaveAccessibleDescription('This required field contains an error. Please fix it');
  },
};

export const WithSuccess: Story = {
  name: 'With success message',
  args: { label: 'Email', success: 'Looks good!', defaultValue: 'you@example.com' },
};

export const LeftLabel: Story = {
  name: 'Left label (horizontal)',
  args: {
    label: 'Field label',
    required: true,
    labelPosition: 'left',
    placeholder: 'Text',
  },
};

export const ReadOnly: Story = {
  name: 'Read-only',
  args: { label: 'Email', readOnly: true, defaultValue: 'you@example.com' },
};

export const States: Story = {
  name: 'States (from Figma)',
  render: () => (
    <div className="flex flex-col gap-4 w-[280px]">
      <TextField label="Enable" placeholder="Text" />
      {/* `autoFocus` (the native HTML attribute) makes the browser scroll
          the page to bring the field into view on mount — harmless in
          Canvas (one story per page) but on the Docs page, which renders
          every story's Canvas output inline on one long scrollable page,
          it yanked the reader down to this field the instant it mounted
          (Мария: "TextField - уезжает само на активное поле автоматически").
          A callback ref calling the imperative `.focus({ preventScroll:
          true })` gets the same real focused state/ring — this is still a
          genuinely focused input, not a fake visual — without the
          scroll-into-view side effect. */}
      <TextField label="Active focus" placeholder="Text" ref={(el) => el?.focus({ preventScroll: true })} />
      <TextField label="Disable" placeholder="Text" disabled />
      <TextField label="Error" error="This required field contains an error. Please fix it" defaultValue="Text" />
    </div>
  ),
};
