import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Combobox } from './combobox';

const meta: Meta<typeof Combobox> = {
  title: 'Forms/Combobox',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'No Radix combobox primitive — built on our own Popover. Ported from a reference that grew into a ' +
          'full multi-select-with-chips picker. Deferred: chip reorder animation (disabled in the source too) ' +
          'and wrap={false} single-line horizontal chip scrolling.',
      },
    },
  },
  // Explicit argTypes because the props type is a discriminated union
  // (ComboboxSingleProps | ComboboxMultipleProps) — Storybook's automatic
  // react-docgen table inference is weak on unions like this, so without
  // this the Docs page's props table came out far sparser than a plain
  // interface would produce.
  argTypes: {
    options: { control: false, description: 'Selectable options ({ value, label, keywords?, disabled? }).', table: { category: 'Content' } },
    multiple: { control: 'boolean', description: 'Multi-select with chips instead of a single value.', table: { category: 'Behavior' } },
    value: { control: false, description: 'Controlled value — a string for single mode, a string[] for multiple.', table: { category: 'State' } },
    defaultValue: { control: false, description: 'Uncontrolled initial value.', table: { category: 'State' } },
    onValueChange: { control: false, description: 'Fires with the new value on selection change.', table: { category: 'Events' } },
    placeholder: { control: 'text', description: 'Placeholder text shown when nothing is selected.', table: { category: 'Content' } },
    emptyMessage: { control: 'text', description: 'Shown when no options match the query.', table: { category: 'Content' } },
    loadingMessage: { control: 'text', description: 'Shown in the dropdown while loading is true.', table: { category: 'Content' } },
    createOptionLabel: { control: false, description: 'Label for the create-option row in multiple mode. Defaults to Create "{query}".', table: { category: 'Content' } },
    createOptionIcon: { control: false, description: 'Icon shown on the create-option row.', table: { category: 'Content' } },
    clearLabel: { control: 'text', description: 'Accessible label for the clear button.', table: { category: 'Content' } },
    triggerLabel: { control: 'text', description: 'Accessible label for the dropdown-open trigger.', table: { category: 'Content' } },
    heightSize: {
      control: 'radio',
      options: ['m', 's'],
      description: "Matches TextField's own heightSize: m (default) 40px, body-m | s 32px, body-s. Dropdown text size follows it too.",
      table: { category: 'Appearance' },
    },
    allowCreate: { control: 'boolean', description: 'Allow the current input to be committed even if it matches no option.', table: { category: 'Behavior' } },
    createOnDelimiter: { control: 'boolean', description: 'In multiple mode, commit the current input as a chip when space or comma is typed.', table: { category: 'Behavior' } },
    showClear: { control: 'boolean', description: 'Shows the clear button when a value is selected.', table: { category: 'Behavior' } },
    showTrigger: { control: 'boolean', description: 'Shows the dropdown-open trigger icon.', table: { category: 'Behavior' } },
    loading: { control: 'boolean', description: 'Shows loadingMessage in the dropdown instead of options.', table: { category: 'State' } },
    disabled: { control: 'boolean', description: 'Disables the combobox.', table: { category: 'State' } },
    readOnly: {
      control: 'boolean',
      description: 'Presentation-only: no border/fill/hover, no chevron/clear/chip-remove. Chips always wrap.',
      table: { category: 'State' },
    },
    renderOption: { control: false, description: 'Custom renderer for a dropdown option.', table: { category: 'Advanced' } },
    renderChip: { control: false, description: 'Custom renderer for a selected chip in multiple mode.', table: { category: 'Advanced' } },
    filter: { control: false, description: 'Custom match function, overriding the default local keyword match.', table: { category: 'Advanced' } },
    className: { control: false, description: 'Class on the root trigger element.', table: { category: 'Advanced' } },
    contentClassName: { control: false, description: 'Class on the dropdown content.', table: { category: 'Advanced' } },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const FRAMEWORKS = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'vite', label: 'Vite' },
  { value: 'sveltekit', label: 'SvelteKit' },
];

function SingleDemo() {
  const [value, setValue] = useState<string>('');
  return (
    <div className="w-[240px]">
      <Combobox options={FRAMEWORKS} value={value} onValueChange={setValue} placeholder="Select framework…" aria-label="Framework" />
    </div>
  );
}

export const Single: Story = {
  render: () => <SingleDemo />,
  // Type to filter, Enter commits, Escape restores the committed label.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const input = canvas.getByRole('combobox', { name: 'Framework' });

    await userEvent.click(input);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.type(input, 'rem');

    const listbox = await body.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    await expect(options).toHaveLength(1);
    await expect(options[0]).toHaveTextContent('Remix');
    // The highlighted option is exposed to assistive tech, not just painted.
    await expect(input).toHaveAttribute('aria-activedescendant', options[0].id);

    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Remix');
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(input);
    await userEvent.type(input, 'zzz');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(input).toHaveValue('Remix'));
  },
};

