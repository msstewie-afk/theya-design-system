import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, screen, userEvent, within } from '@storybook/test';
import { AccountMenu, DEFAULT_ACCOUNT_LINKS, type ThemePreference } from './account-menu';
import { DEMO_USER, DEMO_WORKSPACES } from './demo-data';

const meta: Meta<typeof AccountMenu> = {
  title: 'Patterns: Account/AccountMenu',
  component: AccountMenu,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { user: DEMO_USER, onSignOut: fn(), onWorkspaceChange: fn() },
  decorators: [(Story) => <div className="flex justify-end">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof AccountMenu>;

/** Who is signed in and where; the menu lists every account area, sign-out last. */
export const Default: Story = {
  render: function Render(args) {
    const [ws, setWs] = useState('seashell');
    const [theme, setTheme] = useState<ThemePreference>('system');
    return (
      <AccountMenu
        {...args}
        workspaces={DEMO_WORKSPACES}
        workspaceId={ws}
        onWorkspaceChange={(id) => {
          setWs(id);
          args.onWorkspaceChange?.(id);
        }}
        theme={theme}
        onThemeChange={setTheme}
        links={DEFAULT_ACCOUNT_LINKS.map((l) => (l.label === 'Billing' ? { ...l, count: 1 } : l))}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Account: Dana Kovač, Seashell, 1 item needs attention' });
    await userEvent.click(trigger);
    const menu = await screen.findByRole('menu');
    await expect(within(menu).getByText('dana@seashell.shop')).toBeVisible();
    await expect(within(menu).getByRole('menuitem', { name: /Billing 1 item needs attention/ })).toHaveAttribute('href', '#billing');

    await userEvent.click(within(menu).getByRole('menuitemradio', { name: /Northwind Studio/ }));
    await expect(args.onWorkspaceChange).toHaveBeenCalledWith('northwind');
    await expect(canvas.getByRole('button', { name: /Account: Dana Kovač, Northwind Studio/ })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: /Account:/ }));
    const items = within(await screen.findByRole('menu')).getAllByRole('menuitem');
    await expect(items[items.length - 1]).toHaveTextContent('Sign out');
    await userEvent.click(items[items.length - 1]);
    await expect(args.onSignOut).toHaveBeenCalledTimes(1);
  },
};

/** One workspace, no theme switch, avatar only — the smallest version. */
export const Compact: Story = {
  args: { compact: true },
};
