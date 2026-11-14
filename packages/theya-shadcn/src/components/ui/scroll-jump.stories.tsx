import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ScrollJump } from './scroll-jump';
import { testOnly } from '../../lib/test-only';

const meta: Meta<typeof ScrollJump> = {
  title: 'Navigation/ScrollJump',
  component: ScrollJump,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Two buttons in the bottom corner that jump to the top or the bottom of a long page or scroll container. The one pointing where you already are is disabled. Hidden when there is nothing to scroll; smooth scroll, instant with reduced motion.',
      },
    },
  },
  argTypes: {
    position: { control: 'inline-radio', options: ['bottom-end', 'bottom-start', 'none'] },
    shape: { control: 'inline-radio', options: ['rounded', 'round'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
  },
};
export default meta;
type Story = StoryObj<typeof ScrollJump>;

const Paragraphs = ({ n = 24, small = false }: { n?: number; small?: boolean }) => (
  <div className={small ? 'flex flex-col gap-2' : 'flex flex-col gap-4'}>
    {Array.from({ length: n }, (_, i) => (
      <p key={i} className={`m-0 max-w-[40rem] font-body text-[var(--color-text-text-subtle)] ${small ? 'text-body-xs' : 'text-body-m'}`}>
        {i + 1}. Galleries, contracts and invoices for every shoot, kept together so clients find them in one place and you find them in a second.
      </p>
    ))}
  </div>
);

/** In a scroll container (the canvas has no page scroll of its own): scroll, or press the buttons. */
export const InContainer: Story = {
  args: { position: 'none' },
  render: function Render(args) {
    const box = useRef<HTMLDivElement>(null);
    return (
      <div className="relative m-6 h-[28rem] max-w-[48rem] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
        <div ref={box} tabIndex={0} role="region" aria-label="Article" className="h-full overflow-y-auto p-6 outline-none focus-visible:focus-ring">
          <Paragraphs />
        </div>
        <ScrollJump {...args} target={box} className="absolute end-4 bottom-4" />
      </div>
    );
  },
  play: testOnly(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const up = await canvas.findByRole('button', { name: 'Scroll to top' });
    const down = canvas.getByRole('button', { name: 'Scroll to bottom' });
    await expect(up).toHaveAttribute('aria-disabled', 'true');
    await expect(down).not.toHaveAttribute('aria-disabled');
    await userEvent.click(down);
    await waitFor(() => expect(down).toHaveAttribute('aria-disabled', 'true'), { timeout: 3000 });
    await expect(up).not.toHaveAttribute('aria-disabled');
    // Focus stays on the pressed button after the jump.
    await expect(down).toHaveFocus();
  }),
};

/** One small scroll box with its own pair of buttons, labelled with shape and size. */
function Sample({ args, shape, size }: { args: React.ComponentProps<typeof ScrollJump>; shape: 'rounded' | 'round'; size: 'sm' | 'md' | 'lg' | 'xl' }) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="relative h-48 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
        <div
          ref={box}
          tabIndex={0}
          role="region"
          aria-label={`Sample, ${shape} ${size}`}
          className="h-full overflow-y-auto p-3 pe-14 outline-none focus-visible:focus-ring"
        >
          <Paragraphs n={6} small />
        </div>
        <ScrollJump {...args} target={box} shape={shape} size={size} label={`Page scroll, ${shape} ${size}`} className="absolute end-3 bottom-3" />
      </div>
      <figcaption className="font-body text-body-s text-[var(--color-text-text-subtle)]">
        {shape} · {size}
      </figcaption>
    </figure>
  );
}

/** Shapes and sizes: rounded (the button radius of each size) and round, sm to xl. Each sample scrolls on its own. */
export const ShapesAndSizes: Story = {
  args: { position: 'none' },
  render: (args) => (
    <div className="m-6 grid max-w-[60rem] grid-cols-2 gap-4 sm:grid-cols-4">
      {(['rounded', 'round'] as const).flatMap((shape) =>
        (['sm', 'md', 'lg', 'xl'] as const).map((size) => <Sample key={shape + size} args={args} shape={shape} size={size} />),
      )}
    </div>
  ),
};

/** Short content: nothing to scroll, nothing rendered. */
export const NothingToScroll: Story = {
  args: { position: 'none' },
  render: function Render(args) {
    const box = useRef<HTMLDivElement>(null);
    return (
      <div className="relative m-6 h-[20rem] max-w-[48rem] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
        <div ref={box} tabIndex={0} role="region" aria-label="Article" className="h-full overflow-y-auto p-6 outline-none focus-visible:focus-ring">
          <Paragraphs n={2} />
        </div>
        <ScrollJump {...args} target={box} className="absolute end-4 bottom-4" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('group', { name: 'Page scroll' })).toBeNull();
  },
};
