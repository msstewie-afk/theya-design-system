import { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Meta, StoryObj } from '@storybook/react';
import { MorphIcon } from 'morphicons/react';
import { svgToIcon } from 'morphicons/adapters';
import * as Iconoir from 'iconoir-react';

/*
 * Icon morphing prototype (Maria, 2026-11-04), on morphicons 2.0.0 (MIT,
 * devDependency of Storybook only for now). One icon flows into another with
 * spring physics; shapes that match under rotation turn instead of stretching.
 * Iconoir icons are fed in as SVG markup (svgToIcon fits them to the 24 grid).
 *
 * reducedMotion="user": with prefers-reduced-motion the icon swaps instantly
 * (the library's own default is to animate regardless).
 *
 * Not a Theya component yet: if the look is right, the next step is deciding
 * whether morphicons becomes a dependency of AnimatedIcon.
 */

const NAMES = [
  'Menu', 'Xmark', 'Plus', 'Minus', 'Check', 'NavArrowDown', 'NavArrowUp', 'Play', 'Pause', 'Search', 'ArrowRight', 'Copy',
  'Eye', 'EyeClosed', 'Heart', 'Bell', 'BellOff', 'Settings', 'Trash', 'Download', 'Upload', 'SunLight', 'HalfMoon', 'Lock',
  'LockSlash', 'MoreHoriz', 'Refresh', 'Home', 'User', 'Mail', 'Send', 'Star', 'Bookmark', 'Calendar', 'Filter', 'List',
  'ViewGrid', 'Expand', 'Collapse', 'Sparks', 'InfoCircle', 'WarningCircle', 'CheckCircle', 'XmarkCircle',
] as const;
type Name = (typeof NAMES)[number];

const cache = new Map<Name, ReturnType<typeof svgToIcon>>();
/** Iconoir icon → morphicons input (memoized; markup rendered once per icon). */
function icon(name: Name) {
  let v = cache.get(name);
  if (!v) {
    const C = Iconoir[name] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
    v = svgToIcon(renderToStaticMarkup(<C />));
    cache.set(name, v);
  }
  return v;
}

type Spring = 'smooth' | 'snappy' | 'bouncy';
type Args = { spring: Spring; from: Name; to: Name };

const meta: Meta<Args> = {
  title: 'Motion/MorphIcon (prototype)',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Prototype: one icon morphs into another (spring physics, morphicons). Click a tile to morph and back. Reduced motion swaps instantly.',
      },
    },
  },
  args: { spring: 'bouncy', from: 'Menu', to: 'Xmark' },
  argTypes: {
    spring: { control: 'inline-radio', options: ['smooth', 'snappy', 'bouncy'], description: 'Spring preset.' },
    from: { control: 'select', options: NAMES, description: 'Playground: first icon.' },
    to: { control: 'select', options: NAMES, description: 'Playground: second icon.' },
  },
};
export default meta;
type Story = StoryObj<Args>;

const PAIRS: [Name, Name][] = [
  ['Menu', 'Xmark'],
  ['Play', 'Pause'],
  ['Plus', 'Minus'],
  ['NavArrowDown', 'NavArrowUp'],
  ['ArrowRight', 'Check'],
  ['Copy', 'Check'],
  ['Search', 'Xmark'],
  ['Eye', 'EyeClosed'],
  ['SunLight', 'HalfMoon'],
  ['Bell', 'BellOff'],
  ['Lock', 'LockSlash'],
  ['List', 'ViewGrid'],
  ['Expand', 'Collapse'],
  ['InfoCircle', 'CheckCircle'],
];

function Tile({ a, b, spring }: { a: Name; b: Name; spring: Spring }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-[var(--size-border-radius-border-radius-xl)] border-0 bg-transparent p-2 text-[var(--color-icon-icon)] outline-none focus-visible:focus-ring"
    >
      <MorphIcon icon={icon(on ? b : a)} spring={spring} reducedMotion="user" size={32} strokeWidth={1.5} />
      <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">
        {a} ↔ {b}
      </span>
    </button>
  );
}

/** Pairs that make sense as two states of one control. Click a tile. */
export const Pairs: Story = {
  argTypes: { from: { table: { disable: true } }, to: { table: { disable: true } } },
  render: ({ spring }) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-x-4 gap-y-6">
      {PAIRS.map(([a, b]) => (
        <Tile key={a + b} a={a} b={b} spring={spring} />
      ))}
    </div>
  ),
};

/** Any two Iconoir icons: pick them in Controls, then click the icon. */
export const Playground: Story = {
  render: ({ spring, from, to }) => (
    <div className="flex justify-center p-10">
      <Tile key={from + to} a={from} b={to} spring={spring} />
    </div>
  ),
};

const CHAIN: Name[] = ['Menu', 'Xmark', 'Plus', 'Check', 'Star', 'Heart', 'Sparks', 'Refresh'];

/** A loop through several icons, like the Lottie reference. Stops with reduced motion. */
export const Chain: Story = {
  argTypes: { from: { table: { disable: true } }, to: { table: { disable: true } } },
  render: function Render({ spring }) {
    const [i, setI] = useState(0);
    const reduce = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
    useEffect(() => {
      if (reduce) return;
      // raw-ok: demo cadence of the loop, not a motion token.
      const t = window.setInterval(() => setI((n) => (n + 1) % CHAIN.length), 1200);
      return () => window.clearInterval(t);
    }, [reduce]);
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-[var(--color-icon-icon)]">
        <MorphIcon icon={icon(CHAIN[i])} spring={spring} reducedMotion="user" size={64} strokeWidth={1.5} />
        <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">{CHAIN[i]}</span>
      </div>
    );
  },
};
