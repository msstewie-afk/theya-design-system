import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Single two-state (pressed/unpressed) button on Radix Toggle.
 * "tonal" always shows a soft fill: neutral tonal (matching Button's
 * Tonal+Default) when off, switching to blue/primary tonal (matching
 * Button's Tonal+Primary) when on — the transition itself is the
 * "selected" signal, not just a border or text-color change.
 */
const toggleVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap',
    'rounded-[var(--size-border-radius-border-radius-md)]',
    'font-normal text-[var(--color-text-text-subtle)]',
    'transition-[background-color,border-color,color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
    'outline-none cursor-pointer',
    'focus-visible:focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'data-[state=on]:text-[var(--color-text-text-link-on-tonal)]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  ],
  {
    variants: {
      appearance: {
        tonal: [
          'data-[state=off]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
          'data-[state=off]:hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle-hover)]',
          'data-[state=on]:bg-[var(--color-bg-primary-bg-primary-subtle)]',
          'data-[state=on]:hover:not-disabled:bg-[var(--color-bg-primary-bg-primary-subtle-hover)]',
        ],
        outlined: [
          'border border-solid bg-transparent',
          'data-[state=off]:border-[var(--color-border-border-default)]',
          'data-[state=off]:hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
          // Selected border switches neutral -> primary, matching
          // ToggleGroupItem's own on-state frame color exactly (see
          // toggle-group.tsx) so a standalone Toggle and a grouped one
          // read as the same control. Fixed 2026-09-26 (dark-theme QA) —
          // was stuck on border-default in every state.
          'data-[state=on]:border-[var(--color-border-border-primary)]',
          'data-[state=on]:bg-[var(--color-bg-primary-bg-primary-subtle)]',
        ],
        ghost: [
          'bg-transparent',
          'data-[state=off]:hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
          'data-[state=on]:bg-[var(--color-bg-primary-bg-primary-subtle)]',
        ],
      },
      size: {
        sm: 'h-[var(--size-size-control-size-control-lg)] min-w-[var(--size-size-control-size-control-lg)] px-2.5 text-body-s', // 32px
        md: 'h-[var(--size-size-control-size-control-2xl)] min-w-[var(--size-size-control-size-control-2xl)] px-3 text-body-m', // 40px — shared default row height with TextField/Select/Filter/Button
        lg: 'h-[var(--size-size-control-size-control-4xl)] min-w-[var(--size-size-control-size-control-4xl)] px-3.5 text-body-m', // 48px
      },
    },
    defaultVariants: { appearance: 'ghost', size: 'md' },
  },
);

export interface ToggleProps
  extends React.ComponentProps<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

function Toggle({ className, appearance, size, ...props }: ToggleProps) {
  return <TogglePrimitive.Root className={cn(toggleVariants({ appearance, size }), className)} {...props} />;
}

export { Toggle, toggleVariants };
