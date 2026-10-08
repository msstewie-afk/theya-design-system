import { cn } from '../../lib/utils';

/**
 * No library dependency — semantic key/value detail pairs (valid
 * HTML5 dl > div > (dt, dd)). Each row stacks on mobile and goes
 * two-column on sm+; both tracks wrap so long prose values and
 * unbreakable identifiers never force horizontal scroll at 360px.
 *
 * Usage: wrap each pair in DescriptionItem and add font-mono on
 * DescriptionDetails for identifiers (shop.seashell.dev, eu-west-1).
 */
export function DescriptionList({ className, ...props }: React.ComponentProps<'dl'>) {
  return <dl data-slot="description-list" className={cn('m-0', className)} {...props} />;
}

export function DescriptionItem({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="description-item"
      className={cn(
        'grid grid-cols-1 gap-1 border-b border-solid border-[var(--color-border-border-subtler)] py-3 last:border-b-0',
        'sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:items-baseline sm:gap-4',
        className,
      )}
      {...props}
    />
  );
}

export function DescriptionTerm({ className, ...props }: React.ComponentProps<'dt'>) {
  // text-body-m (not -s): matches DescriptionDetails' own size — the term
  // isn't shrunk relative to the value, only recolored
  // (muted vs full-ink); also matches the table-text-size default rule
  // (Sep 2026): body-m is the default, body-s only for genuinely secondary
  // text (a caption, a second line), which a term/value pair isn't.
  return <dt data-slot="description-term" className={cn('min-w-0 break-words font-body text-body-m text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

export function DescriptionDetails({ className, ...props }: React.ComponentProps<'dd'>) {
  return <dd data-slot="description-details" className={cn('m-0 min-w-0 break-words font-body text-body-m text-[var(--color-text-text)]', className)} {...props} />;
}
