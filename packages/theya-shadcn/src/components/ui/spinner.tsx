import { cn } from '../../lib/utils';

/**
 * The loading spinner (CSS Loaders' Meridian, MIT): an arc that grows and shrinks
 * while the ring turns. Button's `loading`, Combobox, Autocomplete, Command and
 * Dropzone use it; use it for any other small "working…" state.
 *
 * Sized and coloured like an icon (1.5em square, `currentColor`) — set `size-*` and a
 * text colour. Decorative: give the busy region `aria-busy`, or put a `role="status"`
 * label next to it. With reduced motion the arc stops and slowly fades in and out.
 */
export function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      data-slot="spinner"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0 animate-[theya-spin_1.6s_linear_infinite] motion-reduce:animate-[theya-breathe_2s_ease-in-out_infinite]', className)}
      {...props}
    >
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="5" opacity="0.2" />
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        className="[stroke-dasharray:60_150] animate-[theya-dashring_1.4s_ease-in-out_infinite] motion-reduce:animate-none"
      />
    </svg>
  );
}
