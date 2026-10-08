import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Badge } from './badge';
import { Chip } from './chip';

export const chipGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Selectable or removable values: quick filters (“Critical”, “Mine”), selected tags, suggestions.'],
  whenNotToUse: [
    { text: 'A read-only status or count', instead: 'Badge' },
    { text: 'Choosing one of several views', instead: 'ToggleGroup or Tabs' },
    { text: 'Actions', instead: 'Button' },
  ],
  anatomy: [
    { part: 'Pill', description: <>a real button stretched over it; <C>pressed</C> / <C>onPressedChange</C>.</> },
    { part: 'Icon', optional: true, description: 'leading.' },
    { part: 'Remove', optional: true, description: <><C>ChipRemove</C> — a sibling button, not nested.</> },
    { part: 'Look', description: <><C>tone</C>, <C>appearance</C> tonal/filled, <C>size</C> sm/md/lg.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="flex gap-2">
            <Chip defaultPressed>Critical</Chip>
            <Chip>Mine</Chip>
            <Chip>Unassigned</Chip>
          </div>
        ),
        caption: 'Quick filters people toggle on and off.',
      },
      dont: {
        example: (
          <div className="flex items-center gap-2 font-body text-body-m text-[var(--color-text-text)]">
            shop.seashell.dev
            <Chip tone="success" interactive={false}>Running</Chip>
          </div>
        ),
        caption: 'A status that can’t be clicked styled as a chip — use a Badge.',
      },
    },
    {
      do: {
        example: (
          <div className="flex items-center gap-2 font-body text-body-m text-[var(--color-text-text)]">
            shop.seashell.dev
            <Badge tone="success">Running</Badge>
          </div>
        ),
        caption: 'Read-only state is a Badge.',
      },
      dont: {
        example: (
          <div className="flex gap-2">
            <Chip defaultPressed>List</Chip>
            <Chip defaultPressed>Grid</Chip>
          </div>
        ),
        caption: 'Chips for an either-or view: both end up selected — use ToggleGroup.',
      },
    },
  ],
  a11y: [
    <>Toggle chips are buttons with <C>aria-pressed</C>; Space/Enter toggles.</>,
    'Remove buttons are named per chip (“Remove Critical”).',
    <>For selection that must read without color, use <C>appearance="filled"</C> — selected filled chips also show a check.</>,
  ],
};
