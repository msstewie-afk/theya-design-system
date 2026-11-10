'use client';

import { createContext, useCallback, useContext, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Check } from 'iconoir-react';
import { cn } from '../../lib/utils';

/**
 * Selectable bordered card on @radix-ui/react-radio-group (the same
 * package already backing our plain Radio) — no new dependency needed,
 * just a card-shaped Item instead of a circular one. Wrap items in
 * OptionCardGroup (RadioGroupPrimitive.Root, laid out as a grid).
 *
 * `type="multiple"` (T10, 2026-11-09): several cards can be on at once,
 * e.g. health conditions to take into account. Then the group is a
 * role="group" (name it with aria-label / aria-labelledby) and each card is
 * a button with role="checkbox" / aria-checked: Tab moves between cards,
 * Space toggles (Enter doesn't, as on a checkbox). The value is a string[].
 * A card can be `exclusive` ("None of these": turning it on clears the
 * rest, turning any other on clears it) or list values it `excludes`
 * ("More protein" vs "Less protein"; either side may list the other).
 */
const GROUP_CLASS = 'grid gap-3 sm:grid-cols-2';

interface MultipleContextValue {
  value: string[];
  disabled: boolean;
  toggle: (value: string) => void;
  register: (value: string, rule: { exclusive: boolean; excludes: string[] }) => () => void;
}
const MultipleContext = createContext<MultipleContextValue | null>(null);

export type OptionCardGroupSingleProps = React.ComponentProps<typeof RadioGroupPrimitive.Root> & { type?: 'single' };
export interface OptionCardGroupMultipleProps
  extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'dir'> {
  type: 'multiple';
  /** Controlled selected values. */
  value?: string[];
  /** Initially selected values (uncontrolled). */
  defaultValue?: string[];
  /** Fires with the new selected values, exclusive rules already applied. */
  onValueChange?: (value: string[]) => void;
  /** Disables every card in the group. */
  disabled?: boolean;
}
export type OptionCardGroupProps = OptionCardGroupSingleProps | OptionCardGroupMultipleProps;

function OptionCardGroupMultiple({ className, value: valueProp, defaultValue, onValueChange, disabled = false, type: _type, ...props }: OptionCardGroupMultipleProps) {
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const value = valueProp ?? inner;
  const rules = useRef(new Map<string, { exclusive: boolean; excludes: string[] }>());
  const register = useCallback<MultipleContextValue['register']>((v, rule) => {
    rules.current.set(v, rule);
    return () => {
      rules.current.delete(v);
    };
  }, []);
  const toggle = useCallback(
    (v: string) => {
      let next: string[];
      if (value.includes(v)) next = value.filter((x) => x !== v);
      else {
        const rule = rules.current.get(v);
        next = rule?.exclusive
          ? [v]
          : [
              ...value.filter((x) => {
                const other = rules.current.get(x);
                // an exclusive card goes off when anything else comes on;
                // excludes works from either side
                return !other?.exclusive && !rule?.excludes.includes(x) && !other?.excludes.includes(v);
              }),
              v,
            ];
      }
      if (valueProp === undefined) setInner(next);
      onValueChange?.(next);
    },
    [value, valueProp, onValueChange],
  );
  return (
    <MultipleContext.Provider value={{ value, disabled, toggle, register }}>
      <div role="group" data-slot="option-card-group" data-type="multiple" className={cn(GROUP_CLASS, className)} {...props} />
    </MultipleContext.Provider>
  );
}

function OptionCardGroup(props: OptionCardGroupProps) {
  if (props.type === 'multiple') return <OptionCardGroupMultiple {...props} />;
  const { className, type: _type, ...rest } = props;
  return <RadioGroupPrimitive.Root data-slot="option-card-group" className={cn(GROUP_CLASS, className)} {...rest} />;
}

export interface OptionCardProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, 'title' | 'children'> {
  title: string;
  description?: string;
  icon?: ReactNode;
  /**
   * Right-aligned detail before the radio dot — typically the option's
   * price ("$4 / mo"), so each choice shows its cost without opening it.
   * Announced after the description (it joins aria-describedby).
   */
  aside?: ReactNode;
  /** In a `type="multiple"` group: on, it clears every other card; any other card coming on clears it ("None of these"). */
  exclusive?: boolean;
  /** In a `type="multiple"` group: values that go off when this card comes on, and the other way round ("more-protein" vs "less-protein"). */
  excludes?: string[];
}

