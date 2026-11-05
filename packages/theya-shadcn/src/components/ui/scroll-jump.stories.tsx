import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { ScrollJump } from './scroll-jump';

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

const Paragraphs = ({ n = 24 }: { n?: number }) => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: n }, (_, i) => (
      <p key={i} className="m-0 max-w-[40rem] font-body text-body-m text-[var(--color-text-text-subtle)]">
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
  play: async ({ canvasElement }) => {
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
  },
};

/** Shapes and sizes side by side: rounded (the button radius of each size) and round. */
export const ShapesAndSizes: Story = {
  args: { position: 'none' },
  render: function Render(args) {
    const box = useRef<HTMLDivElement>(null);
    return (
      <div className="relative m-6 h-[22rem] max-w-[60rem] rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)]">
        <div ref={box} tabIndex={0} role="region" aria-label="Article" className="h-full overflow-y-auto p-6 pb-40 outline-none focus-visible:focus-ring sm:pe-[26rem] sm:pb-6">
          <Paragraphs />
        </div>
        <div className="absolute end-4 bottom-4 flex max-w-[calc(100%-2rem)] flex-wrap items-end justify-end gap-3 sm:gap-4">
          {(['rounded', 'round'] as const).flatMap((shape) =>
            (['sm', 'md', 'lg', 'xl'] as const).map((size) => <ScrollJump key={shape + size} {...args} target={box} shape={shape} size={size} label={`Page scroll, ${shape} ${size}`} />),
          )}
        </div>
      </div>
    );
  },
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
