import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { SpecSheet } from './spec-sheet';
import { DEMO_SPECS } from './demo-data';

const meta: Meta<typeof SpecSheet> = {
  title: 'Patterns: Catalog/SpecSheet',
  component: SpecSheet,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { groups: DEMO_SPECS },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof SpecSheet>;

/** Grouped, units always shown, folded after 8 rows. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Last updated')).not.toBeInTheDocument();
    const more = canvas.getByRole('button', { name: 'Show all 13 specifications' });
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Last updated')).toBeVisible();
  },
};

export const AllVisible: Story = {
  args: { initialCount: 0 },
};
