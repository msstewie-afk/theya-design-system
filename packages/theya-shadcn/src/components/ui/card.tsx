'use client';

import { useRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';
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
 * CardAction centers its controls with plain items-center. Button
 * emits data-slot/data-size (2026-09-27), so per-size optical
 * alignment can key off [data-slot=button][data-size=…] if it's ever
 * needed.
 */
export type CardTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const TONE_CLASS: Record<CardTone, string> = {
  neutral: '',
  info: 'border-[var(--color-border-border-primary)] bg-[var(--color-bg-secondary-bg-secondary-subtle)]',
  success: 'border-[var(--color-border-border-success)] bg-[var(--color-bg-success-bg-success-subtle)]',
  warning: 'border-[var(--color-border-border-warning)] bg-[var(--color-bg-warning-bg-warning-subtle)]',
  danger: 'border-[var(--color-border-border-danger)] bg-[var(--color-bg-danger-bg-danger-subtle)]',
};

// A selected `action="filter"` card used to always switch to primary/blue
// (border-primary + bg-primary-subtle) regardless of `tone` — so a
// tone="warning" filter card turned blue the moment it was selected,
// fighting its own warning coloring (Мария's call to fix). `neutral` has
// no inherent tone of its own, so it still falls back to primary/blue;
// every other tone keeps its own color when selected instead.
const TONE_SELECTED_CLASS: Record<CardTone, string> = {
  neutral: 'border-[var(--color-border-border-primary)] bg-[var(--color-bg-primary-bg-primary-subtle)]',
  info: 'border-[var(--color-border-border-primary)] bg-[var(--color-bg-secondary-bg-secondary-subtle)]',
  success: 'border-[var(--color-border-border-success)] bg-[var(--color-bg-success-bg-success-subtle)]',
  warning: 'border-[var(--color-border-border-warning)] bg-[var(--color-bg-warning-bg-warning-subtle)]',
  danger: 'border-[var(--color-border-border-danger)] bg-[var(--color-bg-danger-bg-danger-subtle)]',
};

// Hover and focus are separate signals (2026-10-02): hover changes the
// border and lifts the card, the translucent ring appears only on
// keyboard focus (focus-within), in the card's tone. Hover lift is gated
// with not-focus-within: hover sorts after focus-within, and both set
// box-shadow, so an unconditional hover lift would hide the ring while a
// focused card is under the pointer.
const TONE_HOVER_CLASS: Record<CardTone, string> = {
  neutral: 'hover:border-[var(--color-border-border-primary)] hover:not-focus-within:shadow-elevation-sm focus-within:focus-ring',
  info: 'hover:border-[var(--color-border-border-primary)] hover:not-focus-within:shadow-elevation-sm focus-within:focus-ring',
  success: 'hover:border-[var(--color-border-border-success)] hover:not-focus-within:shadow-elevation-sm focus-within:focus-ring-success',
  warning: 'hover:border-[var(--color-border-border-warning)] hover:not-focus-within:shadow-elevation-sm focus-within:focus-ring-warning',
  danger: 'hover:border-[var(--color-border-border-danger)] hover:not-focus-within:shadow-elevation-sm focus-within:focus-ring-error',
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

export type CardAppearance = 'outlined' | 'filled';

/**
 * `filled`: a brand card on the primary fill. It sets data-surface="primary"
 * (Button and Checkbox switch to their on-primary treatment inside it) and
 * re-points the text/icon/border tokens for everything inside, so titles,
 * descriptions, icons and dividers adapt without per-part props. `tone`
 * doesn't apply to a filled card.
 */
const FILLED_CLASS = cn(
  'border-transparent bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)]',
  '[--color-text-text:var(--color-text-text-on-primary)]',
  '[--color-text-text-subtle:var(--color-text-text-subtle-on-primary)]',
  '[--color-text-text-subtler:var(--color-text-text-subtle-on-primary)]',
  '[--color-icon-icon:var(--color-text-text-on-primary)]',
  '[--color-icon-icon-subtle:var(--color-icon-icon-on-primary)]',
  '[--color-icon-icon-subtler:var(--color-icon-icon-on-primary)]',
  '[--color-border-border:var(--color-border-border-on-primary)]',
  '[--color-border-border-subtle:var(--color-border-border-on-primary)]',
  '[--color-border-border-subtler:var(--white-a300)]',
);

export interface CardProps extends React.ComponentProps<'div'> {
  size?: CardSize;
  /** Status tone: tinted border/surface and matching hover/focus colors. Default `neutral` (untinted). */
  tone?: CardTone;
  /** `outlined` (default) surface card, or `filled` brand card on the primary color. */
  appearance?: CardAppearance;
  interactive?: boolean;
  /** Primary action for the whole card. Providing one makes the card interactive automatically. */
  action?: CardPrimaryAction;
  /** Convenience shorthand for `action={{ type: 'link', href }}`. `action` takes precedence when both are set. */
  href?: string;
  /** Dims the card, blocks pointer events, and disables `action`/`selectable`. */
  disabled?: boolean;
  /**
   * Renders a Radio or Checkbox pinned to the card's top-left corner and
   * reserves matching left padding on CardHeader/CardContent/CardFooter
   * so their content clears it. `selected`/`onSelectedChange` control
   * it — Card keeps no internal state and does not enforce mutual
   * exclusivity for `'radio'` across Cards (each Card gets its own
   * isolated Radix RadioGroup, purely for the checked visual); the
   * caller owns single-select behavior across a group of Cards.
   */
  selectable?: CardSelectable;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Accessible name for the selection control. Required when `selectable` is set. */
  selectLabel?: string;
  /**
   * Pointer effect, mouse only (touch and keyboard see the plain card):
   * `tilt` — the card turns up to 10° toward the cursor, with a faint primary light under it;
   * `spotlight` — a primary glow follows the cursor across the surface;
   * `lift` — the card rises 6px with a larger shadow.
   * Off with prefers-reduced-motion (the spotlight stays, it doesn't move
   * anything) and on a disabled card.
   */
  effect?: CardEffect;
}

export type CardEffect = 'tilt' | 'spotlight' | 'lift';

const MAX_TILT = 10;

// The glow and the glare are one ::before layer under the content, placed
// with CSS variables the pointer handler writes (no React re-render).
const EFFECT_CLASS: Record<CardEffect, string> = {
  tilt: cn(
    'transition-[border-color,box-shadow,transform] duration-standard ease-enter hover:shadow-elevation-lg',
    // Only while hovered: a resting 3D transform makes the text render soft.
    'hover:[transform:perspective(700px)_rotateX(var(--card-tilt-x,0deg))_rotateY(var(--card-tilt-y,0deg))]',
    // A faint primary light where the cursor is, under the content.
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:content-['']",
    'before:bg-[radial-gradient(18rem_circle_at_var(--card-px,50%)_var(--card-py,0%),color-mix(in_oklab,var(--color-icon-icon-primary)_10%,transparent),transparent_70%)]',
    'before:opacity-0 before:transition-opacity before:duration-moderate hover:before:opacity-100',
    'motion-reduce:transform-none! motion-reduce:before:hidden',
  ),
  spotlight: cn(
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:content-['']",
    'before:bg-[radial-gradient(18rem_circle_at_var(--card-px,-999px)_var(--card-py,-999px),color-mix(in_oklab,var(--color-icon-icon-primary)_10%,transparent),transparent_70%)]',
    'before:opacity-0 before:transition-opacity before:duration-moderate hover:before:opacity-100',
    'hover:border-[var(--color-border-border-primary)]',
  ),
  lift: cn(
    'transition-[border-color,box-shadow,translate] duration-slower ease-spring',
    'hover:-translate-y-1.5 hover:shadow-elevation-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  ),
};

export function Card({
  className,
  size,
  tone: toneProp = 'neutral',
  appearance = 'outlined',
  action,
  href,
  interactive = false,
  disabled = false,
  selectable,
  selected = false,
  onSelectedChange,
  selectLabel,
  effect: effectProp,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: CardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const effect = disabled ? undefined : effectProp;
  const tracksPointer = effect === 'tilt' || effect === 'spotlight';
  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const el = rootRef.current;
    if (!tracksPointer || event.pointerType !== 'mouse' || !el) return;
    const r = el.getBoundingClientRect();
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    el.style.setProperty('--card-px', `${x}px`);
    el.style.setProperty('--card-py', `${y}px`);
    if (effect === 'tilt') {
      el.style.setProperty('--card-tilt-x', `${(y / r.height - 0.5) * -MAX_TILT * 2}deg`);
      el.style.setProperty('--card-tilt-y', `${(x / r.width - 0.5) * MAX_TILT * 2}deg`);
    }
  };
  const settle = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    rootRef.current?.style.setProperty('--card-tilt-x', '0deg');
    rootRef.current?.style.setProperty('--card-tilt-y', '0deg');
  };
  // `href` is a legacy/convenience shorthand; an explicit `action` always wins.
  // A disabled card never resolves an action or a selection control.
  const resolvedAction: CardPrimaryAction | undefined = disabled ? undefined : (action ?? (href ? { type: 'link', href } : undefined));
  const isInteractive = !disabled && (interactive || resolvedAction != null);
  const isSelectedFilter = resolvedAction?.type === 'filter' && resolvedAction.active;
  const overlayClassName = 'absolute inset-0 z-0 rounded-[inherit] border-0 bg-transparent p-0 outline-none';
  const resolvedSelectable = disabled ? undefined : selectable;
  const isFilled = appearance === 'filled';
  const tone: CardTone = isFilled ? 'neutral' : toneProp;

  return (
    <div
      data-slot="card"
      data-size={size || undefined}
      data-tone={tone !== 'neutral' ? tone : undefined}
      data-appearance={isFilled ? 'filled' : undefined}
      data-surface={isFilled ? 'primary' : undefined}
      data-interactive={isInteractive || undefined}
      data-legacy-interactive={interactive || undefined}
      data-action={resolvedAction?.type}
      data-filter-active={isSelectedFilter || undefined}
      data-disabled={disabled || undefined}
      data-selectable={resolvedSelectable || undefined}
      data-effect={effect}
      aria-disabled={disabled || undefined}
      ref={rootRef}
      onPointerMove={track}
      onPointerLeave={settle}
      className={cn(
        'group/card isolate relative min-w-0 max-w-full rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid',
        'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text)] shadow-elevation-xs',
        TONE_CLASS[tone],
        isFilled && FILLED_CLASS,
        isInteractive && cn('transition-[border-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none', TONE_HOVER_CLASS[tone]),
        // After the interactive transition so its property list wins.
        effect && EFFECT_CLASS[effect],
        isSelectedFilter && TONE_SELECTED_CLASS[tone],
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
        // Selectable: content clears the control by exactly the card's own
        // side padding + control width + a 12px gap (was an approximate pl-12).
        resolvedSelectable &&
          cn(
            '[--card-select-inset:calc(var(--spacing)*5+round(nearest,(var(--spacing)*5-8px)*var(--size-density-density-space-delta,0),2px)+var(--size-size-control-size-control-xs)+var(--spacing)*3+round(nearest,(var(--spacing)*3-8px)*var(--size-density-density-space-delta,0),2px))]',
            'data-[size=sm]:[--card-select-inset:calc(var(--spacing)*3+round(nearest,(var(--spacing)*3-8px)*var(--size-density-density-space-delta,0),2px)+var(--size-size-control-size-control-xs)+var(--spacing)*3+round(nearest,(var(--spacing)*3-8px)*var(--size-density-density-space-delta,0),2px))]',
            'data-[size=md]:[--card-select-inset:calc(var(--spacing)*4+round(nearest,(var(--spacing)*4-8px)*var(--size-density-density-space-delta,0),2px)+var(--size-size-control-size-control-xs)+var(--spacing)*3+round(nearest,(var(--spacing)*3-8px)*var(--size-density-density-space-delta,0),2px))]',
            // With a CardMedia the control moves onto the image (below), so
            // the text column keeps the normal side padding.
            'has-[>[data-slot=card-media]]:[--card-select-inset:calc(var(--spacing)*5+round(nearest,(var(--spacing)*5-8px)*var(--size-density-density-space-delta,0),2px))]',
            'has-[>[data-slot=card-media]]:data-[size=sm]:[--card-select-inset:calc(var(--spacing)*3+round(nearest,(var(--spacing)*3-8px)*var(--size-density-density-space-delta,0),2px))]',
            'has-[>[data-slot=card-media]]:data-[size=md]:[--card-select-inset:calc(var(--spacing)*4+round(nearest,(var(--spacing)*4-8px)*var(--size-density-density-space-delta,0),2px))]',
          ),
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
          data-control={resolvedSelectable}
          className={cn(
            // One title line tall, in the title's own text size, with the
            // control centered in it — so it sits level with the title.
            'absolute z-[1] flex h-[1lh] items-center text-body-l',
            'group-data-[size=sm]/card:text-body-s group-data-[size=md]/card:text-body-s',
            'start-5 top-5',
            'group-data-[size=sm]/card:start-3 group-data-[size=sm]/card:top-2.5',
            'group-data-[size=md]/card:start-4 group-data-[size=md]/card:top-3',
            'group-data-[size=lg]/card:start-5 group-data-[size=lg]/card:top-4',
            // On a media card: top-right corner of the image, on a small
            // surface chip so the control keeps its contrast over any photo.
            'group-has-[>[data-slot=card-media]]/card:start-auto! group-has-[>[data-slot=card-media]]/card:top-3! group-has-[>[data-slot=card-media]]/card:end-3 group-has-[>[data-slot=card-media]]/card:h-auto',
            // Nested radius = control radius + padding (4 + 4 = 8px) so the curves
            // run parallel; a radio's chip is a circle like the radio itself.
            'group-has-[>[data-slot=card-media]]/card:rounded-[var(--size-border-radius-border-radius-xl)] group-has-[>[data-slot=card-media]]/card:data-[control=radio]:rounded-full group-has-[>[data-slot=card-media]]/card:bg-[var(--color-bg-surface-bg-surface)] group-has-[>[data-slot=card-media]]/card:p-1 group-has-[>[data-slot=card-media]]/card:shadow-elevation-sm',
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
        // Reserves room for Card's absolutely-positioned selection control:
        // --card-select-inset is set on the Card per size (padding + control
        // + 12px gap).
        'group-data-[selectable]/card:ps-[var(--card-select-inset)]',
        // Divider — an inset line via an absolutely positioned ::after,
        // not a full-bleed border (Мария's call: dividers get padding,
        // never run edge-to-edge). `inset-x-*` mirrors this header's own
        // left/right padding above, step for step, own-size override
        // included, so the line's ends always line up with the content.
        (divider === undefined || divider) &&
          cn(
            "after:absolute after:bottom-0 after:h-px after:bg-[var(--color-border-border-subtler)] after:content-['']",
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

const TONE_LINK_HOVER: Record<CardTone, string> = {
  neutral: 'group-data-[tone=neutral]/card:hover:text-[var(--color-text-text-link)]',
  info: 'group-data-[tone=info]/card:hover:text-[var(--color-text-text-link)]',
  success: 'group-data-[tone=success]/card:hover:text-[var(--color-text-text-success)]',
  warning: 'group-data-[tone=warning]/card:hover:text-[var(--color-text-text-warning)]',
  danger: 'group-data-[tone=danger]/card:hover:text-[var(--color-text-text-danger)]',
};

export function CardLink({ className, asChild = false, ...props }: CardLinkProps) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      data-slot="card-link"
      className={cn(
        "rounded-[var(--size-border-radius-border-radius-sm)] outline-none after:absolute after:inset-0 after:content-[''] hover:text-[var(--color-text-text-link)]",
        Object.values(TONE_LINK_HOVER).join(' '),
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
        'group-data-[selectable]/card:ps-[var(--card-select-inset)]',
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
        'group-data-[selectable]/card:ps-[var(--card-select-inset)]',
        // Divider — see the matching comment in CardHeader: an inset
        // ::after line, not a full-bleed border.
        "after:absolute after:top-0 after:h-px after:bg-[var(--color-border-border-subtler)] after:content-['']",
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
  /** Banner height. Defaults to 180px (on the 4px grid). */
  height?: number | string;
}

export function CardMedia({ className, height = 180, style, alt = '', ...props }: CardMediaProps) {
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
 * centered on that boundary line. Place it as a **direct child of
 * `Card`**, between `CardMedia` (or the top of the
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
