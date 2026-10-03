import { useEffect, useState, type ReactNode } from 'react';
import { Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { SOLID_TONE_CLASS } from './chip';

/**
 * Full-width strip above the app header for something that concerns
 * everyone on every page: planned maintenance, an incident, a new feature,
 * a promo. One line on desktop, wraps on phones.
 *
 * - Not a live region: it's there when the page loads, and announcing it
 *   would interrupt. It's a named landmark (`region`, "Announcement") so
 *   screen-reader users can find it. For something that appears in
 *   response to an action, use a toast or an Alert with `live`.
 * - Links inside inherit the bar's color and are always underlined.
 * - `dismissKey` remembers the dismissal in this browser (localStorage),
 *   so a dismissed bar stays gone across pages and reloads. Change the key
 *   when the message changes and it shows again. Without a key, dismissing
 *   only hides it until reload (or handle `onDismiss` yourself).
 * - `filled` colors are Chip/Button's solid tones; `tonal` are Alert's.
 */
export type AnnouncementBarTone = 'primary' | 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type AnnouncementBarAppearance = 'filled' | 'tonal';

const TONAL_CLASS: Record<AnnouncementBarTone, string> = {
  primary: 'bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)]',
  neutral: 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text)]',
  info: 'bg-[var(--color-bg-info-bg-info-subtle)] text-[var(--color-text-text-info-on-tonal)]',
  success: 'bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-text-text-success-on-tonal)]',
  warning: 'bg-[var(--color-bg-warning-bg-warning-subtle)] text-[var(--color-text-text-warning-on-tonal)]',
  danger: 'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-text-text-danger-on-tonal)]',
};

// Dismiss on a tinted bar steps one level denser, like Alert's own dismiss.
const TONAL_DISMISS_CLASS: Record<AnnouncementBarTone, string> = {
  primary: 'hover:bg-[var(--color-bg-primary-bg-primary-subtle-hover)] active:bg-[var(--color-bg-primary-bg-primary-subtle-pressed)]',
  neutral: 'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle-hover)] active:bg-[var(--color-bg-neutral-bg-neutral-subtle-pressed)]',
  info: 'hover:bg-[var(--color-bg-info-bg-info-subtle-hover)] active:bg-[var(--color-bg-info-bg-info-subtle-pressed)]',
  success: 'hover:bg-[var(--color-bg-success-bg-success-subtle-hover)] active:bg-[var(--color-bg-success-bg-success-subtle-pressed)]',
  warning: 'hover:bg-[var(--color-bg-warning-bg-warning-subtle-hover)] active:bg-[var(--color-bg-warning-bg-warning-subtle-pressed)]',
  danger: 'hover:bg-[var(--color-bg-danger-bg-danger-subtle-hover)] active:bg-[var(--color-bg-danger-bg-danger-subtle-pressed)]',
};

// On a solid fill a translucent black step reads on every tone (same
// tokens Button uses on primary surfaces).
const FILLED_DISMISS_CLASS =
  'hover:bg-[var(--color-bg-primary-on-primary-hover)] active:bg-[var(--color-bg-primary-on-primary-pressed)] focus-visible:focus-ring-on-primary';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** First focusable element after `node` in document order (outside it), or null. */
function nextFocusableAfter(node: HTMLElement) {
  for (const el of document.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (node.contains(el)) continue;
    if (node.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && el.getClientRects().length > 0) return el;
  }
  return null;
}

function readDismissed(key?: string) {
  if (!key) return false;
  try {
    return window.localStorage.getItem(`theya:announcement:${key}`) === 'dismissed';
  } catch {
    return false;
  }
}

export interface AnnouncementBarProps extends Omit<React.ComponentProps<'div'>, 'role'> {
  tone?: AnnouncementBarTone;
  appearance?: AnnouncementBarAppearance;
  /** Leading 16px icon. */
  icon?: ReactNode;
  dismissible?: boolean;
  /** Remember the dismissal in this browser under this key. Change it when the message changes. */
  dismissKey?: string;
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Stick to the top of the viewport while the page scrolls. */
  sticky?: boolean;
  /** Landmark name. Default "Announcement". */
  'aria-label'?: string;
}

export function AnnouncementBar({
  tone = 'primary',
  appearance = 'filled',
  icon,
  dismissible = false,
  dismissKey,
  onDismiss,
  dismissLabel = 'Dismiss announcement',
  sticky = false,
  className,
  children,
  'aria-label': ariaLabel = 'Announcement',
  ...props
}: AnnouncementBarProps) {
  // Starts visible on the server/first paint, then hides if remembered —
  // reading storage during render would mismatch hydration.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (readDismissed(dismissKey)) setHidden(true);
  }, [dismissKey]);

  if (hidden) return null;

  const filled = appearance === 'filled';

  const dismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    // The dismiss button disappears with the bar; send focus to whatever comes
    // next on the page instead of letting it fall to <body>.
    const bar = e.currentTarget.closest<HTMLElement>('[data-slot="announcement-bar"]');
    const next = bar ? nextFocusableAfter(bar) : null;
    if (next) requestAnimationFrame(() => next.focus());
    if (dismissKey) {
      try {
        window.localStorage.setItem(`theya:announcement:${dismissKey}`, 'dismissed');
      } catch {
        /* storage blocked: dismiss for this page view only */
      }
    }
    setHidden(true);
    onDismiss?.();
  };

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      data-slot="announcement-bar"
      className={cn(
        'relative flex min-h-[var(--size-size-control-size-control-2xl)] w-full items-center justify-center px-4 py-2 font-body text-body-s',
        filled ? SOLID_TONE_CLASS[tone] : TONAL_CLASS[tone],
        dismissible && 'pr-12',
        sticky && 'sticky top-0 z-(--z-index-sticky)',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'flex max-w-full items-start gap-2 text-left sm:items-center sm:text-center',
          '[&_a]:font-medium [&_a]:text-inherit [&_a]:underline [&_a]:underline-offset-2 [&_a]:rounded-[var(--size-border-radius-border-radius-sm)] [&_a]:outline-none',
          filled ? '[&_a:focus-visible]:focus-ring-on-primary' : '[&_a:focus-visible]:focus-ring',
          '[&_a:hover]:decoration-2',
        )}
      >
        {icon && (
          <span aria-hidden="true" className="mt-px flex shrink-0 sm:mt-0 [&_svg]:size-[var(--size-icon-icon-sm)]">
            {icon}
          </span>
        )}
        <div className="min-w-0">{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={dismiss}
          className={cn(
            'absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[var(--size-border-radius-border-radius-lg)] text-current outline-none',
            'transition-colors duration-150 ease-enter motion-reduce:transition-none',
            filled ? FILLED_DISMISS_CLASS : cn(TONAL_DISMISS_CLASS[tone], 'focus-visible:focus-ring'),
          )}
        >
          <Xmark aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
