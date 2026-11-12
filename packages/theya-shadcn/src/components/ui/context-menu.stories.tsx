import { Fragment, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Trash } from 'iconoir-react';
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
import { contextMenuGuidelines } from './context-menu.guidelines';
import { testOnly } from '../../lib/test-only';

// Notes moved from the Docs description (the page now shows a reader-facing
// summary):
//   Compositional — ContextMenu (Root) itself takes only
//   open/onOpenChange/modal/dir. Build the menu from
//   ContextMenuContent/Item/CheckboxItem/RadioItem/Label/Separator/Sub*.
//   **Rule: a context menu is an accelerator, never the only path.** The
//   trigger region is not focusable, so keyboard users (and touch users who
//   never long-press) can only reach these actions another way. Every item
//   must also live in a visible control — a "…" menu button, a toolbar, an
//   inline button. See *With Visible Alternative*.
const meta: Meta<typeof ContextMenu> = {
  title: 'Menus/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    guidelines: contextMenuGuidelines,
    docs: {
      description: {
        component:
          "A right-click menu for tool-like surfaces: a file grid, a canvas, a kanban card. A shortcut only — every action in it is also reachable another way.",
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
    <ContextMenuTrigger className="flex h-28 w-full max-w-sm select-none items-center justify-center rounded-[var(--size-border-radius-border-radius-lg)] border border-dashed border-[var(--color-border-border)] font-body text-body-m text-[var(--color-text-text-subtler)]">
      {children}
    </ContextMenuTrigger>
  );
}

/** Actions for the thing under the pointer: a shortcut, a sub-menu, and a destructive row. */
export const Default: Story = {
  render: () => (
    <ContextMenu>
      <Target>Right-click DAWN_0412.jpg</Target>
      <ContextMenuContent>
        <ContextMenuLabel className="font-mono">DAWN_0412.jpg</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem>
            Open photo
            <ContextMenuShortcut>⌘O</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Download original
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Copy</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy URL</ContextMenuItem>
            <ContextMenuItem>Copy file name</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem tone="danger">
          <Trash />
          Delete photo
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

/** `tone="danger"` turns the row (text + highlight fill) destructive for irreversible actions. */
export const Destructive: Story = {
  render: () => (
    <ContextMenu>
      <Target>Right-click for destructive actions</Target>
      <ContextMenuContent>
        <ContextMenuItem>Open gallery</ContextMenuItem>
        <ContextMenuItem>Edit license</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem tone="danger">Unpublish gallery</ContextMenuItem>
        <ContextMenuItem tone="danger">
          <Trash />
          Delete gallery
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

/** Checkbox and radio items hold toggles and a single-choice picker; `inset` aligns label/plain rows with the leading indicator column. */
export const CheckboxAndRadio: Story = {
  render: function CheckboxAndRadioStory() {
    const [watermark, setWatermark] = useState(true);
    const [includeRaw, setIncludeRaw] = useState(false);
    const [studio, setStudio] = useState('helios');
    return (
      <ContextMenu>
        <Target>Right-click for export options</Target>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked={watermark} onCheckedChange={setWatermark}>
            Add watermark
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={includeRaw} onCheckedChange={setIncludeRaw}>
            Include RAW files
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuLabel inset>Export for</ContextMenuLabel>
          <ContextMenuRadioGroup value={studio} onValueChange={setStudio}>
            <ContextMenuRadioItem value="helios">
              Helios Studio
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="selene">
              Selene Weddings
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
  },
};

/** `ContextMenuTrailing` pins non-interactive content - a count, a status - to an item's right edge. An action goes in its own item ("Remove watermark"), never as a button inside one. */
export const WithTrailing: Story = {
  render: function WithTrailingStory() {
    const [hasWatermark, setHasWatermark] = useState(true);
    return (
      <ContextMenu>
        <Target>Right-click Helios Studio</Target>
        <ContextMenuContent>
          <ContextMenuItem>
            Open dashboard
            <ContextMenuShortcut>⌘O</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <span className="flex-1 truncate">Team seats</span>
            <ContextMenuTrailing>
              <span className="font-body text-body-m text-[var(--color-text-text-subtler)]">5/5</span>
            </ContextMenuTrailing>
          </ContextMenuItem>
          <ContextMenuSeparator />
          {hasWatermark ? (
            // A remove action is its own item, not a button inside one: a
            // button in a menu item is lost to screen readers and to the
            // keyboard (the item's content is presentational).
            <ContextMenuItem tone="danger" onSelect={() => setHasWatermark(false)}>
              Remove watermark
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onSelect={() => setHasWatermark(true)}>Add watermark</ContextMenuItem>
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
      <Target>Right-click Blue hour</Target>
      <ContextMenuContent>
        <ContextMenuItem>Open gallery</ContextMenuItem>
        <ContextMenuItem disabled>Edit license</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem tone="danger">Delete gallery</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

const GALLERY_ACTIONS = [
  { label: 'Open gallery' },
  { label: 'Share with client' },
  { label: 'Delete gallery', danger: true },
] as const;

/**
 * The required pattern: right-click is a shortcut, the "…" button is the
 * path everyone can reach. Both menus list the same actions.
 */
export const WithVisibleAlternative: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex w-full max-w-sm items-center justify-between gap-3 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)] p-4">
        <span className="font-body text-body-m text-[var(--color-text-text)]">Golden hour</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button appearance="ghost" tone="secondary" size="md" iconOnly leftIcon={<KebabIconHorizontal />} aria-label="Actions for Golden hour" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {GALLERY_ACTIONS.map((a) => (
              <DropdownMenuItem key={a.label} tone={'danger' in a ? 'danger' : undefined}>
                {'danger' in a && <Trash />}
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {GALLERY_ACTIONS.map((a, i) => (
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
  play: testOnly(async ({ canvasElement }) => {
    const page = within(document.body);
    const canvas = within(canvasElement);
    const names = GALLERY_ACTIONS.map((a) => a.label);

    // Keyboard only: Tab reaches the "…" button, Enter opens the same actions.
    await userEvent.tab();
    const more = canvas.getByRole('button', { name: 'Actions for Golden hour' });
    await expect(more).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dropdown = await page.findByRole('menu');
    await expect(within(dropdown).getAllByRole('menuitem').map((el) => el.textContent?.trim())).toEqual(names);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(more).toHaveFocus());

    // Right-click on the card offers exactly the same set.
    await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('Golden hour') });
    const context = await page.findByRole('menu');
    await expect(within(context).getAllByRole('menuitem').map((el) => el.textContent?.trim())).toEqual(names);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('menu')).toBeNull());
  }),
};

/** The Figma component's own sample, opened with a right-click on the target: what the Figma visual diff compares against (scripts/figma-visual). */
export const FigmaReference: Story = {
  name: 'Figma reference',
  tags: ['!autodocs'],
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[140px] w-60 select-none items-center justify-center rounded-[var(--size-border-radius-border-radius-lg)] border border-dashed border-[var(--color-border-border)] font-body text-body-s text-[var(--color-text-text-subtler)]">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>
          Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem tone="danger">
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

/** Interaction test for Default, kept out of Default so Default opens untouched. */
export const TestInteractions: Story = {
  ...Default,
  name: 'Test: interactions',
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const page = within(document.body);
    const target = within(canvasElement).getByText('Right-click DAWN_0412.jpg');
    await userEvent.pointer({ keys: '[MouseRight]', target });
    const menu = await page.findByRole('menu');
    // Keyboard inside the menu: arrows move, ArrowRight opens the sub-menu.
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{ArrowDown}');
    await expect(page.getByRole('menuitem', { name: /Open photo/ })).toHaveFocus();
    page.getByRole('menuitem', { name: 'Copy' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(await page.findByRole('menuitem', { name: 'Copy URL' })).toBeInTheDocument();
    await waitFor(() => expect(page.getByRole('menuitem', { name: 'Copy URL' })).toHaveFocus());
    // Escape closes everything.
    await userEvent.keyboard('{Escape}{Escape}');
    await waitFor(() => expect(page.queryByRole('menu')).toBeNull());
  },
};
