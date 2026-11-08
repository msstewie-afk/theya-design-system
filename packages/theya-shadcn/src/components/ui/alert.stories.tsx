import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InfoCircle, CheckCircle, WarningTriangle, WarningCircle } from 'iconoir-react';
import { Alert, AlertTitle, AlertDescription, AlertActions } from './alert';
import { Button } from './button';
import { alertGuidelines } from './alert.guidelines';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { resetFocus, tabTo } from '../../test/keyboard';
import { testOnly } from '../../lib/test-only';

/**
 * Alert — an inline feedback banner. Put an iconoir icon as the first child
 * (it inherits the tone color), then compose AlertTitle + AlertDescription.
 * Static by default; pass `live="polite"` / `live="assertive"` when mounted
 * in response to an event so screen readers announce it.
 */
const meta = {
  title: 'Status & Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "A message about this page or section that stays until it’s resolved: a warning before an action, the summary of errors after a submit.",
      },
    },
    guidelines: alertGuidelines, layout: 'padded',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
      description: 'Tone of the banner.',
    },
    indicator: {
      control: 'select',
      options: ['none', 'stripe'],
      description: 'Full solid-tone accent bar on the left edge. No effect on tone="neutral".',
    },
    shadow: {
      control: 'boolean',
      description: 'Adds shadow-elevation-sm. Off by default for an inline banner.',
    },
    live: {
      control: 'select',
      options: [undefined, 'polite', 'assertive'],
      description: 'Announce as a live region when mounted dynamically.',
    },
    dismissible: {
      control: 'boolean',
      description: 'Show the dismiss control (X). Handle `onDismiss` to remove the alert.',
    },
    dismissLabel: {
      control: 'text',
      description: 'Accessible name for the dismiss control. Default "Dismiss".',
    },
  },
  args: { tone: 'neutral', indicator: 'none', shadow: false },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Neutral banner on the card surface. Switch tone via the Controls panel. */
export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <InfoCircle />
      <div>
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>Client portals will be read-only from 02:00 to 02:30 UTC. No action needed.</AlertDescription>
      </div>
    </Alert>
  ),
};

/** All five tones. Icon color is inherited from the tone — never color-alone:
 * the title text carries the meaning too. */
export const Tones: Story = {
  parameters: { controls: { exclude: ['tone'] } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert tone="neutral">
        <InfoCircle />
        <div>
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>This is a default alert.</AlertDescription>
        </div>
      </Alert>
      <Alert tone="info">
        <InfoCircle />
        <div>
          <AlertTitle>Maintenance scheduled</AlertTitle>
          <AlertDescription>Client portals may be unavailable Sunday 2am–4am UTC.</AlertDescription>
        </div>
      </Alert>
      <Alert tone="success">
        <CheckCircle />
        <div>
          <AlertTitle>Gallery published</AlertTitle>
          <AlertDescription>Your client can now view and download the photos.</AlertDescription>
        </div>
      </Alert>
      <Alert tone="warning">
        <WarningTriangle />
        <div>
          <AlertTitle>Approaching quota</AlertTitle>
          <AlertDescription>You&apos;re at 90% of your storage limit.</AlertDescription>
        </div>
      </Alert>
      <Alert tone="danger">
        <WarningCircle />
        <div>
          <AlertTitle>Export failed</AlertTitle>
          <AlertDescription>3 files couldn&apos;t be processed. Check the export log for details.</AlertDescription>
        </div>
      </Alert>
    </div>
  ),
};

/**
 * `indicator="stripe"` adds a full solid-tone bar on the left edge on top of
 * the same subtle background — for a banner that needs to read at a glance,
 * not just via icon/text color. Has no effect on `neutral` (no tone to draw
 * the bar from).
 */
export const Stripe: Story = {
  parameters: { controls: { exclude: ['tone'] } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert tone="info" indicator="stripe">
        <InfoCircle />
        <div>
          <AlertTitle>Maintenance scheduled</AlertTitle>
          <AlertDescription>Client portals may be unavailable Sunday 2am–4am UTC.</AlertDescription>
        </div>
      </Alert>
      <Alert tone="success" indicator="stripe">
        <CheckCircle />
        <div>
          <AlertTitle>Gallery published</AlertTitle>
          <AlertDescription>Your client can now view and download the photos.</AlertDescription>
        </div>
      </Alert>
      <Alert tone="warning" indicator="stripe">
        <WarningTriangle />
        <div>
          <AlertTitle>Approaching quota</AlertTitle>
          <AlertDescription>You&apos;re at 90% of your storage limit.</AlertDescription>
        </div>
      </Alert>
      <Alert tone="danger" indicator="stripe">
        <WarningCircle />
        <div>
          <AlertTitle>Export failed</AlertTitle>
          <AlertDescription>3 files couldn&apos;t be processed. Check the export log for details.</AlertDescription>
        </div>
      </Alert>
    </div>
  ),
};

