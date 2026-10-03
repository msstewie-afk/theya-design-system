import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PhoneField } from './phone-field';
import { phoneFieldGuidelines } from './phone-field.guidelines';

/**
 * PhoneField — country-code picker + number formatted as you type in that
 * country's pattern, with its example number as the placeholder. The value
 * comes out in E.164 (`+359888123456`). A number typed or pasted with `+`
 * switches the country by itself. Checked on blur with a specific message
 * (too short / too long for the country). Rules: libphonenumber-js.
 */
const meta = {
  title: 'Text Input/PhoneField',
  component: PhoneField,
  tags: ['autodocs'],
  parameters: { guidelines: phoneFieldGuidelines, layout: 'padded' },
  argTypes: {
    label: { control: 'text', table: { category: 'Content' } },
    description: { control: 'text', table: { category: 'Content' } },
    error: { control: 'text', description: 'External error; replaces the built-in check.', table: { category: 'State' } },
    defaultCountry: { control: 'text', description: 'ISO code, e.g. BG, GB, US.', table: { category: 'Behavior' } },
    heightSize: { control: 'inline-radio', options: ['sm', 'md'], table: { category: 'Appearance' } },
    required: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    preferredCountries: { control: false },
    onValueChange: { control: false },
  },
  args: {
    label: 'Phone number',
    defaultCountry: 'BG',
    preferredCountries: ['BG', 'GB', 'DE', 'US'],
    description: 'For delivery updates only.',
  },
  decorators: [(Story) => <div className="w-[360px]">{Story()}</div>],
} satisfies Meta<typeof PhoneField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pick a country (search by name or code), type the number. Leave the field to see the length check. */
export const Default: Story = {};

/** A saved number in E.164 opens in its own country, formatted. */
export const Prefilled: Story = {
  args: { defaultValue: '+442079460958' },
};

/** What the form receives: E.164 plus the country and a validity flag. Try pasting `+1 201 555 0123`. */
export const ValueOutput: Story = {
  render: function Render(args) {
    const [out, setOut] = useState({ value: '', country: args.defaultCountry ?? 'BG', valid: false });
    return (
      <div className="flex flex-col gap-3">
        <PhoneField {...args} onValueChange={(value, d) => setOut({ value, country: d.country, valid: d.valid })} />
        <dl className="grid grid-cols-[80px_1fr] gap-1 font-body text-body-s">
          <dt className="text-[var(--color-text-text-subtler)]">value</dt>
          <dd className="font-mono text-[var(--color-text-text)]">{out.value || '—'}</dd>
          <dt className="text-[var(--color-text-text-subtler)]">country</dt>
          <dd className="font-mono text-[var(--color-text-text)]">{out.country}</dd>
          <dt className="text-[var(--color-text-text-subtler)]">valid</dt>
          <dd className="font-mono text-[var(--color-text-text)]">{String(out.valid)}</dd>
        </dl>
      </div>
    );
  },
};

/** An external error, e.g. from the server, uses the same danger treatment. */
export const WithError: Story = {
  args: { defaultValue: '+359888123456', error: 'This number is already linked to another account.' },
};

/** sm and md, matching TextField heights. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['heightSize'] } },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <PhoneField {...args} heightSize="sm" label="Phone (sm)" />
      <PhoneField {...args} heightSize="md" label="Phone (md)" />
    </div>
  ),
};

/** Required vs optional mark on the label, like every other form field. */
export const RequiredAndOptional: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <PhoneField {...args} required label="Mobile number" description={undefined} />
      <PhoneField {...args} optional label="Office number" description={undefined} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: '+12015550123', disabled: true },
};
