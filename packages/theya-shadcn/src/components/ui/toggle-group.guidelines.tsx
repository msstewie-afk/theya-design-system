import { List, ViewGrid } from 'iconoir-react';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

export const toggleGroupGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Switching a view or a filter among 2–5 options, all visible: Grid / List, All / Unread, Monthly / Yearly.', <><C>type="multiple"</C> for independent format toggles (bold, italic).</>],
  whenNotToUse: [
    { text: 'Switching between panels of content', instead: 'Tabs' },
    { text: 'A choice in a form that’s saved later', instead: 'RadioGroup' },
    { text: 'More than 5 options', instead: 'Select' },
  ],
  anatomy: [
    { part: 'Group', description: <><C>type</C> single/multiple, <C>appearance</C> (<C>outlined</C> for a visible segmented control, <C>ghost</C> for toolbars).</> },
    { part: 'Items', description: 'sized to their content, not stretched to equal widths.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <ToggleGroup type="single" appearance="outlined" defaultValue="grid" aria-label="Layout">
            <ToggleGroupItem value="grid" aria-label="Grid"><ViewGrid /></ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List"><List /></ToggleGroupItem>
          </ToggleGroup>
        ),
        caption: 'Same thing shown differently — a view switch.',
      },
      dont: {
        example: (
          <ToggleGroup type="single" appearance="outlined" defaultValue="general" aria-label="Settings">
            <ToggleGroupItem value="general">General</ToggleGroupItem>
            <ToggleGroupItem value="billing">Billing</ToggleGroupItem>
            <ToggleGroupItem value="security">Security</ToggleGroupItem>
          </ToggleGroup>
        ),
        caption: 'Different sections of content are Tabs, not a toggle.',
      },
    },
  ],
  a11y: [<>Give the group an <C>aria-label</C>. Arrow keys move between items.</>, 'Icon-only items need aria-label each.', 'Single: one is always on — don’t let it be unselected unless “none” is a real option.'],
};
