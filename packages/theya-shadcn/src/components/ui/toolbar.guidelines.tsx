import { C, type ComponentGuidelines } from '@/docs/guidelines';
import { Copy, Download, Trash } from 'iconoir-react';
import { Button } from './button';
import { Toolbar, ToolbarButton, ToolbarSeparator } from './toolbar';

const CARD = 'w-fit rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-1';

export const toolbarGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['A row of related commands sharing one tab stop: bulk actions on a selection, text formatting, editor tools.'],
  whenNotToUse: [
    { text: 'Search and filter fields', instead: 'a search region with normal tab order' },
    { text: 'Two or three unrelated buttons', instead: 'Buttons' },
  ],
  anatomy: [
    { part: 'Toolbar', description: <>one tab stop, arrows move inside; named with <C>aria-label</C>.</> },
    { part: 'Items', description: <><C>ToolbarButton</C>, <C>ToolbarGroup</C> (toggles), <C>ToolbarLink</C>.</> },
    { part: 'Separator', description: 'between groups; destructive actions last.' },
  ],
  doDont: [
    {
      do: {
        example: (
          <Toolbar aria-label="Bulk actions" className={CARD}>
            <ToolbarButton><Copy /> Duplicate</ToolbarButton>
            <ToolbarButton><Download /> Export</ToolbarButton>
            <ToolbarSeparator />
            <ToolbarButton appearance="ghost" tone="danger"><Trash /> Delete</ToolbarButton>
          </Toolbar>
        ),
        caption: 'Related actions on a selection; Tab in once, arrows across, Delete set apart.',
      },
      dont: {
        example: (
          <div className={`${CARD} flex gap-1`}>
            <Button appearance="ghost" tone="secondary" size="md"><Copy /> Duplicate</Button>
            <Button appearance="ghost" tone="secondary" size="md"><Download /> Export</Button>
            <Button appearance="ghost" tone="danger" size="md"><Trash /> Delete</Button>
          </div>
        ),
        caption: 'Loose buttons styled as a toolbar: three tab stops, no grouping, Delete right next to Export.',
      },
    },
  ],
  a11y: [
    'Role toolbar with roving tabindex: Tab enters once, ←/→ move, Home/End jump.',
    <>Name it (<C>aria-label</C>: “Bulk actions”).</>,
  ],
};
