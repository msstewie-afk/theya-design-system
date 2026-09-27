import { Children, isValidElement, cloneElement } from 'react';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './avatar';
import type { AvatarSize } from './avatar';

/**
 * A stack of overlapping Avatars with a trailing "+N" overflow. Composes
 * Avatar: pass Avatar children and the group handles the overlap, the ring
 * separating each disc, and — past `max` — a neutral "+N" count. `size`
 * reuses Avatar's own scale (`sm`/`md`/`lg` = 32/48/64px) and is forced onto
 * every child, so you don't size them yourself. Each avatar's own `outline`
 * is overridden to `'none'` — the group draws its own flat separating
 * border instead, so overlapping avatars read as one consistent stack
 * rather than each carrying its own ring/gradient. Give the group an
 * accessible name via `aria-label`; each avatar's own name still comes from
 * its `alt`/initials.
 */
const GAP: Record<AvatarSize, string> = {
  sm: '-space-x-1.5',
  md: '-space-x-2',
  lg: '-space-x-2.5',
};

const CHIP_TEXT: Record<AvatarSize, string> = {
  sm: 'text-[0.625rem]',
  md: 'text-body-xs',
  lg: 'text-body-s',
};

export interface AvatarGroupProps extends React.ComponentProps<'div'> {
  /** Max avatars to show before collapsing the rest into a "+N" count. */
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ children, max, size = 'sm', className, ...props }: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{
    size?: AvatarSize;
    outline?: string;
    className?: string;
  }>[];
  const shown = max != null && max >= 0 ? items.slice(0, max) : items;
  const overflow = items.length - shown.length;

  return (
    <div role="group" className={cn('flex items-center', GAP[size], className)} {...props}>
      {shown.map((child, i) =>
        cloneElement(child, {
          key: child.key ?? i,
          size,
          outline: 'none',
          className: cn('border-2 border-solid border-[var(--color-bg-surface-bg-surface)]', child.props.className),
        }),
      )}
      {overflow > 0 && (
        <Avatar
          aria-label={`${overflow} more`}
          size={size}
          outline="none"
          className="border-2 border-solid border-[var(--color-bg-surface-bg-surface)]"
        >
          <AvatarFallback className={cn('bg-[var(--color-bg-neutral-bg-neutral-subtle)] font-medium text-[var(--color-text-text-subtler)]', CHIP_TEXT[size])}>
            +{overflow}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
