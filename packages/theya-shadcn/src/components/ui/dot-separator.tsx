import { cn } from '@/lib/utils';

/**
 * A small bullet separator between inline meta facts ("eu-west-1 · Created Mar 2026 · v2.4.0").
 * Purely decorative — hidden from assistive tech.
 */
export function DotSeparator({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dot-separator"
      aria-hidden="true"
      className={cn('mx-2 shrink-0 select-none text-[var(--color-text-text-subtler)]', className)}
      {...props}
    >
      ·
    </span>
  );
}
