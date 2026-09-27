import type { Meta, StoryObj } from '@storybook/react';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from './navigation-menu';

const meta: Meta<typeof NavigationMenu> = {
  title: 'Navigation/NavigationMenu',
  component: NavigationMenu,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      config: {
        // aria-hidden-focus: confirmed false positive, not our code. Every
        // open NavigationMenuTrigger renders @radix-ui/react-navigation-
        // menu's own internal focus-proxy sentinel (a VisuallyHiddenPrimitive
        // with aria-hidden + tabIndex=0 — see their dist/index.mjs, the
        // NavigationMenuTrigger implementation) to redirect keyboard focus
        // into/out of the open panel. It's deliberate upstream a11y
        // plumbing wired to their internal focusProxyRef, not a leftover or
        // a mistake — disabling it here would risk actually breaking
        // keyboard navigation, and there is nothing on our side to patch
        // (audit finding, 2026-09-27; confirmed against Radix's own
        // source, not guessed).
        rules: [{ id: 'aria-hidden-focus', enabled: false }],
      },
    },
  },
  argTypes: {
    viewportClassName: { control: false, description: "Extra classes for the flyout panel's viewport wrapper." },
    value: { control: false, description: 'Controlled open item value.' },
    defaultValue: { control: false, description: 'Uncontrolled initial open item value.' },
    onValueChange: { control: false, description: 'Fires when the open item changes.' },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], description: 'Reading direction, affects arrow-key navigation.' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], description: 'Layout direction of the top-level menu.' },
  },
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

function ProductNav({ defaultValue }: { defaultValue?: string }) {
  return (
    <NavigationMenu aria-label="Product menu" defaultValue={defaultValue}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              <li>
                <NavigationMenuLink href="#">
                  <span className="font-medium">Hosting</span>
                  <span className="text-[var(--color-text-text-subtler)]">Shared, VPS and dedicated servers.</span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <span className="font-medium">Domains</span>
                  <span className="text-[var(--color-text-text-subtler)]">Search, register and manage.</span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <span className="font-medium">SSL certificates</span>
                  <span className="text-[var(--color-text-text-subtler)]">Automatic renewal, wildcard support.</span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">
                  <span className="font-medium">Email</span>
                  <span className="text-[var(--color-text-text-subtler)]">Business email and calendars.</span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex flex-col gap-1 w-[220px]">
              <li>
                <NavigationMenuLink href="#">Documentation</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Blog</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#">Support</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className="h-9 flex-row items-center px-3 py-2">
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export const Default: Story = {
  render: () => <ProductNav />,
};

/** The Products panel open by default — no click needed to see the mega-menu grid. */
export const Open: Story = {
  render: () => <ProductNav defaultValue="products" />,
};
