import { createContext, useContext } from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { toggleVariants } from './toggle';

/**
 * Segmented set of Toggles on Radix ToggleGroup. variant/size flow to
 * every item via context.
 *
 * For "outline" specifically, adjacent items do NOT each draw a real
 * `border` — two real 1px borders sitting side by side at a shared
 * seam always sum to something visibly thicker than the group's own
 * single-item outer edge, and no amount of "subtract the left border
 * from every item but the first" fully avoids that, because it still
 * only removes ONE side while the other item's own border (on the
 * opposite side of that same seam) is still there. Ported from the
 * corporate reference's own fix: each item's border is a `shadow`
 * (inset box-shadow) instead, and `not-first:-ml-px` pulls every item
 * but the first left by exactly one pixel so two neighbors' shadows
 * land on the SAME physical pixel column rather than beside each
 * other — the later item paints on top (plus `z-[1]` on pressed), so
 * the seam always shows exactly one line, never two.
 *
 * Items are NOT `flex-1` — each sizes to its own content (padding +
 * label/icon), not an equal share of the group's width. `flex-1` was
 * the earlier bug: text items of very different lengths ("All" vs.
 * "Unread 3") got stretched to the same width, which also threw off
 * how their own padding read. `min-w-0` is removed too, since without
 * `flex-1` there is no reason to let content shrink below its own
 * intrinsic size - `toggleVariants`' own `min-w-[...]` per size is
 * only a floor (keeps icon-only items square), not a target width.
 */
const ToggleGroupContext = createContext<VariantProps<typeof toggleVariants>>({
  size: 'md',
  appearance: 'ghost',
});

export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>;

function ToggleGroup({ className, appearance = 'ghost', size, children, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root className={cn('flex w-fit items-center rounded-[var(--size-border-radius-border-radius-md)]', className)} data-appearance={appearance} {...props}>
      <ToggleGroupContext.Provider value={{ appearance, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

export interface ToggleGroupItemProps
  extends React.ComponentProps<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof toggleVariants> {}

function ToggleGroupItem({ className, children, appearance, size, ...props }: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext);
  const resolvedAppearance = context.appearance ?? appearance;
  const resolvedSize = context.size ?? size;

  return (
    <ToggleGroupPrimitive.Item
      data-appearance={resolvedAppearance}
      className={cn(
        toggleVariants({ appearance: resolvedAppearance, size: resolvedSize }),
        'shrink-0 rounded-none first:rounded-l-[var(--size-border-radius-border-radius-md)]',
        'last:rounded-r-[var(--size-border-radius-border-radius-md)]',
        // outline only: cancel toggleVariants' own real border and draw
        // the seam as an inset shadow instead — see the file-level note.
        'data-[appearance=outlined]:border-0',
        'data-[appearance=outlined]:not-first:-ml-px',
        // Pressed items keep a frame too — just recolored to primary
        // instead of losing it, matching the reference's "grey at rest,
        // swapped for the ring when pressed, never stacked" rule.
        'data-[appearance=outlined]:data-[state=off]:shadow-[inset_0_0_0_1px_var(--color-border-border-default)]',
        'data-[appearance=outlined]:data-[state=on]:shadow-[inset_0_0_0_1px_var(--color-border-border-primary)]',
        'data-[appearance=outlined]:data-[state=on]:z-[1]',
        'focus-visible:z-10',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
