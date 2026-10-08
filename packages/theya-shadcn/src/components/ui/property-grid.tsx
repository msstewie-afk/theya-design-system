'use client';

import { useState, useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
import { Switch } from './switch';
import { TextArea } from './textarea';
import { TextField } from './text-field';
import { NumberField } from './number-field';
import { Separator } from './separator';

export type PropertyValue = string | number | boolean;

export interface PropertyGridItem {
  name: string;
  label: ReactNode;
  type?: 'text' | 'number' | 'select' | 'switch' | 'textarea' | 'custom';
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: ReactNode;
  readOnly?: boolean;
  /** Required for type="custom" — renders full control over the value cell. */
  render?: (props: { value: PropertyValue; onChange: (v: PropertyValue) => void; disabled?: boolean }) => ReactNode;
}

export interface PropertyGridProps {
  items: PropertyGridItem[];
  /** Initial values keyed by item name (uncontrolled). */
  defaultValues?: Record<string, PropertyValue>;
  /** Controlled values keyed by item name (pair with onValueChange/onValuesChange). */
  values?: Record<string, PropertyValue>;
  onValueChange?: (name: string, value: PropertyValue) => void;
  onValuesChange?: (values: Record<string, PropertyValue>) => void;
  /** Cap on the label column (any CSS length). The column is still sized to the longest label; this only moves the ceiling past which labels ellipsise. */
  maxLabelWidth?: string;
  className?: string;
  id?: string;
}

/**
 * A label/value editor driven by a row schema: each item's `type` picks
 * the control (TextField, NumberField, Select, Switch, TextArea, or a
 * `custom` render), and rows are divided with Separator. The label
 * column auto-sizes to the longest label via CSS Grid's max-content,
 * capped by maxLabelWidth. Label and field always stay side by side on
 * the same row: a long label wraps within its own column rather than
 * pushing the field down or being ellipsised.
 */
export function PropertyGrid({
  items,
  defaultValues,
  values,
  onValueChange,
  onValuesChange,
  maxLabelWidth = '30ch',
  className,
  id,
}: PropertyGridProps) {
  const isControlled = values !== undefined;
  const [internal, setInternal] = useState<Record<string, PropertyValue>>(defaultValues ?? {});
  const current = isControlled ? values! : internal;

  const setValue = (name: string, value: PropertyValue) => {
    const next = { ...current, [name]: value };
    if (!isControlled) setInternal(next);
    onValueChange?.(name, value);
    onValuesChange?.(next);
  };

  return (
    <div
      id={id}
      className={cn('grid', className)}
      // The value column keeps at least 8rem (NumberField's default width): with minmax(0, 1fr) a long
      // label (up to maxLabelWidth) took the row in a narrow panel and the
      // controls collapsed to a few px (or overflowed, for NumberField).
      // Now the label column gives way and its text wraps — but never
      // narrower than its longest word (min-content), so words don't spill
      // under the control.
      style={{ gridTemplateColumns: 'minmax(min-content, max-content) minmax(min(8rem, 100%), 1fr)' }}
    >
      {items.map((item, index) => (
        <PropertyRow
          key={item.name}
          item={item}
          value={current[item.name]}
          onChange={(v) => setValue(item.name, v)}
          isLast={index === items.length - 1}
          maxLabelWidth={maxLabelWidth}
        />
      ))}
    </div>
  );
}

function PropertyRow({
  item,
  value,
  onChange,
  isLast,
  maxLabelWidth,
}: {
  item: PropertyGridItem;
  value: PropertyValue | undefined;
  onChange: (v: PropertyValue) => void;
  isLast: boolean;
  maxLabelWidth: string;
}) {
  const fieldId = useId();

  return (
    <>
      <div className="flex min-w-0 items-center pe-3 py-3" style={{ maxWidth: maxLabelWidth }}>
        <label htmlFor={fieldId} className="font-body text-body-m text-[var(--color-text-text-subtler)] font-medium break-words">
          {item.label}
        </label>
      </div>
      {/*
        items-end so the control's right edge always sits flush against
        the row's right edge (matching the separator's full width),
        instead of a fixed-width control (e.g. the default text
        control's own `md`/240px) floating at the column's left edge
        with dead space before the separator's actual end.
      */}
      <div className="flex min-w-0 flex-col items-end justify-center py-3">
        <PropertyControl fieldId={fieldId} item={item} value={value} onChange={onChange} />
        {item.description && (
          <span className="font-body text-body-xs text-[var(--color-text-text-subtler)] mt-0.5">
            {item.description}
          </span>
        )}
      </div>
      {!isLast && (
        <div className="col-span-2">
          <Separator />
        </div>
      )}
    </>
  );
}

function PropertyControl({
  fieldId,
  item,
  value,
  onChange,
}: {
  fieldId: string;
  item: PropertyGridItem;
  value: PropertyValue | undefined;
  onChange: (v: PropertyValue) => void;
}) {
  const { type = 'text', readOnly, options, placeholder } = item;

  if (readOnly) {
    if (type === 'switch') {
      return <Switch checked={Boolean(value)} disabled aria-label={String(item.label)} />;
    }
    return (
      <span className="font-body text-body-m text-[var(--color-text-text)] whitespace-pre-wrap">
        {value !== undefined && value !== '' ? String(value) : '—'}
      </span>
    );
  }

  switch (type) {
    case 'switch':
      return <Switch id={fieldId} checked={Boolean(value)} onCheckedChange={onChange} aria-label={String(item.label)} />;
    case 'select':
      return (
        <Select value={value !== undefined ? String(value) : undefined} onValueChange={onChange}>
          <SelectTrigger id={fieldId} className="w-fit max-w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'textarea':
      return (
        <TextArea
          id={fieldId}
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          widthSize="full"
          className="min-h-[60px]"
        />
      );
    case 'number':
      return (
        <div className="w-[160px] max-w-full">
          <NumberField
            id={fieldId}
            value={typeof value === 'number' ? value : undefined}
            onValueChange={onChange}
            placeholder={placeholder}
            widthSize="full"
          />
        </div>
      );
    case 'custom':
      return <>{item.render?.({ value: value as PropertyValue, onChange })}</>;
    default:
      return (
        <TextField
          id={fieldId}
          type="text"
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          widthSize="md"
          className="max-w-full"
        />
      );
  }
}
