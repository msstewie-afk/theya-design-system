import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Copy, InfoCircle, Refresh } from 'iconoir-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { Button } from './button';

/**
 * Tooltip — short hint on hover/focus, built on @radix-ui/react-tooltip and
 * themed as a small dark surface. Opens on focus as well as hover and
 * dismisses on blur, pointer-leave, and Esc.
 *
 * A tooltip is supplementary, never a substitute for an accessible name: an
 * icon-only trigger still needs its own aria-label. Don't put essential or
 * interactive content here — tooltips don't open on touch.
 */
const meta: Meta<typeof TooltipContent> = {
  title: 'Overlays/Tooltip',
  component: TooltipContent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Preferred side to render against the trigger (collision-aware).',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment against the trigger along the chosen side.',
    },
    sideOffset: {
      control: 'number',
      description: 'Gap in pixels between the trigger and the content.',
    },
    children: { control: 'text', description: 'The hint text to display.' },
  },
  args: { side: 'top', align: 'center', sideOffset: 6, children: 'Copy API key' },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The default hint on an icon-only button. The trigger carries its own
 * aria-label — the tooltip is supplementary, not the accessible name. */
export const Default: Story = {
  render: (args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="ghost" intent="secondary" iconOnly leftIcon={<Copy />} aria-label="Copy API key" />
      </TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
};

/** All four sides. Radix is collision-aware, so a side flips automatically
 * when it would render off-screen. */
export const Sides: Story = {
  argTypes: { side: { control: false }, children: { control: false } },
  render: (args) => (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="outlined" intent="secondary">Top</Button>
        </TooltipTrigger>
        <TooltipContent {...args} side="top">Opens above</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="outlined" intent="secondary">Right</Button>
        </TooltipTrigger>
        <TooltipContent {...args} side="right">Opens to the right</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="outlined" intent="secondary">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent {...args} side="bottom">Opens below</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="outlined" intent="secondary">Left</Button>
        </TooltipTrigger>
        <TooltipContent {...args} side="left">Opens to the left</TooltipContent>
      </Tooltip>
    </div>
  ),
};

/** A tooltip works on any focusable trigger, not just icon buttons. */
export const OnTextButton: Story = {
  args: { side: 'bottom', children: 'Fetches a fresh 90-day certificate' },
  render: (args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="outlined" intent="secondary" leftIcon={<Refresh />}>
          Reissue certificate
        </Button>
      </TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
};

/** Hints scale to short identifiers too. */
export const WithIdentifier: Story = {
  args: { children: <span className="font-mono">eu-west-1</span> },
  render: (args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="ghost" intent="secondary" iconOnly leftIcon={<InfoCircle />} aria-label="Region details" />
      </TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
};

/** Open by default so the surface, gap, and typography are visible without hovering. */
export const Open: Story = {
  args: { children: 'Visible without hovering' },
  render: (args) => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button type="outlined" intent="secondary">Hover or focus me</Button>
      </TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
};

/** Long content stays on screen: the popup caps at 600px and wraps with break-words. */
export const LongContent: Story = {
  args: {
    children:
      'Certificate renewal runs 30 days before expiry for shop.seashell.dev.eu-west-1.internal-load-balancer-01; no action needed.',
  },
  render: (args) => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button type="outlined" intent="secondary">Renewal details</Button>
      </TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
};

/**
 * `intent` reports the RESULT of an action rather than hinting at one - e.g.
 * confirming a copy succeeded or flagging that it failed. Click each button
 * to see the tooltip flip to its result state; it resets a moment later.
 */
export const ResultIntents: Story = {
  argTypes: { side: { control: false }, children: { control: false }, intent: { control: false } },
  render: () => {
    function CopyResultDemo({ shouldFail = false }: { shouldFail?: boolean }) {
      const [state, setState] = useState<'idle' | 'success' | 'danger'>('idle');

      const handleClick = () => {
        setState(shouldFail ? 'danger' : 'success');
        window.setTimeout(() => setState('idle'), 1500);
      };

      return (
        <Tooltip open={state !== 'idle' ? true : undefined}>
          <TooltipTrigger asChild>
            <Button
              type="ghost"
              intent="secondary"
              iconOnly
              leftIcon={<Copy />}
              aria-label="Copy API key"
              onClick={handleClick}
            />
          </TooltipTrigger>
          <TooltipContent side="top" intent={state === 'idle' ? 'default' : state}>
            {state === 'success' ? 'Copied' : state === 'danger' ? 'Failed to copy' : 'Copy API key'}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <CopyResultDemo />
          <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Success</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <CopyResultDemo shouldFail />
          <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Failure</span>
        </div>
      </div>
    );
  },
};
