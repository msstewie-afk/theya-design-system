import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { KeyCommand } from 'iconoir-react';
import { KeyboardShortcuts, type ShortcutGroup } from './keyboard-shortcuts';
import { Button } from './button';

/**
 * KeyboardShortcuts — a help dialog listing an app's shortcuts, composed from
 * Dialog + Kbd. Pass grouped shortcuts as data; open it from a trigger button
 * or a global `hotkey` (e.g. "?"). Simultaneous keys share one Kbd; sequences
 * split at "then". The component displays shortcuts but does not bind them.
 */
const meta: Meta<typeof KeyboardShortcuts> = {
  title: 'Overlays/KeyboardShortcuts',
  component: KeyboardShortcuts,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    groups: { control: false, description: 'Grouped shortcut lists shown in the dialog.' },
    trigger: { control: false, description: 'Element that opens the dialog when clicked.' },
    hotkey: { control: 'text', description: 'Global key combo that opens the dialog, e.g. "?" or "mod+/".' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const groups: ShortcutGroup[] = [
  {
    heading: 'General',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['⌘', '/'], description: 'Toggle the sidebar' },
    ],
  },
  {
    heading: 'Navigation',
    shortcuts: [
      { keys: ['g', 'then', 'd'], description: 'Go to dashboard' },
      { keys: ['g', 'then', 's'], description: 'Go to sites' },
      { keys: ['⌘', '⇧', 'F'], description: 'Search everything' },
    ],
  },
  {
    heading: 'Actions',
    shortcuts: [
      { keys: ['c'], description: 'Create a site' },
      { keys: ['⌘', '⏎'], description: 'Save and close' },
      { keys: ['esc'], description: 'Dismiss the current dialog' },
    ],
  },
];

/** Opened from a help button; grouped rows, one Kbd per simultaneous chord. */
export const Default: Story = {
  args: {
    groups,
    description: 'A quick reference for getting around faster.',
    trigger: (
      <Button appearance="outlined" tone="secondary" leftIcon={<KeyCommand />}>
        Shortcuts
      </Button>
    ),
  },
};

/** No trigger: the "?" hotkey opens it from anywhere on the page. */
export const HotkeyToOpen: Story = {
  args: { groups, hotkey: '?' },
  render: (args) => (
    <div className="flex flex-col items-center gap-3 font-body text-body-s text-[var(--color-text-text-subtler)]">
      <p>
        Press{' '}
        <kbd className="rounded-[var(--size-border-radius-border-radius-sm)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-1.5 py-0.5 font-mono text-[11px]">
          ?
        </kbd>{' '}
        to open the shortcuts.
      </p>
      <KeyboardShortcuts {...args} />
    </div>
  ),
};

/**
 * `scopeRef` restricts the hotkey to firing only while focus is inside a
 * specific container (WCAG 2.1.4(c) — "active only on focus"), instead of
 * anywhere in the document. Focus the Sidebar button and press "?": nothing
 * opens. Focus the Main area button and press "?": it opens.
 */
export const ScopedHotkey: Story = {
  args: { groups, hotkey: '?' },
  render: function ScopedHotkeyDemo(args) {
    const mainRef = useRef<HTMLDivElement>(null);
    return (
      <div className="flex w-[420px] flex-col gap-4 font-body text-body-s">
        <div className="rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-subtle)] p-4">
          <p className="mb-2 font-medium text-[var(--color-text-text)]">Sidebar (out of scope)</p>
          <Button appearance="outlined" tone="secondary" size="md">
            Sidebar button
          </Button>
        </div>
        <div ref={mainRef} className="rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-primary)] p-4">
          <p className="mb-2 font-medium text-[var(--color-text-text)]">Main area (in scope)</p>
          <Button appearance="filled" tone="secondary" size="md">
            Main area button
          </Button>
        </div>
        <KeyboardShortcuts {...args} scopeRef={mainRef} />
      </div>
    );
  },
};

/** Opened, for the open-state baseline: grouped rows with key caps. */
export const Open: Story = {
  args: {
    groups,
    description: 'A quick reference for getting around faster.',
    trigger: (
      <Button appearance="outlined" tone="secondary">
        Shortcuts
      </Button>
    ),
    defaultOpen: true,
  },
};

/** A compact set with a single unnamed group (no section headings). */
export const SingleGroup: Story = {
  args: {
    groups: [
      {
        shortcuts: [
          { keys: ['⌘', 'K'], description: 'Open command palette' },
          { keys: ['⌘', 'S'], description: 'Save changes' },
          { keys: ['esc'], description: 'Close' },
        ],
      },
    ],
    trigger: (
      <Button appearance="outlined" tone="secondary">
        Keyboard help
      </Button>
    ),
  },
};
