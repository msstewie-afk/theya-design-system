import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PropertyGrid, type PropertyGridItem, type PropertyValue } from './property-grid';
import { Slider } from './slider';

const meta: Meta<typeof PropertyGrid> = {
  title: 'Forms/PropertyGrid',
  component: PropertyGrid,
  tags: ['autodocs'],
  argTypes: {
    items: { control: false, description: 'Row schema — name/label/type/options/placeholder/description/readOnly/render drive which control renders per row.' },
    defaultValues: { control: false, description: 'Initial values keyed by item name (uncontrolled).' },
    values: { control: false, description: 'Controlled values keyed by item name (pair with onValueChange/onValuesChange).' },
    onValueChange: { control: false, description: 'Fires with (name, value) whenever a single row changes.' },
    onValuesChange: { control: false, description: 'Fires with the whole values map whenever any row changes.' },
    maxLabelWidth: {
      control: 'text',
      description: 'Cap on the label column (any CSS length). The column is still sized to the longest label; this only moves the ceiling past which labels ellipsise.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PropertyGrid>;

const ITEMS: PropertyGridItem[] = [
  { name: 'name', label: 'Display name', type: 'text' },
  {
    name: 'region',
    label: 'Region',
    type: 'select',
    placeholder: 'Select a region',
    options: [
      { value: 'eu-west-1', label: 'eu-west-1' },
      { value: 'us-east-1', label: 'us-east-1' },
    ],
  },
  { name: 'replicas', label: 'Replicas', type: 'number' },
  { name: 'https', label: 'Force HTTPS', type: 'switch' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional notes' },
];

const DEFAULT_VALUES: Record<string, PropertyValue> = {
  name: 'shop.seashell.dev',
  region: 'eu-west-1',
  replicas: 3,
  https: true,
  notes: 'Primary storefront',
};

export const Default: Story = {
  args: { items: ITEMS, defaultValues: DEFAULT_VALUES },
  render: (args) => (
    <div className="w-[600px]">
      <PropertyGrid {...args} />
    </div>
  ),
};

function EditingDemo() {
  const [values, setValues] = useState<Record<string, PropertyValue>>({});
  return (
    <div className="w-[600px]">
      <PropertyGrid items={ITEMS} values={values} onValuesChange={setValues} />
    </div>
  );
}

export const Editing: Story = {
  render: () => <EditingDemo />,
};

export const ReadOnlyStory: Story = {
  name: 'Read Only',
  render: () => (
    <div className="w-[600px]">
      <PropertyGrid
        items={ITEMS.map((i) => ({ ...i, readOnly: true }))}
        defaultValues={DEFAULT_VALUES}
      />
    </div>
  ),
};

export const MixedReadOnly: Story = {
  name: 'Mixed Read Only',
  render: () => (
    <div className="w-[600px]">
      <PropertyGrid
        items={ITEMS.map((i) => (i.name === 'name' ? { ...i, readOnly: true } : i))}
        defaultValues={DEFAULT_VALUES}
      />
    </div>
  ),
};

export const SizedToLongestLabel: Story = {
  name: 'Sized To Longest Label',
  render: () => (
    <div className="w-[400px] flex flex-col gap-8">
      <PropertyGrid
        items={[
          { name: 'os', label: 'OS', type: 'text' },
          { name: 'ipv4', label: 'IPv4', type: 'text' },
        ]}
        defaultValues={{ os: 'AlmaLinux 9', ipv4: '203.0.113.42' }}
      />
      <PropertyGrid
        items={[
          { name: 'os', label: 'OS', type: 'text' },
          { name: 'ipv4', label: 'IPv4', type: 'text' },
          { name: 'renewal', label: 'Certificate renewal policy for this hostname', type: 'text' },
        ]}
        defaultValues={{ os: 'AlmaLinux 9', ipv4: '203.0.113.42', renewal: 'Automatic' }}
      />
    </div>
  ),
};

export const NarrowLabelColumn: Story = {
  name: 'Narrow Label Column',
  render: () => (
    <div className="w-[400px]">
      <PropertyGrid
        items={[
          { name: 'os', label: 'OS', type: 'text' },
          { name: 'ipv4', label: 'IPv4', type: 'text' },
          { name: 'renewal', label: 'Certificate renewal policy for this hostname', type: 'text' },
        ]}
        defaultValues={{ os: 'AlmaLinux 9', ipv4: '203.0.113.42', renewal: 'Automatic' }}
        maxLabelWidth="10ch"
      />
    </div>
  ),
};

export const CustomControl: Story = {
  name: 'Custom Control',
  render: () => (
    <div className="w-[500px]">
      <PropertyGrid
        items={[
          { name: 'name', label: 'Display name', type: 'text' },
          {
            name: 'weight',
            label: 'Traffic weight',
            type: 'custom',
            render: ({ value, onChange }) => (
              <div className="flex items-center gap-3 w-full">
                <span className="font-body text-body-m text-[var(--color-text-text)] w-10 shrink-0">
                  {value ?? 0}%
                </span>
                <Slider
                  value={[Number(value ?? 0)]}
                  onValueChange={([v]) => onChange(v)}
                  aria-label="Traffic weight"
                />
              </div>
            ),
          },
        ]}
        defaultValues={{ name: 'shop.seashell.dev', weight: 40 }}
      />
    </div>
  ),
};
