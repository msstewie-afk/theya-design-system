import type { Meta, StoryObj } from '@storybook/react';
import { BillingUsage } from './billing-usage';

const meta: Meta<typeof BillingUsage> = {
  title: 'Patterns/BillingUsage',
  component: BillingUsage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Page heading.', table: { category: 'Content' } },
    plan: { control: false, description: 'Current plan summary card.', table: { category: 'Content' } },
    stats: { control: false, description: 'KPI tiles (renders a 2-up / lg:3-up grid).', table: { category: 'Content' } },
    quotas: { control: false, description: 'Metered quotas, one Progress bar each.', table: { category: 'Content' } },
    storageBreakdown: { control: false, description: 'Breakdown of a single storage pool by category, shown as one segmented UsageBar.', table: { category: 'Content' } },
    storageTotal: { control: { type: 'number' }, description: 'The storage pool size (denominator for the breakdown bar); defaults to the segment sum.', table: { category: 'Content' } },
    storageUnit: { control: 'text', description: 'Unit label appended to storage values (e.g. "GB").', table: { category: 'Content' } },
    invoices: { control: false, description: 'Billing history rows.', table: { category: 'Content' } },
    onUpgrade: { control: false, description: 'Fires when the upgrade button is clicked.', table: { category: 'Events' } },
    upgradeLabel: { control: 'text', description: 'Label for the upgrade button.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<typeof BillingUsage>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <BillingUsage onUpgrade={() => alert('Upgrade clicked')} />
    </div>
  ),
};
