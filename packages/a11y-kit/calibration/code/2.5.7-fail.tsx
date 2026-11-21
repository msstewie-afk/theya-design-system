import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

/** Sortable list reachable only by dragging with a pointer. */
export function SortableList({ children }: { children: React.ReactNode }) {
  const sensors = useSensors(useSensor(PointerSensor));
  return <DndContext sensors={sensors}>{children}</DndContext>;
}
