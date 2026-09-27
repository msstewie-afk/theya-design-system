import type { Meta, StoryObj } from '@storybook/react';
import { Globe, ShieldCheck, Server } from 'iconoir-react';
import { Stat } from './stat';
import { Card, CardHeader, CardTitle, CardContent } from './card';

/**
 * Stat — a compact KPI metric card: a muted label, a large tabular-nums
 * value, and an optional status dot, top-right icon, and trend delta.
 * `tone` renders a bare `StatusDot` by default with its status word kept
 * `sr-only`; pass `toneIcon` to render a `ToneIcon` there instead — its
 * stacked fill/shape/color signals still distinguish tones in grayscale.
 * The delta carries an icon plus an sr-only "increased / decreased / no
 * change". Pair several in a responsive grid to lead a dashboard above a
 * chart or table.
 */
const meta = {
  title: 'Data Display/Stat',
  component: Stat,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    // A single Stat is a ~260px dashboard tile; the multi-Stat grid stories
    // (Tones/Deltas/KpiRow) opt out via `parameters.fullWidth` so their
    // responsive columns get the room to lay out instead of collapsing.
    (Story, context) => <div className={context.parameters.fullWidth ? 'w-full' : 'w-[260px] max-w-full'}><Story /></div>,
  ],
  argTypes: {
    label: { control: 'text', description: 'Short metric name shown muted above the value.' },
    value: { control: 'text', description: 'Headline figure (string | number); pre-abbreviate large magnitudes.' },
    tone: {
      control: 'select',
      options: ['success', 'warning', 'destructive', 'neutral', 'primary', 'info'],
      description: 'Status tone → renders a bare StatusDot (or ToneIcon, see toneIcon) beside the value, word kept sr-only by default.',
    },
    toneLabel: { control: 'text', description: 'Overrides the sr-only status word.' },
    toneIcon: { control: 'boolean', description: 'Default false: bare StatusDot. Set true to render a ToneIcon instead.' },
    icon: { control: false, description: 'Optional decorative iconoir node, top-right.' },
    delta: { control: false, description: 'Trend indicator { value, direction }.' },
  },
  args: { label: 'Active sites', value: 119 },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A plain headline metric. Use the Controls panel to add a tone or label. */
export const Default: Story = {};

/** A status tone renders a bare StatusDot by default, its word kept `sr-only`. */
export const WithTone: Story = {
  args: { label: 'Sites needing attention', value: 9, tone: 'warning' },
};

/**
 * `toneIcon` swaps the bare StatusDot for a ToneIcon — its stacked
 * fill/shape/color signals still distinguish tones in grayscale, closing
 * the "never color-alone" gap without a heavier Badge treatment.
 */
export const WithToneIcon: Story = {
  name: 'With tone icon',
  args: { label: 'Sites needing attention', value: 9, tone: 'warning', toneIcon: true },
};

/** A trend delta sits below the value with a directional icon and an sr-only "increased / decreased / no change" prefix. */
export const WithDelta: Story = {
  name: 'With delta',
  args: {
    label: 'Requests / day',
    value: '4.2M',
    icon: <Globe />,
    delta: { value: '+12% vs last week', direction: 'up' },
  },
};

/** `toneLabel` overrides the tone's word when a generic tone term would mislead on a given KPI. */
export const ContextualToneLabel: Story = {
  args: {
    label: 'Certificates expiring',
    value: 3,
    tone: 'warning',
    toneLabel: 'renew within 14 days',
    delta: { value: '2 more than last month', direction: 'up' },
  },
};

/** Every tone as the bare-StatusDot default (word kept `sr-only`). */
export const Tones: Story = {
  parameters: { fullWidth: true, controls: { exclude: ['tone', 'label', 'value'] } },
  render: () => (
    <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Stat label="Healthy sites" value={119} tone="success" />
      <Stat label="Needs attention" value={9} tone="warning" />
      <Stat label="Failing sites" value={2} tone="destructive" />
      <Stat label="Suspended" value={4} tone="neutral" />
      <Stat label="Provisioning" value={1} tone="primary" />
      <Stat label="Sync status" value={12} tone="info" />
    </div>
  ),
};

/** A composite `value`: a ReactNode (here a mono identifier) instead of a bare string/number, for a fact that reads as more than one metric. */
export const CompositeValue: Story = {
  name: 'Composite value',
  args: {
    label: 'Primary domain',
    // font-mono only — no font-size override: the outer stat-value span
    // already sets text-heading-m, and a nested span with its OWN smaller
    // text-heading-s line-height created a half-leading mismatch against
    // that outer line box, which is what was throwing StatusDot's vertical
    // centering off (items-center centers against the flex item's full
    // line-box height, and the two nested line-heights didn't agree on
    // what that was). Letting it inherit the wrapper's own size fixes it.
    value: <span className="font-mono">shop.seashell.dev</span>,
    tone: 'success',
    toneLabel: 'verified',
  },
};

/** Each delta direction: up (success), down (destructive), flat (muted). */
export const Deltas: Story = {
  parameters: { fullWidth: true, controls: { exclude: ['delta', 'label', 'value'] } },
  render: () => (
    <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
      <Stat label="Requests / day" value="4.2M" delta={{ value: '+12%', direction: 'up' }} />
      <Stat label="Error rate" value="0.4%" delta={{ value: '-0.2 pts', direction: 'down' }} />
      <Stat label="Active regions" value={6} delta={{ value: 'no change', direction: 'flat' }} />
    </div>
  ),
};

/** A dashboard KPI row: tone, icon, and delta together in a responsive grid that collapses to one column on a phone. */
export const KpiRow: Story = {
  name: 'KPI row',
  parameters: { fullWidth: true, controls: { exclude: ['label', 'value', 'tone', 'toneLabel', 'icon', 'delta'] } },
  render: () => (
    <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total sites" value={128} icon={<Globe />} delta={{ value: '+4 this week', direction: 'up' }} />
      <Stat label="Active" value={119} tone="success" delta={{ value: '+3', direction: 'up' }} />
      <Stat label="Needs attention" value={9} tone="warning" delta={{ value: '2 more', direction: 'up' }} />
      <Stat label="Certificates" value={142} icon={<ShieldCheck />} delta={{ value: 'no change', direction: 'flat' }} />
    </div>
  ),
};

/** Very large values wrap (`break-words`) rather than truncating, so digits are never silently dropped — pre-abbreviate the magnitude for tighter layout. */
export const LongValue: Story = {
  name: 'Long value',
  args: { label: 'Total requests this month', value: '1,284,902,310', icon: <Server /> },
};

/**
 * `variant="plain"` drops Stat's own border, surface, padding and shadow so
 * it can sit inside a Card that already supplies them — the default `card`
 * variant nested inside one draws a second box around the first. The plain
 * variant has no padding of its own, so the host's content region owns the
 * spacing.
 */
export const PlainInsideCard: Story = {
  name: 'Plain inside Card',
  parameters: { fullWidth: true },
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card size="md">
        <CardHeader>
          <CardTitle>Nested, default variant</CardTitle>
        </CardHeader>
        <CardContent>
          <Stat label="Block events" value="1,284" tone="warning" />
        </CardContent>
      </Card>
      <Card size="md">
        <CardHeader>
          <CardTitle>Nested, plain variant</CardTitle>
        </CardHeader>
        <CardContent>
          <Stat label="Block events" value="1,284" tone="warning" variant="plain" />
        </CardContent>
      </Card>
    </div>
  ),
};
