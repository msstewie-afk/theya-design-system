import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { TickerList } from './ticker-list';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { tickerListGuidelines } from './ticker-list.guidelines';
import { resetFocus, tabTo } from '../../test/keyboard';

const ACTIVITY = ['Rhea Okafor downloaded 24 photos', 'Theo Amari ordered 2 prints', 'Layla Haddad favorited 8 photos', 'Chen Yue opened Blue hour', 'Rhea Okafor shared First light', 'Theo Amari downloaded Wide-shining'];

/** TickerList — rows inside a card take turns (live activity on a showcase card). */
const meta = {
  title: 'Motion/TickerList',
  component: TickerList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A few rows of recent activity taking turns inside a showcase card: transactions, signups, client downloads.",
      },
    },
    layout: 'padded', guidelines: tickerListGuidelines,
  },
  argTypes: {
    visible: { control: { type: 'number', min: 1, max: 6 }, description: 'Rows on screen at once.' },
    interval: { control: { type: 'number', min: 1000, step: 250 }, description: 'Time between moves, ms.' },
    hidePause: { control: 'boolean', description: 'Hide the Pause button — only with another way to stop the motion.' },
    children: { control: false, description: 'The rows.' },
  },
  args: { visible: 3, interval: 2500 },
} satisfies Meta<typeof TickerList>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three activity rows on screen, moving on every `interval`; Pause stops it, and nothing moves under reduced motion. */
export const Default: Story = {
  render: (args) => (
    <Card className="w-[22rem] max-w-full">
      <CardHeader>
        <div>
          <CardTitle>Client activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <TickerList {...args} aria-label="Recent client activity">
          {ACTIVITY.map((d) => (
            <div key={d} className="py-1 font-body text-body-s text-[var(--color-text-text)]">
              {d}
            </div>
          ))}
        </TickerList>
      </CardContent>
    </Card>
  ),
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    // Under prefers-reduced-motion nothing moves, so there is no Pause.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(canvas.queryByRole('button', { name: 'Pause' })).toBeNull();
    } else {
      resetFocus();
      await tabTo(canvas.getByRole('button', { name: 'Pause' }));
      await userEvent.keyboard('{Enter}');
      await expect(canvas.getByRole('button', { name: 'Play' })).not.toHaveAttribute('aria-pressed');
    }
  },
};
