import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

/**
 * Determinate bar, 0-100, for an operation advancing toward done
 * (upload, install, multi-step setup), on @radix-ui/react-progress.
 * Reach for it when the value reads as "how far along", not "how
 * full" (that's Meter). For indeterminate work use Skeleton instead.
 */
export interface ProgressProps extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, 'value'> {
  value?: number;
}

export function Progress({ className, value = 0, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <ProgressPrimitive.Root value={pct} className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)]', className)} {...props}>
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-[var(--color-bg-primary-bg-primary)] transition-[transform] duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
