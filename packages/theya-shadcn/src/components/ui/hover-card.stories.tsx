import type { Meta, StoryObj } from '@storybook/react';
import { Globe } from 'iconoir-react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
import { StatusDot } from './status-dot';

/**
 * HoverCard — a preview surface that opens when a real interactive trigger (a
 * link or button) is hovered or focused, on @radix-ui/react-hover-card. It
 * opens on keyboard focus too, so keyboard users get it; Esc and blur close
 * it. It is progressive enhancement: the trigger's primary action must work
 * without the card because hover doesn't fire on touch, and the card must
 * never hold the only path to an action. For tap-reachable info, reach for
 * Popover or Tooltip.
 */
const meta: Meta<typeof HoverCard> = {
  title: 'Overlays/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    openDelay: { control: { type: 'number', min: 0, step: 100 }, description: 'Delay in ms before the card opens on hover.' },
    closeDelay: { control: { type: 'number', min: 0, step: 100 }, description: 'Delay in ms before the card closes after the pointer leaves.' },
    open: { control: 'boolean', description: 'Controlled open state.' },
  },
  args: { openDelay: 200, closeDelay: 200 },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The canonical pattern: hover or focus the domain link to glance at its
 * status, region, and certificate. The link still navigates on its own —
 * the card is a preview, not the only path. */
export const Default: Story = {
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger asChild>
        <a href="#" className="font-mono text-body-m text-[var(--color-text-text-link)] underline-offset-4 hover:underline">
          shop.seashell.dev
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="font-mono text-body-m font-medium text-[var(--color-text-text)]">shop.seashell.dev</p>
        <p className="mt-2 flex items-center gap-1.5 font-body text-body-s text-[var(--color-text-text-subtler)]">
          <StatusDot tone="success" />
          Running · eu-west-1 · TLS active
        </p>
        <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">184,320 requests today</p>
      </HoverCardContent>
    </HoverCard>
  ),
};

/** `align` and `sideOffset` position the card against the trigger. Here the
 * card is left-aligned and pushed further off the trigger. Radix stays
 * collision-aware, so it flips to fit the viewport on a phone. */
export const Aligned: Story = {
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger asChild>
        <button type="button" className="font-body text-body-m text-[var(--color-text-text)] underline underline-offset-4">
          Owner
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" sideOffset={12}>
        <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">Jordan Kim</p>
        <p className="mt-1 font-mono text-body-s text-[var(--color-text-text-subtler)]">jordan@seashell.dev</p>
        <p className="mt-2 font-body text-body-s text-[var(--color-text-text-subtler)]">Owner since v2.4.0 · 3 sites</p>
      </HoverCardContent>
    </HoverCard>
  ),
};

/** A richer preview: an icon, a domain, a status row (never color-alone —
 * `StatusDot` is paired with a text label), and a short metadata list. The
 * card caps its width and wraps long text so it stays inside a 360px
 * viewport. */
export const SitePreview: Story = {
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger asChild>
        <a href="#" className="font-mono text-body-m text-[var(--color-text-text-link)] underline-offset-4 hover:underline">
          api.seashell.dev
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-96">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text-subtler)]">
            <Globe />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-body-m font-medium text-[var(--color-text-text)]">api.seashell.dev</p>
            <p className="mt-1 flex items-center gap-1.5 font-body text-body-s text-[var(--color-text-text-subtler)]">
              <StatusDot tone="danger" />
              Error · last deploy failed
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-body text-body-s">
              <dt className="text-[var(--color-text-text-subtler)]">Region</dt>
              <dd className="font-mono text-[var(--color-text-text)]">eu-west-1</dd>
              <dt className="text-[var(--color-text-text-subtler)]">Plan</dt>
              <dd className="text-[var(--color-text-text)]">Scale</dd>
              <dt className="text-[var(--color-text-text-subtler)]">Requests</dt>
              <dd className="text-[var(--color-text-text)]">902,540 / day</dd>
            </dl>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

/** Open by default so the card layout is visible without interaction.
 * HoverCard is non-modal — no focus trap, no aria-hiding — so this is safe
 * to leave open on the combined autodocs page (unlike a Dialog). */
export const Open: Story = {
  args: { open: true },
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger asChild>
        <a href="#" className="font-mono text-body-m text-[var(--color-text-text-link)] underline-offset-4 hover:underline">
          blog.seashell.dev
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="font-mono text-body-m font-medium text-[var(--color-text-text)]">blog.seashell.dev</p>
        <p className="mt-2 flex items-center gap-1.5 font-body text-body-s text-[var(--color-text-text-subtler)]">
          <StatusDot tone="success" />
          Running · eu-west-1
        </p>
      </HoverCardContent>
    </HoverCard>
  ),
};
