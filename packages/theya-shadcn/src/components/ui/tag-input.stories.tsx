import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { emailProblem } from '@/lib/email';
import { Label } from './label';
import { TagInput } from './tag-input';
import { tagInputGuidelines } from './tag-input.guidelines';

/**
 * TagInput — several free-form values as chips: tags, emails, domains.
 * Enter, comma or semicolon commits; leaving the field commits too.
 * Pasting a list splits it. `validate` keeps bad values as danger chips
 * and lists them under the field, so nothing is silently dropped. For
 * picking from a known list, use Combobox `multiple` instead.
 */
const meta = {
  title: 'Text Input/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  parameters: { guidelines: tagInputGuidelines, layout: 'padded' },
  argTypes: {
    placeholder: { control: 'text', table: { category: 'Content' } },
    description: { control: 'text', table: { category: 'Content' } },
    error: { control: 'text', description: 'External error shown under the field.', table: { category: 'State' } },
    max: { control: 'number', description: 'Maximum number of values.', table: { category: 'Behavior' } },
    heightSize: { control: 'inline-radio', options: ['sm', 'md'], table: { category: 'Appearance' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    readOnly: { control: 'boolean', table: { category: 'State' } },
    validate: { control: false },
    transform: { control: false },
    delimiters: { control: false },
  },
  args: { 'aria-label': 'Tags', defaultValue: ['production', 'eu-west'], heightSize: 'md' },
  decorators: [(Story) => <div className="w-[420px]">{Story()}</div>],
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type a tag and press Enter or comma. Backspace in the empty input removes the last one. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Tags' });
    const removeButtons = () => canvas.queryAllByRole('button', { name: /^Remove / });
    await expect(removeButtons()).toHaveLength(2);

    // Enter and comma commit; surrounding spaces are trimmed.
    await userEvent.type(input, '  staging {Enter}');
    await userEvent.type(input, 'canary,');
    await expect(canvas.getByRole('button', { name: 'Remove staging' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Remove canary' })).toBeInTheDocument();
    await expect(input).toHaveValue('');
    await waitFor(() => expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('Added canary'));

    // Duplicates (case-insensitive) are ignored.
    await userEvent.type(input, 'Production{Enter}');
    await expect(removeButtons()).toHaveLength(4);

    // Backspace in the empty input removes the last tag.
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.queryByRole('button', { name: 'Remove canary' })).not.toBeInTheDocument();
    await expect(input).toHaveFocus();

    // The chip's remove button removes that tag and returns focus to the input.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove eu-west' }));
    await expect(removeButtons().map((b) => b.getAttribute('aria-label'))).toEqual(['Remove production', 'Remove staging']);
    await expect(input).toHaveFocus();

    // Enter with nothing typed is left alone (a form can submit); leaving the field commits a draft.
    await userEvent.keyboard('{Enter}');
    await expect(removeButtons()).toHaveLength(2);
    await userEvent.type(input, 'blue');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Remove blue' })).toBeInTheDocument();
  },
};

const EMAIL_LIST = 'maria@seashell.dev, ops@seashell.dev; not-an-email, Billing@Seashell.dev';

/**
 * Email recipients: lower-cased on the way in, checked one by one. Paste the
 * list below to see it split — the bad one stays as a danger chip.
 */
export const Emails: Story = {
  args: {
    'aria-label': 'Recipients',
    defaultValue: [],
    placeholder: 'name@company.com',
    transform: (v: string) => v.toLowerCase(),
    validate: emailProblem,
    description: 'Separate addresses with a comma or press Enter.',
  },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <TagInput {...args} />
      <code className="font-mono text-body-xs text-[var(--color-text-text-subtler)]">Try pasting: {EMAIL_LIST}</code>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Recipients' });
    await userEvent.click(input);
    await userEvent.paste(EMAIL_LIST);
    // The pasted list splits into four chips; the mixed-case address is lower-cased.
    const names = canvas.getAllByRole('button', { name: /^Remove / }).map((b) => b.getAttribute('aria-label'));
    await expect(names).toEqual(['Remove maria@seashell.dev', 'Remove ops@seashell.dev', 'Remove not-an-email', 'Remove billing@seashell.dev']);
    // The bad value stays, marked invalid, and is listed under the field.
    await expect(canvas.getByText('(invalid)')).toBeInTheDocument();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    const messageId = input.getAttribute('aria-describedby');
    await expect(messageId).toBeTruthy();
    await expect(canvasElement.querySelector(`#${CSS.escape(messageId!)}`)).toHaveTextContent(/^not-an-email: /);
    // Removing it clears the error.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove not-an-email' }));
    await expect(input).not.toHaveAttribute('aria-invalid');
  },
};

/** `max` caps the count; the input disappears at the limit and the counter shows how many are left. */
export const Max: Story = {
  args: { 'aria-label': 'Domains', defaultValue: ['shop.seashell.dev', 'docs.seashell.dev'], max: 3, description: 'Domains for this certificate' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Domains' });
    await expect(canvas.getByText(/2 of 3/)).toBeInTheDocument();
    // Pasting more than fits keeps only what the limit allows.
    await userEvent.click(input);
    await userEvent.paste('api.seashell.dev, mail.seashell.dev');
    await expect(canvas.getAllByRole('button', { name: /^Remove / })).toHaveLength(3);
    await expect(canvas.getByText(/3 of 3/)).toBeInTheDocument();
    // At the limit the input goes away; removing a value brings it back.
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove api.seashell.dev' }));
    // Focus lands in the re-mounted input, not on <body> (the clicked button is gone).
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Domains' })).toHaveFocus());
  },
};

/** Space as an extra delimiter — for one-word tags. */
export const SpaceSeparated: Story = {
  args: { delimiters: ['Enter', ',', ' '], defaultValue: ['react', 'tokens'] },
};

/** An external error (e.g. a required list left empty) uses the same danger treatment as TextField. */
export const WithError: Story = {
  args: { 'aria-label': 'Recipients', defaultValue: [], error: 'Add at least one recipient.' },
};

/** sm and md, matching TextField and Combobox heights. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['heightSize'] } },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <TagInput {...args} heightSize="sm" />
      <TagInput {...args} heightSize="md" />
    </div>
  ),
};

/** Read-only shows the chips without remove buttons; disabled dims everything. */
export const ReadOnlyAndDisabled: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <TagInput {...args} readOnly />
      <TagInput {...args} disabled />
    </div>
  ),
};

/** Controlled, with a visible label. */
export const WithLabel: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [value, setValue] = useState<string[]>(['10.0.0.0/8']);
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="allowlist">IP allowlist</Label>
        <TagInput id="allowlist" value={value} onValueChange={setValue} placeholder="CIDR range, e.g. 192.168.0.0/16" />
      </div>
    );
  },
};
