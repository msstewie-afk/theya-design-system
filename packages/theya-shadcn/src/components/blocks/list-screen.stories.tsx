import type { Meta, StoryObj } from '@storybook/react';
import { Trash, Mail } from 'iconoir-react';
import { ListScreen } from './list-screen';

const meta: Meta<typeof ListScreen> = {
  title: 'Patterns/ListScreen',
  component: ListScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A reusable list/index screen: DataTable + DataTableToolbar wired to search, FilterField-based facets and bulk actions, plus a per-row actions menu.',
      },
    },
  },
  argTypes: {
    columns: { control: false, description: 'TanStack column definitions for the underlying DataTable.', table: { category: 'Content' } },
    data: { control: false, description: 'The rows to render.', table: { category: 'Content' } },
    primaryKey: { control: 'text', description: 'Column id the free-text search box filters on.', table: { category: 'Behavior' } },
    searchPlaceholder: { control: 'text', description: 'Placeholder for the free-text search box.', table: { category: 'Content' } },
    facets: { control: false, description: 'FilterField-based facets shown in the toolbar.', table: { category: 'Content' } },
    bulkActions: { control: false, description: 'Actions shown in the toolbar when rows are selected.', table: { category: 'Content' } },
    rowActions: { control: false, description: 'Per-row actions menu — a static list, or a function of the row.', table: { category: 'Content' } },
    getRowId: { control: false, description: 'Stable identity for a row, used as its selection key.', table: { category: 'Behavior' } },
    getRowLabel: { control: false, description: 'Accessible label for a row, used by selection and link affordances.', table: { category: 'Behavior' } },
    noun: { control: false, description: '{ one, many } noun used in empty/selection copy.', table: { category: 'Content' } },
    loading: { control: 'boolean', description: 'Shows the DataTable skeleton state instead of rows.', table: { category: 'State' } },
    emptyMessage: { control: 'text', description: 'Message shown when there are no rows.', table: { category: 'Content' } },
    ariaLabel: { control: 'text', description: 'Accessible name for the underlying table.', table: { category: 'Content' } },
    getRowHref: { control: false, description: 'Makes each row a link when provided.', table: { category: 'Behavior' } },
  },
};

export default meta;
type Story = StoryObj<typeof ListScreen>;

export const Default: Story = {
  render: () => (
    <div className="px-4 py-6 md:px-6">
      <ListScreen />
    </div>
  ),
};

export const WithBulkAndRowActions: Story = {
  name: 'With bulk and row actions',
  render: () => (
    <div className="px-4 py-6 md:px-6">
      <ListScreen
        bulkActions={[
          { label: 'Email', icon: <Mail />, onSelect: (rows) => alert(`Emailing ${rows.length}`) },
          { label: 'Remove', icon: <Trash />, destructive: true, confirm: { title: (n) => `Remove ${n} user(s)?`, onConfirm: () => {} } },
        ]}
        rowActions={[
          { label: 'View profile', onSelect: (row) => alert((row as { name: string }).name) },
          { label: 'Remove', destructive: true, separatorBefore: true, confirm: { title: (row) => `Remove ${(row as { name: string }).name}?`, onConfirm: () => {} } },
        ]}
      />
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="px-4 py-6 md:px-6">
      <ListScreen loading />
    </div>
  ),
};
