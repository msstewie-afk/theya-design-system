import type { ReactNode, MouseEventHandler, KeyboardEventHandler, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { cn } from '@/lib/utils';

/**
 * A single row in a vertical list: an optional leading visual, a
 * title with an optional description, and trailing content. For
 * lists lighter than a Table — a settings list, a resource picker, a
 * notifications row.
 *
 * Pass `href` to make the row a link, or `interactive` for a
 * whole-row selectable/clickable region rendered as role="button" on
 * a plain element (not a real <button>, so a real button — trailing
 * content — can nest inside safely). `trailing` stays a sibling
 * OUTSIDE the link/button region so a row action never nests inside it.
 */
export type ListItemSize = 'sm' | 'm' | 'lg';

const SIZE_CLASS: Record<ListItemSize, string> = {
  sm: 'px-2.5 py-1.5',
  m: 'px-3 py-2.5 min-h-11',
  lg: 'px-4 py-3 min-h-12',
};

export interface ListItemProps extends Omit<React.ComponentProps<'div'>, 'title' | 'onClick' | 'onKeyDown'> {
  size?: ListItemSize;
  onClick?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  /** Leading visual: an icon, Avatar, or a tone-colored status glyph. */
  leading?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Trailing content — meta text, a Badge, a kebab menu. Stays outside the link/button region. */
  trailing?: ReactNode;
  /** Renders the row's text region as a link. */
  href?: string;
  /** Renders the text region as a selectable, whole-row-clickable region. */
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

export function ListItem({ className, size = 'm', leading, title, description, trailing, href, interactive = false, selected = false, disabled = false, onClick, onKeyDown, children, ...props }: ListItemProps) {
  const isPressable = interactive && href == null;

  // `children` renders BELOW description (extra composed content, e.g. an
  // action button) — centering leading+content against that combined height
  // pulls the leading icon down off the title/description text it's meant to
  // sit beside. items-start (top-aligning leading with the content column's
  // top, i.e. the title) keeps it pinned to the text regardless of whatever
  // renders below; items-center (the common case — just title/description)
  // stays the better default when there's nothing extra underneath.
  const rowAlign = children != null ? 'items-start' : 'items-center';

  const body = (
    <>
      {leading != null && <span data-slot="list-item-leading" className="flex shrink-0 items-center text-[var(--color-icon-icon-subtle)] [&_svg:not([class*='size-'])]:size-4">{leading}</span>}
      <span data-slot="list-item-content" className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        {title != null && <span data-slot="list-item-title" className="truncate font-medium">{title}</span>}
        {description != null && <span data-slot="list-item-description" className="truncate font-body text-body-s text-[var(--color-text-text-subtler)]">{description}</span>}
        {children}
      </span>
    </>
  );

  const regionClass = cn(
    'flex min-w-0 flex-1 gap-3',
    rowAlign,
    (href != null || interactive) && "rounded-[var(--size-border-radius-border-radius-md)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]",
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (isPressable && !disabled && !event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event as unknown as ReactMouseEvent<HTMLElement>);
    }
  };

  return (
    <div
      data-slot="list-item"
      data-selected={selected || undefined}
      className={cn(
        'relative flex w-full min-w-0 items-center gap-3 rounded-[var(--size-border-radius-border-radius-md)]',
        'font-body text-body-m text-[var(--color-text-text)] transition-colors duration-150 ease-out motion-reduce:transition-none',
        SIZE_CLASS[size],
        // Selected uses `-subtle` (one step darker than hover's `-subtler`)
        // so a selected-but-not-hovered row stays visually distinct from a
        // merely-hovered one — previously both used `-subtler` and were
        // indistinguishable (Мария caught this, 2026-09-27). Matches the
        // highlighted-row convention Command and Combobox already use
        // (`bg-neutral-bg-neutral-subtle` for their active/highlighted item).
        (href != null || interactive) && 'cursor-pointer hover:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
        selected && 'bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...props}
    >
      {href != null ? (
        <a href={href} aria-current={selected ? 'true' : undefined} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined} className={regionClass}>
          {body}
        </a>
      ) : isPressable ? (
        <div role="button" tabIndex={disabled ? -1 : 0} aria-pressed={selected || undefined} aria-disabled={disabled || undefined} onClick={disabled ? undefined : onClick} onKeyDown={handleKeyDown} className={regionClass}>
          {body}
        </div>
      ) : (
        <div className={cn('flex min-w-0 flex-1 gap-3', rowAlign)}>{body}</div>
      )}
      {trailing != null && <span data-slot="list-item-trailing" className="flex shrink-0 items-center gap-2 text-[var(--color-icon-icon-subtle)]">{trailing}</span>}
    </div>
  );
}
