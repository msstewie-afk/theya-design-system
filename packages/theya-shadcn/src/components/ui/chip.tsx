import { forwardRef, useId, useState, cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Xmark, Check } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import type { StatusTone } from './status-dot';

/**
 * A compact pill for one value that can be selected and/or removed —
 * a status, a selected option, a suggestion. Unlike a static label
 * pill, Chip is interactive by default: toggles on click or Enter/Space.
 * The outer element is always a plain <span> (or Slot via asChild) —
 * the actual pressable control is a real <button>, stretched over the
 * whole pill (absolute inset-0), so a trailing ChipRemove (also a real
 * button) sits as its sibling instead of nesting inside another
 * interactive element (axe: nested-interactive; previously this used
 * role="button" on the outer span for the same button-in-button
 * reason, which avoided invalid HTML but still tripped nested-interactive).
 *
 * When interactive AND carrying a ChipRemove, give the Chip an
 * explicit aria-label matching its visible text — otherwise the name
 * would recurse into ChipRemove's own "Remove X" label, producing
 * "X Remove X" without it.
 */
export type ChipTone = StatusTone;
export type ChipAppearance = 'tonal' | 'filled';
export type ChipSize = 'sm' | 'md' | 'lg';

// Base (unselected) look for `appearance="tonal"` — the tinted "tonal"
// background, matching Button's own `appearance="tonal"` per-tone colors
// (`neutral` here maps to Button's `tone="neutral"`, `danger` to
// `tone="danger"`). Hover states come from HOVER_CLASS below, same
// source (Button's tonal compound variants).
// All six borderless at rest (Мария's call — neutral used to carry a
// visible border here while every other tone didn't; the `bordered` prop
// below is the deliberate opt-in for a bordered tonal chip, uniformly
// across all tones, rather than one tone silently defaulting to it).
const TONE_CLASS: Record<ChipTone, string> = {
  neutral: 'border-transparent bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text-subtler)]',
  primary: 'border-transparent bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-text-text-link-on-tonal)]',
  success: 'border-transparent bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-text-text-success-on-tonal)]',
  warning: 'border-transparent bg-[var(--color-bg-warning-bg-warning-subtle)] text-[var(--color-text-text-warning-on-tonal)]',
  danger: 'border-transparent bg-[var(--color-bg-danger-bg-danger-subtle)] text-[var(--color-text-text-danger-on-tonal)]',
  info: 'border-transparent bg-[var(--color-cyan-cyan-050)] text-[var(--color-cyan-cyan-900)] [[data-theme=dark]_&]:bg-[var(--color-cyan-cyan-800)] [[data-theme=dark]_&]:text-[var(--color-cyan-cyan-200)]',
};

// Border color per tone for the `bordered` prop — a real per-tone border
// token (not the tinted bg), matching Button/Card's own tone-border
// vocabulary (--color-border-border-{primary,success,warning,danger,info}).
// Applied on top of TONE_CLASS/SOLID_TONE_CLASS's `border-transparent`,
// last in the class list so it wins the border-color slot.
const BORDER_TONE_CLASS: Record<ChipTone, string> = {
  neutral: 'border-[var(--color-border-border-subtle)]',
  primary: 'border-[var(--color-border-border-primary)]',
  success: 'border-[var(--color-border-border-success)]',
  warning: 'border-[var(--color-border-border-warning)]',
  danger: 'border-[var(--color-border-border-danger)]',
  info: 'border-[var(--color-border-border-info)]',
};

// "Solid look" — full-saturation tone background + on-dark text, matching
// Button's `appearance="filled"` per-tone colors 1:1 (including its
// accessibility-adjusted Success hex and the dark-text-on-light Warning
// pairing). Used for `appearance="filled"` at rest, AND for a *selected*
// `appearance="tonal"` (tonal) chip — Мария's call: a selected tonal chip
// should read as solid, not stay in its tinted state.
export const SOLID_TONE_CLASS: Record<ChipTone, string> = {
  neutral: 'border-transparent bg-[var(--color-bg-neutral-bg-neutral-strong)] text-[var(--color-text-text-on-dark)]',
  primary: 'border-transparent bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-dark)]',
  // Was a hand-picked hex (#448018) matching Button's OLD workaround for a
  // raw-token contrast failure (4.37:1 with white text, under WCAG AA's
  // 4.5:1) — Button has since been rewired to the real token now that the
  // green primitive ramp was recalibrated (light 4.87:1, dark 11.8:1,
  // 2026-09-26), but Chip was never updated to match and kept the stale
  // hardcoded hex, which is also a different, duller green than the rest of
  // the palette (Мария: "без токенов, и это наверное наследие Solid, другой
  // зеленый тон"). Fixed to the real token, mirroring Button 1:1.
  success: 'border-transparent bg-[var(--color-bg-success-bg-success)] text-[var(--color-text-text-on-dark)]',
  // Warning fill is light in light theme but a punchy dark-orange primitive
  // in dark theme — text-on-dark clears contrast at every state and matches
  // every other solid tone here; mirrors Button's own fix (2026-09-26).
  warning: 'border-transparent bg-[var(--color-bg-warning-bg-warning)] text-[var(--color-text-text-warning)] [[data-theme=dark]_&]:text-[var(--color-text-text-on-dark)]',
  danger: 'border-transparent bg-[var(--color-bg-danger-bg-danger)] text-[var(--color-text-text-on-dark)]',
  info: 'border-transparent bg-[var(--color-bg-info-bg-info)] text-[var(--color-cyan-cyan-900)]',
};

