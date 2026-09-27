import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InfoCircle, CheckCircle, WarningTriangle, WarningCircle } from 'iconoir-react';
import { Alert, AlertTitle, AlertDescription, AlertActions } from './alert';
import { Button } from './button';

/**
 * Alert — an inline feedback banner. Put an iconoir icon as the first child
 * (it inherits the tone color), then compose AlertTitle + AlertDescription.
 * Static by default; pass `live="polite"` / `live="assertive"` when mounted
 * in response to an event so screen readers announce it.
 */
const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'danger'],
      description: 'Tone of the banner.',
    },
    indicator: {
      control: 'select',
      options: ['none', 'stripe'],
      description: 'Full solid-tone accent bar on the left edge. No effect on variant="default".',
    },
    shadow: {
      control: 'boolean',
      description: 'Adds shadow-sm. Off by default for an inline banner.',
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
  args: { variant: 'default', indicator: 'none', shadow: false },
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
        <AlertDescription>eu-west-1 will restart at 02:00 UTC. No action needed.</AlertDescription>
      </div>
    </Alert>
  ),
};

/** All five tones. Icon color is inherited from the tone — never color-alone:
 * the title text carries the meaning too. */
export const Tones: Story = {
  parameters: { controls: { exclude: ['variant'] } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="default">
        <InfoCircle />
        <div>
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>This is a default alert.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="info">
        <InfoCircle />
        <div>
          <AlertTitle>Maintenance scheduled</AlertTitle>
          <AlertDescription>Downtime expected Sunday 2am–4am UTC.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="success">
        <CheckCircle />
        <div>
          <AlertTitle>Deployment successful</AlertTitle>
          <AlertDescription>Your changes are now live.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="warning">
        <WarningTriangle />
        <div>
          <AlertTitle>Approaching quota</AlertTitle>
          <AlertDescription>You&apos;re at 90% of your storage limit.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="danger">
        <WarningCircle />
        <div>
          <AlertTitle>Deployment failed</AlertTitle>
          <AlertDescription>Check the logs for details.</AlertDescription>
        </div>
      </Alert>
    </div>
  ),
};

/**
 * `indicator="stripe"` adds a full solid-tone bar on the left edge on top of
 * the same subtle background — for a banner that needs to read at a glance,
 * not just via icon/text color. Has no effect on `default` (no tone to draw
 * the bar from).
 */
export const Stripe: Story = {
  parameters: { controls: { exclude: ['variant'] } },
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="info" indicator="stripe">
        <InfoCircle />
        <div>
          <AlertTitle>Maintenance scheduled</AlertTitle>
          <AlertDescription>Downtime expected Sunday 2am–4am UTC.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="success" indicator="stripe">
        <CheckCircle />
        <div>
          <AlertTitle>Deployment successful</AlertTitle>
          <AlertDescription>Your changes are now live.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="warning" indicator="stripe">
        <WarningTriangle />
        <div>
          <AlertTitle>Approaching quota</AlertTitle>
          <AlertDescription>You&apos;re at 90% of your storage limit.</AlertDescription>
        </div>
      </Alert>
      <Alert variant="danger" indicator="stripe">
        <WarningCircle />
        <div>
          <AlertTitle>Deployment failed</AlertTitle>
          <AlertDescription>Check the logs for details.</AlertDescription>
        </div>
      </Alert>
    </div>
  ),
};

/** `shadow` lifts the banner off the page — for a floating placement (e.g.
 * over content) rather than the default flush-in-flow look. */
export const Shadow: Story = {
  args: { variant: 'info', shadow: true },
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
  args: { variant: 'info', dismissible: true },
  render: function DismissibleExample(args) {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex flex-col items-start gap-3">
        {open ? (
          <Alert {...args} onDismiss={() => setOpen(false)}>
            <InfoCircle />
            <div>
              <AlertTitle>Backups moved to eu-west-1</AlertTitle>
              <AlertDescription>Nightly snapshots now run at 03:00 UTC. Existing schedules are unchanged.</AlertDescription>
            </div>
          </Alert>
        ) : (
          <Button type="outlined" intent="secondary" size="sm" onClick={() => setOpen(true)}>
            Show alert again
          </Button>
        )}
      </div>
    );
  },
};

