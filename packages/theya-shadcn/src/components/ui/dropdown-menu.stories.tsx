import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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

const meta: Meta<typeof DropdownMenu> = {
  title: 'Overlays/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Ported from a Base UI reference onto @radix-ui/react-dropdown-menu. Items support ' +
          '`variant="danger"` and `inset`, plus checkbox / radio items, a trailing slot, and nested sub-menus.',
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

/** A row overflow menu: an icon-only trigger, a labelled group with a shortcut, and a destructive row. */
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="ghost" tone="secondary" size="md" iconOnly leftIcon={<KebabIconHorizontal />} aria-label="Open actions for shop.seashell.dev" className="[&_svg]:text-[var(--color-text-text)]" />
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
        <DropdownMenuItem variant="danger">
          <Trash /> Delete site
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
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
        <Button type="outlined" tone="secondary">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="font-mono text-heading-2xs normal-case tracking-normal">shop.seashell.dev</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Open site</DropdownMenuItem>
        <DropdownMenuItem>Reissue certificate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger">
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
        <Button type="outlined" tone="secondary">
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
          <DropdownMenuItem variant="danger">
            <Trash /> Delete site
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** The destructive variant turns the row (text + color) destructive for irreversible actions. Intent is text plus color - never color alone. */
export const Destructive: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="outlined" tone="secondary">
          Manage site
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Open site</DropdownMenuItem>
        <DropdownMenuItem>Reissue certificate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger">Suspend site</DropdownMenuItem>
        <DropdownMenuItem variant="danger">
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
          <Button type="outlined" tone="secondary">
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
};

/** A nested sub-menu groups secondary actions (copy variants) behind a SubTrigger with a trailing chevron. */
export const WithSubMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="outlined" tone="secondary" leftIcon={<Plus />}>
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
};

/**
 * `DropdownMenuTrailing` pins arbitrary content - a count, a live control - to an item's
 * right edge. A `Button` in the trailing slot needs its own `onPointerDown`/`onClick`
 * stopPropagation, since it renders inside the same row that carries the item's `onSelect`.
 */
export const WithTrailing: Story = {
  render: function WithTrailingStory() {
    const [hasAutoResponder, setHasAutoResponder] = React.useState(true);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="outlined" tone="secondary">
            Manage a.smith7
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          <DropdownMenuItem>
            Open webmail
            <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span className="flex-1 truncate">Aliases</span>
            <DropdownMenuTrailing>
              <span className="text-body-s text-[var(--color-text-text-subtler)]">5/5</span>
            </DropdownMenuTrailing>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {hasAutoResponder ? (
            <DropdownMenuItem>
              <span className="flex-1 truncate">Auto-responder</span>
              <DropdownMenuTrailing>
                <Button
                  type="ghost"
                  tone="danger"
                  size="sm"
                  iconOnly
                  leftIcon={<Xmark />}
                  aria-label="Remove auto-responder"
                  tabIndex={-1}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setHasAutoResponder(false);
                  }}
                />
              </DropdownMenuTrailing>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setHasAutoResponder(true)}>Add auto-responder</DropdownMenuItem>
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
        <Button type="outlined" tone="secondary">
          Manage staging.seashell.dev
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Open site</DropdownMenuItem>
        <DropdownMenuItem disabled>Reissue certificate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger">
          <Trash /> Delete site
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
