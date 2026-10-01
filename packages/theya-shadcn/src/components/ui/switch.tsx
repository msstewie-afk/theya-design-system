import { forwardRef, useId } from 'react';
import { useMissingNameWarning } from '@/lib/a11y-dev';
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'iconoir-react';
import { cn } from '@/lib/utils';

/** Requires: npm i @radix-ui/react-switch */

const switchVariants = cva(
  [
    'relative inline-flex h-[20px] w-[36px] shrink-0 items-center rounded-full border-0',
    'bg-[var(--color-bg-secondary-bg-secondary)]',
    // Off — big jump to a dark fill on hover per the Figma spec.
    'hover:not-disabled:data-[state=unchecked]:bg-[var(--color-bg-secondary-bg-secondary-hover)]',
    // Disabled off — combined with data-state so specificity always wins
    // over the checked/hover color rules (same fix as Checkbox/Radio).
    'disabled:data-[state=unchecked]:bg-[var(--color-bg-secondary-bg-secondary-subtle)]',
    'transition-[background-color,transform] duration-150 ease-out motion-reduce:transition-none',
    'cursor-pointer disabled:cursor-not-allowed',
    'motion-safe:active:not-disabled:scale-[0.95]',
    'focus-visible:outline-none',
    'focus-visible:data-[state=unchecked]:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
  ],
  {
    variants: {
      tone: {
        primary: '',
        warning: '',
        danger: '',
      },
    },
    compoundVariants: [
      {
        tone: 'primary',
        class: [
          'data-[state=checked]:bg-[var(--color-bg-primary-bg-primary)]',
          'hover:not-disabled:data-[state=checked]:bg-[var(--color-bg-primary-bg-primary-hover)]',
          'disabled:data-[state=checked]:bg-[var(--color-bg-primary-bg-primary-subtle)] disabled:data-[state=checked]:border-transparent',
          'focus-visible:data-[state=checked]:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        ],
      },
      {
        tone: 'warning',
        class: [
          'data-[state=checked]:bg-[var(--color-bg-warning-bg-warning)]',
          'hover:not-disabled:data-[state=checked]:bg-[var(--color-bg-warning-bg-warning-hover)]',
          'disabled:data-[state=checked]:bg-[var(--color-bg-warning-bg-warning-subtle)] disabled:data-[state=checked]:border-transparent',
          // No low-alpha focus-ring-warning token exists — solid halo at
          // border-warning instead, same reasoning as Checkbox's error ring.
          'focus-visible:data-[state=checked]:shadow-[0_0_0_4px_var(--color-border-border-warning)]',
        ],
      },
      {
        tone: 'danger',
        class: [
          'data-[state=checked]:bg-[var(--color-bg-danger-bg-danger)]',
          'hover:not-disabled:data-[state=checked]:bg-[var(--color-bg-danger-bg-danger-hover)]',
          'disabled:data-[state=checked]:bg-[var(--color-bg-danger-bg-danger-subtle)] disabled:data-[state=checked]:border-transparent',
          'focus-visible:data-[state=checked]:shadow-[0_0_0_4px_var(--color-border-border-danger)]',
        ],
      },
    ],
    defaultVariants: { tone: 'primary' },
  },
);

export interface SwitchProps
  extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  label?: ReactNode;
  description?: ReactNode;
  /** Shows a checkmark inside the thumb when on. Default true — set false to hide it. */
  checkIcon?: boolean;
}

export const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  function Switch(
    {
      tone = 'primary',
      checkIcon = true,
      label,
      description,
      disabled,
      className,
      id,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) {

    const generatedId = useId();
    const resolvedId = id ?? generatedId;
    useMissingNameWarning('Switch', resolvedId);
    const descriptionId = description ? `${resolvedId}-description` : undefined;

    const track = (
      <SwitchPrimitive.Root
        ref={ref}
        id={resolvedId}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={descriptionId}
        className={cn(switchVariants({ tone }), className)}
        {...rest}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'group relative flex items-center justify-center',
            'size-[14px] rounded-full bg-[var(--color-icon-icon-on-dark)] shadow-elevation-sm',
            'translate-x-[3px] data-[state=checked]:translate-x-[19px]',
            'transition-transform duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none',
          )}
        >
          {checkIcon && (
            <Check
              width={10}
              height={10}
              aria-hidden="true"
              className={cn(
                // Thumb is a fixed white circle in both themes (bg-icon-
                // on-dark, a primitive white, not theme-reactive) — the
                // checkmark needs a fixed dark color to match, not the
                // theme-reactive icon-icon token (slate-500 in light, but
                // slate-005/near-white in dark, so it vanished against the
                // white thumb once dark mode flipped it). No semantic
                // "dark icon on a light surface" token exists yet, so this
                // references the black primitive directly, same way the
                // thumb itself already does for white.
                'text-[var(--color-black)]',
                'scale-50 opacity-0 transition-[opacity,transform] duration-100 ease-out motion-reduce:transition-none',
                'group-data-[state=checked]:scale-100 group-data-[state=checked]:opacity-100',
                'group-data-[state=checked]:duration-200 group-data-[state=checked]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
              )}
            />
          )}
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
    );

    if (!label) return track;

    return (
      <div className="inline-flex flex-col items-start gap-[var(--size-margin-margin-2xs)]">
        <label
          htmlFor={resolvedId}
          className={cn(
            'inline-flex items-center gap-[var(--size-margin-margin-xs)] cursor-pointer',
            disabled && 'cursor-not-allowed',
          )}
        >
          {track}
          <span className={cn(disabled && 'text-[var(--color-text-text-subtler)] opacity-[0.48]')}>{label}</span>
        </label>
        {description && (
          <span id={descriptionId} className="font-body font-normal text-body-s text-[var(--color-text-text-subtler)] pl-[44px]">
            {description}
          </span>
        )}
      </div>
    );
  },
);