const ACTION_CASES = [
  {
    variant: 'default',
    // Button's `intent` has a full set of status intents matching Alert's own
    // variants (primary/secondary/default/info/success/warning/danger) — the
    // primary action below uses the one that matches its alert's tone.
    primaryIntent: 'default',
    icon: <InfoCircle />,
    title: 'Scheduled maintenance',
    body: (
      <>
        <span className="font-mono">eu-west-1</span> restarts at 02:00 UTC. Sites stay online behind the edge cache.
      </>
    ),
    primary: 'Review window',
    secondary: 'Reschedule',
    tertiary: 'Remind me later',
  },
  {
    variant: 'info',
    primaryIntent: 'info',
    icon: <InfoCircle />,
    title: 'New region available',
    body: (
      <>
        <span className="font-mono">ap-south-1</span> is now open for new sites and databases.
      </>
    ),
    primary: 'Create site',
    secondary: 'Compare regions',
    tertiary: 'Remind me later',
  },
  {
    variant: 'success',
    primaryIntent: 'success',
    icon: <CheckCircle />,
    title: 'Certificate issued',
    body: (
      <>
        <span className="font-mono">shop.seashell.dev</span> is secured for 90 days and renews automatically.
      </>
    ),
    primary: 'View certificate',
    secondary: 'Copy chain',
    tertiary: 'Manage renewals',
  },
  {
    variant: 'warning',
    primaryIntent: 'warning',
    icon: <WarningTriangle />,
    title: 'Disk almost full',
    body: (
      <>
        <span className="font-mono">web-04</span> is at 92% of its 40 GB quota. Uploads fail once it is full.
      </>
    ),
    primary: 'Add storage',
    secondary: 'View usage',
    tertiary: 'Remind me later',
  },
  {
    variant: 'danger',
    primaryIntent: 'danger',
    icon: <WarningCircle />,
    title: 'Deploy failed',
    body: (
      <>
        Build <span className="font-mono">v2.4.0</span> exited with code 1 at the install step.
      </>
    ),
    primary: 'Retry deploy',
    secondary: 'Open logs',
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
 * place: every control's `intent` matches its alert's own tone
 * (`default`/`info`/`success`/`warning`/`danger`) — the filled primary
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
  parameters: { controls: { exclude: ['variant'] } },
  render: function WithActionsExample(args) {
    const [dismissed, setDismissed] = useState<string[]>([]);
    const shown = ACTION_CASES.filter((c) => !dismissed.includes(c.variant));
    return (
      <div className="flex flex-col items-start gap-3">
        {shown.map((c) => (
          <Alert {...args} key={c.variant} variant={c.variant} className="w-full" onDismiss={() => setDismissed((d) => [...d, c.variant])}>
            {c.icon}
            <div className="min-w-0 w-full">
              <AlertTitle>{c.title}</AlertTitle>
              <AlertDescription>{c.body}</AlertDescription>
              <AlertActions>
                <Button type="filled" intent={c.primaryIntent} size="sm">
                  {c.primary}
                </Button>
                <Button type="outlined" intent={c.primaryIntent} size="sm">
                  {c.secondary}
                </Button>
                <Button type="ghost" intent={c.primaryIntent} size="sm">
                  {c.tertiary}
                </Button>
              </AlertActions>
            </div>
          </Alert>
        ))}
        {dismissed.length > 0 ? (
          <Button type="outlined" intent="secondary" size="sm" onClick={() => setDismissed([])}>
            Show dismissed alerts
          </Button>
        ) : null}
      </div>
    );
  },
};
