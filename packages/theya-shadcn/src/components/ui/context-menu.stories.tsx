import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Trash, Xmark } from 'iconoir-react';
import { Button } from './button';
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
          'Compositional — ContextMenu (Root) itself takes only open/onOpenChange/modal/dir. Build the menu from ContextMenuContent/Item/CheckboxItem/RadioItem/Label/Separator/Sub*.',
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
        <ContextMenuItem variant="danger">
          <Trash />
          Delete site
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

/** The destructive variant turns the row (text + highlight fill) destructive for irreversible actions. */
export const Destructive: Story = {
  render: () => (
    <ContextMenu>
      <Target>Right-click for destructive actions</Target>
      <ContextMenuContent>
        <ContextMenuItem>Open site</ContextMenuItem>
        <ContextMenuItem>Reissue certificate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger">Suspend site</ContextMenuItem>
        <ContextMenuItem variant="danger">
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
                  type="ghost"
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
        <ContextMenuItem variant="danger">Delete site</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
