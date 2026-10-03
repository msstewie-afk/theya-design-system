import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { PlanComparison } from './plan-comparison';
import { DEMO_FEATURES, DEMO_PLANS } from './demo-data';

const meta: Meta<typeof PlanComparison> = {
  title: 'Patterns: Commerce/PlanComparison',
  component: PlanComparison,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { plans: DEMO_PLANS, features: DEMO_FEATURES, onSelect: fn() },
};
export default meta;
type Story = StoryObj<typeof PlanComparison>;

/** Yearly by default with the saving on the toggle; "Only differences" hides identical rows. */
export const Default: Story = {
  render: (args) => (
    <div className="max-w-5xl">
      <PlanComparison {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole('table');
    await expect(within(table).getByText('$24')).toBeVisible();
    await userEvent.click(canvas.getByRole('radio', { name: 'Monthly' }));
    await expect(within(table).getByText('$30')).toBeVisible();

    await expect(within(table).getByRole('rowheader', { name: 'Bandwidth' })).toBeVisible();
    await userEvent.click(canvas.getByRole('switch', { name: 'Only differences' }));
    await expect(within(table).queryByRole('rowheader', { name: 'Bandwidth' })).toBeNull();

    await userEvent.click(within(table).getByRole('button', { name: /^Choose Pro/ }));
    await expect(args.onSelect).toHaveBeenCalledWith('pro', 'monthly');
  },
};

/** For someone already on a plan: its button says so and is disabled. */
export const WithCurrentPlan: Story = {
  args: { currentPlanId: 'starter' },
  render: (args) => (
    <div className="max-w-5xl">
      <PlanComparison {...args} />
    </div>
  ),
};

/** Phone width: one tab per plan instead of columns. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <div className="max-w-sm">
      <PlanComparison {...args} />
    </div>
  ),
};
