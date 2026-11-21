import { useEffect } from 'react';

/** Command palette opened by a bare "k" from anywhere on the page. */
export function PaletteShortcut({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k') onOpen();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onOpen]);
  return null;
}
