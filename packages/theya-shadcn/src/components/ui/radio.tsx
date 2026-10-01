import { forwardRef, useId } from 'react';
import { useMissingNameWarning } from '@/lib/a11y-dev';
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

/** Requires: npm i @radix-ui/react-radio-group */

export const RadioGroup = RadioGroupPrimitive.Root;

export interface RadioProps extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label?: ReactNode;
  description?: ReactNode;
}

export const Radio = forwardRef<ElementRef<typeof RadioGroupPrimitive.Item>, RadioProps>(
  function Radio(
    { label, description, disabled, className, id, 'aria-label': ariaLabel, ...rest },
    ref,
  ) {

    const generatedId = useId();
    const resolvedId = id ?? generatedId;
    useMissingNameWarning('Radio', resolvedId);
    const descriptionId = description ? `${resolvedId}-description` : undefined;

    const box = (
      <RadioGroupPrimitive.Item
        ref={ref}
        id={resolvedId}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={descriptionId}
        className={cn(
          'peer relative inline-flex size-[var(--size-size-control-size-control-xs)] shrink-0',
          'items-center justify-center rounded-full',
          'bg-[var(--color-bg-input-bg-input)] border border-solid border-[var(--color-border-border-default)]',
          'transition-[background-color,border-color,box-shadow,transform] duration-standard ease-enter motion-reduce:transition-none',
          'cursor-pointer disabled:cursor-not-allowed',
          'motion-safe:active:not-disabled:scale-[0.9]',
          'hover:not-disabled:data-[state=unchecked]:border-[var(--color-border-border-primary)]',
          'data-[state=checked]:border-[var(--color-bg-primary-bg-primary)]',
          'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
          'disabled:data-[state=unchecked]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
          'disabled:data-[state=unchecked]:border-[var(--color-border-border-subtle)]',
          'disabled:data-[state=checked]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
          'disabled:data-[state=checked]:border-[var(--color-border-border-subtle)]',
          className,
        )}
        {...rest}
      >
        <RadioGroupPrimitive.Indicator
          forceMount
          className={cn(
            'size-[10px] rounded-full bg-[var(--color-bg-primary-bg-primary)]',
            'scale-0 opacity-0 transition-[opacity,transform] duration-fast ease-enter motion-reduce:transition-none',
            'data-[state=checked]:scale-100 data-[state=checked]:opacity-100',
            'data-[state=checked]:duration-moderate data-[state=checked]:ease-spring',
            disabled && 'data-[state=checked]:opacity-40 bg-[var(--color-icon-icon-subtler)] data-[state=unchecked]:opacity-0',
          )}
        />
      </RadioGroupPrimitive.Item>
    );

    if (!label) return box;

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
          <span className={cn(disabled && 'text-[var(--color-text-text-subtler)] opacity-[0.48]')}>{label}</span>
        </label>
        {description && (
          <span id={descriptionId} className="font-body font-normal text-body-s text-[var(--color-text-text-subtler)] pl-[28px]">
            {description}
          </span>
        )}
      </div>
    );
  },
);
