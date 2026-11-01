import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Autocomplete } from './autocomplete';
import { FieldError } from './field';
import { Label } from './label';
import { autocompleteGuidelines } from './autocomplete.guidelines';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   Built on our own Popover. The value is the TEXT the user typed; they can
//   pick a suggestion to fill the input, or submit their own text.
const meta: Meta<typeof Autocomplete> = {
  title: 'Selection/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
  parameters: {
    guidelines: autocompleteGuidelines,
    docs: {
      description: {
        component:
          "Free text with suggestions: a shoot location, a city, a recent search. Any typed value is valid; the suggestions only save typing.",
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

const SECTIONS = [
  { value: 'prints', label: 'Prints' },
  { value: 'presets', label: 'Presets', note: 'Beta' },
  { value: 'portals', label: 'Portals' },
  { value: 'archive', label: 'Archive' },
];

// Trailing-note demo: each suggestion says where that name is already
// used, so the user can tell a reuse from a typo before committing.
const PRESETS = [
  { value: 'web', label: 'Web', note: 'In use by 4 galleries' },
  { value: 'proofing', label: 'Proofing', note: 'Watermarked, removed after 7 days' },
  { value: 'print', label: 'Print', note: 'In use by 2 galleries' },
];

/** Type to see matching suggestions; the arrow keys move through them and Enter fills the input with the highlighted one. */
export const Default: Story = {
  render: () => (
    <div className="w-[280px]">
      <Autocomplete options={SECTIONS} placeholder="Search sections" aria-label="Search sections" />
    </div>
  ),
  // Keyboard-only selection (WCAG 2.1.1): arrows move a highlight that is
  // exposed via aria-activedescendant, Enter picks it.
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Search sections' });

    await userEvent.click(input);
    await userEvent.type(input, 'p');
    const listbox = await within(document.body).findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    await expect(options).toHaveLength(3); // prefix match: Prints, Presets, Portals
    await expect(options[1]).toHaveTextContent('Presets');
    await expect(input).not.toHaveAttribute('aria-activedescendant');

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(input).toHaveAttribute('aria-activedescendant', options[1].id);

    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Presets');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

/** `heightSize="md"` (default) and `heightSize="sm"`; the suggestion text follows the field's size. */
export const HeightSizes: Story = {
  name: 'Height sizes (m / s)',
  render: () => (
    <div className="flex flex-col gap-4 w-[280px]">
      <Autocomplete options={SECTIONS} placeholder="Search sections (m, default)" aria-label="Search sections" heightSize="md" />
      <Autocomplete options={SECTIONS} placeholder="Search sections (s)" aria-label="Search sections" heightSize="sm" />
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('');
  return (
    <div className="w-[280px]">
      <Autocomplete
        options={SECTIONS}
        placeholder="Search sections"
        aria-label="Search sections"
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}

/** The typed text is the value: Enter without a highlighted suggestion keeps it, and so does text that matches nothing. */
export const FreeText: Story = {
  name: 'Free text',
  render: () => <ControlledDemo />,
  // Enter without a highlight keeps the typed text; no match keeps it too.
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Search sections' });

    await userEvent.click(input);
    await userEvent.type(input, 'Pres');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Pres');

    await userEvent.clear(input);
    await userEvent.type(input, 'zzz');
    await expect(await within(document.body).findByText('No results.')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('zzz');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};

/** `loading` shows a spinner and a loading message in the dropdown while suggestions are being fetched. */
export const Loading: Story = {
  render: () => (
    <div className="w-[280px]">
      <Autocomplete options={SECTIONS} placeholder="Search sections" aria-label="Search sections" loading />
    </div>
  ),
};

/** A `note` on each option adds a short line of context beside it — here, where each name is already in use, so a reuse is easy to tell from a typo. */
export const WithTrailingNote: Story = {
  name: 'With trailing note',
  render: () => (
    <div className="w-[280px]">
      <Autocomplete options={PRESETS} placeholder="Preset name" aria-label="Preset name" />
    </div>
  ),
};

/** `readOnly`: the value stays visible and selectable, but typing and the suggestion list are off. */
export const ReadOnly: Story = {
  name: 'Read-only',
  render: () => (
    <div className="w-[280px]">
      <Autocomplete
        options={SECTIONS}
        defaultValue="Prints"
        readOnly
        aria-label="Search sections"
      />
    </div>
  ),
};

/** `disabled`: the field can't be focused, typed into or opened. */
export const Disabled: Story = {
  render: () => (
    <div className="w-[280px]">
      <Autocomplete options={SECTIONS} placeholder="Search sections" aria-label="Search sections" disabled />
    </div>
  ),
};

/** Invalid: `aria-invalid` plus `aria-describedby` pointing at a FieldError that says what to change (WCAG 3.3.1). */
export const ErrorState: Story = {
  name: 'Error',
  render: () => (
    <div className="flex w-[280px] flex-col gap-1">
      <Label htmlFor="section-error" data-error>
        Section
      </Label>
      <Autocomplete id="section-error" options={SECTIONS} defaultValue="Printz" aria-invalid aria-describedby="section-error-message" />
      <FieldError id="section-error-message">Pick a section from the list.</FieldError>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox', { name: 'Section' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Pick a section from the list.');
  },
};
