import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

// Spy for the "Disabled item" story's play function.
const onSelectAction = fn();
import { Globe, Settings, HomeSimple, Wrench, ArrowUpRight, RefreshDouble, ShieldCheck, Trash } from 'iconoir-react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandFooter,
  CommandLoading,
} from './command';
import type { CommandItemProps } from './command';
import { Button } from './button';

// Docs-only args type: Command's own props plus the CommandItem props
// we want documented in this single table — they live on a different
// sub-component and Meta<typeof Command> alone can't see them.
type CommandStoryArgs = React.ComponentProps<typeof Command> & Pick<CommandItemProps, 'icon' | 'toneIcon' | 'description' | 'breadcrumb'>;

const meta: Meta<CommandStoryArgs> = {
  title: 'Navigation/Command',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Not built on Base UI Autocomplete or cmdk — a self-contained inline list with our own filtering and keyboard nav (↑/↓/↵/Esc).',
      },
    },
  },
  argTypes: {
    label: { control: 'text', description: 'On Command. Accessible name fallback for the input.', table: { category: 'Content' } },
    shouldFilter: { control: 'boolean', description: 'On Command. Set false to render every item unfiltered — the query only drives the input.', table: { category: 'Behavior' } },
    loading: { control: 'boolean', description: 'On Command. Shows CommandLoading and suppresses CommandEmpty.', table: { category: 'State' } },
    icon: { control: false, description: 'On CommandItem. Leading 16px icon — mutually exclusive with toneIcon (same slot).', table: { category: 'Content' } },
    toneIcon: { control: false, description: 'On CommandItem. Tone-tinted glyph before the label instead of icon.', table: { category: 'Content' } },
    breadcrumb: { control: false, description: 'On CommandItem. Path/context line ABOVE the label.', table: { category: 'Content' } },
    description: { control: false, description: 'On CommandItem. Second line under the label.', table: { category: 'Content' } },
  },
};

export default meta;
type Story = StoryObj<CommandStoryArgs>;

export const Inline: Story = {
  render: () => (
    <div className="w-[380px] rounded-lg border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-sm">
      <Command label="Command menu">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem value="dashboard">
              <HomeSimple /> Dashboard
            </CommandItem>
            <CommandItem value="sites">
              <Globe /> Sites
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem value="settings">
              <Settings /> General settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
            <CommandItem value="tools">
              <Wrench /> Tools
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </Command>
    </div>
  ),
  // Keyboard model: the first option starts highlighted and is exposed via
  // aria-activedescendant; arrows move it; typing filters; Escape clears.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Command menu' });
    const highlighted = () => canvas.getByRole('option', { selected: true });

    await userEvent.click(input);
    await waitFor(() => expect(highlighted()).toHaveTextContent('Dashboard'));
    await expect(input).toHaveAttribute('aria-activedescendant', highlighted().id);

    await userEvent.keyboard('{ArrowDown}');
    await expect(highlighted()).toHaveTextContent('Sites');
    await expect(input).toHaveAttribute('aria-activedescendant', highlighted().id);

    await userEvent.type(input, 'tool');
    await waitFor(() => expect(canvas.getAllByRole('option')).toHaveLength(1));
    await expect(highlighted()).toHaveTextContent('Tools');

    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
    await expect(canvas.getAllByRole('option')).toHaveLength(4);
  },
};

/** `icon`/`toneIcon` (leading glyph) and `description` (second line) — for results that need more than a bare label, like search hits or entities. */
export const WithDescriptions: Story = {
  name: 'With icons and descriptions',
  render: () => (
    <div className="w-[420px] rounded-lg border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-sm">
      <Command label="Command menu">
        <CommandInput placeholder="Search sites, pages and actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Sites">
            <CommandItem value="shop.seashell.dev" toneIcon={{ tone: 'primary' }} description="EU-West-1 · Pro plan">
              shop.seashell.dev
            </CommandItem>
            <CommandItem value="api.seashell.dev" toneIcon={{ tone: 'success' }} description="Deployed 2 minutes ago">
              api.seashell.dev
            </CommandItem>
            <CommandItem value="blog.seashell.dev" toneIcon={{ tone: 'warning' }} description="SSL certificate expires in 3 days">
              blog.seashell.dev
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </Command>
    </div>
  ),
};

/** `breadcrumb` renders a path/context line above the label — e.g. jumping straight to a nested settings page from search. */
export const WithBreadcrumb: Story = {
  name: 'With breadcrumb',
  render: () => (
    <div className="w-[420px] rounded-lg border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-sm">
      <Command label="Command menu">
        <CommandInput placeholder="Search settings…" value="review" readOnly />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Results">
            <CommandItem value="review" breadcrumb="Settings">
              Review
            </CommandItem>
            <CommandItem value="pr-link" breadcrumb="Settings > Review" description="Add a Devin Review link in the PR description">
              Add &quot;Devin Review&quot; link in PR description
            </CommandItem>
            <CommandItem value="spend-limit" breadcrumb="Settings > Review">
              Per-PR spend limit
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </Command>
    </div>
  ),
};