/** `shadow` lifts the banner off the page — for a floating placement (e.g.
 * over content) rather than the default flush-in-flow look. */
export const Shadow: Story = {
  args: { tone: 'info', shadow: true },
  render: (args) => (
    <Alert {...args}>
      <InfoCircle />
      <div>
        <AlertTitle>New feature available</AlertTitle>
        <AlertDescription>Try out the new dashboard layout.</AlertDescription>
      </div>
    </Alert>
  ),
};

/**
 * `dismissible` adds the same 30px X control Banner has. Alert holds no
 * state (it stays server-compatible), so the dismiss is controlled:
 * `onDismiss` fires and the consumer stops rendering it.
 */
export const Dismissible: Story = {
  args: { tone: 'info', dismissible: true },
  render: function DismissibleExample(args) {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex flex-col items-start gap-3">
        {open ? (
          <Alert {...args} onDismiss={() => setOpen(false)}>
            <InfoCircle />
            <div>
              <AlertTitle>Archive moved to Mnemosyne</AlertTitle>
              <AlertDescription>Nightly archiving now runs at 03:00 UTC. Existing schedules are unchanged.</AlertDescription>
            </div>
          </Alert>
        ) : (
          <Button appearance="outlined" tone="secondary" size="sm" onClick={() => setOpen(true)}>
            Show alert again
          </Button>
        )}
      </div>
    );
  },
  // Keyboard: the dismiss X is in the tab order, Enter removes the alert, and
  // the control that brings it back is reachable next.
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    resetFocus();
    await tabTo(canvas.getByRole('button', { name: 'Dismiss alert' }));
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByText('Archive moved to Mnemosyne')).not.toBeInTheDocument());
    await tabTo(canvas.getByRole('button', { name: 'Show alert again' }));
    await userEvent.keyboard(' ');
    await expect(await canvas.findByText('Archive moved to Mnemosyne')).toBeVisible();
  }),
};

const ACTION_CASES = [
  {
    tone: 'neutral',
    // Button's `tone` has a full set of status tones matching Alert's own
    // variants (primary/secondary/default/info/success/warning/danger) — the
    // primary action below uses the one that matches its alert's tone.
    primaryTone: 'neutral',
    icon: <InfoCircle />,
    title: 'Scheduled maintenance',
    body: (
      <>
        Client portals go read-only at 02:00 UTC for 30 minutes. Galleries stay viewable.
      </>
    ),
    primary: 'Review window',
    secondary: 'Reschedule',
    tertiary: 'Remind me later',
  },
  {
    tone: 'info',
    primaryTone: 'info',
    icon: <InfoCircle />,
    title: 'New studio available',
    body: (
      <>
        Studio L4 is now open for bookings and new galleries.
      </>
    ),
    primary: 'Create gallery',
    secondary: 'Compare studios',
    tertiary: 'Remind me later',
  },
  {
    tone: 'success',
    primaryTone: 'success',
    icon: <CheckCircle />,
    title: 'License issued',
    body: (
      <>
        <span className="font-mono">GOLDEN_0907.tif</span> is licensed for web use for 12 months and renews automatically.
      </>
    ),
    primary: 'View license',
    secondary: 'Copy license ID',
    tertiary: 'Manage renewals',
  },
  {
    tone: 'warning',
    primaryTone: 'warning',
    icon: <WarningTriangle />,
    title: 'Storage almost full',
    body: (
      <>
        Helios Studio is at 92% of its 384 GB quota. Uploads fail once it is full.
      </>
    ),
    primary: 'Add storage',
    secondary: 'View usage',
    tertiary: 'Remind me later',
  },
  {
    tone: 'danger',
    primaryTone: 'danger',
    icon: <WarningCircle />,
    title: 'Export failed',
    body: (
      <>
        <span className="font-mono">L4_moonrise.raw</span> couldn&apos;t be converted. The file may be damaged.
      </>
    ),
    primary: 'Retry export',
    secondary: 'Open export log',
    tertiary: 'Contact support',
  },
] as const;