// Hover shades, one set per "look" (subtle/solid), lifted directly from
// Button's tonal/filled compound variants so Chip's hover states never
// drift from Button's — see button.tsx's own TONAL/FILLED sections.
const HOVER_CLASS: Record<'tonal' | 'filled', Record<ChipTone, string>> = {
  tonal: {
    neutral: 'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle-hover)]',
    primary: 'hover:bg-[var(--color-bg-primary-bg-primary-subtle-hover)]',
    success: 'hover:bg-[var(--color-bg-success-bg-success-subtle-hover)]',
    warning: 'hover:bg-[var(--color-bg-warning-bg-warning-subtle-hover)]',
    danger: 'hover:bg-[var(--color-bg-danger-bg-danger-subtle-hover)]',
    info: 'hover:bg-[var(--color-cyan-cyan-100)] [[data-theme=dark]_&]:hover:bg-[var(--color-cyan-cyan-700)]',
  },
  filled: {
    neutral: 'hover:bg-[var(--color-bg-neutral-bg-neutral-strong-hover)]',
    primary: 'hover:bg-[var(--color-bg-primary-bg-primary-hover)]',
    success: 'hover:bg-[var(--color-bg-success-bg-success-hover)]',
    warning: 'hover:bg-[var(--color-bg-warning-bg-warning-hover)]',
    danger: 'hover:bg-[var(--color-bg-danger-bg-danger-hover)]',
    info: 'hover:bg-[var(--color-bg-info-bg-info-hover)]',
  },
};

/** Marks a consumer-provided leading icon as decorative, same rule Button's own `decorativeIcon` uses. */
function decorativeIcon(node: ReactNode): ReactNode {
  if (!isValidElement(node)) return node;
  const props = node.props as Record<string, unknown>;
  if ('aria-hidden' in props || 'aria-label' in props) return node;
  return cloneElement(node as ReactElement<Record<string, unknown>>, { 'aria-hidden': 'true' });
}

export interface ChipProps extends Omit<React.ComponentProps<'span'>, 'onClick' | 'onKeyDown'> {
  tone?: ChipTone;
  /** `'tonal'` (default) — tinted background, matches Badge's default look. `'filled'` — full tone background + on-dark text. */
  appearance?: ChipAppearance;
  /** Adds a tone-colored border on top of `appearance`. Off by default — every tone (including neutral) is borderless at rest. */
  bordered?: boolean;
  size?: ChipSize;
  /** Leading icon, before the label. Unstyled — sized automatically to the chip's size variant. Replaced by a checkmark when a `appearance="filled"` chip is selected (see `pressed`/`defaultPressed`). */
  icon?: ReactNode;
  interactive?: boolean;
  /** Interactive chips toggle (aria-pressed) by default. Pass false for a chip that performs an action instead, e.g. opens an editor — it is then a plain button with no pressed state. */
  toggleable?: boolean;
  asChild?: boolean;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
}

