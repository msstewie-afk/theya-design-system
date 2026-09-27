import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Bell, Lifebelt, HomeSimple, Globe, Settings } from 'iconoir-react';
import { Topbar, TopbarMenu, TopbarSearch, TopbarSpacer, TopbarAction } from './topbar';
import { SidebarProvider } from './sidebar';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Plus } from 'iconoir-react';

const meta: Meta<typeof Topbar> = {
  title: 'Navigation/Topbar',
  component: Topbar,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], description: 'Defaults to horizontal.' },
  },
};

export default meta;
type Story = StoryObj<typeof Topbar>;

const SEARCH_ITEMS = [
  { label: 'Dashboard', icon: <HomeSimple /> },
  { label: 'Sites', icon: <Globe /> },
  { label: 'Site: shop.seashell.dev', icon: <Globe /> },
  { label: 'Site: staging.seashell.dev', icon: <Globe /> },
  { label: 'Settings', icon: <Settings /> },
];

// A live, self-contained results dropdown — typing filters in place, no
// dialog. Not built on Command's own building blocks (CommandItem etc.
// require the <Command> provider's context, so they can't be dropped
// standalone into an arbitrary Popover) — a plain listbox instead, the
// same pattern FilterField's own step-one picker uses.
function SearchResults({ query, onSelect }: { query: string; onSelect: () => void }) {
  const matches = SEARCH_ITEMS.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
  if (matches.length === 0) {
    return <p className="px-3 py-6 text-center font-body text-body-s text-[var(--color-text-text-subtler)]">No results.</p>;
  }
  return (
    <div role="listbox" aria-label="Search results" className="max-h-72 overflow-y-auto p-1">
      {matches.map((item) => (
        <div
          key={item.label}
          role="option"
          aria-selected={false}
          onClick={onSelect}
          className={
            'flex cursor-pointer select-none items-center gap-2.5 rounded-[var(--size-border-radius-border-radius-md)] px-2.5 py-2 ' +
            'font-body text-body-m text-[var(--color-text-text)] outline-none hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] ' +
            '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-[var(--color-icon-icon-subtle)]'
          }
        >
          {item.icon}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function DefaultDemo() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <SidebarProvider>
      <Topbar>
        <TopbarMenu />
        <TopbarSearch value={query} onValueChange={setQuery} open={open} onOpenChange={setOpen}>
          <SearchResults query={query} onSelect={() => setOpen(false)} />
        </TopbarSearch>
        <TopbarSpacer />
        <TopbarAction badge aria-label="Notifications">
          <Bell />
        </TopbarAction>
        <TopbarAction aria-label="Help">
          <Lifebelt />
        </TopbarAction>
        <ThemeToggle />
        <button
          type="button"
          aria-label="Open account menu"
          className="ml-1 rounded-full outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]"
        >
          <Avatar>
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </button>
      </Topbar>
    </SidebarProvider>
  );
}

/** The full app-shell header. Type in the search field — results drop into a Popover anchored right under it, never leaving the field (no dialog teleport). */
export const Default: Story = {
  render: () => <DefaultDemo />,
};

/** Just the search field on its own, already typed into. */
export const SearchTrigger: Story = {
  name: 'Search',
  render: function SearchOnly() {
    const [query, setQuery] = useState('site');
    const [open, setOpen] = useState(true);
    return (
      <SidebarProvider>
        <Topbar>
          <TopbarSearch placeholder="Search domains…" value={query} onValueChange={setQuery} open={open} onOpenChange={setOpen}>
            <SearchResults query={query} onSelect={() => setOpen(false)} />
          </TopbarSearch>
          <TopbarSpacer />
        </Topbar>
      </SidebarProvider>
    );
  },
};

/** Icon actions at the trailing edge — each needs its own aria-label; badge folds ", unread" into the accessible name. */
export const Actions: Story = {
  render: () => (
    <SidebarProvider>
      <Topbar>
        <TopbarSpacer />
        <ThemeToggle />
        <TopbarAction aria-label="Help">
          <Lifebelt />
        </TopbarAction>
        <TopbarAction aria-label="Notifications" badge>
          <Bell />
        </TopbarAction>
      </Topbar>
    </SidebarProvider>
  ),
};

/** A compact left-docked version without breadcrumbs — search is icon-only in this orientation, and an avatar anchors the account action at the top of the rail. */
export const Vertical: Story = {
  render: () => (
    <SidebarProvider>
      <div className="flex bg-[var(--color-bg-surface-bg-surface)]">
        <Topbar orientation="vertical" aria-label="Application toolbar" className="!h-fit">
          <button
            type="button"
            aria-label="Open account menu"
            className="mb-2 rounded-full outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]"
          >
            <Avatar>
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
          </button>
          <TopbarSearch placeholder="Search delivery log…" />
          <TopbarAction aria-label="Notifications" badge>
            <Bell />
          </TopbarAction>
          <TopbarAction aria-label="Help">
            <Lifebelt />
          </TopbarAction>
          <ThemeToggle />
          <TopbarSpacer />
        </Topbar>
        <main className="flex-1 p-6">
          <h1 className="font-body text-body-l font-semibold text-[var(--color-text-text)]">Delivery log</h1>
        </main>
      </div>
    </SidebarProvider>
  ),
};

/** A select plus a button pair on the trailing edge — a secondary/outlined action and a primary one, the "New file"-style pattern of a workspace topbar. */
export const WithButtons: Story = {
  name: 'With buttons',
  render: () => (
    <SidebarProvider>
      <Topbar>
        <TopbarSpacer />
        <Select defaultValue="modified" heightSize="sm">
          <SelectTrigger className="w-40 text-body-m" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modified" className="text-body-m">Last modified</SelectItem>
            <SelectItem value="created" className="text-body-m">Date created</SelectItem>
            <SelectItem value="name" className="text-body-m">Name</SelectItem>
          </SelectContent>
        </Select>
        <Button type="outlined" tone="secondary" size="md">
          Import
        </Button>
        <Button type="filled" tone="primary" size="md" leftIcon={<Plus />}>
          New file
        </Button>
      </Topbar>
    </SidebarProvider>
  ),
};

/** Mobile layout (≤ md): the rail toggle appears as a 44px touch target and the search shrinks narrower. Shown in a 360px frame. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <SidebarProvider>
      <div className="w-[360px] max-w-full border-x border-solid border-[var(--color-border-border-subtle)]">
        <Topbar>
          <TopbarMenu />
          <TopbarSearch />
          <TopbarSpacer />
          <TopbarAction aria-label="Notifications" badge>
            <Bell />
          </TopbarAction>
        </Topbar>
      </div>
    </SidebarProvider>
  ),
};