/**
 * `AlertActions` is the button row under the body — 10px above, wraps at
 * narrow widths. Keep labels verb-first, and lead with one primary action: a
 * filled button plus quieter `outlined`/`ghost` companions read as one
 * signal, two filled buttons compete. Combines with `dismissible`, which is
 * what a "you must decide something" alert usually needs.
 *
 * All five variants, so the tone treatment of the controls is visible in one
 * place: every control's `tone` matches its alert's own tone
 * (`neutral`/`info`/`success`/`warning`/`danger`) — the filled primary
 * action, the outlined secondary action, the ghost tertiary action, and the
 * built-in dismiss "X" all read as part of *this* alert rather than a
 * neutral control sitting on top of it. The three button `type`s (filled /
 * outlined / ghost) still carry the visual hierarchy — one loud surface, one
 * bordered, one bare — so nothing competes with the primary action even
 * though all three now share its color.
 */
export const WithActions: Story = {
  name: 'With actions',
  args: { dismissible: true },
  parameters: { controls: { exclude: ['tone'] } },
  render: function WithActionsExample(args) {
    const [dismissed, setDismissed] = useState<string[]>([]);
    const shown = ACTION_CASES.filter((c) => !dismissed.includes(c.tone));
    return (
      <div className="flex flex-col items-start gap-3">
        {shown.map((c) => (
          <Alert {...args} key={c.tone} tone={c.tone} className="w-full" onDismiss={() => setDismissed((d) => [...d, c.tone])}>
            {c.icon}
            <div className="min-w-0 w-full">
              <AlertTitle>{c.title}</AlertTitle>
              <AlertDescription>{c.body}</AlertDescription>
              <AlertActions>
                <Button appearance="filled" tone={c.primaryTone} size="sm">
                  {c.primary}
                </Button>
                <Button appearance="outlined" tone={c.primaryTone} size="sm">
                  {c.secondary}
                </Button>
                <Button appearance="ghost" tone={c.primaryTone} size="sm">
                  {c.tertiary}
                </Button>
              </AlertActions>
            </div>
          </Alert>
        ))}
        {dismissed.length > 0 ? (
          <Button appearance="outlined" tone="secondary" size="sm" onClick={() => setDismissed([])}>
            Show dismissed alerts
          </Button>
        ) : null}
      </div>
    );
  },
};

function LiveAlertDemo() {
  const [result, setResult] = useState<'started' | 'failed' | null>(null);
  return (
    <div className="flex w-full max-w-[480px] flex-col gap-3">
      {/* Wraps on a phone: three buttons don't fit in 360px. */}
      <div className="flex flex-wrap gap-2">
        <Button appearance="outlined" tone="neutral" onClick={() => setResult(null)}>
          Reset
        </Button>
        <Button onClick={() => setResult('started')}>Archive gallery</Button>
        <Button appearance="outlined" tone="danger" onClick={() => setResult('failed')}>
          Archive gallery (fails)
        </Button>
      </div>
      {result === 'started' && (
        <Alert tone="success" live="polite">
          <CheckCircle />
          <div>
            <AlertTitle>Archiving started</AlertTitle>
            <AlertDescription>Golden hour is being copied to Mnemosyne.</AlertDescription>
          </div>
        </Alert>
      )}
      {result === 'failed' && (
        <Alert tone="danger" live="assertive">
          <WarningCircle />
          <div>
            <AlertTitle>Archiving failed</AlertTitle>
            <AlertDescription>The storage quota is full. Free up space and try again.</AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}

/**
 * `live`: a banner mounted in response to an action is announced — "polite"
 * for news (role=status), "assertive" for a failure (role=alert). Static
 * banners leave `live` off.
 */
export const LiveOnAction: Story = {
  name: 'Live, on action',
  render: () => <LiveAlertDemo />,
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Archive gallery' }));
    await expect(await canvas.findByRole('status')).toHaveTextContent('Archiving started');
    await userEvent.click(canvas.getByRole('button', { name: 'Archive gallery (fails)' }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent('Archiving failed');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
  }),
};
