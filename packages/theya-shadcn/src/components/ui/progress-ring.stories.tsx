import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ProgressRing } from './progress-ring';
import { TickerList } from './ticker-list';
import { CountUp } from './count-up';
import { RevealGroup } from './reveal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { progressRingGuidelines } from './progress-ring.guidelines';

/** ProgressRing — a ring that fills to its value when it comes into view. */
const meta = {
  title: 'Motion/ProgressRing',
  component: ProgressRing,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: progressRingGuidelines },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 }, description: 'The value, 0–max.' },
    max: { control: 'number', description: 'Upper bound (default 100).' },
    label: { control: 'text', description: 'Accessible name.' },
    size: { control: { type: 'number', min: 48, max: 240 }, description: 'Diameter, px.' },
    thickness: { control: { type: 'number', min: 2, max: 24 }, description: 'Stroke width, px.' },
    tone: { control: 'inline-radio', options: ['primary', 'success', 'warning', 'danger', 'info'], description: 'Fill color.' },
    duration: { control: 'number', description: 'Fill time, ms.' },
    children: { control: false, description: 'Middle content; default the percentage, null for none, or a function of the value shown so far.' },
  },
  args: { value: 75, label: 'Components generated', size: 120, thickness: 10, tone: 'primary' },
} satisfies Meta<typeof ProgressRing>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const ring = within(canvasElement).getByRole('progressbar', { name: 'Components generated' });
    // The final value is there from the start; only the drawing animates.
    await expect(ring).toHaveAttribute('aria-valuenow', '75');
  },
};

const ACTIVITY = [
  ['Netflix', 'Entertainment', '−$15.49'],
  ['Apple.com', 'Services', '−$2.99'],
  ['Google Ads', 'Advertising', '−$120.00'],
  ['Shopify', 'Subscription', '−$39.00'],
  ['Stripe payout', 'Income', '+$2,410.00'],
  ['Figma', 'Software', '−$15.00'],
];

/** A "living" bento: the ring fills, the number counts, the activity list takes turns, and the cards come in one after another. */
export const LiveBento: Story = {
  render: () => (
    <RevealGroup effect="scale" stagger={120} className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Fast generation</CardTitle>
            <CardDescription>Components generated this week</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ProgressRing value={75} label="Components generated" size={132} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Cashback earned</CardTitle>
            <CardDescription>Since January</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="m-0 font-body text-heading-l font-semibold tabular-nums text-[var(--color-text-text)]">
            <CountUp to={9.3} format={{ style: 'currency', currency: 'USD', minimumFractionDigits: 2 }} />
            <span className="text-body-m font-normal text-[var(--color-text-text-subtle)]"> k</span>
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <TickerList aria-label="Recent activity" visible={3}>
            {ACTIVITY.map(([who, what, amount]) => (
              <div key={who} className="flex items-center justify-between gap-3 py-1 font-body text-body-s">
                <span className="min-w-0">
                  <span className="block truncate text-[var(--color-text-text)]">{who}</span>
                  <span className="block text-body-xs text-[var(--color-text-text-subtler)]">{what}</span>
                </span>
                <span className="shrink-0 tabular-nums text-[var(--color-text-text)]">{amount}</span>
              </div>
            ))}
          </TickerList>
        </CardContent>
      </Card>
    </RevealGroup>
  ),
};
