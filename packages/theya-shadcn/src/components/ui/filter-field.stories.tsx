import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { FilterField, FILTER_FIELD_SEARCH_KEY, parseFilterDate, parseFilterNumber, type FilterAttribute, type AppliedFilter } from './filter-field';
import { StatusDot, type StatusTone } from './status-dot';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { filterFieldGuidelines } from './filter-field.guidelines';
import { testOnly } from '../../lib/test-only';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   One compact field combining keyword search and attribute-based filtering:
//   a two-step popover (search/attribute list, then a type-specific value
//   editor).
const meta: Meta<typeof FilterField> = {
  title: 'Search & Filter/FilterField',
  tags: ['autodocs'],
  parameters: {
    guidelines: filterFieldGuidelines,
    docs: {
      description: {
        component:
          "Keyword search and filtering by many attributes in one field — galleries, logs, clients — with the applied filters shown as chips people can edit.",
      },
    },
  },
  argTypes: {
    attributes: { control: false, description: 'Filterable attribute definitions offered in the attribute-picker step.', table: { category: 'Content' } },
    value: { control: false, description: 'Controlled applied filters.', table: { category: 'State' } },
    defaultValue: { control: false, description: 'Uncontrolled initial applied filters.', table: { category: 'State' } },
    onValueChange: { control: false, description: 'Fires when the applied filters change.', table: { category: 'Events' } },
    query: { control: false, description: 'Controlled free-text search query.', table: { category: 'State' } },
    onQueryChange: { control: false, description: 'Fires when the free-text search query changes.', table: { category: 'Events' } },
    placeholder: { control: 'text', description: 'Placeholder text for the free-text search input.', table: { category: 'Content' } },
    disabled: { control: 'boolean', description: 'Disables the filter field.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof FilterField>;

const body = () => within(document.body);

/** Text of the row the combobox currently points at. */
const activeRowText = (input: HTMLElement) => {
  const id = input.getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent?.trim() : undefined;
};

async function waitClosed() {
  await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
}

const ATTRIBUTES: FilterAttribute[] = [
  { key: 'name', label: 'Name', type: 'text', operators: true },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    multiple: true,
    options: [
      { value: 'published', label: 'Published', tone: 'success' },
      { value: 'expired', label: 'Expired', tone: 'danger' },
      { value: 'draft', label: 'Draft', tone: 'warning' },
    ],
  },
  {
    key: 'studio',
    label: 'Studio',
    type: 'select',
    searchable: false,
    options: [
      { value: 'helios', label: 'Helios Studio' },
      { value: 'selene', label: 'Selene Weddings' },
      { value: 'eos', label: 'Eos Portraits' },
    ],
  },
  { key: 'created', label: 'Created', type: 'date' },
  { key: 'expires', label: 'Expires', type: 'date', range: true },
  { key: 'photos', label: 'Photos', type: 'number' },
];

function Demo() {
  const [value, setValue] = useState<AppliedFilter[]>([{ key: 'status', value: 'published' }]);
  const [query, setQuery] = useState('');
  return (
    <div className="w-full max-w-[600px]">
      <FilterField attributes={ATTRIBUTES} value={value} onValueChange={setValue} query={query} onQueryChange={setQuery} aria-label="Filter galleries" />
    </div>
  );
}

/** With one filter applied: open the field to pick an attribute and its value, or type to add a keyword search chip. */
export const Default: Story = {
  render: () => <Demo />,
};

/** No filters yet: each attribute type has its own value editor — a list, text with operators, a number range, a date. */
export const Empty: Story = {
  render: () => (
    <div className="w-full max-w-[600px]">
      <FilterField attributes={ATTRIBUTES} aria-label="Filter galleries" />
    </div>
  ),
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Filter galleries' });
    await expect(canvas.getByText('No filters applied')).toBeInTheDocument();

    // Non-searchable select: its own listbox takes focus; arrows + Enter apply.
    await userEvent.click(input);
    await userEvent.click(body().getByRole('option', { name: 'Studio' }));
    const studios = await body().findByRole('listbox', { name: 'Studio' });
    await waitFor(() => expect(studios).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitClosed();
    await expect(canvas.getByRole('button', { name: 'Studio: Selene Weddings' })).toBeInTheDocument();

    // Text attribute with operators: Enter applies "contains".
    await userEvent.click(input);
    await userEvent.click(body().getByRole('option', { name: 'Name' }));
    await userEvent.type(await body().findByRole('textbox', { name: 'Name contains' }), 'gold{Enter}');
    await waitClosed();
    await expect(canvas.getByRole('button', { name: 'Name: Contains gold' })).toBeInTheDocument();

    // Number range: Apply with neither bound says what's missing (WCAG 3.3.1).
    await userEvent.click(input);
    await userEvent.click(body().getByRole('option', { name: 'Photos' }));
    const min = await body().findByRole('spinbutton', { name: 'Photos minimum' });
    await userEvent.click(body().getByRole('button', { name: 'Apply' }));
    await expect(min).toHaveAttribute('aria-invalid', 'true');
    await expect(min).toHaveAccessibleDescription('Enter a minimum, a maximum or both.');
    // Only a minimum -> "100+"; typing clears the message.
    await userEvent.type(min, '100');
    await userEvent.click(body().getByRole('button', { name: 'Apply' }));
    await waitClosed();
    await expect(canvas.getByRole('button', { name: 'Photos: 100+' })).toBeInTheDocument();
    await expect(canvas.getByText('3 filters applied')).toBeInTheDocument();

    // Removing a chip keeps focus in the field.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove filter Name: Contains gold' }));
    await expect(input).toHaveFocus();
    await userEvent.keyboard('{Escape}');

    // Ctrl/Cmd+A selects every chip; Backspace clears them all.
    input.focus();
    await userEvent.keyboard('{Control>}a{/Control}');
    await expect(canvas.getByText('2 filters selected. Press Backspace or Delete to remove.')).toBeInTheDocument();
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.getByText('No filters applied')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitClosed();
  }),
};

/** `disabled` turns off the input, the add button and every applied chip, while the chips stay readable. */
export const Disabled: Story = {
  render: () => (
    <div className="w-full max-w-[600px]">
      <FilterField attributes={ATTRIBUTES} defaultValue={[{ key: 'status', value: 'published' }]} disabled aria-label="Filter galleries" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', { name: 'Filter galleries' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Add filter' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Status: Published' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Remove filter Status: Published' })).toBeDisabled();
  },
};

