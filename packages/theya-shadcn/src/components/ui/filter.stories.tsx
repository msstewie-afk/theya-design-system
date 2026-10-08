import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Filter } from './filter';
import { filterGuidelines } from './filter.guidelines';

const meta: Meta<typeof Filter> = {
  title: 'Search & Filter/Filter',
  component: Filter,
  tags: ['autodocs'],
  parameters: { guidelines: filterGuidelines },
  argTypes: {
    label: { control: 'text', description: 'The facet name shown on the trigger, e.g. "Status".', table: { category: 'Content' } },
    options: { control: false, description: 'Selectable filter options.', table: { category: 'Content' } },
    value: { control: false, description: 'Controlled selected value(s).', table: { category: 'State' } },
    defaultValue: { control: false, description: 'Uncontrolled initial selected value(s).', table: { category: 'State' } },
    onValueChange: { control: false, description: 'Fires with the new selection.', table: { category: 'Events' } },
    searchable: { control: 'boolean', description: 'Show a search box above the list (for facets with many options).', table: { category: 'Behavior' } },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'], description: 'Popover alignment relative to the trigger.', table: { category: 'Appearance' } },
    heightSize: { control: 'radio', options: ['sm', 'md', 'lg'], description: 'Trigger height (and search field, when searchable): sm 32px, body-s | md (default) 40px, body-m | lg 48px, body-m.', table: { category: 'Appearance' } },
    disabled: { control: 'boolean', description: 'Disables the filter trigger.', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<typeof Filter>;

const body = () => within(document.body);

async function closePopover(trigger: HTMLElement) {
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(body().queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(trigger).toHaveFocus());
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', count: 24 },
  { value: 'suspended', label: 'Suspended', count: 3 },
  { value: 'pending', label: 'Pending', count: 7 },
];

export const Default: Story = {
  render: () => <Filter label="Status" options={STATUS_OPTIONS} />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Status' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    const group = await body().findByRole('group', { name: 'Status' });
    await userEvent.click(within(group).getByRole('checkbox', { name: /Active/ }));
    await userEvent.click(within(group).getByRole('checkbox', { name: /Pending/ }));
    await expect(within(group).getByRole('checkbox', { name: /Active/ })).toBeChecked();

    // The count is read after the facet name, not before it. Checked on the
    // attribute: on a phone the sheet is modal, so the trigger behind it is
    // aria-hidden and has no computed name until the sheet closes.
    await expect(trigger).toHaveAttribute('aria-label', 'Status, 2 selected');

    // Clearing keeps focus inside the popover.
    await userEvent.click(body().getByRole('button', { name: 'Clear 2 selected' }));
    await expect(trigger).not.toHaveAttribute('aria-label');
    await expect(body().queryByRole('button', { name: /Clear/ })).toBeNull();
    await waitFor(() => expect(within(group).getByRole('checkbox', { name: /Active/ })).toHaveFocus());

    await closePopover(trigger);
  },
};

export const WithSelection: Story = {
  name: 'With selection',
  render: () => <Filter label="Status" options={STATUS_OPTIONS} defaultValue={['active']} />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Status, 1 selected' });
    // Keyboard: Space toggles the focused checkbox.
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const group = await body().findByRole('group', { name: 'Status' });
    const suspended = within(group).getByRole('checkbox', { name: /Suspended/ });
    suspended.focus();
    await userEvent.keyboard(' ');
    await expect(suspended).toBeChecked();
    await expect(trigger).toHaveAttribute('aria-label', 'Status, 2 selected');
    await closePopover(trigger);
    // Closed: the full computed name, on every viewport.
    await expect(trigger).toHaveAccessibleName('Status, 2 selected');
  },
};

export const Searchable: Story = {
  render: () => (
    <Filter
      label="Owner"
      searchable
      options={[
        { value: 'jane', label: 'Jane Doe' },
        { value: 'john', label: 'John Smith' },
        { value: 'alex', label: 'Alex Chen' },
        { value: 'maria', label: 'Maria Garcia' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Owner' });
    await userEvent.click(trigger);
    const search = await body().findByRole('textbox', { name: 'Search Owner' });
    const group = body().getByRole('group', { name: 'Owner' });

    await userEvent.type(search, 'ma');
    await expect(within(group).getAllByRole('checkbox')).toHaveLength(1);
    await expect(within(group).getByRole('checkbox', { name: 'Maria Garcia' })).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    await expect(within(group).getByText('No options')).toBeInTheDocument();

    await userEvent.clear(search);
    await expect(within(group).getAllByRole('checkbox')).toHaveLength(4);
    await closePopover(trigger);
  },
};

export const FilterBar: Story = {
  name: 'Filter bar',
  render: () => (
    <div className="flex gap-2">
      <Filter label="Status" options={STATUS_OPTIONS} />
      <Filter label="Type" options={[{ value: 'shared', label: 'Shared' }, { value: 'vps', label: 'VPS' }, { value: 'dedicated', label: 'Dedicated' }]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('button', { name: 'Status' });
    const type = canvas.getByRole('button', { name: 'Type' });

    // Facets keep independent selections.
    await userEvent.click(type);
    await userEvent.click(within(await body().findByRole('group', { name: 'Type' })).getByRole('checkbox', { name: 'VPS' }));
    await closePopover(type);
    await expect(type).toHaveAccessibleName('Type, 1 selected');
    await expect(status).toHaveAccessibleName('Status');
  },
};
