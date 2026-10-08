import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { NavArrowDown } from 'iconoir-react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { KebabIconVertical } from './kebab-icon';

const ROW = 'flex w-80 items-center justify-between gap-3 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border)] px-3 py-2 font-body text-body-m text-[var(--color-text-text)]';

export const dropdownMenuGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Secondary actions behind a trigger: “more actions” for a row or card, a user menu, a split button’s options.', <>Settings that toggle in place: <C>DropdownMenuCheckboxItem</C>, <C>DropdownMenuRadioGroup</C>.</>],
  whenNotToUse: [
    { text: 'Choosing a value for a form field', instead: 'Select' },
    { text: 'The one or two actions people use most', instead: 'Buttons' },
    { text: 'Navigation between pages', instead: 'NavigationMenu or links' },
  ],
  anatomy: [
    { part: 'Trigger', description: <>a Button (often <C>iconOnly</C> with a kebab) via <C>asChild</C>.</> },
    { part: 'Content', description: <><C>size</C> matches the trigger; <C>align</C> to the trigger’s edge.</> },
    { part: 'Items', description: <>icon, label, <C>DropdownMenuShortcut</C>; <C>tone="danger"</C> for destructive ones, last and separated.</> },
    { part: 'Groups', optional: true, description: 'labels, separators, submenus.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className={ROW}>
            <span>shop.seashell.dev</span>
            <div className="flex items-center gap-1">
              <Button appearance="outlined" tone="secondary" size="sm">Open</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button appearance="ghost" tone="secondary" size="sm" iconOnly leftIcon={<KebabIconVertical />} aria-label="More actions for shop.seashell.dev" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuItem tone="danger">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ),
        caption: 'The main action stays visible; the rest sit behind a named kebab.',
      },
      dont: {
        example: (
          <div className={ROW}>
            <span>shop.seashell.dev</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button appearance="outlined" tone="secondary" size="sm" rightIcon={<NavArrowDown />}>Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Open</DropdownMenuItem>
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem tone="danger">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        caption: 'Everything, including the most common “Open”, hidden behind “Actions”.',
      },
    },
  ],
  a11y: [
    <>The trigger gets <C>aria-haspopup</C>/<C>aria-expanded</C>; name icon triggers after their object (“More actions for …”).</>,
    'Enter/Space/↓ opens, arrows move, typing jumps to an item, Escape closes and returns focus to the trigger.',
    'Destructive items still need a confirmation or undo — a menu click is easy to mis-hit.',
  ],
};
