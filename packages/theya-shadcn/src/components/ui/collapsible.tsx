import { cn } from '@/lib/utils';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

/**
 * One independent show/hide region on @radix-ui/react-collapsible —
 * a direct equivalent of the Base UI primitive the reference wrapped.
 * For a set of mutually-aware FAQ-style sections use Accordion; this
 * is the primitive for a single toggle (e.g. "show advanced settings").
 * Height animates via Radix's own --radix-collapsible-content-height
 * CSS var on a plain transition, rather than assuming a pre-defined
 * "accordion-down/up" keyframe utility exists in this Tailwind v4
 * CSS-first setup (that's a tailwindcss-animate plugin convention we
 * haven't confirmed is configured here).
 */
export const Collapsible = CollapsiblePrimitive.Root;
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

export function CollapsibleContent({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      className={cn(
        'overflow-hidden transition-[height] duration-moderate ease-enter motion-reduce:transition-none',
        'data-[state=closed]:h-0 data-[state=open]:h-[var(--radix-collapsible-content-height)]',
        className,
      )}
      {...props}
    />
  );
}
