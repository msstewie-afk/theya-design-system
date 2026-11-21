import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

/** The same list, also reorderable from the keyboard. */
export function SortableList({ children }: { children: React.ReactNode }) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  return <DndContext sensors={sensors}>{children}</DndContext>;
}
