'use client';

import { createContext, useContext } from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { isIconOnlyContent } from '../../lib/icon-only';
import { toggleVariants } from './toggle';

/**
 * Segmented set of Toggles on Radix ToggleGroup. appearance/size flow to
 * every item via context; an item's own appearance/size overrides them.
 *
 * For appearance="outlined" specifically, adjacent items do NOT each
 * draw a real `border` — two real 1px borders side by side at a shared
 * seam always add up to something visibly thicker than the group's own
 * outer edge, and trimming the start border off every item but the
 * first still leaves the neighbor's border on the other side of that
 * seam. Instead, each item's frame is an inset box-shadow, and
 * `not-first:-ms-px` pulls every item but the first back by exactly one
 * pixel so two neighbors' frames land on the SAME pixel column rather
 * than beside each other. The later item paints on top (plus `z-[1]` on
 * pressed), so the seam always shows exactly one line, never two.
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
const ToggleGroupContext = createContext<Omit<VariantProps<typeof toggleVariants>, 'iconOnly'>>({
  size: 'md',
  appearance: 'ghost',
});

export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  Omit<VariantProps<typeof toggleVariants>, 'iconOnly'>;

function ToggleGroup({ className, appearance = 'ghost', size, children, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root className={cn('flex w-fit items-center rounded-[var(--size-border-radius-border-radius-md)]', className)} data-appearance={appearance} {...props}>
      <ToggleGroupContext.Provider value={{ appearance, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

export interface ToggleGroupItemProps
  extends React.ComponentProps<typeof ToggleGroupPrimitive.Item>,
    Omit<VariantProps<typeof toggleVariants>, 'iconOnly'> {
  /** Square, icon-only item. Detected automatically when the only child is an icon; pass it to override. */
  iconOnly?: boolean;
}

function ToggleGroupItem({ className, children, appearance, size, iconOnly, ...props }: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext);
  // An item's own appearance/size wins when set; otherwise it follows the
  // group. (The group always provides an appearance, so checking the
  // context first would make the item prop dead.)
  const resolvedAppearance = appearance ?? context.appearance;
  const resolvedSize = size ?? context.size;
  const square = iconOnly ?? isIconOnlyContent(children);

  return (
    <ToggleGroupPrimitive.Item
      data-appearance={resolvedAppearance}
      data-icon-only={square ? '' : undefined}
      className={cn(
        toggleVariants({ appearance: resolvedAppearance, size: resolvedSize, iconOnly: square }),
        'shrink-0 rounded-none first:rounded-s-[var(--size-border-radius-border-radius-md)]',
        'last:rounded-e-[var(--size-border-radius-border-radius-md)]',
        // outlined only: cancel toggleVariants' own real border and draw
        // the seam as an inset shadow instead — see the file-level note.
        'data-[appearance=outlined]:border-0',
        'data-[appearance=outlined]:not-first:-ms-px',
        // One frame per item, recolored by state rather than stacked:
        // the grey border token at rest, the primary border token when
        // pressed.
        'data-[appearance=outlined]:data-[state=off]:shadow-[inset_0_0_0_1px_var(--color-border-border)]',
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