/** On a mobile viewport the field's default 25rem (400px) width shrinks to fit the container instead of overflowing it — here a 360px container, with a chip applied so the shrink is visible against real content. (No frame lines: on a phone they hugged the field's edges and read as a broken border.) */
export const Mobile: Story = {
  render: () => (
    <div className="w-full max-w-[360px]">
      <FilterField attributes={ATTRIBUTES} defaultValue={[{ key: 'status', value: 'published' }]} aria-label="Filter galleries" />
    </div>
  ),
};

type AuditRow = {
  id: string;
  created: Date;
  severity: 'critical' | 'warning' | 'info' | 'resolved';
  actor: string;
  attempts: number;
  note: string;
};

const SEVERITY_TONE: Record<AuditRow['severity'], StatusTone> = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
  resolved: 'success',
};

const AUDIT_ROWS: AuditRow[] = [
  { id: '1', created: new Date(2026, 6, 2), severity: 'critical', actor: 'alice.chen', attempts: 7, note: 'Multiple failed sign-ins' },
  { id: '2', created: new Date(2026, 6, 3), severity: 'warning', actor: 'bob.martinez', attempts: 2, note: 'Password reset requested' },
  { id: '3', created: new Date(2026, 6, 5), severity: 'info', actor: 'carla.diaz', attempts: 0, note: 'New API key issued' },
  { id: '4', created: new Date(2026, 6, 6), severity: 'critical', actor: 'daniel.oyelaran', attempts: 12, note: 'Brute force detected' },
  { id: '5', created: new Date(2026, 6, 8), severity: 'resolved', actor: 'elena.petrova', attempts: 1, note: 'MFA re-enrolled' },
  { id: '6', created: new Date(2026, 6, 10), severity: 'warning', actor: 'frank.osei', attempts: 3, note: 'Unusual login location' },
  { id: '7', created: new Date(2026, 6, 12), severity: 'info', actor: 'grace.kim', attempts: 0, note: 'Role permissions updated' },
  { id: '8', created: new Date(2026, 6, 14), severity: 'critical', actor: 'hassan.ali', attempts: 9, note: 'Account locked after repeated failures' },
  { id: '9', created: new Date(2026, 6, 15), severity: 'resolved', actor: 'irina.volkov', attempts: 1, note: 'Session revoked' },
  { id: '10', created: new Date(2026, 6, 18), severity: 'warning', actor: 'james.okafor', attempts: 4, note: 'New device registered' },
  { id: '11', created: new Date(2026, 6, 20), severity: 'info', actor: 'karolina.nowak', attempts: 0, note: 'Export requested' },
  { id: '12', created: new Date(2026, 6, 22), severity: 'critical', actor: 'liam.oconnor', attempts: 15, note: 'Credential stuffing attempt' },
];

