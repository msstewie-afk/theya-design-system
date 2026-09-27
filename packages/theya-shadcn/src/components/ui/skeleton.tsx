import { cn } from '@/lib/utils';

/**
 * First-load placeholder. Size it to the content it stands in for.
 * Decorative by default (aria-hidden). Uses Tailwind's built-in
 * animate-pulse rather than a custom "skel" keyframe shimmer — we
 * haven't confirmed a matching keyframe is defined in this Tailwind
 * v4 CSS-first setup, and pulse is a safe, always-available default.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-[var(--size-border-radius-border-radius-sm)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] motion-reduce:animate-none', className)}
      {...props}
    />
  );
}
