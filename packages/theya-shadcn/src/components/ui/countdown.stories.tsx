import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Countdown } from './countdown';
import { Button } from './button';

/**
 * Countdown — time left until a deadline. Inline (inherits the surrounding
 * text) or blocks (one tile per unit). Screen readers get a minute-resolution
 * sentence through `role="timer"` instead of a value that changes every second.
 */

const inMs = (d = 0, h = 0, m = 0, s = 0) => Date.now() + ((d * 24 + h) * 60 + m) * 60_000 + s * 1000;

const meta = {
  title: 'Data/Countdown',
  component: Countdown,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    to: { control: false, description: 'Deadline: a Date, an ISO string or a timestamp in ms.' },
    appearance: { control: 'inline-radio', options: ['inline', 'blocks'], description: 'Inline text or one tile per unit.' },
    format: { control: 'inline-radio', options: ['clock', 'compact'], description: 'Inline format: 2d 04:12:09 or 2d 4h 12m.' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Tile size (blocks only).' },
    precision: { control: 'inline-radio', options: ['seconds', 'minutes'], description: 'Smallest unit that ticks.' },
    trimLeading: { control: 'boolean', description: 'Hides leading units that are zero.' },
    urgentBelow: { control: 'number', description: 'Below this many seconds the numbers turn danger.' },
    paused: { control: 'boolean', description: 'Freezes the countdown.' },
    completed: { control: false, description: 'Shown instead of the zeros once the deadline has passed.' },
    labels: { control: false, description: 'Unit names (singular, plural).' },
    srText: { control: false, description: 'Wraps the spoken text, e.g. "Sale ends in …".' },
    onComplete: { control: false },
    className: { control: false },
  },
  args: { to: inMs(2, 4, 12, 9) },
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Inline clock inside a sentence; inherits the text style. */
export const Inline: Story = {
  render: (args) => (
    <p className="text-body-m text-[var(--color-text-text)]">
      Sale ends in <Countdown {...args} className="font-medium" srText={(t) => `Sale ends in ${t}`} />
    </p>
  ),
};

/** Compact format with minute precision — e.g. a trial or plan expiry that doesn't need seconds. */
export const Compact: Story = {
  args: { to: inMs(12, 4, 30), format: 'compact', precision: 'minutes' },
  render: (args) => (
    <p className="text-body-m text-[var(--color-text-text-subtle)]">
      Trial ends in <Countdown {...args} className="text-[var(--color-text-text)]" srText={(t) => `Trial ends in ${t}`} />
    </p>
  ),
};

/** Blocks: one tile per unit, the promo variant. */
export const Blocks: Story = {
  args: { appearance: 'blocks' },
};

/** Tile sizes. */
export const Sizes: Story = {
  args: { appearance: 'blocks' },
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <Countdown {...args} size="sm" />
      <Countdown {...args} size="md" />
      <Countdown {...args} size="lg" />
    </div>
  ),
};

/** Leading zero units drop away: under an hour it reads 12:09, not 0d 00:12:09. */
export const TrimLeading: Story = {
  name: 'Trim leading',
  args: { to: inMs(0, 0, 12, 9) },
  render: (args) => (
    <div className="flex flex-col items-start gap-4 text-body-m text-[var(--color-text-text)]">
      <Countdown {...args} />
      <Countdown {...args} appearance="blocks" />
      <Countdown {...args} trimLeading={false} />
    </div>
  ),
};

/** `urgentBelow` turns the numbers danger in the final stretch. */
export const Urgent: Story = {
  args: { to: inMs(0, 0, 4, 30), urgentBelow: 300 },
  render: (args) => (
    <div className="flex flex-col items-start gap-4 text-body-m text-[var(--color-text-text)]">
      <p>
        Reservation held for <Countdown {...args} className="font-medium" />
      </p>
      <Countdown {...args} appearance="blocks" />
    </div>
  ),
};

/** OTP resend timer: the button unlocks when the countdown completes. */
export const ResendCode: Story = {
  name: 'Resend code',
  render: () => {
    const [deadline, setDeadline] = useState(() => inMs(0, 0, 0, 30));
    const [ready, setReady] = useState(false);
    return (
      <Button
        appearance="ghost"
        disabled={!ready}
        onClick={() => {
          setReady(false);
          setDeadline(inMs(0, 0, 0, 30));
        }}
      >
        {ready ? (
          'Resend code'
        ) : (
          <span>
            Resend code in <Countdown to={deadline} onComplete={() => setReady(true)} srText={(t) => `available in ${t}`} />
          </span>
        )}
      </Button>
    );
  },
};

/** After the deadline `completed` replaces the zeros. */
export const Completed: Story = {
  args: { to: Date.now() - 1000, completed: 'Sale has ended' },
  render: (args) => (
    <p className="text-body-m text-[var(--color-text-text-subtle)]">
      <Countdown {...args} />
    </p>
  ),
};

/** Paused: frozen at its current value. */
export const Paused: Story = {
  args: { paused: true, appearance: 'blocks' },
};
