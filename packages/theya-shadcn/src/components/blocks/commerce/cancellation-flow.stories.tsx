import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { CancellationFlow } from './cancellation-flow';
import { cancellationFlowGuidelines } from './cancellation-flow.guidelines';

const meta: Meta<typeof CancellationFlow> = {
  title: 'Patterns: Commerce/CancellationFlow',
  component: CancellationFlow,
  tags: ['autodocs'],
  parameters: { guidelines: cancellationFlowGuidelines, layout: 'padded' },
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
    // The pressed button is replaced by the done screen: focus goes to its
    // title (which carries the description), not <body>.
    const done = canvas.getByRole('heading', { name: 'Pro plan cancelled' });
    await expect(done).toBeVisible();
    await waitFor(() => expect(done).toHaveFocus());
    await expect(done).toHaveAccessibleDescription(/Everything keeps working until Nov 3, 2026/);
    // And back: the step doesn't change, but focus still lands on its heading.
    await userEvent.click(canvas.getByRole('button', { name: 'Resume plan' }));
    const confirm = canvas.getByRole('heading', { name: 'Confirm cancellation' });
    await expect(confirm).toBeVisible();
    await waitFor(() => expect(confirm).toHaveFocus());
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
    const done = canvas.getByRole('heading', { name: 'Switched to Starter' });
    await expect(done).toBeVisible();
    await waitFor(() => expect(done).toHaveFocus());
  },
};

/** Pausing finishes on step 2 as well; focus moves to the done screen's title. */
export const Pause: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await userEvent.click(canvas.getByRole('radio', { name: /^Pause for up to 3 months/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Pause plan' }));
    await expect(args.onFinish).toHaveBeenCalledWith('paused', undefined);
    const done = canvas.getByRole('heading', { name: 'Pro plan paused' });
    await waitFor(() => expect(done).toHaveFocus());
    await expect(done).toHaveAccessibleDescription(/Billing stops for 3 months/);
  },
};

/** `pauseMonths={0}` hides the pause option (and renders no stray "0"). */
export const NoPause: Story = {
  args: { pauseMonths: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    const group = canvas.getByRole('radiogroup', { name: 'What would you like to do?' });
    await expect(within(group).queryByRole('radio', { name: /^Pause/ })).toBeNull();
    await expect(within(group).getAllByRole('radio')).toHaveLength(2);
    // `pauseMonths && …` used to leave a bare "0" text node in the group.
    const walker = document.createTreeWalker(group, NodeFilter.SHOW_TEXT);
    const texts: string[] = [];
    while (walker.nextNode()) texts.push(walker.currentNode.textContent!.trim());
    await expect(texts).not.toContain('0');
  },
};
