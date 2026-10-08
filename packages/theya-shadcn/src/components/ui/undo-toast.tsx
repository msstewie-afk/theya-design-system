import type { CSSProperties, ReactNode } from 'react';
import { getTheyaMessages } from '../../lib/i18n';
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

export function undoToast({ title, description, duration = 10000, undoLabel = getTheyaMessages().undoToast.undo, icon = <Trash width={16} height={16} />, onUndo, onCommit }: UndoToastOptions) {
  let undone = false;
  // A thin bar drains over the grace window (Kinetics' Undo Snackbar, MIT), so the time
  // left to undo is visible. Sonner pauses its timer while the toasts are hovered
  // (expanded); the bar pauses with it. It keeps running with reduced motion: it is
  // the time left, not decoration. Rendered with the title so a description-less toast
  // keeps its single-line layout.
  const timedTitle = (
    <>
      {title}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-1.5 h-0.5 origin-left rounded-full bg-current opacity-30 animate-[theya-drain_var(--undo-ms)_linear_forwards] rtl:origin-right [[data-expanded=true]_&]:[animation-play-state:paused]"
        style={{ '--undo-ms': `${duration}ms` } as CSSProperties}
      />
    </>
  );
  return toast(timedTitle, {
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
