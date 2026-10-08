import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { TickerList } from './ticker-list';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { tickerListGuidelines } from './ticker-list.guidelines';

const DEPLOYS = ['main → production', 'feature/checkout → staging', 'fix/rtl-icons → preview', 'main → staging', 'docs → preview', 'release/2.4 → production'];

/** TickerList — rows inside a card take turns (live activity on a showcase card). */
const meta = {
  title: 'Motion/TickerList',
  component: TickerList,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: tickerListGuidelines },
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

export const Default: Story = {
  render: (args) => (
    <Card className="w-[22rem] max-w-full">
      <CardHeader>
        <div>
          <CardTitle>Deploys</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <TickerList {...args} aria-label="Recent deploys">
          {DEPLOYS.map((d) => (
            <div key={d} className="py-1 font-mono text-body-s text-[var(--color-text-text)]">
              {d}
            </div>
          ))}
        </TickerList>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    // Under prefers-reduced-motion nothing moves, so there is no Pause.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(canvas.queryByRole('button', { name: 'Pause' })).toBeNull();
    } else {
      await userEvent.click(canvas.getByRole('button', { name: 'Pause' }));
      await expect(canvas.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-pressed', 'true');
    }
  },
};
