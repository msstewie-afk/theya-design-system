import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { SuccessCheck } from './success-check';
import { successCheckGuidelines } from './success-check.guidelines';
import { toast } from './sonner';

/**
 * SuccessCheck — a success icon that draws itself once, ring then tick. The
 * Toaster uses it for `toast.success`; put it in a success Alert yourself.
 */
const meta = {
  title: 'Status & Feedback/SuccessCheck',
  component: SuccessCheck,
  tags: ['autodocs'],
  parameters: { guidelines: successCheckGuidelines, layout: 'centered' },
  argTypes: {
    className: { control: false, description: 'Size and colour, like any icon (e.g. size-5 text-[var(--color-icon-icon-success)]).' },
  },
} satisfies Meta<typeof SuccessCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Replays on every click (a new key remounts it). */
export const Default: Story = {
  render: () => {
    const [run, setRun] = useState(0);
    return (
      <div className="flex flex-col items-center gap-4">
        <SuccessCheck key={run} className="size-12 text-[var(--color-icon-icon-success)]" />
        <Button size="sm" appearance="ghost" tone="neutral" onClick={() => setRun((r) => r + 1)}>
          Replay
        </Button>
      </div>
    );
  },
};

/** In a success Alert, in place of the static icon. Mounted by the action, so it draws then. */
export const InAlert: Story = {
  name: 'In an Alert',
  render: () => {
    const [shown, setShown] = useState(false);
    return (
      <div className="flex w-full max-w-[22rem] flex-col items-start gap-4">
        <Button
          onClick={() => {
            setShown(false);
            setTimeout(() => setShown(true), 0);
          }}
        >
          Restore backup
        </Button>
        {shown && (
          <Alert tone="success" live="polite" className="w-full">
            <SuccessCheck />
            <div>
              <AlertTitle>Backup restored</AlertTitle>
              <AlertDescription>shop.example.com is back to its 03:00 state.</AlertDescription>
            </div>
          </Alert>
        )}
      </div>
    );
  },
};

/** The Toaster uses it for every `toast.success`. */
export const InToast: Story = {
  name: 'In a Toast',
  render: () => <Button onClick={() => toast.success('Settings saved')}>Save settings</Button>,
};
