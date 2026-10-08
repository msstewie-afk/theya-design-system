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
    <div className="mx-auto max-w-5xl">
      <PlanComparison {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    // Phone (below md): one plan at a time, chosen with tabs; the billing switch and
    // the plan's own button work the same.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      const c = within(canvasElement);
      await userEvent.click(c.getByRole('tab', { name: 'Business' }));
      const panel = c.getByRole('tabpanel', { name: 'Business' });
      await expect(panel).toHaveTextContent('$60');
      await userEvent.click(c.getByRole('radio', { name: 'Monthly' }));
      await expect(c.getByRole('tabpanel', { name: 'Business' })).toHaveTextContent('$75');
      await userEvent.click(within(c.getByRole('tabpanel', { name: 'Business' })).getByRole('button', { name: /^Choose Business/ }));
      await expect(args.onSelect).toHaveBeenCalledWith('business', 'monthly');
      return;
    }

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
    <div className="mx-auto max-w-5xl">
      <PlanComparison {...args} />
    </div>
  ),
};

/** Phone width: one tab per plan instead of columns. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'android360' } },
  render: (args) => (
    <div className="max-w-sm">
      <PlanComparison {...args} />
    </div>
  ),
};
