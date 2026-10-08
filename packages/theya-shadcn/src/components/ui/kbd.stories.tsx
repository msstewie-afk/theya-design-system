import type { Meta, StoryObj } from '@storybook/react';
import { Kbd } from './kbd';
import { kbdGuidelines } from './kbd.guidelines';

/**
 * Kbd — a small inline keyboard-key hint rendered as a native `<kbd>`
 * element, so assistive technology conveys keyboard-input semantics
 * automatically. It is purely presentational: it shows a shortcut, it
 * does not bind one. Compose one `Kbd` per key for a multi-key
 * shortcut (`<Kbd>⌘</Kbd><Kbd>K</Kbd>`) so each glyph is read
 * individually. For inline code or identifiers, reach for a mono-text
 * treatment instead.
 */
const meta = {
  title: 'Labels/Kbd',
  component: Kbd,
  tags: ['autodocs'],
  parameters: { guidelines: kbdGuidelines, layout: 'centered' },
  argTypes: {
    children: {
      control: 'text',
      description: 'The key glyph or label to render, e.g. ⌘ or K.',
    },
    className: { control: false, description: 'A small keyboard-key glyph, e.g. inside a shortcut hint.' },
  },
  args: { children: '⌘' },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single key hint. Edit the glyph in the Controls panel. */
export const Default: Story = {};

/** Multi-key shortcut — render one Kbd per key so each glyph is announced individually rather than as one concatenated token. */
export const Shortcut: Story = {
  parameters: { controls: { exclude: ['children'] } },
  render: () => (
    <div className="flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </div>
  ),
};

/** Common single keys: modifiers, arrows, and named keys. */
export const Keys: Story = {
  parameters: { controls: { exclude: ['children'] } },
  render: () => (
    <div className="flex flex-wrap items-center gap-1.5">
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>⌥</Kbd>
      <Kbd>⌃</Kbd>
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
      <Kbd>↵</Kbd>
      <Kbd>esc</Kbd>
      <Kbd>tab</Kbd>
    </div>
  ),
};

/**
 * In context — paired with a label, as in the command-menu footer.
 * The hint sits beside the action it triggers; the actual key handler
 * is wired by the consumer.
 */
export const InContext: Story = {
  name: 'In context',
  parameters: { controls: { exclude: ['children'] } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4 font-body text-body-xs text-[var(--color-text-text-subtler)]">
      <span className="flex items-center gap-1">
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
        navigate
      </span>
      <span className="flex items-center gap-1">
        <Kbd>↵</Kbd>
        open
      </span>
      <span className="flex items-center gap-1">
        <Kbd>esc</Kbd>
        close
      </span>
      <span className="flex items-center gap-1">
        press
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
        to search
      </span>
    </div>
  ),
};
