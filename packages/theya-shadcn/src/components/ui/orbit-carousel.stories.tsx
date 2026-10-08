import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { OrbitCarousel } from './orbit-carousel';
import { orbitCarouselGuidelines } from './orbit-carousel.guidelines';

const CASES = [
  { title: 'Discover', tint: 'var(--color-bg-neutral-bg-neutral-strong)', ink: 'var(--color-text-text-on-dark)' },
  { title: 'Direction', tint: 'var(--color-bg-danger-bg-danger)', ink: 'var(--color-text-text-on-dark)' },
  { title: 'Design', tint: 'var(--color-bg-surface-bg-surface)', ink: 'var(--color-text-text)' },
  { title: 'Delivery', tint: 'var(--color-bg-primary-bg-primary)', ink: 'var(--color-text-text-on-primary)' },
  { title: 'Metrics', tint: 'var(--color-bg-warning-bg-warning-subtle)', ink: 'var(--color-text-text)' },
  { title: 'Launch', tint: 'var(--color-bg-success-bg-success-subtle)', ink: 'var(--color-text-text)' },
];

const Slide = ({ c, i }: { c: (typeof CASES)[number]; i: number }) => (
  <div
    className="flex aspect-[4/3] flex-col justify-between rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] p-5 shadow-elevation-md"
    style={{ background: c.tint, color: c.ink }}
  >
    <span className="font-mono text-body-xs">0{i + 1} / 0{CASES.length}</span>
    <h3 className="m-0 font-body text-heading-s font-semibold">{c.title}</h3>
  </div>
);

/** OrbitCarousel — cards on a turning drum or along a wheel's rim (landing showcases). */
const meta = {
  title: 'Motion/OrbitCarousel',
  component: OrbitCarousel,
  tags: ['autodocs'],
  parameters: { layout: 'padded', guidelines: orbitCarouselGuidelines },
  argTypes: {
    shape: { control: 'inline-radio', options: ['drum', 'wheel'], description: '`drum`: a cylinder turning on its vertical axis. `wheel`: the rim of a large wheel to the start side, rolling vertically.' },
    itemWidth: { control: { type: 'number', min: 160, max: 360, step: 10 }, description: 'Card width, px.' },
    autoplay: { control: { type: 'number', min: 0, step: 500 }, description: 'Turn on its own every N ms (pauses on hover / focus, adds Pause).' },
    onIndexChange: { control: false, description: 'Called with the index of the card that comes to the front.' },
    children: { control: false, description: 'The cards.' },
  },
  args: { shape: 'drum', itemWidth: 240 },
} satisfies Meta<typeof OrbitCarousel>;
export default meta;
type Story = StoryObj<typeof meta>;

const render: Story['render'] = (args) => (
  <OrbitCarousel {...args} aria-label="Case study" className="mx-auto max-w-3xl">
    {CASES.map((c, i) => (
      <Slide key={c.title} c={c} i={i} />
    ))}
  </OrbitCarousel>
);

/** A drum: ← / → or drag to turn it. */
export const Drum: Story = {
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Discover' })).toBeInTheDocument();
    await expect(canvas.queryByRole('heading', { name: 'Direction' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Direction' })).toBeInTheDocument());
    canvas.getByRole('group', { name: 'Case study' }).focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Launch' })).toBeInTheDocument());
  },
};

/** A wheel: the cards roll past along an arc; ↑ / ↓ or drag. */
export const Wheel: Story = {
  args: { shape: 'wheel', itemWidth: 300 },
  render,
};

/** Autoplay every 3 s, paused on hover and focus, with a Pause button. */
export const Autoplay: Story = {
  args: { autoplay: 3000 },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Under prefers-reduced-motion nothing moves, so there is no Pause.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(canvas.queryByRole('button', { name: 'Pause' })).toBeNull();
    } else {
      await userEvent.click(canvas.getByRole('button', { name: 'Pause' }));
      await expect(canvas.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-pressed', 'true');
    }
  },
};
