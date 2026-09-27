import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HomeSimple, Globe, Settings, ShieldCheck, Key, Lifebelt, Plus, Trash, EditPencil } from 'iconoir-react';
import { KebabIconHorizontal } from './kebab-icon';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarBrand,
  SidebarCollapse,
  SidebarNav,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
} from './sidebar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu';
import { Avatar, AvatarFallback } from './avatar';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: {
    docs: {
      description: {
        component: 'A collapsible rail (300px → 64px). Below md it becomes a slide-over on Sheet.',
      },
    },
  },
  argTypes: {
    inverse: {
      control: 'boolean',
      description: 'Dark, inverse-color rail regardless of the page\'s own theme — sets data-theme="dark" locally on the rail (and its mobile slide-over). Default false.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

function DemoLayout({ inverse }: { inverse?: boolean }) {
  const [active, setActive] = useState('sites');
  return (
    <SidebarProvider>
      <div className="flex h-[560px] border border-solid border-[var(--color-border-border-subtle)] rounded-lg overflow-hidden" style={{ width: 760 }}>
        <Sidebar inverse={inverse} className="!h-full">
          <SidebarHeader>
            <SidebarBrand>Theya</SidebarBrand>
            <SidebarCollapse />
          </SidebarHeader>
          <SidebarNav>
            <SidebarSection label="Manage">
              <SidebarItem icon={<HomeSimple />} active={active === 'dashboard'} onClick={() => setActive('dashboard')}>
                Dashboard
              </SidebarItem>
              <SidebarItem icon={<Globe />} badge="128" active={active === 'sites'} onClick={() => setActive('sites')}>
                Sites
              </SidebarItem>
              <SidebarItem icon={<ShieldCheck />} badge="3" badgeTone="warning" active={active === 'certificates'} onClick={() => setActive('certificates')}>
                Certificates
              </SidebarItem>
              <SidebarItem
                icon={<Key />}
                badge="!" badgeTone="destructive"
                active={active === 'credentials'}
                onClick={() => setActive('credentials')}
                actions={
                  <>
                    <DropdownMenuItem><EditPencil /> Rename</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive"><Trash /> Delete</DropdownMenuItem>
                  </>
                }
              >
                Credentials
              </SidebarItem>
            </SidebarSection>
            <SidebarSection
              label="Projects"
              action={
                <button
                  type="button"
                  aria-label="Add project"
                  className="grid size-5 shrink-0 place-content-center rounded-[var(--size-border-radius-border-radius-sm)] text-[var(--color-icon-icon-subtle)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]"
                >
                  <Plus width={14} height={14} aria-hidden="true" />
                </button>
              }
            >
              <SidebarItem
                icon={<Globe />}
                active={active === 'acme'}
                onClick={() => setActive('acme')}
                actions={
                  <>
                    <DropdownMenuItem><EditPencil /> Rename</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive"><Trash /> Delete</DropdownMenuItem>
                  </>
                }
              >
                acme-corp
              </SidebarItem>
            </SidebarSection>
          </SidebarNav>
          <SidebarFooter>
            <SidebarItem icon={<Settings />}>Settings</SidebarItem>
            <SidebarItem icon={<Lifebelt />}>Support</SidebarItem>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-6 font-body text-body-s text-[var(--color-text-text-subtler)]">Main content area.</div>
      </div>
    </SidebarProvider>
  );
}

export const Default: Story = {
  render: () => <DemoLayout />,
};

/** `inverse` puts the rail on the dark token set regardless of the page's own theme (`data-theme="dark"` scoped to the rail). */
export const Inverse: Story = {
  render: () => <DemoLayout inverse />,
};

function AccountLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-[420px] border border-solid border-[var(--color-border-border-subtle)] rounded-lg overflow-hidden" style={{ width: 760 }}>
        <Sidebar className="!h-full">
          <SidebarHeader>
            <SidebarBrand>Theya</SidebarBrand>
            <SidebarCollapse />
          </SidebarHeader>
          <SidebarNav>
            <SidebarSection label="Manage">
              <SidebarItem icon={<HomeSimple />} active>
                Dashboard
              </SidebarItem>
              <SidebarItem icon={<Globe />} badge="128">
                Sites
              </SidebarItem>
            </SidebarSection>
          </SidebarNav>
          <SidebarFooter>
            <SidebarItem icon={<Settings />}>Settings</SidebarItem>
            <SidebarItem icon={<Lifebelt />}>Support</SidebarItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="mt-1 flex w-full items-center gap-2.5 rounded-[var(--size-border-radius-border-radius-md)] px-2.5 py-2 text-left outline-none transition-colors duration-150 ease-out hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)] data-[state=open]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]"
                >
                  <Avatar>
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-body text-body-m font-medium text-[var(--color-text-text)]">Maria Smith</span>
                    <span className="block truncate font-body text-body-xs text-[var(--color-text-text-subtler)]">Design system specialist</span>
                  </span>
                  <KebabIconHorizontal className="shrink-0 text-[var(--color-text-text)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Switch workspace</DropdownMenuItem>
                <DropdownMenuItem>Account settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 p-6 font-body text-body-s text-[var(--color-text-text-subtler)]">Main content area.</div>
      </div>
    </SidebarProvider>
  );
}

/** A realistic footer: Settings/Support items, then an account row (Avatar + name + role) with a chevron for a workspace switcher. */
export const WithAccount: Story = {
  name: 'With account',
  render: () => <AccountLayout />,
};
