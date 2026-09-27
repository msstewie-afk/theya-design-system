import { Slot } from '@radix-ui/react-slot';
import { NavArrowLeft, NavArrowRight, MoreHoriz } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * Numbered page navigation. Square number buttons, prev/next controls,
 * ellipsis for gaps. Pure presentational — every clickable part takes
 * asChild, so it drives from a real <Link> (URL pagination) or a
 * <button> (client paging) equally well. Styled directly with our
 * tokens rather than through Button — Button's type/intent/size API
 * doesn't map onto shadcn's variant/size shape the reference used.
 */
export function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav role="navigation" aria-label="Pagination" className={cn('flex w-full justify-center', className)} {...props} />;
}

export function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-row flex-wrap items-center justify-center gap-1', className)} {...props} />;
}

export function PaginationItem(props: React.ComponentProps<'li'>) {
  return <li {...props} />;
}

export interface PaginationLinkProps extends React.ComponentProps<'a'> {
  isActive?: boolean;
  asChild?: boolean;
  size?: 'icon' | 'default';
}

export function PaginationLink({ className, isActive, size = 'icon', asChild = false, ...props }: PaginationLinkProps) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 cursor-pointer',
        'rounded-[var(--size-border-radius-border-radius-md)]',
        'font-body text-body-s tabular-nums',
        'transition-colors duration-150 ease-out motion-reduce:transition-none',
        size === 'icon' ? 'size-[30px]' : 'h-[30px] px-2.5',
        isActive
          ? 'bg-[var(--color-bg-secondary-bg-secondary-subtle)] font-medium text-[var(--color-text-text)]'
          : 'text-[var(--color-text-text-subtler)] hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-text-text)]',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        className,
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, children, asChild, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink asChild={asChild} size="default" aria-label="Go to previous page" className={cn('gap-1', className)} {...props}>
      {children ?? (
        <>
          <NavArrowLeft width={16} height={16} aria-hidden="true" />
          <span className="max-sm:sr-only">Previous</span>
        </>
      )}
    </PaginationLink>
  );
}

export function PaginationNext({ className, children, asChild, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink asChild={asChild} size="default" aria-label="Go to next page" className={cn('gap-1', className)} {...props}>
      {children ?? (
        <>
          <span className="max-sm:sr-only">Next</span>
          <NavArrowRight width={16} height={16} aria-hidden="true" />
        </>
      )}
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span className={cn('flex size-[30px] items-center justify-center text-[var(--color-text-text-subtler)]', className)} {...props}>
      <MoreHoriz width={16} height={16} aria-hidden="true" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