const CARD_CLASS = [
  'group relative flex w-full items-start gap-3 text-start cursor-pointer outline-none',
  'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid',
  'border-[var(--color-border-border)] bg-[var(--color-bg-surface-bg-surface)]',
  'p-[var(--size-margin-margin-lg)]',
  'transition-[background-color,border-color] duration-standard ease-enter motion-reduce:transition-none',
  'hover:not-disabled:not-data-[state=checked]:border-[var(--color-border-border-primary)]',
  'focus-visible:focus-ring',
  'data-[state=checked]:border-[var(--color-border-border-primary)]',
  'data-[state=checked]:bg-[var(--color-bg-primary-bg-primary-subtle)]',
  'disabled:cursor-not-allowed disabled:opacity-50',
];

const INDICATOR_CLASS = [
  'mt-0.5 flex aspect-square size-4 shrink-0 items-center justify-center',
  'border-[1.5px] border-solid border-[var(--color-border-border)]',
  'bg-[var(--color-bg-input-bg-input)] shadow-track',
  'transition-[background-color,border-color] duration-standard ease-enter motion-reduce:transition-none',
  'group-hover:border-[var(--color-border-border-primary)]',
  'group-data-[state=checked]:border-[var(--color-bg-primary-bg-primary)]',
  'group-data-[state=checked]:bg-[var(--color-bg-primary-bg-primary)]',
];

function OptionCard({ className, value, title, description, icon, aside, exclusive = false, excludes, disabled, onClick, onKeyDown, ...props }: OptionCardProps) {
  const multiple = useContext(MultipleContext);
  // Named by the title, described by the description. From content alone
  // the radio's name ran both together ("HTTP-01Serve a token file…").
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;
  const asideId = aside ? `${baseId}-aside` : undefined;
  const describedBy = [descriptionId, asideId].filter(Boolean).join(' ') || undefined;
  const excludesKey = (excludes ?? []).join('\u0000');
  const register = multiple?.register;
  useLayoutEffect(() => {
    if (!register) return;
    return register(value, { exclusive, excludes: excludesKey ? excludesKey.split('\u0000') : [] });
  }, [register, value, exclusive, excludesKey]);

  const content = (
    <>
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center',
            'text-[var(--color-icon-icon-subtle)] group-data-[state=checked]:text-[var(--color-icon-icon-primary)]',
            '[&_svg]:size-4',
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Title and aside share a wrapping row: in a narrow card a long
            title ("Frankfurt") pushes the price onto the next line instead
            of running into it. */}
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span id={titleId} className="min-w-0 break-words font-body text-body-m font-medium leading-tight text-[var(--color-text-text)]">
            {title}
          </span>
          {aside && (
            <span id={asideId} className="font-body text-body-m font-medium tabular-nums text-[var(--color-text-text)]">
              {aside}
            </span>
          )}
        </span>
        {description && (
          <span id={descriptionId} className="font-body text-body-s font-normal text-[var(--color-text-text-subtler)] group-data-[state=checked]:text-[var(--color-text-text-subtler-on-tonal)]">
            {description}
          </span>
        )}
      </span>
    </>
  );

  if (multiple) {
    const checked = multiple.value.includes(value);
    const isDisabled = multiple.disabled || Boolean(disabled);
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        data-slot="option-card"
        value={value}
        disabled={isDisabled}
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        className={cn(CARD_CLASS, className)}
        {...(props as React.ComponentProps<'button'>)}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) multiple.toggle(value);
        }}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(event);
          // A checkbox toggles on Space only (as Radix Checkbox does).
          if (event.key === 'Enter') event.preventDefault();
        }}
      >
        {content}
        {/* Checkbox corners, capped at 4px: Ember's radius-md is 7px, which on
            a 16px box reads as a circle, i.e. as a radio. */}
        <span aria-hidden="true" className={cn(INDICATOR_CLASS, 'rounded-[min(var(--size-border-radius-border-radius-md),4px)]')}>
          <Check strokeWidth={2.5} className="size-3 text-[var(--color-text-text-on-primary)] opacity-0 group-data-[state=checked]:opacity-100" />
        </span>
      </button>
    );
  }

  return (
    <RadioGroupPrimitive.Item
      value={value}
      data-slot="option-card"
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      className={cn(CARD_CLASS, className)}
      {...props}
    >
      {content}
      <span aria-hidden="true" className={cn(INDICATOR_CLASS, 'rounded-full')}>
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <span className="size-1.5 rounded-full bg-[var(--color-icon-icon-on-dark)]" />
        </RadioGroupPrimitive.Indicator>
      </span>
    </RadioGroupPrimitive.Item>
  );
}

export { OptionCardGroup, OptionCard };
