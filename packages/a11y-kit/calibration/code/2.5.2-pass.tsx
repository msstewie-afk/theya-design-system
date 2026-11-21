/** The down event only manages focus; the action commits on click (up). */
export function Row({ item, onSelect }: { item: string; onSelect: (v: string) => void }) {
  return (
    <div role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => onSelect(item)}>
      {item}
    </div>
  );
}
