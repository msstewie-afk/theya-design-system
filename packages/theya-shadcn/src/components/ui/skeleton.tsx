import { cn } from '../../lib/utils';

/**
 * First-load placeholder. Size it to the content it stands in for.
 * Decorative by default (aria-hidden).
 *
 * Fully rounded by default — a line of text reads as a pill. For a block
 * (an image, a chart, a card) pass a block radius, e.g.
 * `rounded-[var(--size-border-radius-border-radius-lg)]`.
 *
 * A soft highlight sweeps across it (Kinetics' Skeleton Sweep, MIT):
 * `theya-skeleton-sweep` in motion.css. With reduced motion it stays still.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn(
        'rounded-[var(--size-border-radius-border-radius-max)] bg-[color:var(--color-bg-neutral-bg-neutral-subtle)]',
        'bg-[image:linear-gradient(90deg,transparent_25%,color-mix(in_oklab,var(--color-bg-surface-bg-surface)_55%,transparent)_50%,transparent_75%)] bg-[length:200%_100%] bg-no-repeat',
        'animate-[theya-skeleton-sweep_1.4s_ease-in-out_infinite] motion-reduce:animate-none motion-reduce:bg-none',
        // Windows high contrast drops backgrounds entirely: keep an outline so the shape is still there.
        'forced-colors:border forced-colors:border-solid forced-colors:border-[GrayText]',
        className,
      )}
      {...props}
    />
  );
}
