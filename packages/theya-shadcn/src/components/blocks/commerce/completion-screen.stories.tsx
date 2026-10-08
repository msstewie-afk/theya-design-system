import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Download, Globe, OpenNewWindow } from 'iconoir-react';
import { CompletionScreen } from './completion-screen';

const meta: Meta<typeof CompletionScreen> = {
  title: 'Patterns: Commerce/CompletionScreen',
  component: CompletionScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    description: 'Your Pro plan is active and seashell.shop is registered.',
    orderNumber: 'SH-20261003-4821',
    email: 'dana@seashell.dev',
    onResendEmail: fn(),
    details: [
      { term: 'Plan', value: 'Pro, billed yearly · renews Oct 3, 2027' },
      { term: 'Domain', value: 'seashell.shop · 1 year' },
      { term: 'Paid', value: '$448.80 with Visa ending 4242' },
    ],
    primaryAction: { label: 'Open site dashboard', icon: <OpenNewWindow />, onClick: fn() },
    secondaryActions: [
      { label: 'Set up DNS', icon: <Globe /> },
      { label: 'Download invoice', icon: <Download /> },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof CompletionScreen>;

/** Done, the receipt details, where the email went, and the next step. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: "You're all set" })).toBeVisible();
    await expect(canvas.getByText('dana@seashell.dev')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'send it again' }));
    await expect(args.onResendEmail).toHaveBeenCalledTimes(1);
  },
};
