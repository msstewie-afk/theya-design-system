import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Autocomplete } from './autocomplete';
import { autocompleteGuidelines } from './autocomplete.guidelines';

const meta: Meta<typeof Autocomplete> = {
  title: 'Selection/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
  parameters: {
    guidelines: autocompleteGuidelines,
    docs: {
      description: {
        component:
          'Built on our own Popover. The value is the TEXT the user typed; ' +
          'they can pick a suggestion to fill the input, or submit their own text.',
      },
    },
  },
  argTypes: {
    heightSize: {
      control: 'radio',
      options: ['md', 'sm'],
      description: "Matches TextField's own heightSize: m (default) 40px, body-m | s 32px, body-s. The dropdown's own text size follows it too.",
      table: { category: 'Appearance' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Autocomplete>;

const RESOURCES = [
  { value: 'databases', label: 'Databases' },
  { value: 'dns-records', label: 'DNS records', note: 'Beta' },
  { value: 'domains', label: 'Domains' },
  { value: 'backups', label: 'Backups' },
];

// Trailing-note demo: each suggestion says where that name is already
// used, so the user can tell a reuse from a typo before committing.
const ENVIRONMENTS = [
  { value: 'production', label: 'production', note: 'In use by 4 services' },
  { value: 'preview', label: 'preview', note: 'Auto-deleted after 7 days' },
  { value: 'staging', label: 'staging', note: 'In use by 2 services' },
];

export const Default: Story = {
  render: () => (
    <div className="w-[280px]">
      <Autocomplete options={RESOURCES} placeholder="Search resources" aria-label="Search resources" />
    </div>
  ),
  // Keyboard-only selection (WCAG 2.1.1): arrows move a highlight that is
  // exposed via aria-activedescendant, Enter picks it.
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Search resources' });

    await userEvent.click(input);
    await userEvent.type(input, 'd');
    const listbox = await within(document.body).findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    await expect(options).toHaveLength(3); // prefix match: Databases, DNS records, Domains
    await expect(options[1]).toHaveTextContent('DNS records');
    await expect(input).not.toHaveAttribute('aria-activedescendant');

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant', options[1].id);

    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('DNS records');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

export const HeightSizes: Story = {
  name: 'Height sizes (m / s)',
  render: () => (
    <div className="flex flex-col gap-4 w-[280px]">
      <Autocomplete options={RESOURCES} placeholder="Search resources (m, default)" aria-label="Search resources" heightSize="md" />
      <Autocomplete options={RESOURCES} placeholder="Search resources (s)" aria-label="Search resources" heightSize="sm" />
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('');
  return (
    <div className="w-[280px]">
      <Autocomplete
        options={RESOURCES}
        placeholder="Search resources"
        aria-label="Search resources"
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}

export const FreeText: Story = {
  name: 'Free text',
  render: () => <ControlledDemo />,
  // Enter without a highlight keeps the typed text; no match keeps it too.
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Search resources' });

    await userEvent.click(input);
    await userEvent.type(input, 'Datab');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Datab');

    await userEvent.clear(input);
    await userEvent.type(input, 'zzz');
    await expect(await within(document.body).findByText('No results.')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('zzz');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Loading: Story = {
  render: () => (
    <div className="w-[280px]">
      <Autocomplete options={RESOURCES} placeholder="Search resources" aria-label="Search resources" loading />
    </div>
  ),
};

export const WithTrailingNote: Story = {
  name: 'With trailing note',
  render: () => (
    <div className="w-[280px]">
      <Autocomplete options={ENVIRONMENTS} placeholder="Environment name" aria-label="Environment name" />
    </div>
  ),
};

export const ReadOnly: Story = {
  name: 'Read-only',
  render: () => (
    <div className="w-[280px]">
      <Autocomplete
        options={RESOURCES}
        defaultValue="Databases"
        readOnly
        aria-label="Search resources"
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[280px]">
      <Autocomplete options={RESOURCES} placeholder="Search resources" aria-label="Search resources" disabled />
    </div>
  ),
};
