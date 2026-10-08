import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * No library dependency — the standard header block at the top of a
 * page or major section: an optional leading icon, a title (h1 by
 * default), an optional row of tags, an optional description, an
 * optional content-actions row, an optional meta row via children, an
 * optional breadcrumb, and a right-aligned actions slot.
 *
 * Actions always sit on the header's top row — the breadcrumb row
 * when given, or the title row otherwise — never pushed down by
 * description/children. `contentActions` is a separate action slot
 * tied to the description/content, always below it, never in the top
 * row with `actions`.
 *
 * Vertical alignment (Мария's rule): `actions` centers on whichever
 * row it shares — the breadcrumb when one is given, otherwise
 * title+tags+description only. `contentActions`/`children` live
 * outside that row entirely (not just visually below it) so a tall
 * one can never pull `actions`' centering down with it. The `-mt-*`
 * offsets on those two undo the row gap below and restore the exact
 * spacing this had before the split (12px/6px, then 4px).
 */
export interface PageHeaderProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title: ReactNode;
  /** Leading icon beside the title. Plain — no chip/circle background, sized to the title's own scale. */
  icon?: ReactNode;
  /** Row of tags/chips below the title, above the description. */
  tags?: ReactNode;
  /** Supporting line below the title. Capped at 540px so a long line wraps for readability. */
  description?: ReactNode;
  /** Content above the title — typically a Breadcrumb. */
  breadcrumb?: ReactNode;
  /** Right-aligned action row. Sits beside the breadcrumb when given, otherwise beside the title, vertically centered on that row. */
  actions?: ReactNode;
  /** A second action row tied to the description/content — always below it, outside the actions-centering row. */
  contentActions?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  children?: ReactNode;
}

export function PageHeader({ title, icon, tags, description, breadcrumb, actions, contentActions, as: Heading = 'h1', className, children, ...props }: PageHeaderProps) {
  return (
    <div data-slot="page-header" className={cn('flex flex-col gap-4', className)} {...props}>
      {breadcrumb && (
        <div className="flex flex-wrap items-center gap-4">
          <div data-slot="page-header-breadcrumb" className="min-w-0">{breadcrumb}</div>
          {actions && <div data-slot="page-header-actions" className="flex shrink-0 flex-wrap items-center gap-1 sm:ms-auto">{actions}</div>}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col">
          <div className="flex min-w-0 items-center gap-2">
            {icon && (
              <span aria-hidden="true" className="shrink-0 text-[var(--color-icon-icon-subtle)] [&_svg]:size-6">
                {icon}
              </span>
            )}
            <Heading className="min-w-0 break-words font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</Heading>
          </div>
          {tags && <div data-slot="page-header-tags" className="mt-4 flex flex-wrap items-center gap-1">{tags}</div>}
          {description && <p data-slot="page-header-description" className={cn('max-w-[540px] font-body text-body-s text-[var(--color-text-text-subtler)]', tags ? 'mt-3' : 'mt-1.5')}>{description}</p>}
        </div>
        {!breadcrumb && actions && <div data-slot="page-header-actions" className="flex flex-wrap items-center gap-1 sm:shrink-0">{actions}</div>}
      </div>
      {contentActions && (
        <div data-slot="page-header-content-actions" className={cn('flex flex-wrap items-center gap-2', description || tags ? '-mt-1' : '-mt-[10px]')}>
          {contentActions}
        </div>
      )}
      {children && <div className="-mt-3 flex flex-wrap items-center gap-3 font-body text-body-s text-[var(--color-text-text-subtler)]">{children}</div>}
    </div>
  );
}
