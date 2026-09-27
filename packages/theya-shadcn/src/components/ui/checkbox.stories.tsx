import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
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
      options: ['s', 'm'],
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
  args: { label: 'Accept terms and conditions' },
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
      <Checkbox size="s" label="Small (16px)" defaultChecked />
      <Checkbox size="m" label="Medium (20px, default)" defaultChecked />
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
};
