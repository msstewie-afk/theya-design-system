import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InlineEdit } from './inline-edit';
import { inlineEditGuidelines } from './inline-edit.guidelines';

/**
 * InlineEdit — change one value in place. Reads as text until clicked or
 * focused + Enter, then becomes a field with Save and Cancel. Enter saves,
 * Escape cancels, leaving the field saves (`saveOnBlur`). Validation errors
 * and failed saves keep the field open with a message. Switching modes
 * doesn't shift the layout: the text sits where the field's text will be.
 */
const meta = {
  title: 'Text Input/InlineEdit',
  component: InlineEdit,
  tags: ['autodocs'],
  parameters: { guidelines: inlineEditGuidelines, layout: 'padded' },
  argTypes: {
    label: { control: 'text', description: 'Accessible name of the value.', table: { category: 'Content' } },
    placeholder: { control: 'text', description: 'Shown when the value is empty.', table: { category: 'Content' } },
    size: { control: 'inline-radio', options: ['sm', 'md'], description: 'sm 32px / body-s, md 40px / body-m — same as TextField heightSize.', table: { category: 'Appearance' } },
    saveOnBlur: { control: 'boolean', description: 'Save when focus leaves the field.', table: { category: 'Behavior' } },
    multiline: { control: 'boolean', description: 'TextArea while editing; Enter = new line, ⌘/Ctrl+Enter saves.', table: { category: 'Behavior' } },
    inheritFont: { control: 'boolean', description: 'Take the surrounding typography (page titles, headings).', table: { category: 'Appearance' } },
    readOnly: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    onSave: { control: false },
    validate: { control: false },
  },
  args: { label: 'Site name', defaultValue: 'Seashell storefront', size: 'md', saveOnBlur: true },
  decorators: [(Story) => <div className="w-[360px]">{Story()}</div>],
} satisfies Meta<typeof InlineEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click the text (or Tab to it and press Enter), edit, then Enter to save or Escape to cancel. */
export const Default: Story = {};

/** An empty value shows the placeholder in a muted color, inviting a first entry. */
export const Empty: Story = {
  args: { label: 'Description', defaultValue: '', placeholder: 'Add a short description' },
};

/** `validate` blocks the save and keeps the field open with the message. Try clearing it or typing more than 32 characters. */
export const Validation: Story = {
  args: {
    validate: (v: string) => (!v ? 'Enter a site name.' : v.length > 32 ? 'Use 32 characters or fewer.' : undefined),
  },
};

/** `onSave` returning a promise shows a spinner on Save; the field is locked until it settles. */
export const AsyncSave: Story = {
  args: { onSave: () => new Promise<void>((resolve) => setTimeout(resolve, 900)) },
};

/** A rejected save keeps the field open with the error, so nothing typed is lost. */
export const SaveFails: Story = {
  args: {
    onSave: () => new Promise<void>((_, reject) => setTimeout(() => reject(new Error('Site names must be unique — shop already exists.')), 700)),
  },
};

/** sm and md, matching TextField's own heights. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <InlineEdit {...args} size="sm" />
      <InlineEdit {...args} size="md" />
    </div>
  ),
};

/** `multiline` — a TextArea while editing, line breaks kept in display. Enter adds a line, ⌘/Ctrl+Enter saves. */
export const Multiline: Story = {
  args: {
    label: 'Release notes',
    multiline: true,
    defaultValue: 'Region moves without downtime.\nThe CLI prints a plan with --dry-run.',
  },
};

/** `inheritFont` takes the surrounding typography — an editable page title. Same keys and states as the default. */
export const PageTitle: Story = {
  parameters: { controls: { exclude: ['size', 'multiline'] } },
  render: (args) => (
    <h1 className="font-heading text-heading-l text-[var(--color-text-text)]">
      <InlineEdit {...args} inheritFont label="Page title" defaultValue="Seashell storefront" />
    </h1>
  ),
};

/** Read-only and disabled render plain text with no edit affordance. */
export const ReadOnlyAndDisabled: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <InlineEdit {...args} readOnly />
      <InlineEdit {...args} disabled />
    </div>
  ),
};

/** Controlled, in a settings list: each row saves on its own. */
export const InSettings: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [site, setSite] = useState({ name: 'Seashell storefront', domain: 'shop.seashell.dev', owner: '' });
    const rows: { key: keyof typeof site; label: string; placeholder?: string }[] = [
      { key: 'name', label: 'Site name' },
      { key: 'domain', label: 'Primary domain' },
      { key: 'owner', label: 'Owner', placeholder: 'Assign an owner' },
    ];
    return (
      <dl className="flex w-[480px] flex-col divide-y divide-[var(--color-border-border-subtler)]">
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-[140px_1fr] items-center gap-2 py-2">
            <dt className="font-body text-body-s text-[var(--color-text-text-subtler)]">{row.label}</dt>
            <dd>
              <InlineEdit
                label={row.label}
                value={site[row.key]}
                placeholder={row.placeholder}
                size="sm"
                onSave={(v) => setSite((s) => ({ ...s, [row.key]: v }))}
              />
            </dd>
          </div>
        ))}
      </dl>
    );
  },
};
