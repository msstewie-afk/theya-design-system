import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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
export const Default: Story = {};

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
};

/** `max` caps the count; the input disappears at the limit and the counter shows how many are left. */
export const Max: Story = {
  args: { 'aria-label': 'Domains', defaultValue: ['shop.seashell.dev', 'docs.seashell.dev'], max: 3, description: 'Domains for this certificate' },
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
