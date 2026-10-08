'use client';

import { forwardRef } from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { buttonVariants } from './button';
import { Link } from './link';

/**
 * A row (or column) of related controls sharing a single tab stop:
 * Tab moves into the toolbar once, arrow keys move between items
 * (roving tabindex), on @radix-ui/react-toolbar.
 *
 * Not a filter/search region: a bar of TextFields + faceted pickers is
 * a search landmark, not a toolbar — a single tab stop would fight
 * those controls. Use this for a cluster of actions/view controls
 * that belong together (formatting bar, bulk-action bar).
 */
// forwardRef: DataTableToolbar measures its bulk-action overflow through this
// ref (containerRef); as a plain arrow function it was always null, so width-
// based collapsing into the "more" menu never ran — only maxVisible did.
export const Toolbar = forwardRef<React.ElementRef<typeof ToolbarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>>(function Toolbar({ className, ...props }, ref) {
  return (
    <ToolbarPrimitive.Root
      ref={ref}
      className={cn('flex items-center gap-1', 'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch', className)}
      {...props}
    />
  );
});

// Wired to Button's own cva (buttonVariants) rather than a hardcoded class
// list, so a ToolbarButton can take the full appearance/tone range — e.g.
// `appearance="ghost" tone="danger"` for a destructive action past a separator.
export type ToolbarButtonProps = Omit<React.ComponentProps<typeof ToolbarPrimitive.Button>, 'type'> &
  VariantProps<typeof buttonVariants> & { appearance?: VariantProps<typeof buttonVariants>['appearance'] };

// forwardRef (2026-09-27): Radix's roving-tabindex focus management
// (arrow-key navigation between toolbar items) needs a real DOM ref on
// each item to move focus programmatically — a plain function component
// here was silently breaking that (React dev warning: "Function
// components cannot be given refs"), which meant arrow-key keyboard
// navigation inside any Toolbar was at risk of not actually working.
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton(
  { className, appearance = 'ghost', tone = 'neutral', size = 'lg', iconOnly, ...props },
  ref,
) {
  if (process.env.NODE_ENV !== 'production' && iconOnly) {
    const hasAccessibleName = (props as Record<string, unknown>)['aria-label'] || (props as Record<string, unknown>)['aria-labelledby'];
    if (!hasAccessibleName) {
      console.warn(
        '[ToolbarButton] iconOnly buttons need an accessible name — pass aria-label ' +
          '(or aria-labelledby). Without it, screen reader users get no label at all for this button.',
      );
    }
  }

  return (
    <ToolbarPrimitive.Button
      ref={ref}
      className={cn(buttonVariants({ appearance, tone, size, iconOnly }), 'rounded-[var(--size-border-radius-border-radius-md)]', className)}
      {...props}
    />
  );
});

// Radix's ToggleGroup props are a discriminated union keyed on `type`
// ('single' | 'multiple'), which a `Partial<>` wrapper collapses — so this
// omits Radix's required `type`, re-declares it as optional with the same
// name, and defaults it to 'multiple' before handing the props to Radix.
export type ToolbarGroupProps = Omit<React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup>, 'type'> & {
  /** Selection mode, as on Radix ToggleGroup: one pressed item at a time, or any number. Default `multiple`. */
  type?: 'single' | 'multiple';
};

export function ToolbarGroup({ className, type, ...props }: ToolbarGroupProps) {
  const resolvedProps = { ...props, type: type ?? 'multiple' } as React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup>;
  return <ToolbarPrimitive.ToggleGroup {...resolvedProps} className={cn('flex items-center gap-1 data-[orientation=vertical]:flex-col', className)} />;
}

export function ToolbarSeparator({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      className={cn(
        'shrink-0 bg-[var(--color-border-border)]',
        // Radix's separator data-orientation is PERPENDICULAR to its
        // toolbar's — inside a horizontal toolbar the separator reports
        // "vertical".
        'data-[orientation=vertical]:mx-1 data-[orientation=vertical]:h-5 data-[orientation=vertical]:w-px',
        'data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
        className,
      )}
      {...props}
    />
  );
}

export function ToolbarLink({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  // Link supplies the color, hover underline and focus ring; Radix keeps the
  // roving tab stop. Toolbar height so it lines up with the buttons.
  return (
    <Link asChild size="sm" className={cn('inline-flex h-[var(--size-size-control-size-control-lg)] items-center px-2.5 font-medium', className)}>
      <ToolbarPrimitive.Link {...props} />
    </Link>
  );
}
