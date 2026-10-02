import type { Meta, StoryObj } from '@storybook/react';
import { Star } from 'iconoir-react'; // matches Figma's own Icon-type example (Icon16 / Star) — verified against iconoir-react's export list (dist/index.d.ts)
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from './avatar';
import { StatusDot } from './status-dot';

/**
 * Avatar — a circular (or squircle) identity marker on @radix-ui/react-avatar
 * (Figma node 29283:3907). `type="icon"|"image"|"text"` (Figma's Type
 * variant) is a shorthand that renders the matching content directly via
 * `icon`/`src`+`alt`/`initials` — omit `type` and pass
 * `AvatarImage`/`AvatarFallback`/`AvatarBadge` as children for full control.
 * `outline="gradient"` (default) draws the two-ring treatment from Figma —
 * an outer conic-gradient ring, then a background-color separator ring;
 * `outline="solid"` swaps the outer ring for flat brand color;
 * `outline="none"` skips both. Separately, `tone` ("subtle" default /
 * "solid") controls the fallback's own fill, independent of the ring. Use
 * for people/teams/accounts in topbars, member lists, and table rows — not
 * for decorative or hero imagery. Always pass a meaningful `alt`; the
 * fallback content is announced as plain text/icon.
 */
const meta = {
  title: 'Labels/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Avatar diameter.' },
    shape: { control: 'inline-radio', options: ['circle', 'square'], description: 'Outer silhouette — circle or squircle.' },
    outline: {
      control: 'inline-radio',
      options: ['none', 'solid', 'gradient'],
      description: "Ring around the avatar: 'solid' (flat border color), 'gradient' (conic sweep), or 'none' to skip it entirely.",
    },
    separator: { control: 'boolean', description: 'Background-color ring between the colored outline and the content. No effect when outline="none".' },
    type: {
      control: 'inline-radio',
      options: ['icon', 'image', 'text'],
      description: 'Shorthand for the content variant — renders icon/image/initials without composing AvatarImage/AvatarFallback by hand.',
    },
    appearance: { control: 'inline-radio', options: ['tonal', 'filled'], description: 'Fill for AvatarFallback when using the type shorthand.' },
    initials: { control: 'text', description: 'type="text": the initials/short text to show.' },
    src: { control: 'text', description: 'type="image": the image source.' },
    alt: { control: 'text', description: 'type="image": required alt text, announced in place of the photo.' },
    icon: { control: false, description: 'type="icon": the icon element to show.' },
    fallback: { control: false, description: 'type="image": shown while the image loads or if it fails to load.' },
  },
  args: {
    type: 'image',
    src: '/asset-examples/panda-avatar.png',
    alt: 'Panda bot',
    initials: 'AL',
    icon: <Star width={16} height={16} aria-hidden="true" />,
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `type="image"` with an `initials` fallback — if the image can't load, the initials show. */
export const Default: Story = {};

/** `type="text"` — no image, so the initials render immediately. */
export const InitialsFallback: Story = {
  name: 'Initials fallback',
  args: { type: 'text' },
};

/** Figma's Type variant: `icon`, `image`, and `text`, via the shorthand props. */
export const Types: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-1.5">
        <Avatar type="icon" icon={<Star width={16} height={16} aria-hidden="true" />} />
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Icon</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Avatar type="image" src="/asset-examples/panda-avatar.png" alt="Panda bot" initials="AL" />
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Image</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Avatar type="text" initials="AL" />
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Text</span>
      </div>
    </div>
  ),
};

/** `outline="gradient"` (default, Figma "Outline=yes") — the conic-gradient
 * ring; `outline="solid"` swaps it for a flat brand-color ring;
 * `outline="none"` skips the ring entirely. */
export const Outline: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <div className="flex flex-col items-center gap-1.5">
        <Avatar outline="gradient">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Gradient</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Avatar outline="solid">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Solid</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Avatar outline="none">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">None</span>
      </div>
    </div>
  ),
};

/** `AvatarFallback`'s `tone` — independent of `outline` — controls only the
 * fallback's own fill: `appearance="tonal"` (default) is the soft brand-tinted
 * fill; `appearance="filled"` is a filled brand background. Shown here with
 * `outline="none"` to isolate the fill difference. */
