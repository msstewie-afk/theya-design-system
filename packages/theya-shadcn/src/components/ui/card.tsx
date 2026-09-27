import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { Radio, RadioGroup } from './radio';
import { Checkbox } from './checkbox';
import { Avatar } from './avatar';
import type { AvatarProps } from './avatar';

/**
 * Surface container. Compose: Card > CardHeader (CardTitle +
 * CardDescription) > CardContent > CardFooter. Header/footer carry
 * hairline dividers.
 *
 * Clickable card: pass `action` (or the legacy `href` shorthand) for a
 * real stretched link/button overlay over the surface (CardAction/
 * CardFooter stay independently clickable above it). For router/
 * programmatic navigation, set `interactive` and compose a stretched
 * CardLink with asChild instead.
 *
 * Simplified vs the reference: CardAction here uses plain
 * items-center rather than per-Button-size negative-margin
 * compensation — our Button doesn't emit a data-size attribute to
 * hook that fine-tuning off of.
 */
export type CardSeverity = 'default' | 'info' | 'success' | 'warning' | 'destructive';

const SEVERITY_CLASS: Record<CardSeverity, string> = {
  default: '',
  info: 'border-[var(--color-border-border-primary)] bg-[var(--color-bg-secondary-bg-secondary-subtle)]',
  success: 'border-[var(--color-border-border-success)] bg-[var(--color-bg-success-bg-success-subtle)]',
  warning: 'border-[var(--color-border-border-warning)] bg-[var(--color-bg-warning-bg-warning-subtle)]',
  destructive: 'border-[var(--color-border-border-danger)] bg-[var(--color-bg-danger-bg-danger-subtle)]',
};

// A selected `action="filter"` card used to always switch to primary/blue
// (border-primary + bg-primary-subtle) regardless of `severity` — so a
// severity="warning" filter card turned blue the moment it was selected,
// fighting its own warning coloring (Мария's call to fix). `default` has
// no inherent tone of its own, so it still falls back to primary/blue;
// every other severity keeps its own tone when selected instead.
const SEVERITY_SELECTED_CLASS: Record<CardSeverity, string> = {
  default: 'border-[var(--color-border-border-primary)] bg-[var(--color-bg-primary-bg-primary-subtle)]',
  info: 'border-[var(--color-border-border-primary)] bg-[var(--color-bg-secondary-bg-secondary-subtle)]',
  success: 'border-[var(--color-border-border-success)] bg-[var(--color-bg-success-bg-success-subtle)]',
  warning: 'border-[var(--color-border-border-warning)] bg-[var(--color-bg-warning-bg-warning-subtle)]',
  destructive: 'border-[var(--color-border-border-danger)] bg-[var(--color-bg-danger-bg-danger-subtle)]',
};

// Per-intent focus/hover rings — all now the real translucent
// --color-focus-focus-ring-* tokens (0.3 alpha), not a solid
// --color-border-border-* color standing in for one. `warning` needed a
// new token added to the DS (--color-focus-focus-ring-warning, Мария's
// call) since only default/error/success existed before this.
const SEVERITY_HOVER_CLASS: Record<CardSeverity, string> = {
  default: 'hover:border-[var(--color-border-border-primary)] hover:shadow-sm hover:shadow-[0_0_0_3px_var(--color-focus-focus-ring)] focus-within:shadow-[0_0_0_3px_var(--color-focus-focus-ring)]',
  info: 'hover:shadow-[0_0_0_3px_var(--color-focus-focus-ring)] focus-within:shadow-[0_0_0_3px_var(--color-focus-focus-ring)]',
  success: 'hover:shadow-[0_0_0_3px_var(--color-focus-focus-ring-success)] focus-within:shadow-[0_0_0_3px_var(--color-focus-focus-ring-success)]',
  warning: 'hover:shadow-[0_0_0_3px_var(--color-focus-focus-ring-warning)] focus-within:shadow-[0_0_0_3px_var(--color-focus-focus-ring-warning)]',
  destructive: 'hover:shadow-[0_0_0_3px_var(--color-focus-focus-ring-error)] focus-within:shadow-[0_0_0_3px_var(--color-focus-focus-ring-error)]',
};

export type CardSize = 'sm' | 'md' | 'lg';

/**
 * Primary action attached to the whole card. The action is rendered as a
 * transparent overlay covering the card, while nested interactive controls
 * (links, buttons, inputs, selects, textareas, summary, role=button/link)
 * are automatically raised above the overlay so they stay independently
 * usable. `link` navigates in place, `external-link` opens a new tab,
 * `filter` behaves as a toggle button and exposes aria-pressed.
 */
