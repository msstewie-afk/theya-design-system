import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PropertyGrid, type PropertyGridItem, type PropertyValue } from './property-grid';
import { Slider } from './slider';
import { propertyGridGuidelines } from './property-grid.guidelines';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { resetFocus, tabTo } from '../../test/keyboard';

const meta: Meta<typeof PropertyGrid> = {
  title: 'Form Structure/PropertyGrid',
  component: PropertyGrid,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Views and edits the properties of one object in a compact two-column list: an inspector panel, a resource’s settings, a selected item’s details.",
      },
    },
    guidelines: propertyGridGuidelines,
  },
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
    name: 'studio',
    label: 'Studio',
    type: 'select',
    placeholder: 'Select a studio',
    options: [
      { value: 'helios', label: 'Helios Studio' },
      { value: 'selene', label: 'Selene Weddings' },
    ],
  },
  { name: 'copies', label: 'Print copies', type: 'number' },
  { name: 'watermark', label: 'Watermark previews', type: 'switch' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional notes' },
];

const DEFAULT_VALUES: Record<string, PropertyValue> = {
  name: 'Golden hour',
  studio: 'helios',
  copies: 3,
  watermark: true,
  notes: 'Main client gallery',
};

/** Each row picks its control from `type` — text, select, number, switch, textarea — with starting values from `defaultValues`. */
export const Default: Story = {
  args: { items: ITEMS, defaultValues: DEFAULT_VALUES },
  render: (args) => (
    <div className="w-full max-w-[600px]">
      <PropertyGrid {...args} />
    </div>
  ),
};

function EditingDemo() {
  const [values, setValues] = useState<Record<string, PropertyValue>>({});
  return (
    <div className="w-full max-w-[600px]">
      <PropertyGrid items={ITEMS} values={values} onValuesChange={setValues} />
    </div>
  );
}

/** Controlled with `values` and `onValuesChange`, starting empty, so every row is ready for input. */
export const Editing: Story = {
  render: () => <EditingDemo />,
  // Keyboard: Tab goes row by row, and each control works without a mouse.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    resetFocus();
    await tabTo(canvas.getByRole('textbox', { name: 'Display name' }));
    await userEvent.keyboard('Blue hour');
    await expect(canvas.getByRole('textbox', { name: 'Display name' })).toHaveValue('Blue hour');

    const studio = canvas.getByRole('combobox', { name: 'Studio' });
    await tabTo(studio);
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(within(document.body).getByRole('option', { name: 'Selene Weddings' })).toBeVisible());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(() => expect(studio).toHaveTextContent('Selene Weddings'));
    await waitFor(() => expect(studio).toHaveFocus());

    const watermark = canvas.getByRole('switch', { name: 'Watermark previews' });
    await tabTo(watermark);
    await userEvent.keyboard(' ');
    await expect(watermark).toBeChecked();
  },
};

/** A row's `error` shows under its control, which is marked invalid and described by it. Clear it once the value is valid. */
export const WithError: Story = {
  name: 'With Error',
  render: function Render() {
    const [values, setValues] = useState<Record<string, PropertyValue>>({ ...DEFAULT_VALUES, copies: 0, name: '' });
    const items = ITEMS.map((i) =>
      i.name === 'name'
        ? { ...i, error: values.name === '' ? 'Enter a display name.' : undefined }
        : i.name === 'copies'
          ? { ...i, description: 'From 1 to 20.', error: Number(values.copies) < 1 ? 'Order at least 1 copy.' : undefined }
          : i,
    );
    return (
      <div className="w-full max-w-[600px]">
        <PropertyGrid items={items} values={values} onValuesChange={setValues} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole('textbox', { name: 'Display name' });
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAccessibleDescription('Enter a display name.');
    const copies = canvas.getByRole('spinbutton', { name: 'Print copies' });
    await expect(copies).toHaveAttribute('aria-invalid', 'true');
    await expect(copies).toHaveAccessibleDescription('Order at least 1 copy. From 1 to 20.');
    await userEvent.type(name, 'Golden hour');
    await waitFor(() => expect(name).not.toHaveAttribute('aria-invalid', 'true'));
    await expect(canvas.queryByText('Enter a display name.')).not.toBeInTheDocument();
  },
};

/** Every row `readOnly`: the grid shows values as plain text, for a details view with nothing to change. */
export const ReadOnlyStory: Story = {
  name: 'Read Only',
  render: () => (
    <div className="w-full max-w-[600px]">
      <PropertyGrid
        items={ITEMS.map((i) => ({ ...i, readOnly: true }))}
        defaultValues={DEFAULT_VALUES}
      />
    </div>
  ),
};

/** One `readOnly` row among editable ones — for a property that is fixed once the object exists. */
export const MixedReadOnly: Story = {
  name: 'Mixed Read Only',
  render: () => (
    <div className="w-full max-w-[600px]">
      <PropertyGrid
        items={ITEMS.map((i) => (i.name === 'name' ? { ...i, readOnly: true } : i))}
        defaultValues={DEFAULT_VALUES}
      />
    </div>
  ),
};

/** The label column is as wide as its longest label: short labels keep it narrow, a long one widens it. */
export const SizedToLongestLabel: Story = {
  name: 'Sized To Longest Label',
  render: () => (
    <div className="w-full max-w-[400px] flex flex-col gap-8">
      <PropertyGrid
        items={[
          { name: 'iso', label: 'ISO', type: 'text' },
          { name: 'lens', label: 'Lens', type: 'text' },
        ]}
        defaultValues={{ iso: '400', lens: '50 mm f/1.4' }}
      />
      <PropertyGrid
        items={[
          { name: 'iso', label: 'ISO', type: 'text' },
          { name: 'lens', label: 'Lens', type: 'text' },
          { name: 'renewal', label: 'License renewal policy for this gallery', type: 'text' },
        ]}
        defaultValues={{ iso: '400', lens: '50 mm f/1.4', renewal: 'Automatic' }}
      />
    </div>
  ),
};

/** `maxLabelWidth="10ch"` caps the label column; labels longer than that truncate with an ellipsis. */
export const NarrowLabelColumn: Story = {
  name: 'Narrow Label Column',
  render: () => (
    <div className="w-full max-w-[400px]">
      <PropertyGrid
        items={[
          { name: 'iso', label: 'ISO', type: 'text' },
          { name: 'lens', label: 'Lens', type: 'text' },
          { name: 'renewal', label: 'License renewal policy for this gallery', type: 'text' },
        ]}
        defaultValues={{ iso: '400', lens: '50 mm f/1.4', renewal: 'Automatic' }}
        maxLabelWidth="10ch"
      />
    </div>
  ),
};

/** `type: 'custom'` with a `render` function puts any control in a row — here a Slider with its value beside it. */
export const CustomControl: Story = {
  name: 'Custom Control',
  render: () => (
    <div className="w-full max-w-[500px]">
      <PropertyGrid
        items={[
          { name: 'name', label: 'Display name', type: 'text' },
          {
            name: 'weight',
            label: 'Watermark opacity',
            type: 'custom',
            render: ({ value, onChange }) => (
              <div className="flex items-center gap-3 w-full">
                <span className="font-body text-body-m text-[var(--color-text-text)] w-10 shrink-0">
                  {value ?? 0}%
                </span>
                <Slider
                  value={[Number(value ?? 0)]}
                  onValueChange={([v]) => onChange(v)}
                  aria-label="Watermark opacity"
                />
              </div>
            ),
          },
        ]}
        defaultValues={{ name: 'Golden hour', weight: 40 }}
      />
    </div>
  ),
};