function KeyboardDemo() {
  const [value, setValue] = useState<string>('');
  return (
    <div className="w-[240px]">
      <Combobox
        options={[
          { value: 'next', label: 'Next.js' },
          { value: 'remix', label: 'Remix', disabled: true },
          { value: 'astro', label: 'Astro' },
        ]}
        value={value}
        onValueChange={setValue}
        placeholder="Select framework…"
        aria-label="Framework"
      />
    </div>
  );
}

/**
 * Regression tests: arrow-key highlight is announced via
 * aria-activedescendant, and Enter on a disabled option does nothing
 * (it used to commit it).
 */
export const KeyboardNavigation: Story = {
  name: 'Test: keyboard navigation',
  render: () => <KeyboardDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const input = canvas.getByRole('combobox', { name: 'Framework' });

    await userEvent.click(input);
    const listbox = await body.findByRole('listbox');
    const [next, remix, astro] = within(listbox).getAllByRole('option');
    await expect(input).toHaveAttribute('aria-activedescendant', next.id);

    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant', remix.id);
    await expect(remix).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('');
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant', astro.id);
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Astro');
  },
};

export const HeightSizes: Story = {
  name: 'Height sizes (m / s)',
  render: () => (
    <div className="flex flex-col gap-4 w-[240px]">
      <Combobox options={FRAMEWORKS} placeholder="Select framework… (m, default)" aria-label="Framework" heightSize="m" />
      <Combobox options={FRAMEWORKS} placeholder="Select framework… (s)" aria-label="Framework" heightSize="s" />
    </div>
  ),
};

function SingleAllowCreateDemo() {
  const [value, setValue] = useState('');
  return (
    <div className="w-[240px]">
      <Combobox
        options={FRAMEWORKS}
        value={value}
        onValueChange={setValue}
        allowCreate
        placeholder="Select or type…"
        aria-label="Framework"
      />
      <p className="font-mono text-body-xs text-[var(--color-text-text-subtler)] mt-1">value: "{value}"</p>
    </div>
  );
}

export const SingleAllowCreate: Story = {
  name: 'Single — allowCreate',
  render: () => <SingleAllowCreateDemo />,
};

function MultipleDemo() {
  const [value, setValue] = useState<string[]>(['next']);
  return (
    <div className="w-[280px]">
      <Combobox
        options={FRAMEWORKS}
        multiple
        value={value}
        onValueChange={setValue}
        placeholder="Select frameworks…"
        aria-label="Frameworks"
      />
    </div>
  );
}

export const Multiple: Story = {
  render: () => <MultipleDemo />,
  // Enter adds a chip, Backspace on an empty query removes the last one.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Frameworks' });
    await expect(canvas.getByRole('button', { name: 'Remove Next.js' })).toBeInTheDocument();

    await userEvent.click(input);
    await userEvent.type(input, 'ast');
    await userEvent.keyboard('{Enter}');
    await expect(await canvas.findByRole('button', { name: 'Remove Astro' })).toBeInTheDocument();
    await expect(input).toHaveValue('');

    await userEvent.keyboard('{Backspace}');
    await waitFor(() => expect(canvas.queryByRole('button', { name: 'Remove Astro' })).toBeNull());
    await expect(canvas.getByRole('button', { name: 'Remove Next.js' })).toBeInTheDocument();
  },
};

function MultipleAllowCreateDemo() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="w-[280px]">
      <Combobox
        options={FRAMEWORKS}
        multiple
        value={value}
        onValueChange={setValue}
        allowCreate
        createOnDelimiter
        placeholder="Select or type new…"
        aria-label="Frameworks"
      />
    </div>
  );
}

export const MultipleAllowCreate: Story = {
  name: 'Multiple — allowCreate + delimiter',
  render: () => <MultipleAllowCreateDemo />,
};

export const WithClear: Story = {
  name: 'With clear button',
  render: () => (
    <div className="w-[240px]">
      <Combobox options={FRAMEWORKS} defaultValue="next" showClear placeholder="Select framework…" aria-label="Framework" />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="w-[240px]">
      <Combobox options={FRAMEWORKS} loading placeholder="Select framework…" aria-label="Framework" />
    </div>
  ),
};

export const ReadOnly: Story = {
  name: 'Read-only',
  render: () => (
    <div className="w-[280px]">
      <Combobox options={FRAMEWORKS} multiple value={['next', 'astro']} readOnly aria-label="Frameworks" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[240px]">
      <Combobox options={FRAMEWORKS} disabled placeholder="Select framework…" aria-label="Framework" />
    </div>
  ),
};
