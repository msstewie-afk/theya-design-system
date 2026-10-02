import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { QueryBuilder, type QueryField, type QueryValue } from './query-builder';

const meta: Meta<typeof QueryBuilder> = {
  title: 'Search & Filter/QueryBuilder',
  component: QueryBuilder,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'The heavier sibling of Filter — compose arbitrary field-operator-value conditions. Uses Combobox(multiple) in place of a standalone MultiSelect.',
      },
    },
  },
  argTypes: {
    fields: { control: false, description: 'Filterable field definitions offered per condition row.' },
    value: { control: false, description: 'Controlled query value.' },
    defaultValue: { control: false, description: 'Uncontrolled initial query value.' },
    onChange: { control: false, description: 'Fires with the new query value when any condition changes.' },
    addLabel: { control: 'text', description: 'Label for the add-condition button.' },
    maxConditions: { control: { type: 'number', min: 1 }, description: 'Caps how many condition rows can be added.' },
    ariaLabel: { control: 'text', description: 'Accessible name for the query builder region.' },
    emptyMessage: { control: false, description: 'Shown when there are no conditions.' },
  },
};

export default meta;
type Story = StoryObj<typeof QueryBuilder>;

const FIELDS: QueryField[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'replicas', label: 'Replicas', type: 'number' },
  { name: 'created', label: 'Created', type: 'date' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'pending', label: 'Pending' },
    ],
  },
];

function Demo() {
  const [value, setValue] = useState<QueryValue>({
    match: 'all',
    conditions: [{ id: '1', field: 'status', operator: 'is_any_of', value: ['active'] }],
  });
  return (
    <div className="w-[640px]">
      <QueryBuilder fields={FIELDS} value={value} onChange={setValue} />
    </div>
  );
}

export const Default: Story = {
  render: () => <Demo />,
};

export const Empty: Story = {
  render: () => (
    <div className="w-[640px]">
      <QueryBuilder fields={FIELDS} />
    </div>
  ),
};

const TYPED_FIELDS: QueryField[] = [
  ...FIELDS,
  { name: 'ssl', label: 'SSL enabled', type: 'boolean' },
];

/** Range and typed editors: a number `between` (two NumberFields), a date, and a boolean (no value editor). */
export const RangesAndTypes: Story = {
  name: 'Ranges and types',
  render: () => (
    <div className="w-[700px]">
      <QueryBuilder
        fields={TYPED_FIELDS}
        ariaLabel="Site filters"
        defaultValue={{
          match: 'any',
          conditions: [
            { id: 'c1', field: 'replicas', operator: 'between', value: [2, 8] },
            { id: 'c2', field: 'created', operator: 'after', value: new Date(2026, 0, 1) },
            { id: 'c3', field: 'ssl', operator: 'is_true', value: undefined },
          ],
        }}
      />
    </div>
  ),
};

function ControlledDemo() {
  const [query, setQuery] = useState<QueryValue>({
    match: 'all',
    conditions: [{ id: 'c1', field: 'name', operator: 'contains', value: 'shop' }],
  });
  return (
    <div className="flex w-[640px] flex-col gap-4">
      <QueryBuilder fields={FIELDS} value={query} onChange={setQuery} ariaLabel="Site filters" />
      <pre className="overflow-x-auto rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] p-3 font-mono text-body-xs text-[var(--color-text-text-subtler)]">
        {JSON.stringify(query, null, 2)}
      </pre>
    </div>
  );
}

/** Controlled: the parent owns the query and can read it live. */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
  // Add a row (focus lands on its field), edit its value, switch all/any,
  // remove rows (focus moves to the next remove button, then to Add).
  // The JSON readout shows what the parent receives.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const json = () => JSON.parse(canvasElement.querySelector('pre')!.textContent!);
    const add = canvas.getByRole('button', { name: 'Add condition' });

    await userEvent.click(add);
    await waitFor(() => expect(canvas.getAllByRole('combobox', { name: 'Field' })[1]).toHaveFocus());
    await expect(json().conditions).toHaveLength(2);

    await userEvent.type(canvas.getAllByRole('textbox', { name: 'Name value' })[1], 'docs');
    await expect(json().conditions[1]).toMatchObject({ field: 'name', operator: 'contains', value: 'docs' });

    await userEvent.click(canvas.getByRole('combobox', { name: 'Match type' }));
    await userEvent.click(await body.findByRole('option', { name: 'any' }));
    await waitFor(() => expect(json().match).toBe('any'));

    await userEvent.click(canvas.getAllByRole('button', { name: 'Remove Name condition' })[0]);
    await expect(json().conditions).toHaveLength(1);
    await expect(json().conditions[0].value).toBe('docs');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Remove Name condition' })).toHaveFocus());

    await userEvent.keyboard('{Enter}');
    await expect(json().conditions).toHaveLength(0);
    await expect(canvas.getByText(/No conditions yet/)).toBeInTheDocument();
    await waitFor(() => expect(add).toHaveFocus());
  },
};
