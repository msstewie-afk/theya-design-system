import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
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
  decorators: [(Story) => <div className="w-full max-w-[360px]">{Story()}</div>],
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const input = canvas.getByLabelText('Phone number');
    const out = (term: string) => canvas.getByText(term, { selector: 'dt' }).nextElementSibling as HTMLElement;
    const countryButton = () => canvas.getByRole('button', { name: /^Country code:/ });

    // Typing in the default country formats as you go and reports E.164.
    await userEvent.type(input, '888123456');
    await expect(out('value')).toHaveTextContent('+359888123456');
    await expect(out('valid')).toHaveTextContent('true');
    await expect((input as HTMLInputElement).value.replace(/\D/g, '')).toContain('888123456');

    // Backspace right after a formatting space (caret mid-number) deletes the digit
    // before the space; what's shown and what's emitted stay the same number.
    await userEvent.clear(input);
    await userEvent.type(input, '0888123456');
    const shown = (input as HTMLInputElement).value;
    await expect(shown).toMatch(/\s/);
    const afterSpace = shown.indexOf(' ') + 1;
    await userEvent.type(input, '{Backspace}', { initialSelectionStart: afterSpace, initialSelectionEnd: afterSpace });
    const digits = (input as HTMLInputElement).value.replace(/\D/g, '');
    await expect(digits).toBe(shown.replace(/\D/g, '').slice(0, afterSpace - 2) + shown.replace(/\D/g, '').slice(afterSpace - 1));
    await expect(out('value')).toHaveTextContent(`+359${digits.replace(/^0/, '')}`);

    // A number with +code switches the country.
    await userEvent.clear(input);
    await userEvent.type(input, '+44 20 7946 0958');
    await expect(countryButton()).toHaveAccessibleName(/United Kingdom \+44/);
    await expect(out('value')).toHaveTextContent('+442079460958');
    await expect(out('country')).toHaveTextContent('GB');

    // Too short: the length check runs on blur, then live while fixing.
    await userEvent.clear(input);
    await userEvent.type(input, '20');
    await userEvent.tab();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText(/too short for United Kingdom/)).toBeInTheDocument();
    await userEvent.click(input);
    await userEvent.type(input, '79460958');
    await waitFor(() => expect(input).not.toHaveAttribute('aria-invalid'));

    // Picking a country from the searchable list re-emits and returns focus to the number.
    await userEvent.click(countryButton());
    const search = await body.findByPlaceholderText('Search country or code');
    await userEvent.type(search, 'germany');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(countryButton()).toHaveAccessibleName(/Germany \+49/));
    await expect(out('country')).toHaveTextContent('DE');
    await expect(out('value')).toHaveTextContent(/^\+49/);
    await waitFor(() => expect(input).toHaveFocus());
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
