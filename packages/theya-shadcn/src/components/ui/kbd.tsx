import { cn } from '@/lib/utils';

/** Keyboard key hint, e.g. <Kbd>⌘</Kbd><Kbd>K</Kbd>. */
export function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        // Square at 20px (h-5/min-w-5) needs the padding math to actually
        // land under 20px for a single glyph, not just min-w "hoping" to
        // win: text-body-xs (12px) keeps a lone character's content-box
        // narrow, and px-0.5 (2px/side) keeps a 16px icon's content-box at
        // exactly 20px too — 16 + 2 + 2 = 20. Only then does min-w-5 read
        // as square instead of getting overrun by padding. A longer label
        // ("esc", "tab") still grows past min-w via the same padding.
        'inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--size-border-radius-border-radius-sm)] border border-solid',
        'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'px-0.5 py-0 font-mono text-body-xs leading-none text-[var(--color-text-text-subtler)] [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}
