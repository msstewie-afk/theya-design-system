import type { Meta, StoryObj } from '@storybook/react';
import { Filter } from './filter';

const meta: Meta<typeof Filter> = {
  title: 'Navigation/Filter',
  component: Filter,
  tags: ['autodocs'],
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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', count: 24 },
  { value: 'suspended', label: 'Suspended', count: 3 },
  { value: 'pending', label: 'Pending', count: 7 },
];

export const Default: Story = {
  render: () => <Filter label="Status" options={STATUS_OPTIONS} />,
};

export const WithSelection: Story = {
  name: 'With selection',
  render: () => <Filter label="Status" options={STATUS_OPTIONS} defaultValue={['active']} />,
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
};

export const FilterBar: Story = {
  name: 'Filter bar',
  render: () => (
    <div className="flex gap-2">
      <Filter label="Status" options={STATUS_OPTIONS} />
      <Filter label="Type" options={[{ value: 'shared', label: 'Shared' }, { value: 'vps', label: 'VPS' }, { value: 'dedicated', label: 'Dedicated' }]} />
    </div>
  ),
};
