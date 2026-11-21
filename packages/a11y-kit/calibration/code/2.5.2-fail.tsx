/** List item that commits the selection the moment the pointer goes down. */
export function Row({ item, onSelect }: { item: string; onSelect: (v: string) => void }) {
  return (
    <div role="option" onMouseDown={() => onSelect(item)}>
      {item}
    </div>
  );
}
