import { cn } from '../../lib/utils';

/**
 * A success icon that draws itself: the ring first, then the tick (Kinetics'
 * Success Check, MIT). Use it where a success state appears — a success Alert,
 * a finished step, a "Saved" confirmation; the Toaster uses it for
 * `toast.success`. It plays once, when it mounts; remount it (a new `key`) to
 * play it again. With reduced motion it is simply shown.
 *
 * Sized and coloured like an Iconoir icon: 1.5em square, `currentColor`.
 * Decorative (aria-hidden) — the text next to it carries the message.
 */
export function SuccessCheck({ className, ...props }: React.ComponentProps<'svg'>) {
  const draw = '[stroke-dasharray:1] [stroke-dashoffset:1] animate-[theya-draw_var(--motion-duration-slower)_var(--ease-glide)_forwards] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]';
  return (
    <svg
      data-slot="success-check"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('shrink-0', className)}
      {...props}
    >
      {/* Starts at 12 o'clock and runs clockwise (mirrored in RTL it still reads as a ring). */}
      <circle cx="12" cy="12" r="10" pathLength={1} transform="rotate(-90 12 12)" className={draw} />
      <path d="M7.5 12.5l3 3 6-6.5" pathLength={1} className={cn(draw, '[animation-delay:300ms]')} />
    </svg>
  );
}
