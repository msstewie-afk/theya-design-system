import { Fragment } from 'react';
import { NavArrowLeft } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../ui/breadcrumb';

export interface Crumb {
  label: string;
  href: string;
}

export interface PageBreadcrumbsProps {
  /** Hierarchy from the top level down to the parent of this page. */
  path: Crumb[];
  /** This page. */
  current: string;
  /**
   * Where the person came from, when it isn't the parent — a search or a
   * filtered list. Shown as its own "Back to …" link, so the hierarchy
   * stays the hierarchy and the way back keeps its query and filters.
   */
  back?: Crumb;
  /** Crumbs shown before the middle ones fold into "…". Default 4. */
  maxVisible?: number;
  className?: string;
}

const linkClass =
  'rounded-[var(--size-border-radius-border-radius-sm)] outline-none hover:text-[var(--color-text-text)] focus-visible:focus-ring';

/**
 * Two kinds of "where am I" in one row. The breadcrumb is always the
 * hierarchy (Home › Domains › seashell.shop › DNS) — never the click
 * history — so it reads the same however you arrived. When you arrived
 * from a search or a filtered list, a separate "Back to results" link
 * keeps that route. Long paths fold the middle into a menu, keeping the
 * first and the last two; on phones only the parent is shown, as "‹ Parent".
 */
export function PageBreadcrumbs({ path, current, back, maxVisible = 4, className }: PageBreadcrumbsProps) {
  const fold = path.length + 1 > maxVisible;
  const head = fold ? path.slice(0, 1) : path;
  const hidden = fold ? path.slice(1, path.length - (maxVisible - 2)) : [];
  const tail = fold ? path.slice(path.length - (maxVisible - 2)) : [];
  const parent = path[path.length - 1];

  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-body-s text-[var(--color-text-text-subtle)]', className)}>
      {back && (
        <>
          <a href={back.href} className={cn(linkClass, 'inline-flex items-center gap-1 font-medium text-[var(--color-text-text-link)] hover:text-[var(--color-text-text-link-hover)]')}>
            <NavArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            {back.label}
          </a>
          <span aria-hidden="true" className="hidden h-4 w-px bg-[var(--color-border-border)] sm:block" />
        </>
      )}

      {/* Phone: the parent only. */}
      {!back && parent && (
        <a href={parent.href} className={cn(linkClass, 'inline-flex items-center gap-1 sm:hidden')}>
          <NavArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          {parent.label}
        </a>
      )}

      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          {head.map((c) => (
            <Fragment key={c.href}>
              <BreadcrumbItem>
                <BreadcrumbLink href={c.href}>
                  {c.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          {hidden.length > 0 && (
            <>
              <BreadcrumbItem>
                <BreadcrumbEllipsis items={hidden} />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          {tail.map((c) => (
            <Fragment key={c.href}>
              <BreadcrumbItem>
                <BreadcrumbLink href={c.href}>
                  {c.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[24ch] truncate">{current}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
