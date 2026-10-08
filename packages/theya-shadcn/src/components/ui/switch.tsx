'use client';

import { forwardRef, useId } from 'react';
import { useMissingNameWarning } from '../../lib/a11y-dev';
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'iconoir-react';
import { cn } from '../../lib/utils';

/** Requires: npm i @radix-ui/react-switch */

const switchVariants = cva(
  [
    'group/switch relative inline-flex h-[20px] w-[36px] shrink-0 items-center rounded-full border-0',
    // 20px tall track, 24px tall invisible hit area (WCAG 2.5.8).
    "after:absolute after:inset-x-0 after:-inset-y-0.5 after:content-['']",
    // Forced colors drop the fills: draw the track and its on state with system colors.
    'forced-colors:forced-color-adjust-none forced-colors:bg-[Canvas]! forced-colors:border forced-colors:border-solid forced-colors:border-[ButtonText] forced-colors:data-[state=checked]:bg-[Highlight]! forced-colors:data-[state=checked]:border-[Highlight]',
    'bg-[var(--color-bg-secondary-bg-secondary)]',
    // Off — big jump to a dark fill on hover per the Figma spec.
    'hover:not-disabled:data-[state=unchecked]:bg-[var(--color-bg-secondary-bg-secondary-hover)]',
    // Disabled off — combined with data-state so specificity always wins
    // over the checked/hover color rules (same fix as Checkbox/Radio).
    'disabled:data-[state=unchecked]:bg-[var(--color-bg-secondary-bg-secondary-subtle)]',
    'transition-[background-color,transform] duration-standard ease-enter motion-reduce:transition-none',
    'cursor-pointer disabled:cursor-not-allowed',
    'motion-safe:active:not-disabled:scale-[0.95]',
    'focus-visible:outline-none',
    'focus-visible:data-[state=unchecked]:focus-ring',
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
          'focus-visible:data-[state=checked]:focus-ring',
        ],
      },
      {
        tone: 'warning',
        class: [
          'data-[state=checked]:bg-[var(--color-bg-warning-bg-warning)]',
          'hover:not-disabled:data-[state=checked]:bg-[var(--color-bg-warning-bg-warning-hover)]',
          'disabled:data-[state=checked]:bg-[var(--color-bg-warning-bg-warning-subtle)] disabled:data-[state=checked]:border-transparent',
          'focus-visible:data-[state=checked]:focus-ring-warning',
        ],
      },
      {
        tone: 'danger',
        class: [
          'data-[state=checked]:bg-[var(--color-bg-danger-bg-danger)]',
          'hover:not-disabled:data-[state=checked]:bg-[var(--color-bg-danger-bg-danger-hover)]',
          'disabled:data-[state=checked]:bg-[var(--color-bg-danger-bg-danger-subtle)] disabled:data-[state=checked]:border-transparent',
          'focus-visible:data-[state=checked]:focus-ring-error',
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
            'forced-colors:bg-[ButtonText] forced-colors:group-data-[state=checked]:bg-[HighlightText] forced-colors:data-[state=checked]:bg-[HighlightText]',
            // Mirrored in RTL: the thumb starts at the inline-start edge.
            'translate-x-[3px] data-[state=checked]:translate-x-[19px] rtl:-translate-x-[3px] rtl:data-[state=checked]:-translate-x-[19px]',
            // Squish: while the track is pressed the thumb stretches to 20px toward
            // the side it will move to (from the checked side it grows inward, so
            // its start shifts left by the extra 6px), then springs across on release.
            'group-enabled/switch:group-active/switch:w-[20px]',
            'data-[state=checked]:group-enabled/switch:group-active/switch:translate-x-[13px] rtl:data-[state=checked]:group-enabled/switch:group-active/switch:-translate-x-[13px]',
            'transition-[translate,width] duration-moderate ease-spring motion-reduce:transition-none',
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
                // white thumb once dark mode flipped it). icon-on-light is
                // the fixed dark glyph for a light surface in both themes.
                'text-[var(--color-icon-icon-on-light)]',
                'scale-50 opacity-0 transition-[opacity,transform] duration-fast ease-enter motion-reduce:transition-none',
                'group-data-[state=checked]:scale-100 group-data-[state=checked]:opacity-100',
                'group-data-[state=checked]:duration-moderate group-data-[state=checked]:ease-spring',
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
          <span id={descriptionId} className="font-body font-normal text-body-s text-[var(--color-text-text-subtler)] ps-[44px]">
            {description}
          </span>
        )}
      </div>
    );
  },
);
