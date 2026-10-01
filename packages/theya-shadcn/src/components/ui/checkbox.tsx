import { forwardRef, useId } from 'react';
import { useMissingNameWarning } from '@/lib/a11y-dev';
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Minus } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * Rebuilt on Radix Checkbox instead of a visually-hidden native <input>.
 * Radix's Root renders as a real <button role="checkbox"> and natively
 * supports a three-state `checked` (true | false | 'indeterminate') —
 * so indeterminate no longer needs a manual useEffect setting
 * `.indeterminate` on a ref.
 *
 * State is controlled via Radix's own `checked` / `defaultChecked` /
 * `onCheckedChange` (not the native `checked`/`onChange` pair, since the
 * interactive element is a button, not an <input>). `indeterminate` is
 * kept as a convenience alias for checked="indeterminate".
 *
 * On-primary surface: wrap an ancestor in `data-surface="primary"` (e.g.
 * DataTableToolbar's selected/bulk-action bar, which is itself painted
 * with --color-bg-primary-bg-primary) and this checkbox reverses its
 * palette automatically — white outline/fill, primary-blue check mark.
 * This is done with the `[[data-surface=primary]_&]:` ancestor variant
 * rather than remapping --color-bg-primary-bg-primary itself in
 * globals.css, because that same token colors the ancestor bar's own
 * background — a blanket remap scoped to that element would repaint the
 * bar white along with the checkbox. Scoping per-utility to "descendant
 * of [data-surface=primary]" only touches the checkbox.
 *
 * Requires: npm i @radix-ui/react-checkbox
 */

const checkboxVariants = cva(
  [
    'peer relative inline-flex shrink-0 items-center justify-center',
    'rounded-[var(--size-border-radius-border-radius-md)]',
    'bg-[var(--color-bg-input-bg-input)] border border-solid',
    'transition-[background-color,border-color,box-shadow] duration-150 ease-out',
    'motion-reduce:transition-none',
    'cursor-pointer disabled:cursor-not-allowed',
    'motion-safe:active:not-disabled:scale-[0.9]',
    'focus-visible:outline-none',
    // Disabled always wins, regardless of checked/indeterminate/error —
    // each combined with data-[state=*] so it has the same (two-attribute)
    // specificity as the checked/error color rules below and can't lose
    // to them regardless of class source order. This is the fix for the
    // bug where Disabled+checked/indeterminate stayed blue instead of
    // turning gray like Disabled+unchecked.
    'disabled:data-[state=unchecked]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
    'disabled:data-[state=unchecked]:border-[var(--color-border-border-subtle)]',
    'disabled:data-[state=checked]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
    'disabled:data-[state=checked]:border-[var(--color-border-border-subtle)]',
    'disabled:data-[state=indeterminate]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
    'disabled:data-[state=indeterminate]:border-[var(--color-border-border-subtle)]',
  ],
  {
    variants: {
      size: {
        sm: 'size-[16px]',
        md: 'size-[var(--size-size-control-size-control-xs)]', // 20px
      },
      error: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        error: false,
        class: [
          // WCAG 1.4.11 non-text contrast fix: border-subtle (slate-100,
          // #bec0e9) was only 1.76:1 on white — well under the 3:1 floor
          // for a UI-component boundary. border-default (slate-400
          // light / slate-300 dark) clears 3:1 in both themes.
          'border-[var(--color-border-border-default)]',
          'hover:not-disabled:data-[state=unchecked]:border-[var(--color-border-border-primary)]',
          'data-[state=checked]:bg-[var(--color-bg-primary-bg-primary)] data-[state=checked]:border-transparent',
          'data-[state=indeterminate]:bg-[var(--color-bg-primary-bg-primary)] data-[state=indeterminate]:border-transparent',
          'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
          // --- on-primary surface overrides (not disabled, not error) ---
          // Unchecked: default border swaps for the on-primary outline.
          '[[data-surface=primary]_&]:not-disabled:data-[state=unchecked]:border-[var(--color-border-border-on-primary)]',
          '[[data-surface=primary]_&]:hover:not-disabled:data-[state=unchecked]:border-[var(--color-border-border-on-primary)]',
          // Checked/indeterminate: white fill instead of the brand-blue
          // fill, since the surface itself already is that blue.
          '[[data-surface=primary]_&]:data-[state=checked]:bg-[var(--color-bg-primary-on-primary)]',
          '[[data-surface=primary]_&]:data-[state=checked]:border-transparent',
          '[[data-surface=primary]_&]:data-[state=indeterminate]:bg-[var(--color-bg-primary-on-primary)]',
          '[[data-surface=primary]_&]:data-[state=indeterminate]:border-transparent',
          // Focus ring: low-alpha white instead of the brand focus ring,
          // which would be nearly invisible against the primary fill.
          '[[data-surface=primary]_&]:focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring-on-primary)]',
        ],
      },
      {
        error: true,
        class: [
          'border-[var(--color-border-border-danger)]',
          'data-[state=checked]:bg-[var(--color-bg-danger-bg-danger)] data-[state=checked]:border-transparent',
          'data-[state=indeterminate]:bg-[var(--color-bg-danger-bg-danger)] data-[state=indeterminate]:border-transparent',
          // focus-ring-error (rgba(208,45,75,.3)) is only 1.60:1 on white,
          // same problem as the default ring — bumped to a solid halo at
          // full border-danger color instead of the low-alpha token.
          'focus-visible:shadow-[0_0_0_4px_var(--color-border-border-danger)]',
        ],
      },
    ],
    defaultVariants: {
      size: 'md',
      error: false,
    },
  },
);

