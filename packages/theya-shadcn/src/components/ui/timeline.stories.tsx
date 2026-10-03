import type { Meta, StoryObj } from '@storybook/react';
import { CheckCircle, WarningTriangle, XmarkCircle, GitCommit } from 'iconoir-react';
import { Timeline, TimelineItem, TimelineTitle, TimelineDescription } from './timeline';
import { timelineGuidelines } from './timeline.guidelines';

/**
 * Timeline — a vertical activity/event feed. A left rail draws a tone
 * dot (or a tinted chip holding an icon) plus a connector line for
 * each event; the last item drops its connector. Each `TimelineItem`
 * carries a `tone`, an optional mono `time`, a `TimelineTitle`, and
 * an optional `TimelineDescription`. Pure presentational +
 * compositional — no client JS.
 *
 * The rail is decorative (`aria-hidden`); for a non-neutral tone an
 * sr-only severity word ("success"/"warning"/"error"/"info"/
 * "highlighted", overridable via `toneLabel`) is announced, so status
 * is never color-alone. To carry tone for sighted colorblind users
 * too, pass a shape-distinct `icon` per tone. The root is
 * `<ol role="list">`; name the feed with `aria-label`.
 */
const meta: Meta<typeof Timeline> = {
  title: 'Data/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: timelineGuidelines },
  argTypes: {
    'aria-label': {
      control: 'text',
      description: 'Names the feed for assistive tech (e.g. "Activity").',
    },
  },
  args: { 'aria-label': 'Activity' },
  decorators: [
    (Story) => (
      <div className="w-[420px] max-w-full">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

/** An activity feed: each event carries a tone, a mono timestamp, a title, and a short description. */
export const Default: Story = {
  render: (args) => (
    <Timeline {...args}>
      <TimelineItem tone="success" time="14:02">
        <TimelineTitle>Certificate issued</TimelineTitle>
        <TimelineDescription>shop.seashell.dev · valid 90 days</TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="warning" time="13:40">
        <TimelineTitle>Renewal due soon</TimelineTitle>
        <TimelineDescription>app.seashell.dev · 12 days left</TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="info" time="11:18">
        <TimelineTitle>New region available</TimelineTitle>
        <TimelineDescription>eu-west-1 is now open for deploys.</TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="neutral" time="09:15">
        <TimelineTitle>Deploy completed</TimelineTitle>
        <TimelineDescription>v2.4.0 · 6 minutes</TimelineDescription>
      </TimelineItem>
    </Timeline>
  ),
};

/** Every tone, as a bare dot. For a non-neutral tone an sr-only severity word is announced. */
export const Tones: Story = {
  render: (args) => (
    <Timeline {...args} aria-label="Tones">
      <TimelineItem tone="neutral" time="09:15">
        <TimelineTitle>Neutral event</TimelineTitle>
      </TimelineItem>
      <TimelineItem tone="primary" time="10:02">
        <TimelineTitle>Highlighted event</TimelineTitle>
      </TimelineItem>
      <TimelineItem tone="info" time="11:18">
        <TimelineTitle>Informational event</TimelineTitle>
      </TimelineItem>
      <TimelineItem tone="success" time="14:02">
        <TimelineTitle>Successful event</TimelineTitle>
      </TimelineItem>
      <TimelineItem tone="warning" time="13:40">
        <TimelineTitle>Warning event</TimelineTitle>
      </TimelineItem>
      <TimelineItem tone="danger" time="13:11">
        <TimelineTitle>Failed event</TimelineTitle>
      </TimelineItem>
    </Timeline>
  ),
};

/** A shape-distinct `icon` per tone, so tone meaning rides on the glyph shape too — not just the dot color. */
export const WithIcons: Story = {
  render: (args) => (
    <Timeline {...args} aria-label="Deploy history">
      <TimelineItem tone="success" icon={<CheckCircle />} time="2026-06-14 14:02">
        <TimelineTitle>Build passed</TimelineTitle>
        <TimelineDescription>v2.4.0 · 184 tests · 6 minutes</TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="warning" icon={<WarningTriangle />} time="2026-06-14 13:40" toneLabel="flaky">
        <TimelineTitle>Build passed with retries</TimelineTitle>
        <TimelineDescription>2 flaky tests re-run on eu-west-1</TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="danger" icon={<XmarkCircle />} time="2026-06-14 13:11" toneLabel="failed">
        <TimelineTitle>Build failed</TimelineTitle>
        <TimelineDescription>step "test" exited 1</TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="neutral" icon={<GitCommit />} time="2026-06-14 12:58">
        <TimelineTitle>Commit pushed</TimelineTitle>
        <TimelineDescription>a1c5e9d · "tune cache headers"</TimelineDescription>
      </TimelineItem>
    </Timeline>
  ),
};

/** A single item — just a tone dot, a title, and a description. */
export const SingleItem: Story = {
  render: (args) => (
    <Timeline {...args} aria-label="Status">
      <TimelineItem tone="success" time="14:02">
        <TimelineTitle>Certificate issued</TimelineTitle>
        <TimelineDescription>shop.seashell.dev · valid 90 days</TimelineDescription>
      </TimelineItem>
    </Timeline>
  ),
};

/** A long, unbreakable identifier in the `time` slot wraps mid-token, so a trace/correlation id never forces horizontal page scroll at 360px. */
export const LongIdentifier: Story = {
  render: (args) => (
    <Timeline {...args} aria-label="Request trace">
      <TimelineItem tone="info" time="req-7f3c9a1b4e2d8f60a1c5e9d2b7a4f8c0">
        <TimelineTitle>Request received</TimelineTitle>
        <TimelineDescription>The mono id wraps mid-token — no horizontal scroll, even on a phone.</TimelineDescription>
      </TimelineItem>
      <TimelineItem tone="neutral" time="09:15:42.118">
        <TimelineTitle>Routed to eu-west-1</TimelineTitle>
      </TimelineItem>
    </Timeline>
  ),
};
