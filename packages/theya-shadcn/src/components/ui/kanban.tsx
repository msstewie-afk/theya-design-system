import { useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { StatusDot, type StatusTone } from './status-dot';

/**
 * Kanban — columns of cards that move by drag and drop (pointer or
 * keyboard): deploy pipelines, tickets, tasks, content workflows.
 *
 * Data-driven: `columns` + a flat `items` array (each item has `columnId`;
 * order inside a column is the order in the array). Cards render through
 * `renderItem` — use `KanbanCard` for the standard look or your own.
 *
 * While dragging, the board shows the move live; `onItemsChange` fires once
 * on drop with the new array (Esc cancels and nothing changes).
 *
 * Keyboard: focus a card, Space/Enter to pick up, arrows to move (←/→
 * between columns), Space/Enter to drop, Esc to cancel. Moves are announced
 * with the card label and column names.
 */

export interface KanbanColumn {
  id: string;
  title: string;
  /** Status dot before the title. */
  tone?: StatusTone;
  /** WIP limit: the counter turns danger when exceeded (soft limit — drops are still allowed). */
  limit?: number;
}

export interface KanbanItem {
  id: string;
  columnId: string;
}

export interface KanbanMove {
  itemId: string;
  fromColumnId: string;
  toColumnId: string;
  /** Index inside the target column. */
  index: number;
}

export interface KanbanProps<T extends KanbanItem> extends Omit<React.ComponentProps<'div'>, 'children'> {
  columns: KanbanColumn[];
  items: T[];
  /** Called on drop with the reordered array and what moved. */
  onItemsChange?: (items: T[], move: KanbanMove) => void;
  renderItem: (item: T, state: { overlay: boolean }) => React.ReactNode;
  /** Text used for screen-reader announcements ("Picked up <label>"). */
  getItemLabel?: (item: T) => string;
  /** Extra content in a column header, after the counter (e.g. an add button). */
  renderColumnActions?: (column: KanbanColumn) => React.ReactNode;
  /** Content at the bottom of a column (e.g. "Add card"). */
  renderColumnFooter?: (column: KanbanColumn) => React.ReactNode;
  /** Shown in an empty column. */
  emptyMessage?: React.ReactNode;
  /** Column width. */
  columnWidth?: number | string;
  /** Accessible name of the board. */
  label?: string;
}

/* ------------------------------------------------------------------ */

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'relative cursor-grab touch-manipulation rounded-[var(--size-border-radius-border-radius-lg)] outline-none focus-visible:focus-ring',
        // The card's own slot while it's being dragged: an outlined placeholder.
        isDragging &&
          'cursor-grabbing [&>*]:invisible before:absolute before:inset-0 before:rounded-[inherit] before:border-2 before:border-dashed before:border-[var(--color-border-border-primary)] before:bg-[var(--color-bg-primary-bg-primary-subtler,transparent)] before:content-[""]',
      )}
    >
      {children}
    </div>
  );
}

