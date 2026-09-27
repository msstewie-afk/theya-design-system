import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterField, FILTER_FIELD_SEARCH_KEY, parseFilterDate, parseFilterNumber, type FilterAttribute, type AppliedFilter } from './filter-field';
import { StatusDot, type StatusTone } from './status-dot';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

const meta: Meta<typeof FilterField> = {
  title: 'Navigation/FilterField',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One compact field combining keyword search and attribute-based filtering. The most complex component ' +
          'ported this session — a two-step popover (search/attribute list, then a type-specific value editor).',
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

const ATTRIBUTES: FilterAttribute[] = [
  { key: 'name', label: 'Name', type: 'text', operators: true },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    multiple: true,
    options: [
      { value: 'active', label: 'Active', tone: 'success' },
      { value: 'suspended', label: 'Suspended', tone: 'danger' },
      { value: 'pending', label: 'Pending', tone: 'warning' },
    ],
  },
  {
    key: 'region',
    label: 'Region',
    type: 'select',
    searchable: false,
    options: [
      { value: 'eu-west-1', label: 'eu-west-1' },
      { value: 'us-east-1', label: 'us-east-1' },
      { value: 'ap-south-1', label: 'ap-south-1' },
    ],
  },
  { key: 'created', label: 'Created', type: 'date' },
  { key: 'expires', label: 'Expires', type: 'date', range: true },
  { key: 'replicas', label: 'Replicas', type: 'number' },
];

function Demo() {
  const [value, setValue] = useState<AppliedFilter[]>([{ key: 'status', value: 'active' }]);
  const [query, setQuery] = useState('');
  return (
    <div className="w-[600px]">
      <FilterField attributes={ATTRIBUTES} value={value} onValueChange={setValue} query={query} onQueryChange={setQuery} aria-label="Filter servers" />
    </div>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

export const Empty: Story = {
  render: () => (
    <div className="w-[600px]">
      <FilterField attributes={ATTRIBUTES} aria-label="Filter servers" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-[600px]">
      <FilterField attributes={ATTRIBUTES} defaultValue={[{ key: 'status', value: 'active' }]} disabled aria-label="Filter servers" />
    </div>
  ),
};

/** On a mobile viewport the field's 520px floor shrinks to fit the container instead of overflowing it — shown in a 360px frame with a chip applied so the shrink is visible against real content. */
export const Mobile: Story = {
  render: () => (
    <div className="w-[360px] max-w-full border-x border-solid border-[var(--color-border-border-subtle)]">
      <FilterField attributes={ATTRIBUTES} defaultValue={[{ key: 'status', value: 'active' }]} aria-label="Filter servers" />
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
  { id: '1', created: new Date(2026, 6, 2), severity: 'critical', actor: 'alice.chen', attempts: 7, note: 'Multiple failed SSH logins' },
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
    <div className="flex w-[700px] flex-col gap-3">
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
                <TableCell className="whitespace-nowrap">{row.created.toLocaleDateString(undefined, { dateStyle: 'medium' })}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <StatusDot tone={SEVERITY_TONE[row.severity]} aria-hidden="true" />
                    {row.severity}
                  </span>
                </TableCell>
                <TableCell>{row.actor}</TableCell>
                <TableCell className="text-right tabular-nums">{row.attempts}</TableCell>
                <TableCell className="text-[var(--color-text-text-subtler)]">{row.note}</TableCell>
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
