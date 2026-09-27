import type { Meta, StoryObj } from '@storybook/react';
import { DashboardOverview } from './dashboard-overview';

const meta: Meta<typeof DashboardOverview> = {
  title: 'Patterns/DashboardOverview',
  component: DashboardOverview,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text', description: 'Page heading.', table: { category: 'Content' } },
    summary: { control: false, description: 'Subtitle line below the title.', table: { category: 'Content' } },
    attention: { control: false, description: 'Worst-first items needing action; the lede. Empty = healthy state.', table: { category: 'Content' } },
    attentionTotal: { control: { type: 'number' }, description: 'Total count the attention badge is "n of" (e.g. all sites).', table: { category: 'Content' } },
    stats: { control: false, description: 'KPI cards (renders a 2-up / lg:4-up grid).', table: { category: 'Content' } },
    requests: { control: false, description: 'AreaChart data points for the requests-over-time chart.', table: { category: 'Content' } },
    requestsAriaLabel: { control: 'text', description: 'Accessible label for the requests chart.', table: { category: 'Content' } },
    quotas: { control: false, description: 'Metered resource bars: one Progress bar each.', table: { category: 'Content' } },
    capacity: { control: false, description: 'Breakdown of one pool, shown as a segmented UsageBar below the quota bars.', table: { category: 'Content' } },
    capacityTotal: { control: { type: 'number' }, description: 'Denominator for the capacity UsageBar segments.', table: { category: 'Content' } },
    capacityFormat: { control: false, description: 'Custom formatter for values shown on the capacity UsageBar.', table: { category: 'Advanced' } },
    activity: { control: false, description: 'Recent-activity items, rendered as a Timeline. Hidden entirely when empty.', table: { category: 'Content' } },
    onAttentionAction: { control: false, description: 'Fires when an attention item\'s action button is clicked.', table: { category: 'Events' } },
    onViewAll: { control: false, description: 'Fires when the "View all" footer control is clicked (renders as a button instead of a link).', table: { category: 'Events' } },
    viewAllHref: { control: 'text', description: '"View all" link target. Renders the footer as an anchor.', table: { category: 'Behavior' } },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardOverview>;

export const Default: Story = {
  render: () => <DashboardOverview onViewAll={() => alert('View all clicked')} onAttentionAction={(item) => alert(`Action for ${item.id}`)} />,
};

export const Healthy: Story = {
  name: 'Healthy (no attention items)',
  render: () => <DashboardOverview attention={[]} />,
};