export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'checked'>,
    VariantProps<typeof checkboxVariants> {
  /** Convenience for checked="indeterminate" — shows a dash instead of a checkmark. */
  indeterminate?: boolean;
  /** Controlled checked state. Accepts a plain boolean, or 'indeterminate' directly. */
  checked?: boolean | 'indeterminate';
  /** Label shown next to the box. Omit for a bare checkbox with no text. */
  label?: ReactNode;
  /** Small helper text below the label — only rendered when `label` is set. */
  description?: ReactNode;
}

export const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  function Checkbox(
    {
      indeterminate = false,
      checked,
      size = 'md',
      error = false,
      label,
      description,
      disabled,
      className,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref,
  ) {

    const resolvedChecked = indeterminate ? 'indeterminate' : checked;
    const iconSize = size === 'sm' ? 12 : 16;

    const generatedId = useId();
    const resolvedId = id ?? generatedId;
    useMissingNameWarning('Checkbox', resolvedId);
    const descriptionId = description ? `${resolvedId}-description` : undefined;

    const box = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={resolvedId}
        disabled={disabled}
        checked={resolvedChecked}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        // Ties the checkbox to its description text (WCAG 1.3.1 / 4.1.2) —
        // without this, a screen reader announces the label but never
        // reads the description span, since it's just a visual sibling.
        aria-describedby={descriptionId}
        className={cn(checkboxVariants({ size, error }), className)}
        {...rest}
      >
        {/* forceMount + CSS-driven visibility instead of Radix's default
            conditional mount/unmount — the icon fades/scales in via
            data-state instead of being inserted/removed from the DOM,
            which is what was causing the docs canvas height to jump on
            every checked/unchecked toggle. */}
        <CheckboxPrimitive.Indicator
          forceMount
          className={cn(
            'flex items-center justify-center',
            disabled
              ? 'text-[var(--color-icon-icon-subtle)]'
              : [
                  // Default (on the ordinary neutral-input / brand-blue
                  // fill): white check, same as before.
                  'text-[var(--color-icon-icon-on-dark)]',
                  // On a primary surface the box itself is now filled
                  // white (see checkboxVariants above), so the mark
                  // needs to invert to the brand-blue icon color to
                  // stay visible against it.
                  '[[data-surface=primary]_&]:text-[var(--color-icon-icon-primary)]',
                ],
            'scale-50 opacity-0 transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none',
            'data-[state=checked]:duration-200 data-[state=checked]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
            'data-[state=indeterminate]:duration-200 data-[state=indeterminate]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
            'data-[state=checked]:scale-100 data-[state=checked]:opacity-100',
            'data-[state=indeterminate]:scale-100 data-[state=indeterminate]:opacity-100',
            disabled && 'opacity-40 data-[state=unchecked]:opacity-0',
          )}
        >
          {resolvedChecked === 'indeterminate' ? (
            <Minus width={iconSize} height={iconSize} aria-hidden="true" />
          ) : (
            <Check width={iconSize} height={iconSize} aria-hidden="true" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!label) {
      return box;
    }

    return (
      <div className="inline-flex flex-col items-start gap-[var(--size-margin-margin-2xs)]">
        <label
          htmlFor={resolvedId}
          className={cn(
            'inline-flex items-center gap-[var(--size-margin-margin-xs)] cursor-pointer',
            disabled && 'cursor-not-allowed',
          )}
        >
          {box}
          <span
            className={cn(
              disabled && 'text-[var(--color-text-text-subtler)] opacity-[0.48]',
              '[[data-surface=primary]_&]:text-[var(--color-text-text-on-primary)]',
            )}
          >
            {label}
          </span>
        </label>
        {description && (
          <span
            id={descriptionId}
            className={cn(
              'font-body font-normal text-body-s text-[var(--color-text-text-subtler)]',
              size === 'sm' ? 'pl-[24px]' : 'pl-[28px]',
              '[[data-surface=primary]_&]:text-[var(--color-text-text-subtle-on-primary)]',
            )}
          >
            {description}
          </span>
        )}
      </div>
    );
  },
);
