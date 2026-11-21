import { useEffect } from 'react';

/** Same palette, but the shortcut needs a modifier (Cmd/Ctrl+K). */
export function PaletteShortcut({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) onOpen();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onOpen]);
  // A component-level handler is also fine: it only fires while focused.
  return <div tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen()} />;
}
