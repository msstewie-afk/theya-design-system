import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Selection/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Rebuilt on Radix Checkbox (a real `<button role="checkbox">`) instead ' +
          'of a visually-hidden native `<input>`. Radix natively supports a ' +
          'three-state `checked` (`true | false | "indeterminate"`), so ' +
          '`indeterminate` no longer needs manual DOM manipulation.',
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'Label text next to the box.', table: { category: 'Content' } },
    description: { control: 'text', description: 'Helper text under the label.', table: { category: 'Content' } },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: '16px or 20px.',
      table: { category: 'Appearance', defaultValue: { summary: 'm' } },
    },
    error: {
      control: 'boolean',
      description: 'Danger-colored border/fill/focus-ring instead of Primary.',
      table: { category: 'Appearance' },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Convenience for checked="indeterminate".',
      table: { category: 'State' },
    },
    disabled: { control: 'boolean', description: 'Disables the checkbox.', table: { category: 'State' } },
  }, // checkbox
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  args: { label: 'Accept terms and conditions', onCheckedChange: fn() },
  // Label click and Space both toggle; the label is the accessible name.
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: 'Accept terms and conditions' });
    await expect(box).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(canvas.getByText('Accept terms and conditions'));
    await expect(box).toHaveAttribute('aria-checked', 'true');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);

    await expect(box).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(box).toHaveAttribute('aria-checked', 'false');
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
  },
};

export const Bare: Story = {
  name: 'No label',
  args: { 'aria-label': 'Accept terms and conditions' },
};

export const WithDescription: Story = {
  render: () => (
    <Checkbox
      label="Email notifications"
      description="Get notified when someone comments on your post."
    />
  ),
  // The description must be announced, not just shown (aria-describedby).
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', { name: 'Email notifications' });
    await expect(box).toHaveAccessibleDescription('Get notified when someone comments on your post.');
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate />
    </div>
  ),
};

export const Disabled: Story = {
  // Disabled: out of the tab order, clicks don't change state.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unchecked = canvas.getByRole('checkbox', { name: 'Disabled unchecked' });
    await expect(unchecked).toBeDisabled();

    await userEvent.click(canvas.getByText('Disabled unchecked'));
    await expect(unchecked).toHaveAttribute('aria-checked', 'false');

    await userEvent.tab();
    await expect(unchecked).not.toHaveFocus();
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox label="Disabled unchecked" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
      <Checkbox label="Disabled indeterminate" disabled indeterminate />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox size="sm" label="Small (16px)" defaultChecked />
      <Checkbox size="md" label="Medium (20px, default)" defaultChecked />
    </div>
  ),
};

export const ErrorState: Story = {
  name: 'Error',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox error label="Unchecked" />
      <Checkbox error label="Checked" defaultChecked />
      <Checkbox error label="Indeterminate" indeterminate />
      <Checkbox
        error
        label="You must accept the terms"
        description="This field is required to continue."
      />
    </div>
  ),
};

function ControlledIndeterminateDemo() {
  const items = ['Apples', 'Bananas', 'Cherries'];
  const [checkedItems, setCheckedItems] = useState<boolean[]>([true, false, false]);

  const allChecked = checkedItems.every(Boolean);
  const someChecked = checkedItems.some(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Checkbox
        label="Select all"
        checked={allChecked ? true : someChecked ? 'indeterminate' : false}
        onCheckedChange={(v) => setCheckedItems(items.map(() => v === true))}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 28 }}>
        {items.map((item, i) => (
          <Checkbox
            key={item}
            label={item}
            checked={checkedItems[i]}
            onCheckedChange={(v) =>
              setCheckedItems((prev) => prev.map((c, idx) => (idx === i ? v === true : c)))
            }
          />
        ))}
      </div>
    </div>
  );
}

export const ControlledIndeterminate: Story = {
  name: 'Controlled: parent/child indeterminate',
  parameters: {
    docs: {
      description: {
        story:
          'A common indeterminate pattern: the parent checkbox shows ' +
          '"indeterminate" when some but not all children are checked, ' +
          'and toggling it checks/unchecks all children at once.',
      },
    },
  },
  render: () => <ControlledIndeterminateDemo />,
  // Parent reflects children (mixed / all / none) and drives them.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole('checkbox', { name: 'Select all' });
    const children = ['Apples', 'Bananas', 'Cherries'].map((name) =>
      canvas.getByRole('checkbox', { name }),
    );

    await expect(parent).toHaveAttribute('aria-checked', 'mixed');

    await userEvent.click(parent);
    for (const child of children) await expect(child).toHaveAttribute('aria-checked', 'true');
    await expect(parent).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(children[1]);
    await expect(parent).toHaveAttribute('aria-checked', 'mixed');

    await userEvent.click(parent);
    await userEvent.click(parent);
    for (const child of children) await expect(child).toHaveAttribute('aria-checked', 'false');
    await expect(parent).toHaveAttribute('aria-checked', 'false');
  },
};
