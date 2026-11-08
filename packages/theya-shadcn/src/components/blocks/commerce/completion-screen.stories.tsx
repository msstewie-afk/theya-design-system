import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { Download, Globe, OpenNewWindow } from 'iconoir-react';
import { CompletionScreen } from './completion-screen';
import { completionScreenGuidelines } from './completion-screen.guidelines';
import { testOnly } from '../../../lib/test-only';

const meta: Meta<typeof CompletionScreen> = {
  title: 'Patterns: Commerce/CompletionScreen',
  component: CompletionScreen,
  tags: ['autodocs'],
  parameters: { guidelines: completionScreenGuidelines, layout: 'padded' },
  args: {
    description: 'Your Pro plan is active and selene-weddings.aether.photo is live.',
    orderNumber: 'AE-20261003-4821',
    email: 'thea@aether.photo',
    onResendEmail: fn(),
    details: [
      { term: 'Plan', value: 'Pro, billed yearly · renews Oct 3, 2027' },
      { term: 'Client portal', value: 'selene-weddings.aether.photo · 1 year' },
      { term: 'Paid', value: '$448.80 with Visa ending 4242' },
    ],
    primaryAction: { label: 'Open your galleries', icon: <OpenNewWindow />, onClick: fn() },
    secondaryActions: [
      { label: 'Set up client portal', icon: <Globe /> },
      { label: 'Download invoice', icon: <Download /> },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof CompletionScreen>;

/** Done, the receipt details, where the email went, and the next step. */
export const Default: Story = {};

/**
 * `focusOnMount`: for flows that swap this screen in place of the step just
 * submitted. The title takes focus (tabIndex -1, outside the Tab order) and
 * carries the description, so a screen reader reads both. Canvas-only —
 * excluded from the combined autodocs page, where it would pull focus and
 * scroll the page to this story.
 */
export const FocusOnMount: Story = {
  args: { focusOnMount: true },
  parameters: { docs: { disable: true } },
  play: testOnly(async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole('heading', { name: "You're all set" });
    await waitFor(() => expect(title).toHaveFocus());
    await expect(title).toHaveAttribute('tabindex', '-1');
    await expect(title).toHaveAccessibleDescription('Your Pro plan is active and selene-weddings.aether.photo is live.');
    // Re-renders don't pull focus back to the title.
    const resend = canvas.getByRole('button', { name: 'send it again' });
    await userEvent.click(resend);
    await expect(args.onResendEmail).toHaveBeenCalledTimes(1);
    await expect(resend).toHaveFocus();
  }),
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole('heading', { name: "You're all set" });
    await expect(title).toBeVisible();
    // focusOnMount is off by default: an initial page doesn't steal focus.
    await expect(title).not.toHaveFocus();
    await expect(canvas.getByText('thea@aether.photo')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'send it again' }));
    await expect(args.onResendEmail).toHaveBeenCalledTimes(1);
  },
};
