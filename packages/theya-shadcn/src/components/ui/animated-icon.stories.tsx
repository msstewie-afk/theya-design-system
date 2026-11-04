import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import {
  AnimatedIcon,
  ANIMATED_ICONS,
  CopyAnimated,
  EyeAnimated,
  HeartAnimated,
  MenuAnimated,
  PlusAnimated,
  RefreshAnimated,
} from './animated-icon';
import { Button } from './button';
import { animatedIconGuidelines } from './animated-icon.guidelines';

/** Animated icons — iconoir geometry, CSS motion on hover, on a second state, or as a busy loop. */
const meta = {
  title: 'Motion/AnimatedIcon',
  component: AnimatedIcon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Icons that move to answer an action: Copy turns into a tick, a menu button folds into ×, a refresh arrow turns. Also a hint on hover for a few key buttons.",
      },
    },
    layout: 'padded', guidelines: animatedIconGuidelines,
  },
  argTypes: {
    name: { control: 'select', options: Object.keys(ANIMATED_ICONS), description: 'Which icon (or import the named component, e.g. CopyAnimated).' },
    trigger: { control: 'inline-radio', options: ['hover', 'active', 'loop'], description: 'When the motion plays.' },
    active: { control: 'boolean', description: 'Second state (Copy, Plus, Menu, Eye, Heart).' },
  },
  args: { name: 'Copy', trigger: 'hover', active: false },
} satisfies Meta<typeof AnimatedIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Hover an icon: it plays. Plain icons, no button chrome, so the motion is what you look at. */
export const Gallery: Story = {
  render: ({ name: _name, ...args }) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-x-4 gap-y-8">
      {Object.entries(ANIMATED_ICONS).map(([name, Icon]) => (
        // data-icon-trigger: hovering the whole tile (icon + label) plays the icon.
        <div key={name} data-icon-trigger="" className="flex flex-col items-center gap-2 text-[var(--color-icon-icon)]">
          <Icon {...args} className="size-8" />
          <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">{name}</span>
        </div>
      ))}
    </div>
  ),
};

/*
 * Morphing prototype (Maria, 2026-11-04): one shape flows into the other,
 * point by point, instead of parts moving or swapping. Each pair is one path
 * drawn with the same commands in both states, so the browser can interpolate
 * every point. SMIL <animate>, not a CSS `d` transition: Safari doesn't
 * animate `d` in CSS. Reduced motion: the shape switches with no morph.
 */
const MORPHS = {
  'Menu ↔ Close': ['M3 5L21 5M3 12L21 12M3 19L21 19', 'M5.5 5.5L18.5 18.5M12 12L12 12M5.5 18.5L18.5 5.5'],
  // Play is the first bar stretched into the triangle; the second bar
  // grows out of the triangle's tip.
  'Play ↔ Pause': ['M6 4L20 12L20 12L6 20ZM20 12L20 12L20 12L20 12Z', 'M6 5L10 5L10 19L6 19ZM14 5L18 5L18 19L14 19Z'],
  'Plus ↔ Minus': ['M5 12L19 12M12 5L12 19', 'M5 12L19 12M5 12L19 12'],
  'Chevron ↔ up': ['M6 9L12 15L18 9', 'M6 15L12 9L18 15'],
  'Arrow ↔ Check': ['M3 12L12 12L21 12M21 12L12.5 3.5M21 12L12.5 20.5', 'M5 13L9 17L9 17M9 17L19 7M9 17L9 17'],
} as const;

function Morph({ paths, active }: { paths: readonly [string, string]; active: boolean }) {
  const animRef = useRef<SVGAnimateElement>(null);
  const first = useRef(true);
  const [from, to] = active ? paths : [paths[1], paths[0]];
  useEffect(() => {
    if (first.current) return void (first.current = false);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animRef.current?.beginElement();
  }, [active]);
  return (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={to}>
        {/* Glide easing (--motion-easing-glide) over --motion-duration-slow; SMIL takes plain values. */}
        <animate ref={animRef} attributeName="d" from={from} to={to} dur="300ms" begin="indefinite" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" />
      </path>
    </svg>
  );
}

/** Click a tile: the icon morphs into its pair and back. */
export const Morphing: Story = {
  parameters: { controls: { disable: true } },
  render: function Render() {
    const [on, setOn] = useState<Record<string, boolean>>({});
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-x-4 gap-y-8">
        {Object.entries(MORPHS).map(([name, paths]) => (
          <button
            key={name}
            type="button"
            aria-pressed={!!on[name]}
            onClick={() => setOn((s) => ({ ...s, [name]: !s[name] }))}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-[var(--size-border-radius-border-radius-xl)] border-0 bg-transparent p-2 text-[var(--color-icon-icon)] outline-none focus-visible:focus-ring"
          >
            <Morph paths={paths} active={!!on[name]} />
            <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">{name}</span>
          </button>
        ))}
      </div>
    );
  },
};

/** `trigger="active"`: the second state follows a prop; the change happens even with reduced motion. */
export const States: Story = {
  render: function Render() {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [added, setAdded] = useState(false);
    const [liked, setLiked] = useState(false);
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button appearance="outlined" tone="neutral" leftIcon={<CopyAnimated trigger="active" active={copied} />} onClick={() => setCopied((v) => !v)}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button appearance="ghost" tone="neutral" iconOnly aria-label="Menu" aria-expanded={open} leftIcon={<MenuAnimated trigger="active" active={open} />} onClick={() => setOpen((v) => !v)} />
        <Button appearance="ghost" tone="neutral" iconOnly aria-label={hidden ? 'Show password' : 'Hide password'} leftIcon={<EyeAnimated trigger="active" active={hidden} />} onClick={() => setHidden((v) => !v)} />
        <Button appearance="tonal" leftIcon={<PlusAnimated trigger="active" active={added} />} onClick={() => setAdded((v) => !v)}>
          {added ? 'Close' : 'Add'}
        </Button>
        <Button appearance="ghost" tone="danger" iconOnly aria-label="Like" aria-pressed={liked} leftIcon={<HeartAnimated trigger="active" active={liked} />} onClick={() => setLiked((v) => !v)} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
    await expect(canvas.getByRole('button', { name: 'Copied' }).querySelector('[data-slot=animated-icon]')).toHaveAttribute('data-active');
    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }));
    await expect(canvas.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'true');
  },
};

/** `trigger="loop"`: only while something is busy. */
export const Busy: Story = {
  render: () => (
    <Button appearance="outlined" tone="neutral" disabled leftIcon={<RefreshAnimated trigger="loop" />}>
      Refreshing…
    </Button>
  ),
};
