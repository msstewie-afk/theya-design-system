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
  /** Grace period before the action commits (ms). Scale it with a user "more time" setting (WCAG 2.2.1). */
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
  // left to undo is visible. The timer pauses while the toasts are hovered or hold
  // keyboard focus (both set data-expanded, see Toaster); the bar pauses with it. It keeps running with reduced motion: it is
  // the time left, not decoration. Rendered with the title so a description-less toast
  // keeps its single-line layout. 60% of the text color: 4.7:1+ on every toast surface (30% was 1.97:1, WCAG 1.4.11).
  const timedTitle = (
    <>
      {title}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-1.5 h-0.5 origin-left rounded-full bg-current opacity-60 animate-[theya-drain_var(--undo-ms)_linear_forwards] rtl:origin-right [[data-expanded=true]_&]:[animation-play-state:paused]"
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
