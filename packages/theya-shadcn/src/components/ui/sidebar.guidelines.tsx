import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Archive, Database, Globe, HomeSimple, Key, Mail, Settings, ShieldCheck, User } from 'iconoir-react';
import { SidebarItem, SidebarNav, SidebarProvider, SidebarSection } from './sidebar';

const BOX = 'w-60 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)] p-2';

export const sidebarGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['App navigation with several sections people switch between all day.', 'Grouped destinations, counts and per-item actions; collapses to an icon rail.'],
  whenNotToUse: [
    { text: 'Two to four sections', instead: 'Tabs or NavigationMenu' },
    { text: 'Content filters', instead: 'Filter or FacetedList' },
  ],
  anatomy: [
    { part: 'Header', description: <><C>SidebarBrand</C> and <C>SidebarCollapse</C>.</> },
    { part: 'Sections', description: <><C>SidebarSection label</C> groups related items.</> },
    { part: 'Item', description: <>icon, label, <C>badge</C>, hover <C>actions</C>; <C>active</C> marks the current page.</> },
    { part: 'Footer', optional: true, description: 'account, help.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <SidebarProvider>
            <div className={BOX}>
              <SidebarNav aria-label="Grouped navigation example">
                <SidebarSection label="Manage">
                  <SidebarItem href="#gl-sb" icon={<HomeSimple />}>Dashboard</SidebarItem>
                  <SidebarItem href="#gl-sb" icon={<Globe />} active badge="128">Sites</SidebarItem>
                  <SidebarItem href="#gl-sb" icon={<Database />}>Databases</SidebarItem>
                </SidebarSection>
                <SidebarSection label="Account">
                  <SidebarItem href="#gl-sb" icon={<User />}>Team</SidebarItem>
                  <SidebarItem href="#gl-sb" icon={<Settings />}>Settings</SidebarItem>
                </SidebarSection>
              </SidebarNav>
            </div>
          </SidebarProvider>
        ),
        caption: 'Grouped, with the current page marked.',
      },
      dont: {
        example: (
          <SidebarProvider>
            <div className={BOX}>
              <SidebarNav aria-label="Flat navigation example">
                <SidebarItem href="#gl-sb" icon={<HomeSimple />}>Dashboard</SidebarItem>
                <SidebarItem href="#gl-sb" icon={<Globe />}>Sites</SidebarItem>
                <SidebarItem href="#gl-sb" icon={<Database />}>Databases</SidebarItem>
                <SidebarItem href="#gl-sb" icon={<Mail />}>Email</SidebarItem>
                <SidebarItem href="#gl-sb" icon={<ShieldCheck />}>Certificates</SidebarItem>
                <SidebarItem href="#gl-sb" icon={<Key />}>Credentials</SidebarItem>
                <SidebarItem href="#gl-sb" icon={<Archive />}>Backups</SidebarItem>
                <SidebarItem href="#gl-sb" icon={<User />}>Team</SidebarItem>
                <SidebarItem href="#gl-sb" icon={<Settings />}>Settings</SidebarItem>
              </SidebarNav>
            </div>
          </SidebarProvider>
        ),
        caption: 'Nine items in one flat list, nothing marked as current: hard to scan, no “you are here”.',
      },
    },
  ],
  a11y: [
    <>Items are a <C>nav</C> (“Main” by default); the active one has <C>aria-current="page"</C>.</>,
    'Items without href render as buttons, so they’re still keyboard-reachable.',
    'Collapsed: labels are visually hidden but stay as accessible names (no tooltips yet, and badges are hidden); focus follows the collapse toggle.',
    'Below md it’s a slide-over drawer with focus trap and Escape.',
  ],
};
