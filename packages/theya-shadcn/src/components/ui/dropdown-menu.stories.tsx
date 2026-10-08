import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Plus, Trash, Xmark } from 'iconoir-react';
import { KebabIconHorizontal } from './kebab-icon';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrailing,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu';
import { dropdownMenuGuidelines } from './dropdown-menu.guidelines';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Menus/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  parameters: {
    guidelines: dropdownMenuGuidelines,
    docs: {
      description: {
        component:
          'Built on @radix-ui/react-dropdown-menu. Items support ' +
          '`tone="danger"` and `inset`, plus checkbox / radio items, a trailing slot, and nested sub-menus.',
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
type Story = StoryObj<typeof DropdownMenu>;

// Play-function helpers. Menus portal to <body>, so queries go through
// document.body; every play ends with the menu closed, because an open modal
// menu aria-hides #storybook-root and the post-play axe scan would flag it.
const page = () => within(document.body);
const menuClosed = () => waitFor(() => expect(page().queryByRole('menu')).toBeNull());
const focusedItem = (name: string | RegExp) =>
  waitFor(() => expect(page().getByRole('menuitem', { name })).toHaveFocus());

/** A row overflow menu: an icon-only trigger, a labelled group with a shortcut, and a destructive row. */
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button appearance="ghost" tone="secondary" size="md" iconOnly leftIcon={<KebabIconHorizontal />} aria-label="Open actions for shop.seashell.dev" className="[&_svg]:text-[var(--color-icon-icon)]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-mono text-heading-2xs normal-case tracking-normal">shop.seashell.dev</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Open site
            <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Copy domain
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">
          <Trash /> Delete site
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  // Keyboard only: Enter opens with the first item focused, arrows/End move,
  // Escape closes and returns focus to the trigger.
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Open actions for shop.seashell.dev' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await page().findByRole('menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await focusedItem(/^Open site/);

    await userEvent.keyboard('{ArrowDown}');
    await focusedItem(/^Copy domain/);
    await userEvent.keyboard('{End}');
    await focusedItem('Delete site');

    await userEvent.keyboard('{Escape}');
    await menuClosed();
    await expect(trigger).toHaveFocus();
  },
};

/**
 * Render-open by default so the menu surface is visible without interaction.
 * Canvas-only in practice (Radix portals to <body> and traps focus), but kept
 * out of docs.disable via the same viewMode check used on Dialog/Drawer -
 * closed in Docs, open in Canvas.
 */
export const Open: Story = {
  render: (_args, context) => (
    <DropdownMenu defaultOpen={context.viewMode !== 'docs'}>
      <DropdownMenuTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="font-mono text-heading-2xs normal-case tracking-normal">shop.seashell.dev</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Open site</DropdownMenuItem>
        <DropdownMenuItem>Reissue certificate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">
          <Trash /> Delete site
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Section labels nested inside their corresponding menu groups, instead of placed as free siblings of the items they describe. */
export const GroupsWithLabels: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Grouped actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Site</DropdownMenuLabel>
          <DropdownMenuItem>Open site</DropdownMenuItem>
          <DropdownMenuItem>Reissue certificate</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
          <DropdownMenuItem tone="danger">
            <Trash /> Delete site
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** `tone="danger"` turns the row (text + color) destructive for irreversible actions. The meaning is carried by text plus color - never color alone. */
export const Destructive: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Manage site
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Open site</DropdownMenuItem>
        <DropdownMenuItem>Reissue certificate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">Suspend site</DropdownMenuItem>
        <DropdownMenuItem tone="danger">
          <Trash /> Delete site
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Checkbox and radio items hold column toggles and a single-choice sort; `inset` aligns label rows with the leading indicator column. */
export const CheckboxAndRadio: Story = {
  render: function CheckboxAndRadioStory() {
    const [showStatus, setShowStatus] = React.useState(true);
    const [showPlan, setShowPlan] = React.useState(false);
    const [sort, setSort] = React.useState('name');
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button appearance="outlined" tone="secondary">
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Columns</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={showStatus} onCheckedChange={setShowStatus}>
            Status
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showPlan} onCheckedChange={setShowPlan}>
            Plan
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel inset>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="created">Created</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="requests">Requests / day</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  // Checkbox and radio rows expose their state and keep it across reopen.
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'View' });

    await userEvent.click(trigger);
    await expect(await page().findByRole('menuitemcheckbox', { name: 'Status' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(page().getByRole('menuitemcheckbox', { name: 'Plan' }));
    await menuClosed();

    await userEvent.click(trigger);
    await expect(await page().findByRole('menuitemcheckbox', { name: 'Plan' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(page().getByRole('menuitemradio', { name: 'Created' }));
    await menuClosed();

    await userEvent.click(trigger);
    await expect(await page().findByRole('menuitemradio', { name: 'Created' })).toHaveAttribute('aria-checked', 'true');
    await expect(page().getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute('aria-checked', 'false');
    await userEvent.keyboard('{Escape}');
    await menuClosed();
  },
};

/** A nested sub-menu groups secondary actions (copy variants) behind a SubTrigger with a trailing chevron. */
export const WithSubMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button appearance="outlined" tone="secondary" leftIcon={<Plus />}>
          Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Create site</DropdownMenuItem>
        <DropdownMenuItem>Import from git</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Copy</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Copy URL</DropdownMenuItem>
            <DropdownMenuItem>Copy deploy ID</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  // ArrowRight opens the sub-menu on its first item, ArrowLeft returns.
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Add' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await focusedItem('Create site');

    await userEvent.keyboard('{End}');
    const sub = page().getByRole('menuitem', { name: 'Copy' });
    await expect(sub).toHaveFocus();
    await expect(sub).toHaveAttribute('aria-haspopup', 'menu');

    await userEvent.keyboard('{ArrowRight}');
    await focusedItem('Copy URL');
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(page().getByRole('menuitem', { name: 'Copy' })).toHaveFocus());
    await expect(page().queryByRole('menuitem', { name: 'Copy URL' })).toBeNull();

    await userEvent.keyboard('{Escape}');
    await menuClosed();
  },
};

/**
 * `DropdownMenuTrailing` pins arbitrary content - a count, a live control - to an item's
 * right edge. A `Button` in the trailing slot needs its own `onPointerDown`/`onClick`
 * stopPropagation, since it renders inside the same row that carries the item's `onSelect`.
 */
export const WithTrailing: Story = {
  render: function WithTrailingStory() {
    const [hasDeployHook, setHasDeployHook] = React.useState(true);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button appearance="outlined" tone="secondary">
            Manage seashell-shop
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          <DropdownMenuItem>
            Open dashboard
            <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span className="flex-1 truncate">Team seats</span>
            <DropdownMenuTrailing>
              <span className="text-body-s text-[var(--color-text-text-subtler)]">5/5</span>
            </DropdownMenuTrailing>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {hasDeployHook ? (
            <DropdownMenuItem>
              <span className="flex-1 truncate">Deploy hook</span>
              <DropdownMenuTrailing>
                <Button
                  appearance="ghost"
                  tone="danger"
                  size="sm"
                  iconOnly
                  leftIcon={<Xmark />}
                  aria-label="Remove deploy hook"
                  tabIndex={-1}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setHasDeployHook(false);
                  }}
                />
              </DropdownMenuTrailing>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setHasDeployHook(true)}>Add deploy hook</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

/** Disabled rows lose pointer events, dim to 50%, and are skipped during keyboard nav. */
export const WithDisabledItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Manage staging.seashell.dev
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Open site</DropdownMenuItem>
        <DropdownMenuItem disabled>Reissue certificate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">
          <Trash /> Delete site
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  // Disabled rows are announced as disabled and skipped by the arrow keys.
  play: async ({ canvasElement }) => {
    within(canvasElement).getByRole('button', { name: 'Manage staging.seashell.dev' }).focus();
    await userEvent.keyboard('{Enter}');
    await focusedItem('Open site');
    await expect(page().getByRole('menuitem', { name: 'Reissue certificate' })).toHaveAttribute('aria-disabled', 'true');

    await userEvent.keyboard('{ArrowDown}');
    await focusedItem('Delete site');

    await userEvent.keyboard('{Escape}');
    await menuClosed();
  },
};
