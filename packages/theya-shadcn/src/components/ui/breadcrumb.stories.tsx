import { Home } from 'iconoir-react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, within } from '@storybook/test';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from './breadcrumb';
import { breadcrumbGuidelines } from './breadcrumb.guidelines';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   The topbar trail of links ending in the current page. Composed from named
//   parts: Breadcrumb wraps a BreadcrumbList of BreadcrumbItems. Ancestors are
//   BreadcrumbLinks; the final level is a BreadcrumbPage (current,
//   non-navigable). BreadcrumbSeparator renders a decorative chevron;
//   BreadcrumbEllipsis collapses a long middle; pass it `items` and it opens a
//   menu of the hidden levels. Both BreadcrumbLink and BreadcrumbPage accept
//   an icon prop — omit children for an icon-only crumb (pass aria-label).
const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  tags: ['autodocs'],
  parameters: {
    guidelines: breadcrumbGuidelines,
    docs: {
      description: {
        component:
          "Shows where a page sits in a hierarchy of three or more levels and lets people go up. Long trails fold their middle into a menu.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/** A three-level trail: two ancestor links, then the current page, which isn't a link. */
export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Studios</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Golden hour</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Client picks</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** A deeper trail. Identifiers use font-mono; the last item is the current page. */
export const DeepTrail: Story = {
  name: 'Deep trail',
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/galleries">Galleries</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/galleries/golden-hour">
            Golden hour
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/galleries/golden-hour/settings">Settings</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Licenses</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** Folded middle: the ellipsis opens a menu with the hidden levels, so they stay reachable. */
export const WithEllipsis: Story = {
  name: 'With ellipsis',
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show 3 more levels' }));
    const menu = await screen.findByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: 'Helios Studio' })).toHaveAttribute('href', '#helios');
    await userEvent.keyboard('{Escape}');
  },
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Studios</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis
            items={[
              { label: 'Clients', href: '#clients' },
              { label: 'Helios Studio', href: '#helios' },
              { label: 'Galleries', href: '#galleries' },
            ]}
          />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Client picks</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** Custom separator — a slash instead of the default chevron. Stays decorative (role="presentation", aria-hidden). */
export const CustomSeparator: Story = {
  name: 'Custom separator',
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/galleries">Galleries</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Golden hour</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** A single top-level page has no parent, so the trail is just the current page. Prefer omitting the breadcrumb entirely when there's no meaningful hierarchy. */
export const CurrentPageOnly: Story = {
  name: 'Current page only',
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>Galleries</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** A long trail wraps onto a second row rather than forcing horizontal scroll — resize the canvas toward 360px to see it. */
export const Wrapping: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/galleries">Galleries</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/galleries/golden-hour">
              Golden hour
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/galleries/golden-hour/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/galleries/golden-hour/settings/portal">Client portal</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono">golden-hour.aether.photo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};

/** Each crumb gets a leading icon via the `icon` prop. */
export const WithIcons: Story = {
  name: 'With icons',
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/galleries" icon={<Home />}>
            Galleries
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/galleries/golden-hour">
            Golden hour
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Client picks</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** Icon-only first crumb (no visible label) — a common "home icon > item > item" pattern. The icon-only link still needs an accessible name via `aria-label`. */
export const IconOnlyFirst: Story = {
  name: 'Icon-only first crumb',
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/galleries" icon={<Home />} aria-label="Home" />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/galleries/golden-hour">
            Golden hour
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Client picks</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
