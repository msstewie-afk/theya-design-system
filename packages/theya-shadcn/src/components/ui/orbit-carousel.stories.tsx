import type { Meta, StoryObj } from '@storybook/react';
import { resetFocus } from '../../test/keyboard';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { OrbitCarousel } from './orbit-carousel';
import { orbitCarouselGuidelines } from './orbit-carousel.guidelines';
import { tonalFillAt } from '../../lib/tonal-fills';

const CASES = ['Discover', 'Direction', 'Design', 'Delivery', 'Metrics', 'Launch'].map((title) => ({ title }));

// Tonal fills, as on the Flip example (lib/tonal-fills): soft tints with full-strength text. No photos,
// shadows or gradients on demo cards in motion.

const Slide = ({ c, i }: { c: (typeof CASES)[number]; i: number }) => (
  <div className={`flex aspect-[4/3] flex-col justify-between rounded-[var(--size-border-radius-border-radius-2xl)] p-5 ${tonalFillAt(i, CASES.length)}`}>
    <span className="font-mono text-body-xs">0{i + 1} / 0{CASES.length}</span>
    <h3 className="m-0 font-body text-heading-s font-semibold">{c.title}</h3>
  </div>
);

/** OrbitCarousel — cards on a turning drum or along a wheel's rim (landing showcases). */
const meta = {
  title: 'Motion/OrbitCarousel',
  component: OrbitCarousel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Cards on a turning drum, along the rim of a wheel, on a curved wall or fanned on an arc, for a showcase on a landing page.",
      },
    },
    layout: 'padded', guidelines: orbitCarouselGuidelines,
  },
  argTypes: {
    shape: { control: 'inline-radio', options: ['drum', 'wheel', 'wall', 'fan', 'rolodex', 'stack', 'cascade'], description: '`drum`: a cylinder turning on its vertical axis. `wheel`: the rim of a large wheel to the start side, rolling vertically. `wall`: inside the cylinder, a curved wall (coverflow). `fan`: cards on an arc, the middle one in focus. `rolodex`: cards turning round a horizontal axis, a card file. `stack`: a compact pile stepping diagonally. `cascade`: a tilted staircase.' },
    lean: { control: { type: 'number', min: 0, max: 40 }, description: 'Drum and wall: tip toward the viewer, degrees.' },
    center: { control: false, description: 'Drum: a word or a logo in the middle that the cards orbit.' },
    height: { control: 'text', description: 'Stage height (CSS length); the default depends on the shape.' },
    defaultIndex: { control: 'number', description: 'The card in front at first (fan: the middle one).' },
    itemWidth: { control: { type: 'number', min: 120, max: 400, step: 10 }, description: 'Card width, px (default 240; fan 352).' },
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
    // Every aria-hidden card is also inert, on React 18 and 19 alike (React 19
    // used to drop inert="" as falsy, leaving the back cards focusable).
    const backCards = [...canvasElement.querySelectorAll('[aria-hidden="true"]')].filter((el) => el.tagName !== 'svg' && el.textContent?.trim());
    await expect(backCards.length).toBeGreaterThan(0);
    for (const el of backCards) await expect(el).toHaveAttribute('inert');
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Direction' })).toBeInTheDocument());
    canvas.getByRole('group', { name: 'Case study' }).focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Launch' })).toBeInTheDocument());
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
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
      await expect(canvas.getByRole('button', { name: 'Play' })).not.toHaveAttribute('aria-pressed');
    }
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  },
};

/** A drum round a word: the cards pass behind it and in front of it (lean + center). */
export const AroundAWord: Story = {
  name: 'Drum around a word',
  args: { itemWidth: 150, lean: 30 },
  render: (args) => (
    <OrbitCarousel
      {...args}
      aria-label="Case study"
      className="mx-auto max-w-3xl"
      center={<p className="m-0 whitespace-nowrap font-display-serif text-heading-2xl italic text-[var(--color-text-text)]">our work</p>}
    >
      {CASES.map((c, i) => (
        <Slide key={c.title} c={c} i={i} />
      ))}
    </OrbitCarousel>
  ),
};

/** A wall: inside the drum, the edges swinging in. It stops at the ends. */
export const Wall: Story = {
  args: { shape: 'wall' },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole('group', { name: 'Case study' });
    await expect(root).toHaveAccessibleDescription(/arrow keys/);
    // Back from the first card stays on the first (no wrap).
    await userEvent.click(canvas.getByRole('button', { name: 'Previous slide' }));
    await expect(canvas.getByRole('heading', { name: 'Discover' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
    await waitFor(() => expect(canvas.getByText('2 of 6: Direction')).toBeInTheDocument());
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  },
};

/** A fan: the middle card upright and in focus; click a side card to bring it in. */
export const Fan: Story = {
  args: { shape: 'fan', itemWidth: 300 },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Six cards: the fan opens on the fourth (the middle, rounded down from index 3).
    await expect(canvas.getByRole('heading', { name: 'Delivery' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Previous slide' }));
    await expect(canvas.getByRole('heading', { name: 'Design' })).toBeInTheDocument();
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  },
};

/** A rolodex: the cards turn round a horizontal axis behind them; the next one comes up from below. ↑ / ↓ or drag. */
export const Rolodex: Story = {
  args: { shape: 'rolodex', itemWidth: 320 },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole('group', { name: 'Case study' });
    await expect(root).toHaveAccessibleDescription(/up and down arrow keys/);
    root.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Direction' })).toBeInTheDocument());
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    // It wraps: up from the first card is the last.
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Launch' })).toBeInTheDocument());
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  },
};

/** A compact stack: the cards behind step away diagonally, smaller and dimmer. */
export const Stack: Story = {
  args: { shape: 'stack', itemWidth: 300 },
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
    await waitFor(() => expect(canvas.getByRole('heading', { name: 'Direction' })).toBeInTheDocument());
    // Leave no focus ring behind: the story opens at rest, as a reader would see it.
    resetFocus();
  },
};

/** A tilted cascade: a staircase of cards in perspective, the front one largest. */
export const Cascade: Story = {
  args: { shape: 'cascade', itemWidth: 280 },
  render,
};