const AUDIT_ATTRIBUTES: FilterAttribute[] = [
  { key: 'created', label: 'Created', type: 'date', range: true },
  {
    key: 'severity',
    label: 'Severity',
    type: 'select',
    multiple: true,
    searchable: false,
    options: [
      { value: 'critical', label: 'Critical', tone: 'danger' },
      { value: 'warning', label: 'Warning', tone: 'warning' },
      { value: 'info', label: 'Info', tone: 'info' },
      { value: 'resolved', label: 'Resolved', tone: 'success' },
    ],
  },
  {
    key: 'actor',
    label: 'Actor',
    type: 'select',
    multiple: true,
    options: AUDIT_ROWS.map((r) => ({ value: r.actor, label: r.actor })),
  },
  { key: 'attempts', label: 'Failed attempts', type: 'number' },
];

function matchesFilters(row: AuditRow, filters: AppliedFilter[]): boolean {
  const byKey = new Map<string, string[]>();
  for (const filter of filters) {
    const values = byKey.get(filter.key) ?? [];
    values.push(filter.value);
    byKey.set(filter.key, values);
  }
  for (const [key, values] of byKey) {
    if (key === FILTER_FIELD_SEARCH_KEY) {
      const haystack = `${row.actor} ${row.note}`.toLowerCase();
      if (!values.some((value) => haystack.includes(value.toLowerCase()))) return false;
    } else if (key === 'severity') {
      if (!values.includes(row.severity)) return false;
    } else if (key === 'actor') {
      if (!values.includes(row.actor)) return false;
    } else if (key === 'created') {
      const range = parseFilterDate(values[values.length - 1]);
      if (range && (row.created < range.from || row.created > range.to)) return false;
    } else if (key === 'attempts') {
      const { min, max } = parseFilterNumber(values[values.length - 1]);
      if (min != null && row.attempts < min) return false;
      if (max != null && row.attempts > max) return false;
    }
  }
  return true;
}

function LiveListDemo() {
  const [applied, setApplied] = useState<AppliedFilter[]>([]);
  const [query, setQuery] = useState('');
  const rows = AUDIT_ROWS.filter((row) => matchesFilters(row, applied));
  return (
    <div className="flex w-full max-w-[700px] flex-col gap-3">
      <FilterField attributes={AUDIT_ATTRIBUTES} value={applied} onValueChange={setApplied} query={query} onQueryChange={setQuery} aria-label="Filter audit log" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead className="text-right tabular-nums">Attempts</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[var(--color-text-text-subtler)]">
                No events match these filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell label="Created" className="whitespace-nowrap">{row.created.toLocaleDateString(undefined, { dateStyle: 'medium' })}</TableCell>
                <TableCell label="Severity">
                  <span className="inline-flex items-center gap-1">
                    <StatusDot tone={SEVERITY_TONE[row.severity]} aria-hidden="true" />
                    {row.severity}
                  </span>
                </TableCell>
                <TableCell label={false} className="max-sm:order-first">{row.actor}</TableCell>
                <TableCell label="Attempts" className="text-right tabular-nums max-sm:text-start">{row.attempts}</TableCell>
                <TableCell label="Note" className="text-[var(--color-text-text-subtler)]">{row.note}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <p className="font-body text-body-xs text-[var(--color-text-text-subtler)]">
        {rows.length} of {AUDIT_ROWS.length} events shown.
      </p>
    </div>
  );
}

/** Driving a real list: applied filters wire straight into a client-side match over a sample audit log, so the effect of each chip — and of combining several — is visible immediately. */
export const LiveList: Story = {
  render: () => <LiveListDemo />,
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Filter galleries' });
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    // An applied chip opens its editor — it is a button, not a toggle.
    const chip = canvas.getByRole('button', { name: 'Status: Published' });
    await expect(chip).not.toHaveAttribute('aria-pressed');

    // Step one: the input drives the attribute list via activedescendant.
    await userEvent.click(input);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(body().getByRole('listbox', { name: 'Filter by…' })).toBeInTheDocument();
    // Empty query: the disabled "Search for" row is skipped.
    await expect(activeRowText(input)).toBe('Name');
    await userEvent.keyboard('{ArrowUp}');
    await expect(activeRowText(input)).toBe('Name');
    await userEvent.keyboard('{ArrowDown}');
    await expect(activeRowText(input)).toBe('Status');

    // Step two for a multi-select: picking keeps the editor open.
    await userEvent.keyboard('{Enter}');
    await userEvent.click(await body().findByRole('option', { name: /Expired/ }));
    await expect(canvas.getByRole('button', { name: 'Status: Expired' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitClosed();

    // Typed text becomes a search chip from the highlighted "Search for" row.
    await userEvent.click(input);
    await userEvent.type(input, 'wedding');
    await expect(activeRowText(input)).toContain('Search for "wedding"');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('button', { name: 'Remove search "wedding"' })).toBeInTheDocument();
    await expect(input).toHaveValue('');

    // Backspace in the empty input removes the last chip.
    await userEvent.keyboard('{Backspace}');
    await expect(canvas.queryByRole('button', { name: 'Remove search "wedding"' })).toBeNull();
    await expect(canvas.getByText('2 filters applied')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitClosed();
  },
};
