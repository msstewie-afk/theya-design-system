import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
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

/** Attention actions are named with their target and report the item; quotas expose their numbers. */
export const Default: Story = {
  args: { onViewAll: fn(), onAttentionAction: fn() },
  render: (args) => <DashboardOverview onViewAll={args.onViewAll} onAttentionAction={args.onAttentionAction} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Investigate: legacy.seashell.dev' }));
    await expect(args.onAttentionAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'legacy.seashell.dev' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Resume site: staging.seashell.dev' }));
    await expect(args.onAttentionAction).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'staging.seashell.dev' }));
    await userEvent.click(canvas.getByRole('button', { name: 'View all' }));
    await expect(args.onViewAll).toHaveBeenCalledTimes(1);
    // Every quota bar carries its numbers in its name.
    for (const bar of canvas.getAllByRole('progressbar')) await expect(bar).toHaveAccessibleName(/ of .*percent/);
  },
};

/** Nothing to act on: the all-clear message, no "View all". */
export const Healthy: Story = {
  name: 'Healthy (no attention items)',
  render: () => <DashboardOverview attention={[]} onViewAll={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing needs your attention.')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'View all' })).toBeNull();
  },
};

/** Without a handler the attention rows show no (dead) action buttons. */
export const ReadOnly: Story = {
  render: () => <DashboardOverview />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button', { name: /^Investigate/ })).toBeNull();
  },
};