export type CardPrimaryAction =
  | { type: 'link'; href: string; ariaLabel?: string }
  | { type: 'external-link'; href: string; ariaLabel?: string }
  | { type: 'filter'; active: boolean; onChange: (active: boolean) => void; ariaLabel: string };

export type CardSelectable = 'radio' | 'checkbox';

export interface CardProps extends React.ComponentProps<'div'> {
  size?: CardSize;
  severity?: CardSeverity;
  interactive?: boolean;
  /** Primary action for the whole card. Providing one makes the card interactive automatically. */
  action?: CardPrimaryAction;
  /** Convenience shorthand for `action={{ type: 'link', href }}`. `action` takes precedence when both are set. */
  href?: string;
  /** Dims the card, blocks pointer events, and disables `action`/`selectable` — ported from corp's `state="Disabled"`. */
  disabled?: boolean;
  /**
   * Renders a Radio or Checkbox pinned to the card's top-left corner
   * (ported from corp's `choice`/`choice1`) and reserves matching left
   * padding on CardHeader/CardContent/CardFooter so their content clears
   * it. `selected`/`onSelectedChange` control it — Card does not manage
   * its own internal state, and does not enforce mutual exclusivity for
   * `'radio'` across multiple Cards (each Card gets its own isolated
   * Radix RadioGroup internally, purely for the checked visual); the
   * caller is responsible for single-select behavior across a group of
   * Cards, the same way corp's own reference leaves that to its consumer.
   */
  selectable?: CardSelectable;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Accessible name for the selection control. Required when `selectable` is set. */
  selectLabel?: string;
}

