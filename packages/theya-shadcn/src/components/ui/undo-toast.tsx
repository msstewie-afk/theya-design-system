import type { ReactNode } from 'react';
import { Trash } from 'iconoir-react';
import { toast } from './sonner';

/**
 * The optimistic-destructive pattern over our sonner-based toast.
 * Apply the change immediately, then show a toast with an "Undo"
 * action and a grace window: clicking Undo rolls it back via
 * `onUndo`; otherwise, when the toast auto-closes or is dismissed,
 * `onCommit` finalizes it. Returns the toast id.
 */
export interface UndoToastOptions {
  title: string;
  description?: string;
  /** Grace period before the action commits (ms). */
  duration?: number;
  undoLabel?: string;
  /** Defaults to a trash glyph; pass null to omit. */
  icon?: ReactNode;
  onUndo?: () => void;
  onCommit?: () => void;
}

export function undoToast({ title, description, duration = 10000, undoLabel = 'Undo', icon = <Trash width={16} height={16} />, onUndo, onCommit }: UndoToastOptions) {
  let undone = false;
  return toast(title, {
    description,
    duration,
    icon,
    // No close button: this toast's onDismiss commits, so an X would
    // quietly finalize a destructive action early while reading like
    // "hide this". The two exits stay Undo and the grace timer.
    closeButton: false,
    action: {
      label: undoLabel,
      onClick: () => {
        undone = true;
        onUndo?.();
      },
    },
    onAutoClose: () => {
      if (!undone) onCommit?.();
    },
    onDismiss: () => {
      if (!undone) onCommit?.();
    },
  });
}
