import { useState } from 'react';
import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Kanban, KanbanCard, type KanbanColumn, type KanbanItem } from './kanban';

interface Task extends KanbanItem { title: string }

function Board({ columns, items: initial }: { columns: KanbanColumn[]; items: Task[] }) {
  const [items, setItems] = useState(initial);
  return (
    <Kanban<Task>
      columns={columns}
      items={items}
      onItemsChange={setItems}
      renderItem={(t) => <KanbanCard title={t.title} />}
      getItemLabel={(t) => t.title}
      columnWidth={150}
      label="Board"
      className="h-64 w-[30rem]"
    />
  );
}

const FLOW: KanbanColumn[] = [
  { id: 'todo', title: 'To do', tone: 'neutral' },
  { id: 'doing', title: 'In progress', tone: 'primary', limit: 2 },
  { id: 'done', title: 'Done', tone: 'success' },
];
const TASKS: Task[] = [
  { id: 'a', columnId: 'todo', title: 'Move DNS' },
  { id: 'b', columnId: 'doing', title: 'Upgrade Node 20' },
  { id: 'c', columnId: 'done', title: 'HTTP/2 on all sites' },
];
const TOGGLE: KanbanColumn[] = [
  { id: 'on', title: 'Enabled' },
  { id: 'off', title: 'Disabled' },
];
const FEATURES: Task[] = [
  { id: 'x', columnId: 'on', title: 'Gzip' },
  { id: 'y', columnId: 'off', title: 'Brotli' },
];

export const kanbanGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: ['Work moving through stages: tickets, a deploy pipeline, content review.', <>Watching load per stage with WIP limits (<C>limit</C>).</>],
  whenNotToUse: [
    { text: 'An on / off state', instead: 'Switch in a list' },
    { text: 'Ordering one list', instead: 'a sortable list' },
    { text: 'Many fields per item to compare', instead: 'DataTable grouped by status' },
    { text: 'Work planned in time', instead: 'Scheduler' },
  ],
  anatomy: [
    { part: 'Column', description: <>title, status dot (<C>tone</C>), count, optional WIP limit and actions.</> },
    { part: 'Card', description: <><C>KanbanCard</C> — eyebrow, title, description, footer — or your own.</> },
    { part: 'Drop placeholder', description: 'where the card will land.' },
    { part: 'Column footer', description: '“Add card” and similar.', optional: true },
  ],
  doDont: [
    {
      do: { example: <Board columns={FLOW} items={TASKS} />, caption: 'Stages of real work, with a limit where it piles up.' },
      dont: { example: <Board columns={TOGGLE} items={FEATURES} />, caption: 'Two columns for on / off — dragging to toggle is slower than a switch.' },
    },
  ],
  a11y: [
    'Keyboard: Tab to a card, Space to pick up, arrows to move (←/→ between columns), Space to drop, Esc to cancel.',
    <>Each move is announced with the card and column names — set <C>getItemLabel</C>.</>,
    'Offer a non-drag way too (a “Move to…” menu on the card) for people who can’t drag.',
    'Over the limit, the count turns danger and says so in text.',
  ],
};
