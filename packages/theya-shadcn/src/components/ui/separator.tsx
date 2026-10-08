'use client';

import { forwardRef } from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../../lib/utils';

export type SeparatorEmphasis = 'subtle' | 'strong';

const EMPHASIS_CLASS: Record<SeparatorEmphasis, string> = {
  // Quieter than any interactive boundary (1.57:1 light / 1.76:1 dark).
  // Fine for a decorative divider: WCAG 1.4.11 doesn't apply to it.
  subtle: 'bg-[var(--color-border-border-subtler)]',
  // Same weight as a form-field border (3.0:1 / 3.01:1) — for a divider
  // that has to hold its own, e.g. between major page regions.
  strong: 'bg-[var(--color-border-border)]',
};

export interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Line weight. `subtle` (default) stays below interactive borders; `strong` matches a form-field border. */
  emphasis?: SeparatorEmphasis;
}

/** Hairline divider, horizontal or vertical, on @radix-ui/react-separator. */
export const Separator = forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(function Separator(
  { className, orientation = 'horizontal', decorative = true, emphasis = 'subtle', ...props },
  ref,
) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="separator"
      data-emphasis={emphasis}
      orientation={orientation}
      decorative={decorative}
      className={cn('shrink-0', EMPHASIS_CLASS[emphasis], orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
      {...props}
    />
  );
});
