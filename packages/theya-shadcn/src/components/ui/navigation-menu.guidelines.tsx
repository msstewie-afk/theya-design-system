import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from './navigation-menu';

const link = (label: string) => (
  <NavigationMenuItem key={label}>
    <NavigationMenuLink href="#gl-nm">{label}</NavigationMenuLink>
  </NavigationMenuItem>
);

export const navigationMenuGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A horizontal site or product header with a few top-level sections, some opening a panel of links.'],
  whenNotToUse: [
    { text: 'App navigation with many sections', instead: 'Sidebar' },
    { text: 'Commands (File, Edit…)', instead: 'Menubar' },
    { text: 'Switching views within a page', instead: 'Tabs' },
  ],
  anatomy: [
    { part: 'List', description: 'top-level items: links, or triggers with a chevron.' },
    { part: 'Content', description: 'the flyout panel of links, under the bar.' },
    { part: 'Link', description: <><C>NavigationMenuLink</C>; mark the current with <C>active</C>.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <NavigationMenu aria-label="Site sections">
            <NavigationMenuList>{['Products', 'Pricing', 'Docs', 'Blog'].map(link)}</NavigationMenuList>
          </NavigationMenu>
        ),
        caption: 'Four top-level sections fit in one row.',
      },
      dont: {
        example: (
          <div className="w-80 overflow-hidden">
            <NavigationMenu aria-label="All sections">
              <NavigationMenuList className="flex-wrap">
                {['Dashboard', 'Sites', 'Domains', 'Databases', 'Email', 'Backups', 'Logs', 'Team', 'Billing', 'Settings'].map(link)}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        ),
        caption: 'Ten app sections in a header bar: they wrap and get lost — use a Sidebar.',
      },
    },
  ],
  a11y: [
    <>A <C>nav</C>; give each one on a page its own <C>aria-label</C>.</>,
    'Triggers are buttons with aria-expanded; Tab moves through links, Escape closes a panel.',
    <>The current section’s link has <C>aria-current="page"</C> (<C>active</C>).</>,
  ],
};
