import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { CancellationFlow } from './cancellation-flow';

const meta: Meta<typeof CancellationFlow> = {
  title: 'Patterns: Commerce/CancellationFlow',
  component: CancellationFlow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { onFinish: fn(), onKeep: fn() },
};
export default meta;
type Story = StoryObj<typeof CancellationFlow>;

/** What happens → alternatives (skippable) → confirm; "Keep my plan" on every step. */
export const Cancel: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Cancel your Pro plan?' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await expect(canvas.getByRole('heading', { name: 'Before you go' })).toHaveFocus();
    await expect(canvas.getByRole('radio', { name: 'Cancel the plan' })).toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Continue to cancel' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel plan' }));
    await expect(args.onFinish).toHaveBeenCalledWith('cancelled', undefined);
    await expect(canvas.getByRole('heading', { name: 'Pro plan cancelled' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Resume plan' }));
    await expect(canvas.getByRole('heading', { name: 'Confirm cancellation' })).toBeVisible();
  },
};

/** Picking an alternative finishes right there, with its own button label. */
export const Downgrade: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await userEvent.click(canvas.getByRole('radio', { name: 'Switch to Starter' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Switch to Starter' }));
    await expect(args.onFinish).toHaveBeenCalledWith('downgraded', undefined);
    await expect(canvas.getByRole('heading', { name: 'Switched to Starter' })).toBeVisible();
  },
};
