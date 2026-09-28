import type { Meta, StoryObj } from '@storybook/react';
import { Trash, Copy, Download, Bold, Italic, Underline } from 'iconoir-react';
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator, ToolbarLink } from './toolbar';

const meta: Meta<typeof Toolbar> = {
  title: 'Navigation/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], description: 'Toolbar layout direction.' },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], description: 'Reading direction, affects arrow-key navigation.' },
    loop: { control: 'boolean', description: 'Arrow-key navigation loops from the last item back to the first.' },
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

// A floating card look — w-fit so it sizes to its own content rather than
// stretching to the story canvas's width (relevant especially for the
// Vertical story, where a flex-col toolbar's items-stretch would otherwise
// stretch every button to that full, unintended width).
const CARD = 'w-fit rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-1';

export const BulkActions: Story = {
  name: 'Bulk actions',
  render: () => (
    <Toolbar aria-label="Bulk actions" className={CARD}>
      <ToolbarButton>
        <Copy /> Duplicate
      </ToolbarButton>
      <ToolbarButton>
        <Download /> Export
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton appearance="ghost" tone="danger">
        <Trash /> Delete
      </ToolbarButton>
    </Toolbar>
  ),
};

export const FormattingBar: Story = {
  name: 'Formatting bar',
  render: () => (
    <Toolbar aria-label="Text formatting" className={CARD}>
      <ToolbarGroup>
        <ToolbarButton iconOnly aria-label="Bold">
          <Bold />
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Italic">
          <Italic />
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Underline">
          <Underline />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarLink href="#">Learn more</ToolbarLink>
    </Toolbar>
  ),
};

/** `orientation="vertical"` — arrow-up/arrow-down move between items instead of left/right. */
export const Vertical: Story = {
  render: () => (
    <Toolbar aria-label="Alignment" orientation="vertical" className={CARD}>
      <ToolbarButton iconOnly aria-label="Align left">
        <Bold />
      </ToolbarButton>
      <ToolbarButton iconOnly aria-label="Align center">
        <Italic />
      </ToolbarButton>
      <ToolbarButton iconOnly aria-label="Align right">
        <Underline />
      </ToolbarButton>
    </Toolbar>
  ),
};

/** Wired to Button's own appearance/tone — a destructive action past a separator. */
export const WithIntent: Story = {
  name: 'With tone',
  render: () => (
    <Toolbar aria-label="Backup actions" className={CARD}>
      <ToolbarButton>
        <Download /> Export
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton appearance="ghost" tone="danger">
        <Trash /> Delete
      </ToolbarButton>
    </Toolbar>
  ),
};
