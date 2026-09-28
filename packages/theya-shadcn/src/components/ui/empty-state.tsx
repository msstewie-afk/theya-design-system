import type { ElementType, ReactNode, CSSProperties } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

/**
 * Centered no-data / zero-state placeholder. Compose the all-in-one
 * API (`<EmptyState icon={...} title="No sites yet" description="…"
 * action={<Button>Create site</Button>} />`) or the parts directly.
 *
 * a11y: the icon chip is decorative — the title carries the meaning.
 * Title renders a styled <p> by default; pass `titleAs="h2"` when the
 * empty state is the primary content of its region, so it joins the
 * heading rotor.
 *
 * For a quieter action instead of the default filled look, pass
 * `<Button appearance="tonal">` yourself — there is no automatic "subtle"
 * re-styling of whatever Button you pass (Theya's Button has no
 * data-slot/data-variant hooks for that, unlike the corp reference).
 */
export interface EmptyStateProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  titleAs?: ElementType;
  /** Switch to the alternate content used when an active filter has no results. */
  filtered?: boolean;
  filteredIcon?: ReactNode;
  filteredTitle?: ReactNode;
  filteredDescription?: ReactNode;
  filteredAction?: ReactNode;
  /** Fill the parent's height or use an explicit CSS height. Omit for content height. */
  height?: 'container' | CSSProperties['height'];
}

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  titleAs,
  filtered = false,
  filteredIcon,
  filteredTitle,
  filteredDescription,
  filteredAction,
  height,
  style,
  children,
  ...props
}: EmptyStateProps) {
  const resolvedIcon = filtered ? (filteredIcon ?? icon) : icon;
  const resolvedTitle = filtered ? (filteredTitle ?? title) : title;
  const resolvedDescription = filtered ? (filteredDescription ?? description) : description;
  const resolvedAction = filtered ? (filteredAction ?? action) : action;

  return (
    <div
      data-slot="empty-state"
      data-filtered={filtered || undefined}
      className={cn('mx-auto flex max-w-sm min-w-0 flex-col items-center justify-center gap-3 px-6 py-12 text-center', height === 'container' && 'h-full', className)}
      style={{ ...style, ...(height !== undefined && height !== 'container' ? { height } : null) }}
      {...props}
    >
      {resolvedIcon && <EmptyStateIcon>{resolvedIcon}</EmptyStateIcon>}
      <EmptyStateTitle as={titleAs}>{resolvedTitle}</EmptyStateTitle>
      {resolvedDescription && <EmptyStateDescription>{resolvedDescription}</EmptyStateDescription>}
      {resolvedAction && <EmptyStateActions>{resolvedAction}</EmptyStateActions>}
      {children}
    </div>
  );
}

export function EmptyStateIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state-icon"
      aria-hidden="true"
      className={cn('grid size-12 place-items-center rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-icon-icon-subtle)] [&_svg]:size-6 [&_svg]:shrink-0', className)}
      {...props}
    />
  );
}

export interface EmptyStateTitleProps extends React.ComponentProps<'p'> {
  as?: ElementType;
  asChild?: boolean;
}

export function EmptyStateTitle({ className, as, asChild = false, ...props }: EmptyStateTitleProps) {
  const Comp = asChild ? Slot : (as ?? 'p');
  return (
    <Comp
      data-slot="empty-state-title"
      className={cn('text-balance break-words font-body text-body-l font-semibold text-[var(--color-text-text)]', className)}
      {...props}
    />
  );
}

export function EmptyStateDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="empty-state-description" className={cn('text-balance font-body text-body-s text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

export function EmptyStateActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="empty-state-actions" className={cn('mt-1 flex w-full min-w-0 flex-wrap items-center justify-center gap-2', className)} {...props} />;
}
