import type { ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { NavArrowRight, MoreHoriz } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * The topbar trail. Sentence case, hairline chevrons. The last item
 * is the current page (BreadcrumbPage, not a link).
 */
export function Breadcrumb(props: React.ComponentProps<'nav'>) {
  return <nav aria-label="Breadcrumb" {...props} />;
}

export function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      className={cn('flex flex-wrap items-center gap-2 font-body text-body-s text-[var(--color-text-text-subtler)]', className)}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('inline-flex items-center gap-2', className)} {...props} />;
}

export function BreadcrumbLink({
  className,
  asChild,
  icon,
  children,
  ...props
}: React.ComponentProps<'a'> & { asChild?: boolean; /** Icon before the label. Omit `children` for an icon-only crumb — pass `aria-label` for its accessible name. */ icon?: ReactNode }) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors duration-standard ease-enter motion-reduce:transition-none hover:text-[var(--color-text-text)]',
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </Comp>
  );
}

export function BreadcrumbPage({
  className,
  icon,
  children,
  ...props
}: React.ComponentProps<'span'> & { /** Icon before the label. Omit `children` for an icon-only crumb — pass `aria-label` for its accessible name. */ icon?: ReactNode }) {
  return (
    <span
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('inline-flex items-center gap-1.5 font-medium text-[var(--color-text-text)]', className)}
      {...props}
    >
      {icon && (
        <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

export function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li role="presentation" aria-hidden="true" className={cn('[&>svg]:size-3.5 text-[var(--color-icon-icon-subtler)]', className)} {...props}>
      {children ?? <NavArrowRight />}
    </li>
  );
}

export function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span role="presentation" aria-hidden="true" className={cn('flex size-9 items-center justify-center', className)} {...props}>
      <MoreHoriz className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}
