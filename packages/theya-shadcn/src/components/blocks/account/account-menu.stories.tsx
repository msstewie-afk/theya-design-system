import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, screen, userEvent, within } from '@storybook/test';
import { AccountMenu, DEFAULT_ACCOUNT_LINKS, type ThemePreference } from './account-menu';
import { DEMO_USER, DEMO_WORKSPACES } from './demo-data';
import { accountMenuGuidelines } from './account-menu.guidelines';

const meta: Meta<typeof AccountMenu> = {
  title: 'Patterns: Account/AccountMenu',
  component: AccountMenu,
  tags: ['autodocs'],
  parameters: { guidelines: accountMenuGuidelines, layout: 'padded' },
  args: { user: DEMO_USER, onSignOut: fn(), onWorkspaceChange: fn() },
  decorators: [(Story) => <div className="flex justify-end">{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof AccountMenu>;

/** Who is signed in and where; the menu lists every account area, sign-out last. */
export const Default: Story = {
  render: function Render(args) {
    const [ws, setWs] = useState('helios');
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
};

/** One workspace, no theme switch, avatar only — the smallest version. */
export const Compact: Story = {
  args: { compact: true },
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Account: Thea Marlow, Helios Studio, 1 item needs attention' });
    await userEvent.click(trigger);
    const menu = await screen.findByRole('menu');
    await expect(within(menu).getByText('thea@aether.photo')).toBeVisible();
    await expect(within(menu).getByRole('menuitem', { name: /Billing 1 item needs attention/ })).toHaveAttribute('href', '#billing');

    await userEvent.click(within(menu).getByRole('menuitemradio', { name: /Selene Weddings/ }));
    await expect(args.onWorkspaceChange).toHaveBeenCalledWith('selene');
    await expect(canvas.getByRole('button', { name: /Account: Thea Marlow, Selene Weddings/ })).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: /Account:/ }));
    const items = within(await screen.findByRole('menu')).getAllByRole('menuitem');
    await expect(items[items.length - 1]).toHaveTextContent('Sign out');
    await userEvent.click(items[items.length - 1]);
    await expect(args.onSignOut).toHaveBeenCalledTimes(1);
  },
};
