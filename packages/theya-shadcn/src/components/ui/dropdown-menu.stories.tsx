import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Plus, Star, Trash } from 'iconoir-react';
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
import { testOnly } from '../../lib/test-only';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   Built on @radix-ui/react-dropdown-menu. Items support `tone="danger"` and
//   `inset`, plus checkbox / radio items, a trailing slot, and nested
//   sub-menus.
const meta: Meta<typeof DropdownMenu> = {
  title: 'Menus/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  parameters: {
    guidelines: dropdownMenuGuidelines,
    docs: {
      description: {
        component:
          "Secondary actions behind a trigger — “more actions” for a row or a card, a user menu — and settings that toggle in place.",
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
        <Button appearance="ghost" tone="secondary" size="md" iconOnly leftIcon={<KebabIconHorizontal />} aria-label="Open actions for Golden hour" className="[&_svg]:text-[var(--color-icon-icon)]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-heading-2xs normal-case tracking-normal">Golden hour</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Open gallery
            <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Copy portal link
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">
          <Trash /> Delete gallery
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  // Keyboard only: Enter opens with the first item focused, arrows/End move,
  // Escape closes and returns focus to the trigger.,
};

/**
 * Render-open by default so the menu surface is visible without interaction.
 * Canvas-only in practice (Radix portals to <body> and traps focus), but kept
 * out of docs.disable via the same viewMode check used on Dialog/Drawer -
 * closed in Docs, open in Canvas.
 */
export const Open: Story = {
  parameters: {
    // Opened by `defaultOpen`, so Radix focuses the menu itself, not an item
    // (opening from the keyboard focuses the first item, which shows focus).
    a11y: { auto: { skip: ['2.4.7'], reason: 'Menu opened programmatically; the focused container is never reached from the keyboard path.' } },
  },
  render: (_args, context) => (
    <DropdownMenu defaultOpen={context.viewMode !== 'docs'}>
      <DropdownMenuTrigger asChild>
        <Button appearance="outlined" tone="secondary">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="text-heading-2xs normal-case tracking-normal">Golden hour</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Open gallery</DropdownMenuItem>
        <DropdownMenuItem>Edit license</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">
          <Trash /> Delete gallery
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
          <DropdownMenuLabel>Gallery</DropdownMenuLabel>
          <DropdownMenuItem>Open gallery</DropdownMenuItem>
          <DropdownMenuItem>Edit license</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
          <DropdownMenuItem tone="danger">
            <Trash /> Delete gallery
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
          Manage gallery
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Open gallery</DropdownMenuItem>
        <DropdownMenuItem>Edit license</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">Unpublish gallery</DropdownMenuItem>
        <DropdownMenuItem tone="danger">
          <Trash /> Delete gallery
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Checkbox and radio items hold column toggles and a single-choice sort; `inset` aligns label rows with the leading indicator column. */
export const CheckboxAndRadio: Story = {
  render: function CheckboxAndRadioStory() {
    const [showStatus, setShowStatus] = React.useState(true);
    const [showClient, setShowClient] = React.useState(false);
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
          <DropdownMenuCheckboxItem checked={showClient} onCheckedChange={setShowClient}>
            Client
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel inset>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="created">Created</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="downloads">Downloads / day</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  // Checkbox and radio rows expose their state and keep it across reopen.
  play: testOnly(async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'View' });

    await userEvent.click(trigger);
    await expect(await page().findByRole('menuitemcheckbox', { name: 'Status' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(page().getByRole('menuitemcheckbox', { name: 'Client' }));
    await menuClosed();

    await userEvent.click(trigger);
    await expect(await page().findByRole('menuitemcheckbox', { name: 'Client' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(page().getByRole('menuitemradio', { name: 'Created' }));
    await menuClosed();

    await userEvent.click(trigger);
    await expect(await page().findByRole('menuitemradio', { name: 'Created' })).toHaveAttribute('aria-checked', 'true');
    await expect(page().getByRole('menuitemradio', { name: 'Name' })).toHaveAttribute('aria-checked', 'false');
    await userEvent.keyboard('{Escape}');
    await menuClosed();
  }),
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
        <DropdownMenuItem>Create gallery</DropdownMenuItem>
        <DropdownMenuItem>Import from folder</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Copy</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Copy URL</DropdownMenuItem>
            <DropdownMenuItem>Copy gallery ID</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  // ArrowRight opens the sub-menu on its first item, ArrowLeft returns.
  play: testOnly(async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Add' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await focusedItem('Create gallery');

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
  }),
};

/**
 * `DropdownMenuTrailing` pins non-interactive content - a count, a status - to an item's
 * right edge. An action goes in its own item ("Remove watermark"), never as a button inside
 * one: a menu item's content is presentational, so the button is lost to screen readers and
 * to the keyboard.
 */
export const WithTrailing: Story = {
  render: function WithTrailingStory() {
    const [hasWatermark, setHasWatermark] = React.useState(true);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button appearance="outlined" tone="secondary">
            Manage Helios Studio
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
          {hasWatermark ? (
            // A remove action is its own item, not a button inside one: a
            // button in a menu item is lost to screen readers and to the
            // keyboard (the item's content is presentational).
            <DropdownMenuItem tone="danger" onSelect={() => setHasWatermark(false)}>
              Remove watermark
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => setHasWatermark(true)}>Add watermark</DropdownMenuItem>
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
          Manage Blue hour
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Open gallery</DropdownMenuItem>
        <DropdownMenuItem disabled>Edit license</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">
          <Trash /> Delete gallery
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  // Disabled rows are announced as disabled and skipped by the arrow keys.
  play: testOnly(async ({ canvasElement }) => {
    within(canvasElement).getByRole('button', { name: 'Manage Blue hour' }).focus();
    await userEvent.keyboard('{Enter}');
    await focusedItem('Open gallery');
    await expect(page().getByRole('menuitem', { name: 'Edit license' })).toHaveAttribute('aria-disabled', 'true');

    await userEvent.keyboard('{ArrowDown}');
    await focusedItem('Delete gallery');

    await userEvent.keyboard('{Escape}');
    await menuClosed();
  }),
};

/** The Figma component's own sample, open at rest: what the Figma visual diff compares against (scripts/figma-visual). */
export const FigmaReference: Story = {
  name: 'Figma reference',
  tags: ['!autodocs'],
  parameters: {
    a11y: { auto: { skip: ['2.4.7'], reason: 'Menu opened programmatically; the focused container is never reached from the keyboard path.' } },
  },
  render: function FigmaReferenceStory() {
    const [toolbar, setToolbar] = React.useState(true);
    const [statusBar, setStatusBar] = React.useState(false);
    return (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button appearance="outlined" tone="secondary">
            Menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>Group</DropdownMenuLabel>
          <DropdownMenuItem>
            <Star /> Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Star /> Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Star /> Keyboard shortcuts <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={toolbar} onCheckedChange={setToolbar}>
            Show toolbar
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
            Show status bar
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem tone="danger">
            <Star /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Open actions for Golden hour' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await page().findByRole('menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await focusedItem(/^Open gallery/);

    await userEvent.keyboard('{ArrowDown}');
    await focusedItem(/^Copy portal link/);
    await userEvent.keyboard('{End}');
    await focusedItem('Delete gallery');

    await userEvent.keyboard('{Escape}');
    await menuClosed();
    await expect(trigger).toHaveFocus();
  },
};
