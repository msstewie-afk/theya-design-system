import { createContext, useContext, useId, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Checkbox, type CheckboxProps } from './checkbox';

/**
 * Not in the reference repo — manages a set of related Checkboxes as
 * one value (an array of the checked children's `name`s), modeled on
 * @base-ui/react/checkbox-group's shape but built on our own Checkbox
 * (Radix-based) since we don't use Base UI. Give each child Checkbox a
 * `name`; that string is what lands in the group's value array.
 *
 * `size` (default "m") flows to every item via context, same pattern
 * as ToggleGroup — and also drives the list's own item spacing: 10px
 * at "m", 8px at the more compact "s", rather than one fixed gap for
 * both sizes.
 */
interface CheckboxGroupContextValue {
  value: string[];
  toggle: (name: string, checked: boolean) => void;
  disabled?: boolean;
  size?: 's' | 'm';
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export interface CheckboxGroupProps {
  /** Uncontrolled initial checked set. */
  defaultValue?: string[];
  /** Controlled checked set (pair with onValueChange). */
  value?: string[];
  onValueChange?: (value: string[]) => void;
  /** Disables every child Checkbox at once. */
  disabled?: boolean;
  /** Checkbox size for every item, unless an item overrides its own. Defaults to "m". */
  size?: 's' | 'm';
  /** Group label — rendered as a <legend> via the native fieldset. */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CheckboxGroup({
  defaultValue,
  value,
  onValueChange,
  disabled,
  size = 'm',
  label,
  children,
  className,
}: CheckboxGroupProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const current = isControlled ? value : internal;
  const legendId = useId();

  const toggle = useCallback(
    (name: string, checked: boolean) => {
      const next = checked ? [...current, name] : current.filter((n) => n !== name);
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [current, isControlled, onValueChange],
  );

  return (
    <CheckboxGroupContext.Provider value={{ value: current, toggle, disabled, size }}>
      <fieldset disabled={disabled} className={className} aria-labelledby={label ? legendId : undefined}>
        {label && (
          <legend id={legendId} className="font-body text-body-m font-medium text-[var(--color-text-text)] mb-2">
            {label}
          </legend>
        )}
        <div className={size === 's' ? 'flex flex-col gap-2' : 'flex flex-col gap-2.5'}>{children}</div>
      </fieldset>
    </CheckboxGroupContext.Provider>
  );
}

export interface CheckboxGroupItemProps extends Omit<CheckboxProps, 'checked' | 'onCheckedChange' | 'name'> {
  name: string;
}

export function CheckboxGroupItem({ name, disabled, size, ...props }: CheckboxGroupItemProps) {
  const ctx = useContext(CheckboxGroupContext);
  if (!ctx) throw new Error('CheckboxGroupItem must be used within a CheckboxGroup');

  return (
    <Checkbox
      checked={ctx.value.includes(name)}
      onCheckedChange={(checked) => ctx.toggle(name, checked === true)}
      disabled={disabled ?? ctx.disabled}
      size={size ?? ctx.size}
      {...props}
    />
  );
}
