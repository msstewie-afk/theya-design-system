import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, userEvent, waitFor, within } from '@storybook/test';
import { MegaMenu } from './mega-menu';
import { DEMO_MENU } from './demo-data';
import { megaMenuGuidelines } from './mega-menu.guidelines';

const meta: Meta<typeof MegaMenu> = {
  title: 'Patterns: Navigation/MegaMenu',
  component: MegaMenu,
  tags: ['autodocs'],
  parameters: {
    guidelines: megaMenuGuidelines,
    layout: 'fullscreen',
    // Same known false positive as ui/NavigationMenu: Radix's hidden focus
    // proxy (aria-hidden + tabIndex 0) that moves focus into the open panel.
    a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
  },
  args: { items: DEMO_MENU, currentId: 'products' },
  decorators: [
    (Story) => (
      <div className="min-h-[34rem]">
        <header className="flex h-16 items-center gap-6 border-b border-solid border-[var(--color-border-border)] bg-[var(--color-bg-surface-bg-surface)] px-6">
          <span className="font-body text-body-l font-semibold text-[var(--color-text-text)]">Theya</span>
          {Story()}
        </header>
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof MegaMenu>;

/** Grouped sub-areas, one featured item, and the section's own "All …" page in every panel. */
export const Default: Story = {

  play: async ({ canvasElement }) => {
    // Phone (below md): one "Menu" button opens a drawer; sections are accordions,
    // the current one already open.
    const phone = window.matchMedia('(max-width: 767.98px)').matches;
    if (phone) {
      const c = within(canvasElement);
      const menu = c.getByRole('button', { name: 'Menu' });
      await userEvent.click(menu);
      const drawer = await within(document.body).findByRole('dialog', { name: 'Menu' });
      await expect(within(drawer).getByRole('link', { name: 'All products' })).toHaveAttribute('href', '#products');
      await expect(within(drawer).getByRole('link', { name: 'VPS' })).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(menu).toHaveAttribute('aria-expanded', 'false'), { timeout: 2500 });
      return;
    }

    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Products/ });
    // The current section is marked by more than text color: a tinted fill, as a
    // current plain link gets (WCAG 1.4.1). Checked before any hover or open state.
    await expect(trigger).toHaveAccessibleName(/current section/);
    await expect(trigger).toHaveAttribute('data-current');
    await expect(trigger).toHaveClass('bg-[var(--color-bg-neutral-bg-neutral-subtle)]');
    const other = canvas.getByRole('button', { name: 'Solutions' });
    await expect(other).not.toHaveAttribute('data-current');
    await expect(getComputedStyle(trigger).backgroundColor).not.toBe(getComputedStyle(other).backgroundColor);
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await expect(canvas.getByRole('heading', { name: 'Hosting' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: /All products/ })).toHaveAttribute('href', '#products');
    await expect(canvas.getByRole('link', { name: /Move your site for free/ })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  },
};

/** Narrow screens: the same tree in a drawer, one section open at a time. */
export const Narrow: Story = {
  args: { layout: 'drawer' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }));
    const drawer = await screen.findByRole('dialog', { name: 'Menu' });
    // The current section starts open, with its "All …" link first.
    await expect(within(drawer).getByRole('link', { name: /All products/ })).toBeVisible();
    // Column titles are h4 headings (under the h2 title and h3 section headers) that name their lists.
    await expect(within(drawer).getByRole('heading', { level: 4, name: 'Hosting' })).toBeVisible();
    await expect(within(drawer).getByRole('list', { name: 'Hosting' })).toBeVisible();
    await userEvent.click(within(drawer).getByRole('button', { name: 'Solutions' }));
    await expect(within(drawer).getByRole('link', { name: 'Online stores' })).toBeVisible();
  },
};

/** Drawer with a plain top-level link as the current page: marked with aria-current and the same tinted fill as in the bar. */
export const NarrowCurrentLink: Story = {
  args: { layout: 'drawer', currentId: 'pricing' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }));
    const drawer = await screen.findByRole('dialog', { name: 'Menu' });
    const current = within(drawer).getByRole('link', { name: 'Pricing' });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(current).toHaveClass('bg-[var(--color-bg-neutral-bg-neutral-subtle)]');
    const other = within(drawer).getByRole('link', { name: 'Contact sales' });
    await expect(other).not.toHaveAttribute('aria-current');
    await expect(getComputedStyle(current).backgroundColor).not.toBe(getComputedStyle(other).backgroundColor);
  },
};
