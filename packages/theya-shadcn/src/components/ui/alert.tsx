import { Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './button';

/**
 * No library dependency — an inline feedback banner. Put an icon as
 * the first child; it inherits the tone color via the parent's [&>svg]
 * selector. Static by default; pass `live="assertive"|"polite"` when
 * mounting one dynamically in response to an event, so it's announced.
 */
export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'destructive';

/**
 * `indicator="stripe"` adds a full solid-tone bar flush on the left edge, on
 * top of the variant's existing subtle background — for a banner that needs
 * to read at a glance even before the icon/text color registers. No effect
 * on `variant="default"`, which has no assigned tone to draw the bar from.
 */
export type AlertIndicator = 'none' | 'stripe';

const VARIANT_CLASS: Record<AlertVariant, string> = {
  default: 'bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)] border-[var(--color-border-border-subtle)] [&>svg]:text-[var(--color-icon-icon-subtle)] [&_[data-alert-description]]:text-[var(--color-text-text-subtler)]',
  info: 'bg-[var(--color-bg-info-bg-info-subtle)] text-[var(--color-text-text-info)] border-transparent [&>svg]:text-[var(--color-icon-icon-info)]',
  success: 'bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-text-text-success)] border-transparent [&>svg]:text-[var(--color-icon-icon-success)]',
  warning: 'bg-[var(--color-bg-warning-bg-warning-subtle)] text-[var(--color-text-text-warning)] border-transparent [&>svg]:text-[var(--color-icon-icon-warning)]',
  destructive: 'bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-text-text-danger)] border-transparent [&>svg]:text-[var(--color-icon-icon-danger)]',
};

// Solid (non-subtle) tone tokens — same family StatusDot's dot color and
// Badge's solid variant use, not the `-subtle` background tokens above.
const STRIPE_CLASS: Partial<Record<AlertVariant, string>> = {
  info: 'bg-[var(--color-bg-info-bg-info)]',
  success: 'bg-[var(--color-bg-success-bg-success)]',
  warning: 'bg-[var(--color-bg-warning-bg-warning)]',
  destructive: 'bg-[var(--color-bg-danger-bg-danger)]',
};

// Maps the banner's own tone to Button's `intent` prop, so any ghost control
// living inside the alert (the built-in dismiss "X" here, and consumer-built
// tertiary actions in AlertActions) reads as part of *this* alert instead of
// a neutral, tone-less control floating on top of it.
const VARIANT_TO_INTENT: Record<AlertVariant, NonNullable<ButtonProps['intent']>> = {
  default: 'default',
  info: 'info',
  success: 'success',
  warning: 'warning',
  destructive: 'danger',
};

export interface AlertProps extends React.ComponentProps<'div'> {
  variant?: AlertVariant;
  /** Full-tone accent bar on the left edge. See `AlertIndicator`. Default `'none'`. */
  indicator?: AlertIndicator;
  /** Adds `shadow-sm`. Off by default — an inline banner usually sits flush in
   * the page flow and doesn't need to lift off it; turn on for an alert
   * floating over content (e.g. a toast-like placement) instead of inline. */
  shadow?: boolean;
  /** Announce as a live region when mounted dynamically. Omit for static banners. */
  live?: 'polite' | 'assertive';
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
}

export function Alert({
  className,
  variant = 'default',
  indicator = 'none',
  shadow = false,
  live,
  dismissible = false,
  dismissLabel = 'Dismiss',
  onDismiss,
  children,
  ...props
}: AlertProps) {
  const stripeClass = indicator === 'stripe' ? STRIPE_CLASS[variant] : undefined;

  return (
    <div
      role={live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined}
      className={cn(
        'relative flex gap-2 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid px-4 py-3',
        'font-body text-body-s [&>svg]:size-[1.125rem] [&>svg]:mt-px [&>svg]:shrink-0',
        VARIANT_CLASS[variant],
        shadow && 'shadow-sm',
        dismissible && 'pr-10',
        className,
      )}
      {...props}
    >
      {stripeClass && (
        <span
          aria-hidden
          className={cn('absolute inset-y-0 left-0 w-1 rounded-l-[var(--size-border-radius-border-radius-2xl)]', stripeClass)}
        />
      )}
      {children}
      {dismissible && (
        <Button
          type="ghost"
          intent={VARIANT_TO_INTENT[variant]}
          iconOnly
          size="sm"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="absolute right-2 top-2"
          leftIcon={<Xmark />}
        />
      )}
    </div>
  );
}

export function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('font-semibold text-body-m', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-alert-description className={cn('mt-0.5 text-body-s [&_p]:leading-relaxed', className)} {...props} />;
}

/** The row of buttons/links under the body. */
export function AlertActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-2.5 flex flex-wrap items-center gap-2', className)} {...props} />;
}