export function Card({
  className,
  size,
  severity = 'default',
  action,
  href,
  interactive = false,
  disabled = false,
  selectable,
  selected = false,
  onSelectedChange,
  selectLabel,
  children,
  ...props
}: CardProps) {
  // `href` is a legacy/convenience shorthand; an explicit `action` always wins.
  // A disabled card never resolves an action or a selection control.
  const resolvedAction: CardPrimaryAction | undefined = disabled ? undefined : (action ?? (href ? { type: 'link', href } : undefined));
  const isInteractive = !disabled && (interactive || resolvedAction != null);
  const isSelectedFilter = resolvedAction?.type === 'filter' && resolvedAction.active;
  const overlayClassName = 'absolute inset-0 z-0 rounded-[inherit] border-0 bg-transparent p-0 outline-none';
  const resolvedSelectable = disabled ? undefined : selectable;

  return (
    <div
      data-slot="card"
      data-size={size || undefined}
      data-severity={severity !== 'default' ? severity : undefined}
      data-interactive={isInteractive || undefined}
      data-legacy-interactive={interactive || undefined}
      data-action={resolvedAction?.type}
      data-filter-active={isSelectedFilter || undefined}
      data-disabled={disabled || undefined}
      data-selectable={resolvedSelectable || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        'group/card isolate relative min-w-0 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid',
        'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)] shadow-xs',
        SEVERITY_CLASS[severity],
        isInteractive && cn('transition-[border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none', SEVERITY_HOVER_CLASS[severity]),
        isSelectedFilter && SEVERITY_SELECTED_CLASS[severity],
        // Was gated on `resolvedAction` alone, so the legacy `interactive`
        // + stretched `CardLink` composition (no `action`/`href` set) never
        // got a pointer cursor at all, even though the card is genuinely
        // clickable through CardLink's own stretched overlay (Мария's
        // find). `isInteractive` covers both: a resolved `action`, and
        // plain `interactive` with no `action`.
        isInteractive &&
          cn(
            'cursor-pointer [&_*]:cursor-pointer',
            '[&_a:not([data-slot=card-link-overlay])]:relative [&_a:not([data-slot=card-link-overlay])]:z-[1]',
            '[&_button:not([data-slot=card-filter-overlay])]:relative [&_button:not([data-slot=card-filter-overlay])]:z-[1]',
            '[&_input]:relative [&_input]:z-[1]',
            '[&_select]:relative [&_select]:z-[1]',
            '[&_textarea]:relative [&_textarea]:z-[1]',
            '[&_summary]:relative [&_summary]:z-[1]',
            '[&_[role=button]]:relative [&_[role=button]]:z-[1]',
            '[&_[role=link]]:relative [&_[role=link]]:z-[1]',
          ),
        disabled && 'pointer-events-none opacity-[0.48] shadow-none',
        className,
      )}
      {...props}
    >
      {resolvedAction?.type === 'link' && (
        <a data-slot="card-link-overlay" href={resolvedAction.href} aria-label={resolvedAction.ariaLabel || props['aria-label'] || resolvedAction.href} className={overlayClassName} />
      )}
      {resolvedAction?.type === 'external-link' && (
        <a
          data-slot="card-link-overlay"
          href={resolvedAction.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={resolvedAction.ariaLabel || props['aria-label'] || resolvedAction.href}
          className={overlayClassName}
        />
      )}
      {resolvedAction?.type === 'filter' && (
        <button
          data-slot="card-filter-overlay"
          type="button"
          aria-label={resolvedAction.ariaLabel}
          aria-pressed={resolvedAction.active}
          onClick={() => resolvedAction.onChange(!resolvedAction.active)}
          className={overlayClassName}
        />
      )}
      {resolvedSelectable && (
        <div
          data-slot="card-select-control"
          className={cn(
            'absolute z-[1]',
            'left-5 top-5',
            'group-data-[size=sm]/card:left-3 group-data-[size=sm]/card:top-2.5',
            'group-data-[size=md]/card:left-4 group-data-[size=md]/card:top-3',
            'group-data-[size=lg]/card:left-5 group-data-[size=lg]/card:top-4',
          )}
        >
          {resolvedSelectable === 'checkbox' ? (
            <Checkbox
              checked={selected}
              onCheckedChange={(next) => onSelectedChange?.(next === true)}
              aria-label={selectLabel}
            />
          ) : (
            // Radio needs a RadioGroup ancestor for its own checked/click
            // semantics — this one is local to the card (see the prop doc
            // above: it's just the checked visual, not real cross-card
            // grouping).
            <RadioGroup value={selected ? 'selected' : ''} onValueChange={() => onSelectedChange?.(!selected)}>
              <Radio value="selected" aria-label={selectLabel} />
            </RadioGroup>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * `size` overrides header spacing independently of the parent Card size
 * (falls back to inheriting it via group-data selectors when omitted).
 * `divider` explicitly enables/disables the bottom hairline; when omitted
 * it shows by default, dropping for the last child or an interactive card.
 */
export function CardHeader({ className, divider, size, ...props }: React.ComponentProps<'div'> & { divider?: boolean; size?: 'sm' | 'md' }) {
  return (
    <div
      data-slot="card-header"
      data-size={size}
      className={cn(
        'group/card-header relative flex items-start justify-between gap-4',
        size === 'sm' && 'px-3 py-2.5',
        size === 'md' && 'px-4 py-3',
        !size &&
          cn(
            'px-5 py-5',
            'group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:py-2.5',
            'group-data-[size=md]/card:px-4 group-data-[size=md]/card:py-3',
            'group-data-[size=lg]/card:px-5 group-data-[size=lg]/card:py-4',
          ),
        // Reserves room for Card's absolutely-positioned selection control
        // (see `selectable` on Card) — approximate (control width + gap),
        // not pulled from an exact Figma spec.
        'group-data-[selectable]/card:pl-12',
        // Divider — an inset line via an absolutely positioned ::after,
        // not a full-bleed border (Мария's call: dividers get padding,
        // never run edge-to-edge). `inset-x-*` mirrors this header's own
        // left/right padding above, step for step, own-size override
        // included, so the line's ends always line up with the content.
        (divider === undefined || divider) &&
          cn(
            "after:absolute after:bottom-0 after:h-px after:bg-[var(--color-border-border-subtle)] after:content-['']",
            size === 'sm' && 'after:inset-x-3',
            size === 'md' && 'after:inset-x-4',
            !size &&
              cn(
                'after:inset-x-5',
                'group-data-[size=sm]/card:after:inset-x-3',
                'group-data-[size=md]/card:after:inset-x-4',
                'group-data-[size=lg]/card:after:inset-x-5',
              ),
          ),
        divider === undefined && 'last:after:hidden group-data-[interactive]/card:after:hidden',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'flex items-center font-body text-body-l font-semibold text-[var(--color-text-text)]',
        'group-data-[size=sm]/card:text-body-s group-data-[size=md]/card:text-body-s',
        // An explicit CardHeader size resets the title back to its default (unshrunk) size, unlike inheriting shrink from the parent Card's size.
        'group-data-[size=sm]/card-header:text-body-l group-data-[size=md]/card-header:text-body-l',
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('mt-0.5 font-body text-body-s text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

/**
 * The optional stretched primary action for an interactive Card.
 * Renders an <a> by default; pass asChild for a router link or
 * programmatic-navigation button.
 */
export interface CardLinkProps extends React.ComponentProps<'a'> {
  asChild?: boolean;
}

const SEVERITY_LINK_HOVER: Record<CardSeverity, string> = {
  default: 'group-data-[severity=default]/card:hover:text-[var(--color-text-text-link)]',
  info: 'group-data-[severity=info]/card:hover:text-[var(--color-text-text-link)]',
  success: 'group-data-[severity=success]/card:hover:text-[var(--color-text-text-success)]',
  warning: 'group-data-[severity=warning]/card:hover:text-[var(--color-text-text-warning)]',
  destructive: 'group-data-[severity=destructive]/card:hover:text-[var(--color-text-text-danger)]',
};

export function CardLink({ className, asChild = false, ...props }: CardLinkProps) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      data-slot="card-link"
      className={cn(
        "rounded-[var(--size-border-radius-border-radius-sm)] outline-none after:absolute after:inset-0 after:content-[''] hover:text-[var(--color-text-text-link)]",
        Object.values(SEVERITY_LINK_HOVER).join(' '),
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        'p-5',
        'group-data-[size=sm]/card:p-3 group-data-[size=md]/card:p-4 group-data-[size=lg]/card:p-5',
        // See the matching comment in CardHeader.
        'group-data-[selectable]/card:pl-12',
        className,
      )}
      {...props}
    />
  );
}

/** A header-level control opposite the title (an icon button, a kebab menu). */
export function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-action" className={cn('relative z-[1] flex shrink-0 items-center gap-1', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'relative z-[1] flex items-center gap-3 px-5 py-4',
        'group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:py-2',
        'group-data-[size=md]/card:px-4 group-data-[size=md]/card:py-2.5',
        'group-data-[size=lg]/card:px-5 group-data-[size=lg]/card:py-3',
        // See the matching comment in CardHeader.
        'group-data-[selectable]/card:pl-12',
        // Divider — see the matching comment in CardHeader: an inset
        // ::after line, not a full-bleed border.
        "after:absolute after:top-0 after:h-px after:bg-[var(--color-border-border-subtle)] after:content-['']",
        'after:inset-x-5',
        'group-data-[size=sm]/card:after:inset-x-3',
        'group-data-[size=md]/card:after:inset-x-4',
        'group-data-[size=lg]/card:after:inset-x-5',
        'first:after:hidden [[data-slot=card-header]+&]:after:hidden',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Full-bleed image banner at the top of the card — a direct child of
 * `Card`, placed before `CardHeader`/`CardContent` (Card itself has no
 * padding around its children, so this sits flush against the card's
 * edges with no extra markup needed). Clips its own corners rather than
 * relying on the outer Card having `overflow-hidden` (Card intentionally
 * doesn't, so popovers/tooltips inside it aren't clipped).
 */
export interface CardMediaProps extends React.ComponentProps<'img'> {
  /** Banner height. Defaults to 177px, matching corp's own Media size. */
  height?: number | string;
}

export function CardMedia({ className, height = 177, style, alt = '', ...props }: CardMediaProps) {
  return (
    <div data-slot="card-media" className="w-full shrink-0 overflow-hidden rounded-t-[var(--size-border-radius-border-radius-2xl)]" style={{ height }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- CardMedia's src is caller-supplied, not a static import Next can optimize */}
      <img alt={alt} className={cn('size-full object-cover', className)} style={style} {...props} />
    </div>
  );
}

// Half of Avatar's own SIZE_PX (32/48/64) — the negative top margin that
// centers the avatar exactly ON the boundary line above it (a preceding
// CardMedia's bottom edge, or the card's own top edge), rather than an
// arbitrary fixed offset that only happens to line up for one size.
const CARD_AVATAR_OFFSET_CLASS: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: '-mt-4',
  md: '-mt-6',
  lg: '-mt-8',
};

/**
 * Avatar that straddles the card's top edge (or a preceding `CardMedia`),
 * centered on that boundary line — ported from corp's `avatar`. Place as
 * a **direct child of `Card`**, between `CardMedia` (or the top of the
 * card, if there's no media) and `CardHeader` — NOT nested inside
 * `CardHeader`/`CardContent` (Card itself has no padding, same reasoning
 * as `CardMedia`; nesting it inside CardHeader would put that padding
 * between the avatar's flow position and the boundary it needs to
 * overlap, fighting the negative margin below — Мария's find). Carries
 * its own horizontal inset (mirroring CardHeader's own `px-*` per Card
 * `size`) since it no longer inherits CardHeader's padding for that.
 * `outline="solid"` (the default here, not Avatar's own default) gives it
 * a separator ring against whatever it overlaps; override like any other
 * Avatar prop.
 */
export interface CardAvatarProps extends AvatarProps {}

export function CardAvatar({ className, size = 'lg', outline = 'solid', ...props }: CardAvatarProps) {
  return (
    <div
      data-slot="card-avatar"
      className={cn(
        'flex shrink-0 px-5',
        'group-data-[size=sm]/card:px-3 group-data-[size=md]/card:px-4 group-data-[size=lg]/card:px-5',
        CARD_AVATAR_OFFSET_CLASS[size],
      )}
    >
      <Avatar size={size} outline={outline} className={className} {...props} />
    </div>
  );
}