export function Chip({
  className,
  tone = 'neutral',
  appearance = 'tonal',
  bordered = false,
  size = 'md',
  icon,
  interactive = true,
  toggleable = true,
  pressed,
  defaultPressed,
  onPressedChange,
  asChild = false,
  disabled,
  onClick,
  onKeyDown,
  children,
  ...props
}: ChipProps) {
  const { 'aria-label': ariaLabelProp, ...restProps } = props;
  const contentId = useId();
  const [internalPressed, setInternalPressed] = useState(defaultPressed ?? false);
  const isPressed = pressed !== undefined ? pressed : internalPressed;
  const isPressable = interactive && !asChild;
  const isSelected = isPressable && isPressed;

  const activate = () => {
    if (disabled || !toggleable) return;
    if (pressed === undefined) setInternalPressed((p) => !p);
    onPressedChange?.(!isPressed);
  };

  const Comp = asChild ? Slot : 'span';

  // A selected tonal (subtle) chip reads as solid; a solid chip is always
  // solid. Only the base appearance/selection state decide the look — the
  // colors themselves are static per render, no CSS-side data-attribute
  // branching needed.
  const look: 'tonal' | 'filled' = appearance === 'filled' || isSelected ? 'filled' : 'tonal';
  // Checkmark swap-in is narrower: only an actually solid-appearance chip
  // gets it when selected (Мария's call) — a tonal chip that merely *looks*
  // solid because it's selected keeps its own icon/no-icon as passed.
  const showSelectedCheck = appearance === 'filled' && isSelected;
  const displayIcon = showSelectedCheck ? <Check /> : icon;

  return (
    <Comp
      id={isPressable ? contentId : undefined}
      data-pressed={isSelected ? true : undefined}
      data-disabled={isPressable && disabled ? true : undefined}
      // Non-pressable chips have no overlay button to carry this instead —
      // a pressable chip's aria-label moves to that button below.
      aria-label={isPressable ? undefined : ariaLabelProp}
      onClick={isPressable ? undefined : onClick}
      onKeyDown={isPressable ? undefined : onKeyDown}
      className={cn(
        'relative inline-flex w-fit max-w-full shrink-0 items-center gap-1 border border-solid pl-2',
        'font-body text-body-xs font-medium whitespace-nowrap outline-none',
        'transition-[background-color,border-color,color] duration-standard ease-enter motion-reduce:transition-none',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        // Guarded selector (matches Button/corp's own pattern): only sizes a
        // *bare* icon (no existing `size-*` class, e.g. ChipRemove's inner
        // Button icon) — a leading icon passed unstyled falls through to this.
        size === 'lg' ? '[&_svg:not([class*="size-"])]:size-3.5' : '[&_svg:not([class*="size-"])]:size-3',
        size === 'sm'
          ? // 1px more than the shared radius-sm token (2px) — Мария's call
            // specifically for Chip's small size; not changing the shared
            // token since that would also shift every other radius-sm
            // consumer (Checkbox, etc.) library-wide.
            'h-6 rounded-[3px] pr-2'
          : size === 'lg'
            ? 'h-8 rounded-[var(--size-border-radius-border-radius-lg)] pr-2.5 text-body-s'
            : 'h-[26px] rounded-[var(--size-border-radius-border-radius-md)] pr-2',
        look === 'filled' ? SOLID_TONE_CLASS[tone] : TONE_CLASS[tone],
        bordered && BORDER_TONE_CLASS[tone],
        isPressable &&
          cn('cursor-pointer', HOVER_CLASS[look][tone], 'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'),
        className,
      )}
      {...restProps}
    >
      {isPressable && (
        // The real pressable control — a stretched <button>, not
        // role="button" on Comp itself. Comp can carry a real nested
        // <button> (ChipRemove, given its own `relative z-10` below) as a
        // sibling of this overlay without nesting one interactive-role
        // element inside another (axe: nested-interactive). Name comes
        // from an explicit aria-label when given (required once a
        // ChipRemove sibling exists, see ChipRemove's own doc comment) —
        // otherwise from this chip's own visible content, same as the old
        // content-derived role="button" name.
        <button
          type="button"
          aria-pressed={toggleable ? isPressed : undefined}
          disabled={disabled || undefined}
          aria-label={ariaLabelProp}
          aria-labelledby={ariaLabelProp ? undefined : contentId}
          onClick={(event) => {
            onClick?.(event);
            if (!disabled) activate();
          }}
          onKeyDown={onKeyDown}
          className="absolute inset-0 outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]"
        />
      )}
      {displayIcon != null && decorativeIcon(displayIcon)}
      {children}
    </Comp>
  );
}

/**
 * The trailing "x" for a removable Chip: a 24px hit target (WCAG 2.5.8)
 * around a 14px icon. Always pass an accessible name
 * (aria-label="Remove {label}") — Chip's own label isn't available
 * here to derive one automatically. Its click stops propagation so
 * removing a chip never also toggles an interactive parent's pressed
 * state.
 */
// forwardRef: a wrapper over a native control must pass refs through (focus
// by ref, Radix asChild triggers); a plain function drops them under React 18.
export const ChipRemove = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(function ChipRemove({ className, onClick, children, type: _nativeType, ...props }, ref) {
  return (
    <Button
      ref={ref}
      appearance="ghost"
      size="sm"
      iconOnly
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      className={cn('relative z-10 -mr-2 shrink-0 text-[var(--color-icon-icon-subtle)]', className)}
      leftIcon={children ?? <Xmark width={14} height={14} />}
      {...props}
    />
  );
});
