import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { Calendar, ChatBubbleEmpty, Plus } from 'iconoir-react';
import { Kanban, KanbanCard, type KanbanColumn, type KanbanItem } from './kanban';
import { Badge } from './badge';
import { Button } from './button';

/**
 * Kanban — columns of cards moved by drag and drop, pointer or keyboard.
 * Data-driven: `columns` + a flat `items` array; `onItemsChange` fires once
 * per drop. Cards render through `renderItem` (KanbanCard for the standard look).
 *
 * Keyboard: Tab to a card, Space to pick up, arrows to move (←/→ between
 * columns), Space to drop, Esc to cancel.
 */

interface Task extends KanbanItem {
  key: string;
  title: string;
  description?: string;
  priority?: 'high' | 'med' | 'low';
  assignee?: string;
  due?: string;
  comments?: number;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', tone: 'neutral' },
  { id: 'progress', title: 'In progress', tone: 'primary', limit: 3 },
  { id: 'review', title: 'Review', tone: 'warning', limit: 2 },
  { id: 'done', title: 'Done', tone: 'success' },
];

const TASKS: Task[] = [
  { id: 't1', columnId: 'backlog', key: 'SITE-142', title: 'Move DNS to the new provider', description: 'Export the zone, lower TTLs a day before, switch NS records.', priority: 'med', assignee: 'AK', comments: 2 },
  { id: 't2', columnId: 'backlog', key: 'SITE-151', title: 'Backups: keep 30 days instead of 7', priority: 'low', assignee: 'MS' },
  { id: 't3', columnId: 'backlog', key: 'SITE-157', title: 'Staging copy for the shop', description: 'Clone production with anonymized customer data.', priority: 'med', due: 'Oct 10' },
  { id: 't4', columnId: 'progress', key: 'SITE-133', title: 'Upgrade PHP 8.1 → 8.3', description: 'Check plugin compatibility on staging first.', priority: 'high', assignee: 'MS', due: 'Oct 6', comments: 5 },
  { id: 't5', columnId: 'progress', key: 'SITE-139', title: 'Renew wildcard certificate', priority: 'high', assignee: 'AK', due: 'Oct 4' },
  { id: 't6', columnId: 'progress', key: 'SITE-146', title: 'Rate-limit the login endpoint', assignee: 'JT', comments: 1 },
  { id: 't7', columnId: 'progress', key: 'SITE-148', title: 'Image CDN for the blog', priority: 'low', assignee: 'JT' },
  { id: 't8', columnId: 'review', key: 'SITE-128', title: 'Nightly database dump to object storage', assignee: 'AK', comments: 3 },
  { id: 't9', columnId: 'done', key: 'SITE-120', title: 'HTTP/2 on all sites', assignee: 'MS' },
  { id: 't10', columnId: 'done', key: 'SITE-124', title: 'Error page in the brand style', assignee: 'JT' },
];

const PRIORITY: Record<NonNullable<Task['priority']>, { label: string; tone: 'danger' | 'warning' | 'neutral' }> = {
  high: { label: 'High', tone: 'danger' },
  med: { label: 'Medium', tone: 'warning' },
  low: { label: 'Low', tone: 'neutral' },
};

function TaskCard({ task }: { task: Task }) {
  return (
    <KanbanCard
      eyebrow={
        <>
          <span className="font-code">{task.key}</span>
          {task.priority && (
            <Badge tone={PRIORITY[task.priority].tone} className="ms-auto">
              {PRIORITY[task.priority].label}
            </Badge>
          )}
        </>
      }
      title={task.title}
      description={task.description}
      footer={
        (task.assignee || task.due || task.comments) && (
          <>
            {task.due && (
              <span className="inline-flex items-center gap-1">
                <Calendar width={14} height={14} aria-hidden />
                {task.due}
              </span>
            )}
            {task.comments ? (
              <span className="inline-flex items-center gap-1">
                <ChatBubbleEmpty width={14} height={14} aria-hidden />
                {task.comments}
                <span className="sr-only">comments</span>
              </span>
            ) : null}
            {task.assignee && (
              <span
                className="ms-auto inline-flex size-6 items-center justify-center rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-body-xs font-medium text-[var(--color-text-text)]"
                title={`Assignee ${task.assignee}`}
              >
                {task.assignee}
              </span>
            )}
          </>
        )
      }
    />
  );
}

