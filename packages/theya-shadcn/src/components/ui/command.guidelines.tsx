import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Globe, HomeSimple, Settings, Wrench } from 'iconoir-react';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './command';

const BOX = 'w-80 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)]';

export const commandGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: [<>A ⌘K palette (<C>CommandDialog</C>): jump to any page or run any action by typing.</>, 'A searchable list of actions or destinations inside a popover.'],
  whenNotToUse: [
    { text: 'Choosing a value for a form field', instead: 'Combobox or Select' },
    { text: 'A handful of actions', instead: 'Buttons or DropdownMenu' },
    { text: 'Searching content and showing results on a page', instead: 'SearchBox (Patterns: Search)' },
  ],
  anatomy: [
    { part: 'Input', description: 'filters items by label and keywords as you type.' },
    { part: 'Groups', optional: true, description: <><C>CommandGroup heading</C>; a group with no matches hides.</> },
    { part: 'Item', description: <>icon, label, optional <C>description</C>/<C>breadcrumb</C>, <C>CommandShortcut</C>.</> },
    { part: 'Empty / loading', description: <><C>CommandEmpty</C>, <C>CommandLoading</C>.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className={BOX}>
            <Command label="Go to or run">
              <CommandInput placeholder="Type a command or search…" />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Go to">
                  <CommandItem value="dashboard"><HomeSimple /> Dashboard</CommandItem>
                  <CommandItem value="sites"><Globe /> Sites</CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem value="settings"><Settings /> General settings<CommandShortcut>⌘,</CommandShortcut></CommandItem>
                  <CommandItem value="tools"><Wrench /> Tools</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ),
        caption: 'Many destinations and actions, grouped, reached by typing.',
      },
      dont: {
        example: (
          <div className="flex gap-2">
            <Button appearance="outlined" tone="secondary" size="md">Cancel</Button>
            <Button appearance="filled" tone="primary" size="md">Save</Button>
          </div>
        ),
        caption: 'Don’t hide two actions like these behind a palette — show them as buttons.',
      },
    },
  ],
  a11y: [
    <>The input is a <C>combobox</C>; the highlighted item is its <C>aria-activedescendant</C>. Arrows move, Enter runs, Escape clears.</>,
    <>Name it with <C>label</C> (“Command menu”); the dialog version also needs <C>title</C>.</>,
    'Shortcuts shown in items are hints only — the real shortcut must work outside the palette too.',
  ],
};
