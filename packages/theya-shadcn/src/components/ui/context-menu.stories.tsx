import { Fragment, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Trash, Xmark } from 'iconoir-react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu';
import { KebabIconHorizontal } from './kebab-icon';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuTrailing,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from './context-menu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Overlays/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Compositional — ContextMenu (Root) itself takes only open/onOpenChange/modal/dir. Build the menu from ContextMenuContent/Item/CheckboxItem/RadioItem/Label/Separator/Sub*.\n\n' +
          '**Rule: a context menu is an accelerator, never the only path.** The trigger region is not focusable, so keyboard users (and touch users who never long-press) can only reach these actions another way. Every item must also live in a visible control — a "…" menu button, a toolbar, an inline button. See *With Visible Alternative*.',
      },
    },
  },
  argTypes: {
    open: { control: false, description: 'Controlled open state.' },
    onOpenChange: { control: false, description: 'Fires when the menu opens or closes.' },
    modal: { control: 'boolean', description: 'Trap focus and block outside interaction while open.' },
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'], description: 'Reading direction, affects arrow-key navigation.' },
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

/** A shared dashed target region. Right-click it to open the menu. */
function Target({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenuTrigger className="flex h-28 w-full max-w-sm select-none items-center justify-center rounded-lg border border-dashed border-[var(--color-border-border-default)] font-body text-body-m text-[var(--color-text-text-subtler)]">
      {children}
    </ContextMenuTrigger>
  );
}

/** Actions for the thing under the pointer: a shortcut, a sub-menu, and a destructive row. */
export const Default: Story = {
  render: () => (
    <ContextMenu>
      <Target>Right-click shop.seashell.dev</Target>
      <ContextMenuContent>
        <ContextMenuLabel className="font-mono">shop.seashell.dev</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem>
            Open site
            <ContextMenuShortcut>⌘O</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Clear cache
            <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Copy</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy URL</ContextMenuItem>
            <ContextMenuItem>Copy deploy ID</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem tone="danger">
          <Trash />
          Delete site
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const page = within(document.body);
    const target = within(canvasElement).getByText('Right-click shop.seashell.dev');
    await userEvent.pointer({ keys: '[MouseRight]', target });
    const menu = await page.findByRole('menu');
    // Keyboard inside the menu: arrows move, ArrowRight opens the sub-menu.
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{ArrowDown}');
    await expect(page.getByRole('menuitem', { name: /Open site/ })).toHaveFocus();
    page.getByRole('menuitem', { name: 'Copy' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(await page.findByRole('menuitem', { name: 'Copy URL' })).toBeInTheDocument();
    await waitFor(() => expect(page.getByRole('menuitem', { name: 'Copy URL' })).toHaveFocus());
    // Escape closes everything.
    await userEvent.keyboard('{Escape}{Escape}');
    await waitFor(() => expect(page.queryByRole('menu')).toBeNull());
  },
};

/** `tone="danger"` turns the row (text + highlight fill) destructive for irreversible actions. */
export const Destructive: Story = {
  render: () => (
    <ContextMenu>
      <Target>Right-click for destructive actions</Target>
      <ContextMenuContent>
        <ContextMenuItem>Open site</ContextMenuItem>
        <ContextMenuItem>Reissue certificate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem tone="danger">Suspend site</ContextMenuItem>
        <ContextMenuItem tone="danger">
          <Trash />
          Delete site
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

/** Checkbox and radio items hold toggles and a single-choice picker; `inset` aligns label/plain rows with the leading indicator column. */
export const CheckboxAndRadio: Story = {
  render: function CheckboxAndRadioStory() {
    const [autoRenew, setAutoRenew] = useState(true);
    const [includeStaging, setIncludeStaging] = useState(false);
    const [region, setRegion] = useState('eu-west-1');
    return (
      <ContextMenu>
        <Target>Right-click for deploy options</Target>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked={autoRenew} onCheckedChange={setAutoRenew}>
            Auto-renew certificate
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={includeStaging} onCheckedChange={setIncludeStaging}>
            Include staging
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel inset>Region</ContextMenuLabel>
          <ContextMenuRadioGroup value={region} onValueChange={setRegion}>
            <ContextMenuRadioItem value="eu-west-1" className="font-mono">
              eu-west-1
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="us-east-2" className="font-mono">
              us-east-2
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

/** `ContextMenuTrailing` pins arbitrary content - a count, a shortcut, an inline control - to an item's right edge. */
export const WithTrailing: Story = {
  render: function WithTrailingStory() {
    const [hasAutoResponder, setHasAutoResponder] = useState(true);
    return (
      <ContextMenu>
        <Target>Right-click a.smith7</Target>
        <ContextMenuContent>
          <ContextMenuItem>
            Open webmail
            <ContextMenuShortcut>⌘O</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <span className="flex-1 truncate">Aliases</span>
            <ContextMenuTrailing>
              <span className="font-body text-body-m text-[var(--color-text-text-subtler)]">5/5</span>
            </ContextMenuTrailing>
          </ContextMenuItem>
          <ContextMenuSeparator />
          {hasAutoResponder ? (
            <ContextMenuItem>
              <span className="flex-1 truncate">Auto-responder</span>
              <ContextMenuTrailing>
                <Button
                  appearance="ghost"
                  tone="danger"
                  size="sm"
                  iconOnly
                  aria-label="Remove auto-responder"
                  tabIndex={-1}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setHasAutoResponder(false);
                  }}
                  leftIcon={<Xmark />}
                />
              </ContextMenuTrailing>
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={() => setHasAutoResponder(true)}>
              Add auto-responder
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

/** Disabled rows lose pointer events, dim, and are skipped during keyboard nav. */
export const WithDisabledItem: Story = {
  render: () => (
    <ContextMenu>
      <Target>Right-click staging.seashell.dev</Target>
      <ContextMenuContent>
        <ContextMenuItem>Open site</ContextMenuItem>
        <ContextMenuItem disabled>Reissue certificate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem tone="danger">Delete site</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

const SITE_ACTIONS = [
  { label: 'Open site' },
  { label: 'Clear cache' },
  { label: 'Delete site', danger: true },
] as const;

/**
 * The required pattern: right-click is a shortcut, the "…" button is the
 * path everyone can reach. Both menus list the same actions.
 */
export const WithVisibleAlternative: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex w-full max-w-sm items-center justify-between gap-3 rounded-lg border border-solid border-[var(--color-border-border-default)] p-4">
        <span className="font-mono text-body-m text-[var(--color-text-text)]">shop.seashell.dev</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button appearance="ghost" tone="secondary" size="md" iconOnly leftIcon={<KebabIconHorizontal />} aria-label="Actions for shop.seashell.dev" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SITE_ACTIONS.map((a) => (
              <DropdownMenuItem key={a.label} tone={'danger' in a ? 'danger' : undefined}>
                {'danger' in a && <Trash />}
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {SITE_ACTIONS.map((a, i) => (
          <Fragment key={a.label}>
            {'danger' in a && i > 0 && <ContextMenuSeparator />}
            <ContextMenuItem tone={'danger' in a ? 'danger' : 'neutral'}>
              {'danger' in a && <Trash />}
              {a.label}
            </ContextMenuItem>
          </Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    const page = within(document.body);
    const canvas = within(canvasElement);
    const names = SITE_ACTIONS.map((a) => a.label);

    // Keyboard only: Tab reaches the "…" button, Enter opens the same actions.
    await userEvent.tab();
    const more = canvas.getByRole('button', { name: 'Actions for shop.seashell.dev' });
    await expect(more).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dropdown = await page.findByRole('menu');
    await expect(within(dropdown).getAllByRole('menuitem').map((el) => el.textContent?.trim())).toEqual(names);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(more).toHaveFocus());

    // Right-click on the card offers exactly the same set.
    await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('shop.seashell.dev') });
    const context = await page.findByRole('menu');
    await expect(within(context).getAllByRole('menuitem').map((el) => el.textContent?.trim())).toEqual(names);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('menu')).toBeNull());
  },
};