/** Entity results — searchable site list with font-mono identifiers and a trailing "open" affordance. */
export const EntityResults: Story = {
  name: 'Entity results',
  render: () => (
    <div className="w-[380px] rounded-lg border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-sm">
      <Command label="Command menu">
        <CommandInput placeholder="Search sites…" />
        <CommandList>
          <CommandEmpty>No sites match.</CommandEmpty>
          <CommandGroup heading="Sites">
            <CommandItem value="shop.seashell.dev" icon={<Globe />} keywords={['pro', 'eu-west-1']}>
              <span className="font-mono">shop.seashell.dev</span>
              <ArrowUpRight className="ml-auto" />
            </CommandItem>
            <CommandItem value="api.seashell.dev" icon={<Globe />} keywords={['scale', 'us-east-1']}>
              <span className="font-mono">api.seashell.dev</span>
              <ArrowUpRight className="ml-auto" />
            </CommandItem>
            <CommandItem value="blog.seashell.dev" icon={<Globe />} keywords={['starter', 'eu-west-1']}>
              <span className="font-mono">blog.seashell.dev</span>
              <ArrowUpRight className="ml-auto" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </Command>
    </div>
  ),
};

/** Disabled items are skipped by filtering/keyboard nav and render dimmed (never color-alone). Here "Delete site" is unavailable until the running site is suspended. */
export const DisabledItem: Story = {
  name: 'Disabled item',
  render: () => (
    <div className="w-[380px] rounded-lg border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-sm">
      <Command label="Command menu">
        <CommandInput placeholder="Run a command…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem value="reissue" onSelect={onSelectAction}>
              <RefreshDouble /> Reissue certificate
            </CommandItem>
            <CommandItem value="suspend" onSelect={onSelectAction}>
              <ShieldCheck /> Suspend site
            </CommandItem>
            <CommandItem value="delete" disabled onSelect={onSelectAction}>
              <Trash /> Delete site
              <CommandShortcut>suspend first</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </Command>
    </div>
  ),
  // The disabled row never takes the highlight, so Enter can't land on it.
  play: async ({ canvasElement }) => {
    onSelectAction.mockClear();
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Command menu' });
    const highlighted = () => canvas.getByRole('option', { selected: true });
    await expect(canvas.getByRole('option', { name: /Delete site/ })).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await expect(highlighted()).toHaveTextContent('Suspend site');

    await userEvent.keyboard('{Enter}');
    await expect(onSelectAction).toHaveBeenCalledTimes(1);
    await expect(onSelectAction).toHaveBeenLastCalledWith('suspend');

    await userEvent.type(input, 'delete');
    await expect(canvas.queryByRole('option', { selected: true })).toBeNull();
    await userEvent.keyboard('{Enter}');
    await expect(onSelectAction).toHaveBeenCalledTimes(1);
  },
};

/** The empty state — a query pre-seeded to match nothing, so CommandEmpty shows without interaction. */
export const Empty: Story = {
  render: () => (
    <div className="w-[380px] rounded-lg border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-sm">
      <Command label="Command menu">
        <CommandInput placeholder="Search…" value="no-such-command" readOnly />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem value="dashboard">
              <HomeSimple /> Dashboard
            </CommandItem>
            <CommandItem value="sites">
              <Globe /> Sites
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </Command>
    </div>
  ),
};

/** Pass `<Command loading>` while fetching and place a `<CommandLoading>` as a sibling of `<CommandList>` (a listbox may not own a status region). It shows a spinner + "Loading…" and suppresses CommandEmpty. This story stays loading so the row is visible. */
export const Loading: Story = {
  render: () => (
    <div className="w-[380px] rounded-lg border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-sm">
      <Command label="Command menu" loading>
        <CommandInput placeholder="Search sites…" />
        <CommandLoading />
        <CommandList>
          <CommandEmpty>No sites match.</CommandEmpty>
        </CommandList>
      </Command>
    </div>
  ),
};

function AsyncFetchDemo() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1600);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="w-[380px] rounded-lg border border-solid border-[var(--color-border-border-subtle)] shadow-elevation-sm">
      <Command label="Command menu" loading={loading}>
        <CommandInput placeholder="Search sites…" />
        <CommandLoading />
        <CommandList>
          <CommandEmpty>No sites match.</CommandEmpty>
          <CommandGroup heading="Sites">
            <CommandItem value="shop.seashell.dev">
              <span className="font-mono">shop.seashell.dev</span>
            </CommandItem>
            <CommandItem value="api.seashell.dev">
              <span className="font-mono">api.seashell.dev</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

/** A realistic async fetch: `loading` starts true and flips false after ~1.6s, so the palette shows the loading row first and then the results. */
export const AsyncFetch: Story = {
  name: 'Async fetch',
  render: () => <AsyncFetchDemo />,
};

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button appearance="outlined" tone="secondary" onClick={() => setOpen(true)}>
        Open command palette (⌘K)
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem value="dashboard" onSelect={() => setOpen(false)}>
              <HomeSimple /> Dashboard
            </CommandItem>
            <CommandItem value="sites" onSelect={() => setOpen(false)}>
              <Globe /> Sites
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </CommandDialog>
    </>
  );
}

export const AsDialog: Story = {
  name: 'As dialog',
  render: () => <DialogDemo />,
};

/** Render-open by default so the modal palette is visible without interaction. Excluded from the combined autodocs page — an always-open Dialog focus-traps and aria-hides siblings, making the rest of the Docs page unreachable. Canvas-only. */
export const OpenInDialog: Story = {
  name: 'Open in dialog',
  parameters: { docs: { disable: true } },
  render: () => (
    <CommandDialog open>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="dashboard">
            <HomeSimple /> Dashboard
          </CommandItem>
          <CommandItem value="sites">
            <Globe /> Sites
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem value="new-site">
            Create site
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <CommandFooter />
    </CommandDialog>
  ),
};
