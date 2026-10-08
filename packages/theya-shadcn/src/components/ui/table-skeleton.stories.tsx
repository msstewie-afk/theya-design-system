import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableHeader, TableBody, TableRow, TableHead } from './table';
import { TableSkeletonRows } from './table-skeleton';
import { tableSkeletonGuidelines } from './table-skeleton.guidelines';

const meta: Meta<typeof TableSkeletonRows> = {
  title: 'Status & Feedback/TableSkeleton',
  component: TableSkeletonRows,
  parameters: { guidelines: tableSkeletonGuidelines },
  tags: ['autodocs'],
  argTypes: {
    rows: { control: { type: 'number', min: 1 }, description: 'Number of skeleton rows. Default 6.' },
    columns: { control: false, description: 'Column count, or per-column { align, width, control } definitions.' },
  },
};

export default meta;
type Story = StoryObj<typeof TableSkeletonRows>;

export const Default: Story = {
  render: () => (
    <Table className="w-full max-w-[500px]">
      <TableHeader>
        <TableRow>
          <TableHead>Domain</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Replicas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody aria-busy="true">
        <TableSkeletonRows rows={5} columns={[{}, {}, { align: 'right', width: '2rem' }]} />
      </TableBody>
    </Table>
  ),
};
