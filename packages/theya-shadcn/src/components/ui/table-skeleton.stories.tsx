import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableHeader, TableBody, TableRow, TableHead } from './table';
import { TableSkeletonRows } from './table-skeleton';
import { tableSkeletonGuidelines } from './table-skeleton.guidelines';
import { expect, userEvent } from '@storybook/test';
import { resetFocus } from '../../test/keyboard';

const meta: Meta<typeof TableSkeletonRows> = {
  title: 'Status & Feedback/TableSkeleton',
  component: TableSkeletonRows,
  parameters: {
    docs: {
      description: {
        component:
          "Skeleton rows under real column headers for the first load of a table, without a flash when the data comes back fast.",
      },
    },
    guidelines: tableSkeletonGuidelines,
  },
  tags: ['autodocs'],
  argTypes: {
    rows: { control: { type: 'number', min: 1 }, description: 'Number of skeleton rows. Default 6.' },
    columns: { control: false, description: 'Column count, or per-column { align, width, control } definitions.' },
  },
};

export default meta;
type Story = StoryObj<typeof TableSkeletonRows>;

/** Five skeleton rows under real column headers; the last column is right-aligned and narrower, matching the numbers it will hold. */
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
  // Placeholders add no tab stops: the table's own scroll container is the
  // only one (Table keeps it focusable), and the next Tab leaves the table.
  play: async ({ canvasElement }) => {
    resetFocus();
    await userEvent.tab();
    await expect(document.activeElement).toHaveAttribute('data-slot', 'table-container');
    await userEvent.tab();
    await expect(canvasElement.contains(document.activeElement)).toBe(false);
  },
};
