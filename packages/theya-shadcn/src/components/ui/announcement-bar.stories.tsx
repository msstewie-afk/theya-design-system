import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { InfoCircle, Sparks, Tools, WarningTriangle } from 'iconoir-react';
import { AnnouncementBar } from './announcement-bar';
import { Button } from './button';
import { announcementBarGuidelines } from './announcement-bar.guidelines';

/**
 * AnnouncementBar — a full-width strip above the header for something that
 * concerns everyone on every page: maintenance, an incident, a new
 * feature, a promo. A named landmark, not a live region. Links inherit the
 * bar's color and stay underlined. `dismissKey` remembers a dismissal in
 * this browser; change the key when the message changes.
 */
const meta = {
  title: 'Status & Feedback/AnnouncementBar',
  component: AnnouncementBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', guidelines: announcementBarGuidelines },
  argTypes: {
    tone: { control: 'inline-radio', options: ['primary', 'neutral', 'info', 'success', 'warning', 'danger'], table: { category: 'Appearance' } },
    appearance: { control: 'inline-radio', options: ['filled', 'tonal'], table: { category: 'Appearance' } },
    dismissible: { control: 'boolean', table: { category: 'Behavior' } },
    sticky: { control: 'boolean', table: { category: 'Behavior' } },
    dismissKey: { control: 'text', description: 'Remember the dismissal in this browser.', table: { category: 'Behavior' } },
    icon: { control: false },
    children: { control: false },
  },
  args: { tone: 'primary', appearance: 'filled', dismissible: true },
} satisfies Meta<typeof AnnouncementBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A feature launch: brand fill, a link to read more, dismissible. */
export const NewFeature: Story = {
  args: {
    icon: <Sparks />,
    children: (
      <>
        Region moves are now zero-downtime for every plan. <a href="#">See how it works</a>
      </>
    ),
  },
};

/** Planned maintenance: tonal warning with the time window. */
export const Maintenance: Story = {
  args: {
    tone: 'warning',
    appearance: 'tonal',
    icon: <Tools />,
    children: (
      <>
        Scheduled maintenance on <strong>Sunday 5 Oct, 02:00–03:00 UTC</strong>. Deploys are paused during the window. <a href="#">Status page</a>
      </>
    ),
  },
};

/** An ongoing incident: filled danger, not dismissible — it goes away when the incident is resolved. */
export const Incident: Story = {
  args: {
    tone: 'danger',
    dismissible: false,
    icon: <WarningTriangle />,
    children: (
      <>
        Some deploys in eu-west-1 are failing. We’re working on a fix. <a href="#">Follow updates</a>
      </>
    ),
  },
};

/** Every tone, filled and tonal. Several bars on one page each need their own `aria-label` — landmarks must be unique (axe landmark-unique). */
export const Tones: Story = {
  parameters: { controls: { exclude: ['tone', 'appearance'] } },
  render: (args) => (
    <div className="flex flex-col gap-2">
      {(['filled', 'tonal'] as const).map((appearance) =>
        (['primary', 'neutral', 'info', 'success', 'warning', 'danger'] as const).map((tone) => (
          <AnnouncementBar key={`${appearance}-${tone}`} {...args} tone={tone} appearance={appearance} icon={<InfoCircle />} aria-label={`Announcement, ${appearance} ${tone}`}>
            {appearance} · {tone} — Certificates now renew 30 days early. <a href="#">Details</a>
          </AnnouncementBar>
        )),
      )}
    </div>
  ),
};

/** Long text wraps on narrow screens; the icon stays at the first line and the text aligns left. */
export const LongTextOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: {
    tone: 'info',
    appearance: 'tonal',
    icon: <InfoCircle />,
    children: (
      <>
        From 1 November, free plans keep backups for 7 days instead of 30. Upgrade to keep a longer history. <a href="#">Compare plans</a>
      </>
    ),
  },
};

/** `dismissKey` remembers the dismissal across reloads. "Show again" clears it for this demo. */
export const RememberedDismissal: Story = {
  args: { dismissKey: 'storybook-demo-v1', icon: <Sparks />, children: <>Dismiss me, then reload the page — I stay hidden.</> },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <AnnouncementBar {...args} />
      <Button
        appearance="outlined"
        tone="secondary"
        size="md"
        className="mx-4 self-start"
        onClick={() => {
          try {
            window.localStorage.removeItem('theya:announcement:storybook-demo-v1');
          } catch {
            /* storage blocked */
          }
          window.location.reload();
        }}
      >
        Show again
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const KEY = 'theya:announcement:storybook-demo-v1';
    const bar = () => canvas.queryByRole('region', { name: 'Announcement' });
    // This test may run after someone dismissed it by hand.
    if (!bar()) return;
    try {
      // Dismiss: the bar goes, the choice is remembered, and focus moves on to the
      // next control instead of falling to <body>.
      await userEvent.click(canvas.getByRole('button', { name: 'Dismiss announcement' }));
      await expect(bar()).not.toBeInTheDocument();
      await expect(window.localStorage.getItem(KEY)).toBe('dismissed');
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Show again' })).toHaveFocus());
    } finally {
      window.localStorage.removeItem(KEY);
    }
  },
};