const meta = {
  title: 'Data/Kanban',
  component: Kanban,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    columns: { control: false, description: 'id, title, tone (status dot), limit (soft WIP limit).' },
    items: { control: false, description: 'Flat array; each item has columnId, order = array order.' },
    onItemsChange: { control: false, description: 'Fires once per drop with the new array and the move.' },
    renderItem: { control: false, description: 'Renders a card; state.overlay is true for the dragged copy.' },
    getItemLabel: { control: false, description: 'Text for screen-reader announcements.' },
    renderColumnActions: { control: false, description: 'Extra header content per column.' },
    renderColumnFooter: { control: false, description: 'Content at the bottom of a column.' },
    emptyMessage: { control: 'text', description: 'Shown in an empty column.' },
    columnWidth: { control: 'number', description: 'Column width (px or CSS length).' },
    label: { control: 'text', description: 'Accessible name of the board.' },
    className: { control: false },
  },
  args: {
    columns: COLUMNS,
    items: TASKS,
    renderItem: (item) => <TaskCard task={item as Task} />,
    label: 'Sprint board',
  },
} satisfies Meta<typeof Kanban<Task>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Task board with WIP limits: In progress is over its limit of 3. Drag cards, or Tab + Space + arrows. */
export const Default: Story = {
  render: (args) => {
    const [items, setItems] = useState(TASKS);
    const [last, setLast] = useState('');
    return (
      <div className="flex flex-col gap-3">
        <Kanban<Task>
          {...args}
          items={items}
          renderItem={(task) => <TaskCard task={task} />}
          getItemLabel={(task) => `${task.key} ${task.title}`}
          onItemsChange={(next, move) => {
            setItems(next);
            const title = COLUMNS.find((c) => c.id === move.toColumnId)?.title;
            setLast(`${move.itemId} → ${title}, position ${move.index + 1}`);
          }}
          className="h-[560px]"
        />
        {last && <p className="text-body-s text-[var(--color-text-text-subtle)]">Last move: {last}</p>}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // While dragging, the overlay copy shows the same text; take the sortable slot.
    const card = (key: string) =>
      canvas
        .getAllByText(key)
        .map((n) => n.closest('[aria-roledescription="sortable"]'))
        .find(Boolean) as HTMLElement;
    const inColumn = (title: string, key: string) => within(canvas.getByRole('heading', { name: title }).closest('section') as HTMLElement).queryAllByText(key)[0] ?? null;
    const settle = () => new Promise((r) => setTimeout(r, 250));

    // Keyboard move: Space picks up, → moves to the next column, Space drops.
    // Let dnd-kit finish measuring the board before the first key.
    await settle();
    card('SITE-142').focus();
    await expect(card('SITE-142')).toHaveFocus();
    await userEvent.keyboard(' ');
    await waitFor(() => expect(card('SITE-142')).toHaveAttribute('aria-pressed', 'true'), { timeout: 2000 });
    const liveRegion = () => Array.from(document.querySelectorAll('[aria-live]')).map((n) => n.textContent).join(' ');
    await waitFor(() => expect(liveRegion()).toMatch(/Picked up SITE-142 Move DNS to the new provider/));
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    await userEvent.keyboard(' ');
    await settle();
    await waitFor(() => expect(canvas.getByText(/^Last move:/)).toHaveTextContent('t1 → In progress'));
    await expect(inColumn('In progress', 'SITE-142')).toBeInTheDocument();
    await expect(inColumn('Backlog', 'SITE-142')).not.toBeInTheDocument();

    // Escape cancels: the card stays where it was and no move is reported.
    const before = canvas.getByText(/^Last move:/).textContent;
    card('SITE-151').focus();
    await userEvent.keyboard(' ');
    await settle();
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    await userEvent.keyboard('{Escape}');
    await settle();
    await expect(inColumn('Backlog', 'SITE-151')).toBeInTheDocument();
    await expect(canvas.getByText(/^Last move:/).textContent).toBe(before);

    // Nothing is left mid-drag.
    await waitFor(() => expect(canvasElement.querySelector('[aria-pressed="true"]')).toBeNull());

    // Over the WIP limit the counter turns into a danger badge with a spoken explanation.
    await expect(canvas.getByText(/over the limit of 3/)).toBeInTheDocument();
  },
};

/** Column actions and an "Add card" footer. */
export const WithActions: Story = {
  name: 'With actions',
  render: (args) => {
    const [items, setItems] = useState(TASKS.slice(0, 6));
    const add = (columnId: string) =>
      setItems((prev) => [...prev, { id: `n${prev.length + 1}`, columnId, key: `SITE-${200 + prev.length}`, title: 'New task' }]);
    return (
      <Kanban<Task>
        {...args}
        items={items}
        renderItem={(task) => <TaskCard task={task} />}
        getItemLabel={(task) => `${task.key} ${task.title}`}
        onItemsChange={setItems}
        renderColumnActions={(column) => (
          <Button appearance="ghost" tone="neutral" size="sm" iconOnly leftIcon={<Plus />} aria-label={`Add to ${column.title}`} onClick={() => add(column.id)} />
        )}
        renderColumnFooter={(column) => (
          <Button appearance="ghost" tone="neutral" size="sm" leftIcon={<Plus />} fullWidth onClick={() => add(column.id)} aria-label={`Add card to ${column.title}`}>
            Add card
          </Button>
        )}
        className="h-[480px]"
      />
    );
  },
};

/** Empty columns show a drop target. */
export const EmptyColumns: Story = {
  name: 'Empty columns',
  render: (args) => {
    const [items, setItems] = useState(TASKS.filter((t) => t.columnId === 'backlog'));
    return (
      <Kanban<Task>
        {...args}
        items={items}
        renderItem={(task) => <TaskCard task={task} />}
        getItemLabel={(task) => task.title}
        onItemsChange={setItems}
        emptyMessage="Drop a card here"
      />
    );
  },
};

/** Narrow columns with plain cards — e.g. a compact pipeline view. */
export const Compact: Story = {
  render: (args) => {
    const [items, setItems] = useState(TASKS);
    return (
      <Kanban<Task>
        {...args}
        items={items}
        columnWidth={220}
        renderItem={(task) => <KanbanCard title={task.title} eyebrow={<span className="font-code">{task.key}</span>} />}
        getItemLabel={(task) => task.title}
        onItemsChange={setItems}
      />
    );
  },
};
