import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ScrollArea, ScrollBar } from './scroll-area';
import { Separator } from './separator';
import { Chip } from './chip';
import { scrollAreaGuidelines } from './scroll-area.guidelines';

const meta: Meta<typeof ScrollArea> = {
  title: 'Layout/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: { guidelines: scrollAreaGuidelines, layout: 'padded' },
  argTypes: {
    type: {
      control: 'select',
      options: ['auto', 'always', 'scroll', 'hover'],
      description: 'When the scrollbar is shown (forwarded to the Radix Root).',
    },
    scrollHideDelay: {
      control: 'number',
      description: 'ms before the bar hides when type is scroll or hover.',
    },
    className: { control: false, description: 'Class on the root element.' },
    children: { control: false, description: 'Scrollable content.' },
  },
  args: { type: 'hover', scrollHideDelay: 600 },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const REGIONS = ['eu-west-1', 'eu-central-1', 'eu-north-1', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'sa-east-1', 'ca-central-1', 'af-south-1'];

const TAGS = ['v2.4.0', 'production', 'eu-west-1', 'python-3.12', 'node-20', 'edge-cache', 'auto-renew', 'wildcard-cert', 'staging', 'canary'];

const BOX = 'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]';

/** A capped-height vertical list. Hover (or focus + arrow keys / wheel) to scroll;
 * the thin overlay bar appears on the right. The root carries the height (`h-72`). */
export const Default: Story = {
  render: (args) => (
    <ScrollArea {...args} className={`h-72 w-full max-w-sm ${BOX}`}>
      <div className="p-4">
        <p className="pb-2 font-body text-body-m font-medium text-[var(--color-text-text)]">Regions</p>
        {REGIONS.map((region) => (
          <div key={region}>
            <div className="py-1.5 font-mono text-body-m text-[var(--color-text-text-subtler)]">{region}</div>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

/** Horizontal scrolling needs an explicit `<ScrollBar orientation="horizontal" />`
 * plus `whitespace-nowrap` and a `w-max` inner track so the row overflows its box
 * rather than wrapping. Stays within the viewport at 360px (`max-w-full`). */
export const Horizontal: Story = {
  parameters: { controls: { exclude: ['type', 'scrollHideDelay'] } },
  render: (args) => (
    <ScrollArea {...args} className={`w-full max-w-full whitespace-nowrap ${BOX}`}>
      <div className="flex w-max gap-2 p-4">
        {TAGS.map((tag) => (
          <Chip key={tag} interactive={false} className="font-mono">
            {tag}
          </Chip>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

/** `type="always"` keeps the bar visible at all times — useful when you want to
 * signal up front that a region is scrollable (e.g. a dense side panel). */
export const AlwaysVisible: Story = {
  args: { type: 'always' },
  parameters: { controls: { exclude: ['type'] } },
  render: (args) => (
    <ScrollArea {...args} className={`h-64 w-full max-w-sm ${BOX}`}>
      <div className="p-4">
        <p className="pb-2 font-body text-body-m font-medium text-[var(--color-text-text)]">Recent deploys</p>
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-1.5 font-body text-body-m">
            <span className="font-mono text-[var(--color-text-text-subtler)]">v2.{18 - i}.0</span>
            <span className="text-[var(--color-text-text-subtler)]">{i + 1}h ago</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

/** A tall block of prose capped with `max-h-*` so the surrounding layout never
 * shifts. The viewport is focusable, so keyboard-only users can tab in and scroll. */
export const LongContent: Story = {
  parameters: { controls: { exclude: ['type', 'scrollHideDelay'] } },
  render: (args) => (
    <ScrollArea {...args} className={`max-h-72 w-full max-w-md ${BOX}`}>
      <div className="space-y-3 p-4 font-body text-body-s text-[var(--color-text-text-subtler)]">
        <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Deploy log</p>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>Step {i + 1} — resolved dependencies, built the bundle and pushed it to eu-west-1. Cache warmed, health checks green, certificate valid for 90 days. No regressions detected against the previous release.</p>
        ))}
      </div>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>('[data-slot="scroll-area"], [dir]') ?? canvasElement.firstElementChild as HTMLElement;
    const viewport = canvasElement.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]')!;
    // max-h on the root reaches the viewport: the content scrolls inside a 288px box
    // instead of the box growing to fit it.
    await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    await expect(root.getBoundingClientRect().height).toBeLessThanOrEqual(288 + 1);
    // The viewport is a tab stop, so keyboard users can reach and scroll it.
    await userEvent.tab();
    await expect(viewport).toHaveFocus();
    // Scrolling moves the content, not the page.
    viewport.scrollTop = 200;
    await expect(viewport.scrollTop).toBeGreaterThan(0);
    await expect(within(viewport).getByText('Deploy log')).toBeInTheDocument();
  },
};