function Column({
  column,
  itemIds,
  count,
  children,
  actions,
  footer,
  emptyMessage,
  width,
}: {
  column: KanbanColumn;
  itemIds: string[];
  count: number;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  emptyMessage: React.ReactNode;
  width: number | string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const over = column.limit !== undefined && count > column.limit;
  const headingId = `kanban-col-${column.id}`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex max-h-full shrink-0 flex-col rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-neutral-bg-neutral-subtler)]"
      style={{ width }}
    >
      <header className="flex items-center gap-2 px-3 pb-2 pt-3">
        {column.tone && <StatusDot tone={column.tone} />}
        <h3 id={headingId} className="min-w-0 truncate text-body-m font-medium text-[var(--color-text-text)]">
          {column.title}
        </h3>
        {/* Plain counter; a danger Badge only when over the limit. The neutral tonal Badge
            (text-subtler) fails contrast on the column's neutral-subtler fill in dark. */}
        {over ? (
          <Badge tone="danger" className="shrink-0 tabular-nums">
            {count}/{column.limit}
            <span className="sr-only"> — over the limit of {column.limit}</span>
          </Badge>
        ) : (
          <span className="shrink-0 text-body-s tabular-nums text-[var(--color-text-text-subtle)]">
            {column.limit !== undefined ? `${count}/${column.limit}` : count}
          </span>
        )}
        {actions && <div className="ms-auto flex items-center">{actions}</div>}
      </header>
      <SortableContext id={column.id} items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex min-h-20 flex-1 flex-col gap-2 overflow-y-auto scrollbar-thin px-2 pb-2 pt-0.5',
            isOver && itemIds.length === 0 && 'rounded-[var(--size-border-radius-border-radius-lg)]',
          )}
        >
          {children}
          {itemIds.length === 0 && (
            <div
              className={cn(
                'flex min-h-16 flex-1 items-center justify-center rounded-[var(--size-border-radius-border-radius-lg)] border border-dashed px-3 text-center text-body-s text-[var(--color-text-text-subtle)]',
                isOver ? 'border-[var(--color-border-border-primary)]' : 'border-[var(--color-border-border-default)]',
              )}
            >
              {emptyMessage}
            </div>
          )}
        </div>
      </SortableContext>
      {footer && <div className="px-2 pb-2">{footer}</div>}
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Kanban<T extends KanbanItem>({
  columns,
  items,
  onItemsChange,
  renderItem,
  getItemLabel = (item) => item.id,
  renderColumnActions,
  renderColumnFooter,
  emptyMessage = 'No items',
  columnWidth = 288,
  label = 'Board',
  className,
  ...props
}: KanbanProps<T>) {
  // Draft order while dragging; null when idle (the board shows `items`).
  const [draft, setDraft] = useState<T[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const startColumn = useRef<string | null>(null);
  const list = draft ?? items;

  const sensors = useSensors(
    // A few px of travel before a drag starts, so clicks on the card still work.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byColumn = useMemo(() => {
    const map = new Map<string, T[]>(columns.map((c) => [c.id, []]));
    for (const item of list) map.get(item.columnId)?.push(item);
    return map;
  }, [columns, list]);

  const isColumn = (id: UniqueIdentifier) => columns.some((c) => c.id === id);
  const columnOf = (id: UniqueIdentifier, source: T[]) => (isColumn(id) ? String(id) : source.find((i) => i.id === id)?.columnId);
  const itemById = (id: UniqueIdentifier | null) => (id == null ? undefined : list.find((i) => i.id === id));
  const columnTitle = (id: string | undefined) => columns.find((c) => c.id === id)?.title ?? '';

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setDraft(items);
    startColumn.current = items.find((i) => i.id === active.id)?.columnId ?? null;
  };

  // Cross-column moves happen live, while hovering.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    setDraft((prev) => {
      const source = prev ?? items;
      const from = columnOf(active.id, source);
      const to = columnOf(over.id, source);
      if (!from || !to || from === to) return prev;
      const moving = source.find((i) => i.id === active.id);
      if (!moving) return prev;
      const without = source.filter((i) => i.id !== active.id);
      const moved = { ...moving, columnId: to };
      let insertAt: number;
      if (isColumn(over.id)) {
        // Over the column itself: append after its last item.
        const lastIndex = without.map((i) => i.columnId).lastIndexOf(to);
        insertAt = lastIndex === -1 ? without.length : lastIndex + 1;
      } else {
        const overIndex = without.findIndex((i) => i.id === over.id);
        // Below the middle of the hovered card → after it.
        const below = active.rect.current.translated && over.rect ? active.rect.current.translated.top > over.rect.top + over.rect.height / 2 : false;
        insertAt = overIndex + (below ? 1 : 0);
      }
      return [...without.slice(0, insertAt), moved, ...without.slice(insertAt)];
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    let next = draft ?? items;
    if (over && !isColumn(over.id) && active.id !== over.id) {
      const a = next.findIndex((i) => i.id === active.id);
      const b = next.findIndex((i) => i.id === over.id);
      if (a !== -1 && b !== -1 && next[a].columnId === next[b].columnId) next = arrayMove(next, a, b);
    }
    const moved = next.find((i) => i.id === active.id);
    if (moved) {
      const index = next.filter((i) => i.columnId === moved.columnId).findIndex((i) => i.id === moved.id);
      const fromColumnId = startColumn.current ?? moved.columnId;
      const changed = next.some((item, i) => item !== items[i]);
      if (changed) onItemsChange?.(next, { itemId: moved.id, fromColumnId, toColumnId: moved.columnId, index });
    }
    setDraft(null);
    setActiveId(null);
  };

  const onDragCancel = () => {
    setDraft(null);
    setActiveId(null);
  };

  const position = (id: UniqueIdentifier | undefined) => {
    if (id == null) return '';
    const col = columnOf(id, list);
    const colItems = col ? (byColumn.get(col) ?? []) : [];
    const idx = colItems.findIndex((i) => i.id === id);
    return `${columnTitle(col)}, position ${idx === -1 ? colItems.length + 1 : idx + 1} of ${Math.max(colItems.length, 1)}`;
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${getItemLabel(itemById(active.id)!)}. In ${position(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${getItemLabel(itemById(active.id)!)} moved to ${position(active.id)}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `Dropped ${getItemLabel(itemById(active.id)!)} in ${position(active.id)}.` : `Dropped ${getItemLabel(itemById(active.id)!)}.`,
    onDragCancel: ({ active }) => `Cancelled. ${getItemLabel(itemById(active.id)!)} returned to its place.`,
  };

  const activeItem = itemById(activeId);

  return (
    <div role="region" aria-label={label} className={cn('min-w-0', className)} {...props}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: 'To pick up a card, press Space or Enter. Use the arrow keys to move it, left and right between columns. Press Space or Enter to drop, or Escape to cancel.',
          },
        }}
      >
        <div className="flex h-full items-stretch gap-3 overflow-x-auto scrollbar-thin pb-1">
          {columns.map((column) => {
            const colItems = byColumn.get(column.id) ?? [];
            return (
              <Column
                key={column.id}
                column={column}
                itemIds={colItems.map((i) => i.id)}
                count={colItems.length}
                actions={renderColumnActions?.(column)}
                footer={renderColumnFooter?.(column)}
                emptyMessage={emptyMessage}
                width={columnWidth}
              >
                {colItems.map((item) => (
                  <SortableCard key={item.id} id={item.id}>
                    {renderItem(item, { overlay: false })}
                  </SortableCard>
                ))}
              </Column>
            );
          })}
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
          {activeItem ? (
            <div className="cursor-grabbing rounded-[var(--size-border-radius-border-radius-lg)] shadow-elevation-lg motion-safe:rotate-2">{renderItem(activeItem, { overlay: true })}</div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export interface KanbanCardProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Small row above the title (e.g. an ID or a tag). */
  eyebrow?: React.ReactNode;
  /** Bottom row (assignee, due date, counters). */
  footer?: React.ReactNode;
}

/** The standard card look for Kanban items. Keep interactive controls out of it — the whole card is the drag handle. */
export function KanbanCard({ title, description, eyebrow, footer, className, ...props }: KanbanCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-[var(--size-border-radius-border-radius-lg)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-3 shadow-elevation-xs',
        className,
      )}
      {...props}
    >
      {eyebrow && <div className="flex items-center gap-2 text-body-s text-[var(--color-text-text-subtle)]">{eyebrow}</div>}
      <div className="text-body-m font-medium text-[var(--color-text-text)]">{title}</div>
      {description && <div className="line-clamp-2 text-body-s text-[var(--color-text-text-subtle)]">{description}</div>}
      {footer && <div className="mt-1 flex items-center gap-2 text-body-s text-[var(--color-text-text-subtle)]">{footer}</div>}
    </div>
  );
}
