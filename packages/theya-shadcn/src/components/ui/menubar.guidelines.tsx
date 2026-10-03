import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from './menubar';

export const menubarGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['An application-style menu bar for editors and tools: File, Edit, View, each with many commands.'],
  whenNotToUse: [
    { text: 'Site or product navigation', instead: 'NavigationMenu or Sidebar' },
    { text: 'One menu of actions', instead: 'DropdownMenu' },
    { text: 'A few frequent actions', instead: 'a toolbar of Buttons' },
  ],
  anatomy: [
    { part: 'Bar', description: <>one tab stop; <C>bordered</C> for a floating toolbar look.</> },
    { part: 'Trigger', description: 'opens its menu; arrows move between menus.' },
    { part: 'Content', description: 'items, checkbox/radio items, submenus, shortcuts — same as DropdownMenu.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <Menubar aria-label="Editor menu">
            <MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem>New file</MenubarItem></MenubarContent></MenubarMenu>
            <MenubarMenu><MenubarTrigger>Edit</MenubarTrigger><MenubarContent><MenubarItem>Undo</MenubarItem></MenubarContent></MenubarMenu>
            <MenubarMenu><MenubarTrigger>View</MenubarTrigger><MenubarContent><MenubarItem>Zoom in</MenubarItem></MenubarContent></MenubarMenu>
          </Menubar>
        ),
        caption: 'Command menus of an editor, like a desktop app.',
      },
      dont: {
        example: (
          <Menubar aria-label="Site menu">
            <MenubarMenu><MenubarTrigger>Products</MenubarTrigger><MenubarContent><MenubarItem>Hosting</MenubarItem></MenubarContent></MenubarMenu>
            <MenubarMenu><MenubarTrigger>Pricing</MenubarTrigger><MenubarContent><MenubarItem>Plans</MenubarItem></MenubarContent></MenubarMenu>
            <MenubarMenu><MenubarTrigger>Docs</MenubarTrigger><MenubarContent><MenubarItem>Guides</MenubarItem></MenubarContent></MenubarMenu>
          </Menubar>
        ),
        caption: 'Site navigation as a menubar: links become menu commands — use NavigationMenu.',
      },
    },
  ],
  a11y: [
    <>Role <C>menubar</C> with roving focus: Tab lands on the bar once, ←/→ move between menus, ↓ opens.</>,
    <>Name the bar with <C>aria-label</C>.</>,
    'Items that navigate belong in navigation, not here — screen readers announce menu items, not links.',
  ],
};
