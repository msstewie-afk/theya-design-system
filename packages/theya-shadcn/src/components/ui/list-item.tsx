import { useId } from 'react';
import type { ReactNode, MouseEventHandler, KeyboardEventHandler } from 'react';
import { cn } from '@/lib/utils';

/**
 * A single row in a vertical list: an optional leading visual, a
 * title with an optional description, and trailing content. For
 * lists lighter than a Table — a settings list, a resource picker, a
 * notifications row.
 *
 * Pass `href` to make the row a link, or `interactive` for a
 * whole-row selectable/clickable region. The pressable control itself
 * is a real <button>, stretched over the region (absolute inset-0) —
 * NOT role="button" on the element wrapping the content — so `children`
 * (e.g. an action button composed into the row, see the Notification
 * story) can stay a real nested button/link without landing inside
 * another interactive-role element (axe: nested-interactive); it works
 * because the content layer sits above the stretched button with
 * pointer-events-none except on its own real button/link descendants,
 * which re-enable it for themselves. `trailing` stays a sibling
 * OUTSIDE the link/button region entirely, same as before.
 */
export type ListItemSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<ListItemSize, string> = {
  sm: 'px-2.5 py-1.5',
  md: 'px-3 py-2.5 min-h-11',
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

export function ListItem({ className, size = 'md', leading, title, description, trailing, href, interactive = false, selected, disabled = false, onClick, onKeyDown, children, ...props }: ListItemProps) {
  const isPressable = interactive && href == null;
  // The stretched button is empty (the visible text sits in a sibling span
  // on top of it), so it takes its accessible name/description from the
  // title/description by id — without this it had no name at all
  // (axe button-name, found in the 2026-09-28 full test-runner pass).
  const baseId = useId();
  const titleId = title != null ? `${baseId}-title` : undefined;
  const descriptionId = description != null ? `${baseId}-description` : undefined;

  // Leading visual aligns to the TITLE line, not the middle of the text
  // block (Мария, 2026-10-02): the row is items-start and the leading slot
  // is at least one line tall (min-h-[1lh], same font as the title), with
  // its content centered in that line. A small icon sits level with the
  // title whether a description or extra children follow; a larger visual
  // (avatar) just grows downward from the top.
  const rowAlign = 'items-start';

  const body = (
    <>
      {leading != null && <span data-slot="list-item-leading" className="flex min-h-[1lh] shrink-0 items-center text-[var(--color-icon-icon-subtle)] [&_svg:not([class*='size-'])]:size-4">{leading}</span>}
      <span data-slot="list-item-content" className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        {title != null && <span id={titleId} data-slot="list-item-title" className="truncate font-medium">{title}</span>}
        {description != null && <span id={descriptionId} data-slot="list-item-description" className="truncate font-body text-body-s text-[var(--color-text-text-subtler)]">{description}</span>}
        {children}
      </span>
    </>
  );

  const regionClass = cn(
    'flex min-w-0 flex-1 gap-3',
    rowAlign,
    (href != null || interactive) && "rounded-[var(--size-border-radius-border-radius-md)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]",
  );

  // isPressable-only: the layout classes above move onto an inner content
  // span instead, because the actual pressable element becomes a real
  // stretched <button> — `children` can be arbitrary consumer content
  // (the doc comment above literally shows "an action button"), and a
  // real button rendered inside a role="button" div is nested-interactive.
  // pointer-events-none (auto'd back on any nested button/link) makes the
  // content span click-through to the stretched button everywhere except
  // its own genuinely-interactive descendants, which keep working exactly
  // as they already did (they stopPropagation in every story that has one).
  const contentClass = cn('relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto', regionClass);

  return (
    <div
      data-slot="list-item"
      data-selected={selected || undefined}
      className={cn(
        'relative flex w-full min-w-0 items-center gap-3 rounded-[var(--size-border-radius-border-radius-md)]',
        'font-body text-body-m text-[var(--color-text-text)] transition-colors duration-standard ease-enter motion-reduce:transition-none',
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
        <div className="relative min-w-0 flex-1">
          <button
            type="button"
            tabIndex={disabled ? -1 : 0}
            // A selectable row (selected passed, true or false) is a toggle;
            // an action-only row (selected omitted) is a plain button. It
            // used to be pressed="true" or nothing, so unselected rows in a
            // selectable list didn't read as toggles at all.
            aria-pressed={selected}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            disabled={disabled || undefined}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className="absolute inset-0 rounded-[var(--size-border-radius-border-radius-md)] outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]"
          />
          <span className={contentClass}>{body}</span>
        </div>
      ) : (
        <div className={cn('flex min-w-0 flex-1 gap-3', rowAlign)}>{body}</div>
      )}
      {trailing != null && <span data-slot="list-item-trailing" className="flex shrink-0 items-center gap-2 text-[var(--color-icon-icon-subtle)]">{trailing}</span>}
    </div>
  );
}
