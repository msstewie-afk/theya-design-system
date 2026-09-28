import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';
import { Button } from './button';

/**
 * Progress — determinate bar, 0–100, for an operation advancing toward done
 * (upload, install, import, multi-step setup), on @radix-ui/react-progress.
 * Reach for it when the value reads as "how far along", not "how full" (a
 * static measurement against a range is Meter). For indeterminate work with
 * no known total, use Skeleton instead.
 */
const meta = {
  title: 'Feedback/Progress',
  component: Progress,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[320px] max-w-full">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Completion percentage (0–100); out-of-range values are clamped.',
    },
    className: { control: false, description: 'Class on the root element.' },
  }, // progress
  args: { value: 62, 'aria-label': 'Upload progress' },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single determinate bar. Drag the `value` control to fill it. */
export const Default: Story = {};

/** The fill across the range — empty, partial, and complete. */
export const Values: Story = {
  parameters: { controls: { exclude: ['value'] } },
  render: () => (
    <div className="flex flex-col gap-5">
      {[0, 25, 62, 100].map((v) => (
        <div key={v} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-body text-body-s">
            <span className="text-[var(--color-text-text-subtler)]">Restore</span>
            <span className="font-mono tabular-nums text-[var(--color-text-text)]">{v}%</span>
          </div>
          <Progress value={v} aria-label={`Restore ${v}%`} />
        </div>
      ))}
    </div>
  ),
};

/** Pair the bar with a visible label via `aria-labelledby` so AT announces what
 * is progressing alongside the percentage. */
export const Labelled: Story = {
  parameters: { controls: { exclude: ['value', 'aria-label'] } },
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between font-body text-body-s">
        <span id="backup-label" className="text-[var(--color-text-text-subtler)]">
          Uploading backup
        </span>
        <span className="font-mono tabular-nums text-[var(--color-text-text-subtler)]">8.2 / 12.4 GB</span>
      </div>
      <Progress value={66} aria-labelledby="backup-label" />
    </div>
  ),
};

/** Quota usage — a thicker track via `className` (the fill inherits the height). */
export const Usage: Story = {
  parameters: { controls: { exclude: ['value', 'className'] } },
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between font-body text-body-s">
        <span id="disk-label" className="text-[var(--color-text-text-subtler)]">
          Disk used
        </span>
        <span className="font-mono tabular-nums text-[var(--color-text-text-subtler)]">37.4 / 50 GB</span>
      </div>
      <Progress value={75} className="h-2" aria-labelledby="disk-label" />
    </div>
  ),
};

/** Out-of-range input is clamped to 0–100 (here −20 reads empty, 140 reads full). */
export const Clamped: Story = {
  parameters: { controls: { exclude: ['value'] } },
  render: () => (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">value={'{-20}'} → 0%</span>
        <Progress value={-20} aria-label="Clamped low" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">value={'{140}'} → 100%</span>
        <Progress value={140} aria-label="Clamped high" />
      </div>
    </div>
  ),
};

/** Live fill — a small demo that animates from 0 to 100 to show the width
 * transition (gated by `prefers-reduced-motion`). */
export const Live: Story = {
  parameters: { controls: { exclude: ['value', 'aria-label'] } },
  render: function LiveProgress() {
    const [value, setValue] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
      if (!running) return;
      if (value >= 100) {
        setRunning(false);
        return;
      }
      const id = setTimeout(() => setValue((v) => Math.min(100, v + 8)), 240);
      return () => clearTimeout(id);
    }, [running, value]);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-body text-body-s">
            <span id="deploy-label" className="text-[var(--color-text-text-subtler)]">
              Deploying
            </span>
            <span className="font-mono tabular-nums text-[var(--color-text-text-subtler)]">{value}%</span>
          </div>
          <Progress value={value} aria-labelledby="deploy-label" />
        </div>
        <Button
          appearance="outlined"
          tone="secondary"
          size="sm"
          onClick={() => {
            setValue(0);
            setRunning(true);
          }}
        >
          Start deploy
        </Button>
      </div>
    );
  },
};
