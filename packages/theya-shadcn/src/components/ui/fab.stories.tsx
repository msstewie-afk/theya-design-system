import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from '@storybook/test';
import { ChatBubbleEmpty, EditPencil, Plus } from 'iconoir-react';
import { Fab } from './fab';
import { fabGuidelines } from './fab.guidelines';

/**
 * Fab — floating action button for the single primary action of a screen.
 * Pass `label` for the extended FAB, leave it out for the round icon-only
 * one (then `aria-label` is required). `collapseOnScroll` folds the
 * extended FAB to the round one while scrolling down. Positioning is built
 * in (`position`, fixed, sticky layer, safe-area aware); a bottom bar lifts
 * it via `--fab-offset-bottom` on an ancestor.
 *
 * The demo frames below use `transform` so the fixed FAB pins to the frame
 * instead of the whole Storybook canvas.
 */
const meta = {
  title: 'Actions/Fab',
  component: Fab,
  tags: ['autodocs'],
  parameters: { guidelines: fabGuidelines, layout: 'centered' },
  argTypes: {
    label: { control: 'text', description: 'Text of the extended FAB. Empty = round icon-only FAB.', table: { category: 'Content' } },
    icon: { control: false, description: 'The action icon, always shown.', table: { category: 'Content' } },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'sm 40px, md 56px, lg 64px.', table: { category: 'Appearance' } },
    tone: { control: 'inline-radio', options: ['primary', 'secondary', 'neutral'], table: { category: 'Appearance' } },
    appearance: { control: 'inline-radio', options: ['filled', 'tonal'], table: { category: 'Appearance' } },
    position: { control: 'inline-radio', options: ['bottom-end', 'bottom-start', 'bottom-center', 'none'], description: 'Where it is pinned; none keeps it in flow.', table: { category: 'Layout' } },
    collapseOnScroll: { control: 'boolean', description: 'Fold to the round FAB while scrolling down.', table: { category: 'Behavior' } },
    collapsed: { control: 'boolean', description: 'Force the folded state.', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    scrollContainer: { control: false },
  },
  args: { icon: <Plus />, label: 'New site', size: 'md', tone: 'primary', appearance: 'filled', position: 'none' },
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Extended FAB: icon + label. Toggle `collapsed` in Controls to see the fold. */
export const Extended: Story = {};

/** Round icon-only FAB — needs an aria-label. */
export const IconOnly: Story = {
  args: { label: undefined, 'aria-label': 'New site' },
};

/** sm 40px, md 56px, lg 64px — round and extended. */
export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Fab key={size} {...args} size={size} label={undefined} aria-label={`New site (${size})`} />
        ))}
      </div>
      <div className="flex items-center gap-4">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Fab key={size} {...args} size={size} />
        ))}
      </div>
    </div>
  ),
};

/** Tones × appearance. Colors and states come from Button, so a FAB always matches the Button of the same tone. */
export const Tones: Story = {
  parameters: { controls: { exclude: ['tone', 'appearance'] } },
  render: (args) => (
    <div className="grid grid-cols-3 gap-4">
      {(['filled', 'tonal'] as const).map((appearance) =>
        (['primary', 'secondary', 'neutral'] as const).map((tone) => (
          <Fab key={`${appearance}-${tone}`} {...args} appearance={appearance} tone={tone} icon={<EditPencil />} label="Compose" />
        )),
      )}
    </div>
  ),
};

const Frame = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`relative h-[360px] w-[420px] overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface)] [transform:translateZ(0)] ${className ?? ''}`}
  >
    {children}
  </div>
);

/** The three pinned positions. 16px from the edges on phones, 24px from the sm breakpoint up. */
export const Positions: Story = {
  parameters: { docs: { story: { inline: true, height: '400px' } }, controls: { exclude: ['position'] } },
  render: (args) => (
    <Frame>
      <Fab {...args} position="bottom-start" label={undefined} aria-label="Help" icon={<ChatBubbleEmpty />} tone="neutral" appearance="tonal" />
      <Fab {...args} position="bottom-center" label="Compose" icon={<EditPencil />} />
      <Fab {...args} position="bottom-end" label={undefined} aria-label="New site" />
    </Frame>
  ),
};

/** `--fab-offset-bottom` on an ancestor lifts the FAB above a bottom navigation bar. */
export const AboveBottomBar: Story = {
  parameters: { docs: { story: { inline: true, height: '400px' } }, controls: { exclude: ['position'] } },
  render: (args) => (
    <Frame className="[--fab-offset-bottom:56px]">
      <Fab {...args} position="bottom-end" />
      <nav aria-label="Main" className="absolute inset-x-0 bottom-0 flex h-14 items-center justify-around border-t border-solid border-[var(--color-border-border-subtler)] bg-[var(--color-bg-surface-bg-surface)] font-body text-body-s text-[var(--color-text-text-subtler)]">
        <span>Sites</span>
        <span>Deploys</span>
        <span>Settings</span>
      </nav>
    </Frame>
  ),
};

/** Scroll the list down: the FAB folds to a circle; scroll up and it unfolds. The label stays in the accessible name throughout. */
export const CollapseOnScroll: Story = {
  parameters: { docs: { story: { inline: true, height: '400px' } }, controls: { exclude: ['position', 'collapseOnScroll', 'scrollContainer'] } },
  render: function Render(args) {
    const scroller = useRef<HTMLDivElement>(null);
    return (
      <Frame>
        {/* Keyboard users must be able to scroll the demo too (axe scrollable-region-focusable): focusable, named region, same pattern as Terminal. */}
        <div ref={scroller} tabIndex={0} role="region" aria-label="Sites" className="h-full overflow-y-auto p-4 outline-none focus-visible:focus-ring">
          <ul className="flex flex-col gap-2">
            {Array.from({ length: 30 }, (_, i) => (
              <li key={i} className="rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] px-3 py-2.5 font-body text-body-m text-[var(--color-text-text)]">
                site-{String(i + 1).padStart(2, '0')}.seashell.dev
              </li>
            ))}
          </ul>
        </div>
        <Fab {...args} position="bottom-end" collapseOnScroll scrollContainer={scroller} />
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fab = canvas.getByRole('button', { name: 'New site' });
    const list = canvas.getByRole('region', { name: 'Sites' });
    await expect(fab).toHaveAttribute('data-collapsed', 'false');
    // Scrolling down folds it; the label stays the accessible name.
    list.scrollTop = 400;
    await waitFor(() => expect(fab).toHaveAttribute('data-collapsed', 'true'));
    await expect(fab).toHaveAccessibleName('New site');
    // Back to the top unfolds it.
    list.scrollTop = 0;
    await waitFor(() => expect(fab).toHaveAttribute('data-collapsed', 'false'));
  },
};