export const FallbackTone: Story = {
  name: 'Fallback tone',
  render: () => (
    <div className="flex items-end gap-6">
      <div className="flex flex-col items-center gap-1.5">
        <Avatar outline="none">
          <AvatarFallback appearance="tonal">AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Subtle</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Avatar outline="none">
          <AvatarFallback appearance="filled">AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Solid</span>
      </div>
    </div>
  ),
};

/** `shape="circle"` (default) vs `shape="square"` (squircle, `border-radius-xl`). */
export const Shapes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <div className="flex flex-col items-center gap-1.5">
        <Avatar shape="circle">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Circle</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Avatar shape="square">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">Square</span>
      </div>
    </div>
  ),
};

/** `size="sm"|"md"|"lg"` — 32 / 48 / 64px. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col items-center gap-1.5">
        <Avatar size="sm">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">32px</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Avatar size="md">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">48px</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Avatar size="lg">
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <span className="font-body text-body-xs text-[var(--color-text-text-subtler)]">64px</span>
      </div>
    </div>
  ),
};

/** A `BadgeIndicator` pinned to the top-right corner — a sibling of
 * `AvatarImage`/`AvatarFallback` inside `Avatar`. Takes a qty value
 * (children/`value`), `dot` for a plain status dot, or `icon`; `tone`
 * defaults to `danger` (notification-count red) but takes any
 * `BadgeIndicator` tone. */
export const Badge: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge>5</AvatarBadge>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="/asset-examples/panda-avatar.png" alt="Panda bot" />
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge>9+</AvatarBadge>
      </Avatar>
      <Avatar outline="none">
        <AvatarFallback appearance="filled">AL</AvatarFallback>
        <AvatarBadge dot tone="success" />
      </Avatar>
      <Avatar>
        <AvatarFallback>AL</AvatarFallback>
        <AvatarBadge icon={<Star width={8} height={8} aria-hidden="true" />} tone="info" />
      </Avatar>
    </div>
  ),
};

/** A member list — initials fallbacks beside names. Status is paired with a
 * text label (never color alone), using the real `StatusDot` component (was
 * a hand-rolled dot pinned to the plain solid `bg-{tone}` tokens, which read
 * too dark next to StatusDot's own Tones story — Мария: "Member list кажется
 * темным" — now on the same `-status` token family everywhere). A long
 * display name truncates rather than overflow. */
export const MemberList: Story = {
  name: 'Member list',
  parameters: { layout: 'padded' },
  render: () => (
    <ul className="flex w-full max-w-sm flex-col gap-3">
      {[
        { initials: 'AL', name: 'Ada Lovelace', email: 'ada@seashell.dev', tone: 'success' as const, status: 'Active' },
        { initials: 'GH', name: 'Grace Hopper', email: 'grace@seashell.dev', tone: 'warning' as const, status: 'Invited' },
        { initials: 'AT', name: 'Alan Turing', email: 'alan@seashell.dev', tone: 'neutral' as const, status: 'Offline' },
      ].map((m) => (
        <li key={m.email} className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{m.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-body-s font-medium text-[var(--color-text-text)]">{m.name}</p>
            <p className="truncate font-mono text-body-xs text-[var(--color-text-text-subtler)]">{m.email}</p>
          </div>
          <span className="flex items-center gap-1.5 font-body text-body-xs text-[var(--color-text-text-subtler)]">
            <StatusDot tone={m.tone} />
            {m.status}
          </span>
        </li>
      ))}
    </ul>
  ),
};

/** A stacked group with overlap and a trailing "+N" overflow count. The
 * border uses the surface token so each avatar reads as a separate disc on
 * any background. */
export const Group: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {['AL', 'GH', 'AT', 'MH'].map((initials) => (
        <Avatar key={initials} outline="none" className="border-2 border-solid border-[var(--color-bg-surface-bg-surface)]">
          <AvatarFallback appearance="filled">{initials}</AvatarFallback>
        </Avatar>
      ))}
      <Avatar outline="none" className="border-2 border-solid border-[var(--color-bg-surface-bg-surface)]">
        <AvatarFallback appearance="filled" className="bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text-subtler)]">
          +5
        </AvatarFallback>
      </Avatar>
    </div>
  ),
};
