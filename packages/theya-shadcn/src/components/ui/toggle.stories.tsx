import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Bold, Italic, Underline } from 'iconoir-react';
import { Toggle } from './toggle';
import { toggleGuidelines } from './toggle.guidelines';

const meta: Meta<typeof Toggle> = {
  title: 'Actions/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A button that stays pressed: bold in an editor, “Show archived”, pin. For a setting that applies at once, use Switch.",
      },
    },
    guidelines: toggleGuidelines,
  },
  argTypes: {
    appearance: { control: 'radio', options: ['tonal', 'outlined', 'ghost'], description: 'Fill style.', table: { category: 'Appearance' } },
    size: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Toggle size.', table: { category: 'Appearance' } },
    disabled: { control: 'boolean', description: 'Disables the toggle.', table: { category: 'State' } },
    pressed: { control: 'boolean', description: 'Controlled pressed state.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

/** The interactive example, driven by the Controls below — click it or press Space to press and release it. */
export const Playground: Story = {
  args: { 'aria-label': 'Bold' },
  render: (args) => (
    <Toggle {...args}>
      <Bold /> Bold
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-state', 'on');
    // Space toggles back; the name stays the same.
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAccessibleName('Bold');
  },
};

/** Icon only: the toggle becomes a square, and `aria-label` gives it its accessible name. */
export const IconOnly: Story = {
  args: { 'aria-label': 'Bold' },
  render: (args) => (
    <Toggle {...args}>
      <Bold />
    </Toggle>
  ),
};

/** `appearance="tonal"`, `"outlined"` and `"ghost"` (default) — ghost suits toolbars, the others stand out more on their own. */
export const Variants: Story = {
  render: () => (
    <div className="flex gap-3">
      <Toggle appearance="tonal" aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle appearance="outlined" aria-label="Italic">
        <Italic />
      </Toggle>
      <Toggle appearance="ghost" aria-label="Underline">
        <Underline />
      </Toggle>
    </div>
  ),
};

/** `size="sm"`, `"md"` (default) and `"lg"`; icon-only toggles stay square at every size. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Toggle size="sm" aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle size="md" aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle size="lg" aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle size="sm" appearance="outlined" aria-label="Italic">
        <Italic />
      </Toggle>
      <Toggle size="md" appearance="outlined" aria-label="Italic">
        <Italic />
      </Toggle>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Icon-only toggles are square at every size, outlined (1px border) included.
    for (const button of within(canvasElement).getAllByRole('button')) {
      const { width, height } = button.getBoundingClientRect();
      await expect(Math.round(width)).toBe(Math.round(height));
    }
  },
};

/** Unpressed, pressed (`defaultPressed`) and `disabled`. */
export const States: Story = {
  render: () => (
    <div className="flex gap-3">
      <Toggle aria-label="Unpressed">
        <Underline />
      </Toggle>
      <Toggle defaultPressed aria-label="Pressed">
        <Underline />
      </Toggle>
      <Toggle disabled aria-label="Disabled">
        <Underline />
      </Toggle>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Unpressed' })).toHaveAttribute('aria-pressed', 'false');
    await expect(canvas.getByRole('button', { name: 'Pressed' })).toHaveAttribute('aria-pressed', 'true');
    const disabled = canvas.getByRole('button', { name: 'Disabled' });
    await expect(disabled).toBeDisabled();
  },
};
