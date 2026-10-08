import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Button } from './button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { KebabIconVertical } from './kebab-icon';

const TILE = 'flex w-56 items-center justify-between gap-2 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border)] px-3 py-3 font-body text-body-m text-[var(--color-text-text)]';

export const contextMenuGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A right-click shortcut in tool-like surfaces: a file grid, a canvas, a code editor, a kanban card.', 'Only as a second path to actions that are also reachable some other way.'],
  whenNotToUse: [
    { text: 'The only way to reach an action', instead: 'a visible Button or DropdownMenu' },
    { text: 'Content pages and forms (people expect the browser menu)', instead: 'DropdownMenu' },
  ],
  anatomy: [
    { part: 'Trigger area', description: <><C>ContextMenuTrigger</C> around the target.</> },
    { part: 'Content', description: 'opens at the pointer; same items as DropdownMenu — shortcuts, checkbox/radio, submenus.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className={TILE}>
                <span>report.pdf</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button appearance="ghost" tone="secondary" size="sm" iconOnly leftIcon={<KebabIconVertical />} aria-label="More actions for report.pdf" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem tone="danger">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Rename</ContextMenuItem>
              <ContextMenuItem tone="danger">Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ),
        caption: 'Right-click is a shortcut; the same actions are behind the visible kebab.',
      },
      dont: {
        example: (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className={TILE}>
                <span>report.pdf</span>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Rename</ContextMenuItem>
              <ContextMenuItem tone="danger">Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ),
        caption: 'Actions only on right-click: invisible, and out of reach on touch and for many keyboard users.',
      },
    },
  ],
  a11y: [
    'Keyboard users open it with Shift+F10 or the Menu key — few know that, so never make it the only path.',
    'Inside, it works like DropdownMenu: arrows, typeahead, Escape.',
    <>On touch it opens on long-press; keep the same actions in a visible menu.</>,
  ],
};
