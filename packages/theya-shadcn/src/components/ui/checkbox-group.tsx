'use client';

import { createContext, useContext, useId, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Checkbox, type CheckboxProps } from './checkbox';

/**
 * A native <fieldset> of related Checkboxes that share one value: the
 * array of the checked items' `name`s. Each CheckboxGroupItem is our own
 * (Radix-based) Checkbox, wired to the group through context. Give every
 * item a `name`; that string is what lands in the value array.
 *
 * `size` (default "md") flows to every item via context, same pattern
 * as ToggleGroup, and also sets the spacing between items: gap-3 at
 * "md", gap-2 at the more compact "sm".
 */
interface GroupState {
  checkedNames: string[];
  setChecked: (name: string, checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const GroupStateContext = createContext<GroupState | null>(null);

export interface CheckboxGroupProps {
  /** Uncontrolled initial checked set. */
  defaultValue?: string[];
  /** Controlled checked set (pair with onValueChange). */
  value?: string[];
  onValueChange?: (value: string[]) => void;
  /** Disables every child Checkbox at once. */
  disabled?: boolean;
  /** Checkbox size for every item, unless an item overrides its own. Defaults to "md". */
  size?: 'sm' | 'md';
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
  size = 'md',
  label,
  children,
  className,
}: CheckboxGroupProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const current = isControlled ? value : internal;
  const legendId = useId();

  const setChecked = useCallback(
    (name: string, checked: boolean) => {
      const next = checked ? [...current, name] : current.filter((n) => n !== name);
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [current, isControlled, onValueChange],
  );

  return (
    <GroupStateContext.Provider value={{ checkedNames: current, setChecked, disabled, size }}>
      <fieldset disabled={disabled} className={className} aria-labelledby={label ? legendId : undefined}>
        {label && (
          <legend id={legendId} className="font-body text-body-m font-medium text-[var(--color-text-text)] mb-2">
            {label}
          </legend>
        )}
        <div className={size === 'sm' ? 'flex flex-col gap-2' : 'flex flex-col gap-3'}>{children}</div>
      </fieldset>
    </GroupStateContext.Provider>
  );
}

export interface CheckboxGroupItemProps extends Omit<CheckboxProps, 'checked' | 'onCheckedChange' | 'name'> {
  name: string;
}

export function CheckboxGroupItem({ name, disabled, size, ...props }: CheckboxGroupItemProps) {
  const group = useContext(GroupStateContext);
  if (!group) throw new Error('CheckboxGroupItem must be used within a CheckboxGroup');

  return (
    <Checkbox
      checked={group.checkedNames.includes(name)}
      onCheckedChange={(checked) => group.setChecked(name, checked === true)}
      disabled={disabled ?? group.disabled}
      size={size ?? group.size}
      {...props}
    />
  );
}
