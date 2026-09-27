import { useState, useRef, useId, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Plus, Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { TextField } from './text-field';
import { NumberField } from './number-field';
import { DatePicker } from './date-picker';
import { Combobox } from './combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

/**
 * A structured filter/condition builder: field-operator-value rows
 * joined by an all/any (AND/OR) connective. Operators and the value
 * editor derive from each field's type, so the value control is
 * always the right primitive. The heavier sibling of Filter (a single
 * faceted chip) — reach for this when users compose arbitrary
 * conditions. Uses our Combobox(multiple) in place of a standalone
 * MultiSelect, since it already covers that shape.
 */
type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export type QueryField =
  | { name: string; label: string; type: 'text' | 'number' | 'date' | 'boolean' }
  | { name: string; label: string; type: 'select'; options: { value: string; label: string }[] };

export interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value?: unknown;
}

export interface QueryValue {
  match: 'all' | 'any';
  conditions: QueryCondition[];
}

type Editor = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'number-range' | 'date-range' | 'none';
type OperatorMeta = { value: string; label: string; editor: Editor };

const OPERATORS: Record<FieldType, OperatorMeta[]> = {
  text: [
    { value: 'contains', label: 'contains', editor: 'text' },
    { value: 'not_contains', label: 'does not contain', editor: 'text' },
    { value: 'equals', label: 'is', editor: 'text' },
    { value: 'not_equals', label: 'is not', editor: 'text' },
    { value: 'starts_with', label: 'starts with', editor: 'text' },
    { value: 'ends_with', label: 'ends with', editor: 'text' },
    { value: 'is_empty', label: 'is empty', editor: 'none' },
    { value: 'is_not_empty', label: 'is not empty', editor: 'none' },
  ],
  number: [
    { value: 'equals', label: 'equals', editor: 'number' },
    { value: 'not_equals', label: 'does not equal', editor: 'number' },
    { value: 'gt', label: 'greater than', editor: 'number' },
    { value: 'gte', label: 'greater or equal', editor: 'number' },
    { value: 'lt', label: 'less than', editor: 'number' },
    { value: 'lte', label: 'less or equal', editor: 'number' },
    { value: 'between', label: 'between', editor: 'number-range' },
  ],
  date: [
    { value: 'on', label: 'on', editor: 'date' },
    { value: 'before', label: 'before', editor: 'date' },
    { value: 'after', label: 'after', editor: 'date' },
    { value: 'between', label: 'between', editor: 'date-range' },
  ],
  select: [
    { value: 'is', label: 'is', editor: 'select' },
    { value: 'is_not', label: 'is not', editor: 'select' },
    { value: 'is_any_of', label: 'is any of', editor: 'multiselect' },
    { value: 'is_none_of', label: 'is none of', editor: 'multiselect' },
  ],
  boolean: [
    { value: 'is_true', label: 'is true', editor: 'none' },
    { value: 'is_false', label: 'is false', editor: 'none' },
  ],
};

function operatorsFor(field: QueryField | undefined): OperatorMeta[] {
  return field ? OPERATORS[field.type] : [];
}

export interface QueryBuilderProps {
  fields: QueryField[];
  value?: QueryValue;
  defaultValue?: QueryValue;
  onChange?: (value: QueryValue) => void;
  addLabel?: string;
  maxConditions?: number;
  ariaLabel?: string;
  emptyMessage?: ReactNode;
  className?: string;
}

export function QueryBuilder({
  fields,
  value,
  defaultValue,
  onChange,
  addLabel = 'Add condition',
  maxConditions,
  ariaLabel = 'Filter conditions',
  emptyMessage = 'No conditions yet. Add one to start filtering.',
  className,
}: QueryBuilderProps) {
  const [internal, setInternal] = useState<QueryValue>(defaultValue ?? { match: 'all', conditions: [] });
  const state = value ?? internal;
  const uid = useId();
  const idc = useRef(0);

  const commit = useCallback(
    (next: QueryValue) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    },
    [value, onChange],
  );

  const setConditions = (conditions: QueryCondition[]) => commit({ ...state, conditions });

  const addCondition = () => {
    const field = fields[0];
    if (!field) return;
    const op = OPERATORS[field.type][0];
    commit({
      ...state,
      conditions: [...state.conditions, { id: `${uid}-${++idc.current}`, field: field.name, operator: op.value, value: undefined }],
    });
  };

  const updateCondition = (id: string, patch: Partial<QueryCondition>) =>
    setConditions(state.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const removeCondition = (id: string) => setConditions(state.conditions.filter((c) => c.id !== id));

  const changeField = (id: string, fieldName: string) => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field) return;
    updateCondition(id, { field: fieldName, operator: OPERATORS[field.type][0].value, value: undefined });
  };

  const atLimit = maxConditions != null && state.conditions.length >= maxConditions;

  return (
    <div role="group" aria-label={ariaLabel} className={cn('flex flex-col gap-3', className)}>
      {state.conditions.length > 1 && (
        <div className="flex items-center gap-2 font-body text-body-s text-[var(--color-text-text-subtler)]">
          <span>Match</span>
          <Select heightSize="sm" value={state.match} onValueChange={(v) => commit({ ...state, match: v as 'all' | 'any' })}>
            <SelectTrigger className="w-[5.5rem]" aria-label="Match type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="any">any</SelectItem>
            </SelectContent>
          </Select>
          <span>of the following</span>
        </div>
      )}

      {state.conditions.length === 0 ? (
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{emptyMessage}</p>
      ) : (
        // Grid, not each row's own flex row: field/operator/value/remove need
        // to land in the SAME column across every condition, regardless of how
        // wide that row's own value editor happens to be (a DatePicker vs a
        // bare NumberField vs nothing at all for a boolean). Each <li> is
        // `contents` so its children become direct grid items in the shared
        // column tracks.
        <ul className="grid grid-cols-[10rem_11rem_auto_auto] items-start gap-2">
          {state.conditions.map((condition) => {
            const field = fields.find((f) => f.name === condition.field);
            const ops = operatorsFor(field);
            const opMeta = ops.find((o) => o.value === condition.operator) ?? ops[0];
            const fieldLabel = field?.label ?? 'field';
            return (
              <li key={condition.id} className="contents">
                <Select value={condition.field} onValueChange={(v) => changeField(condition.id, v)}>
                  <SelectTrigger className="w-full" aria-label="Field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.name} value={f.name}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={condition.operator} onValueChange={(v) => updateCondition(condition.id, { operator: v, value: undefined })}>
                  <SelectTrigger className="w-full" aria-label={`${fieldLabel} condition`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ops.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="min-w-0 pr-2">
                  <ValueEditor condition={condition} field={field} editor={opMeta?.editor ?? 'none'} label={fieldLabel} onValue={(v) => updateCondition(condition.id, { value: v })} />
                </div>

                <Button type="ghost" iconOnly size="md" className="self-center" aria-label={`Remove ${fieldLabel} condition`} onClick={() => removeCondition(condition.id)} leftIcon={<Xmark />} />
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <Button type="outlined" tone="primary" size="xl" onClick={addCondition} disabled={atLimit || fields.length === 0} leftIcon={<Plus />}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

function ValueEditor({
  condition,
  field,
  editor,
  label,
  onValue,
}: {
  condition: QueryCondition;
  field: QueryField | undefined;
  editor: Editor;
  label: string;
  onValue: (value: unknown) => void;
}) {
  const name = `${label} value`;

  switch (editor) {
    case 'none':
      return null;

    case 'text':
      return <TextField value={(condition.value as string) ?? ''} onChange={(e) => onValue(e.target.value)} placeholder="Value" aria-label={name} widthSize="full" />;

    case 'number':
      return <NumberField className="w-full" value={condition.value as number | undefined} onValueChange={(v) => onValue(v)} placeholder="Value" aria-label={name} />;

    case 'number-range': {
      const [from, to] = (condition.value as [number | undefined, number | undefined]) ?? [undefined, undefined];
      return (
        <div className="flex min-w-0 items-center gap-2">
          <NumberField className="w-[132px] shrink-0" value={from} onValueChange={(v) => onValue([v, to])} placeholder="Min" aria-label={`${name} from`} />
          <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">and</span>
          <NumberField className="w-[132px] shrink-0" value={to} onValueChange={(v) => onValue([from, v])} placeholder="Max" aria-label={`${name} to`} />
        </div>
      );
    }

    case 'date':
      return <DatePicker className="w-[calc(100%+3px)]" value={condition.value as Date | undefined} onChange={(d) => onValue(d)} aria-label={name} />;

    case 'date-range': {
      const [from, to] = (condition.value as [Date | undefined, Date | undefined]) ?? [undefined, undefined];
      return (
        <div className="flex flex-wrap items-center gap-2">
          <DatePicker className="w-full flex-1" value={from} onChange={(d) => onValue([d, to])} placeholder="Start date" aria-label={`${name} from`} />
          <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">and</span>
          <DatePicker className="w-full flex-1" value={to} onChange={(d) => onValue([from, d])} placeholder="End date" aria-label={`${name} to`} />
        </div>
      );
    }

    case 'select':
      return (
        <Select value={(condition.value as string) ?? ''} onValueChange={(v) => onValue(v)}>
          <SelectTrigger className="w-full" aria-label={name}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>{field?.type === 'select' && field.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      );

    case 'multiselect':
      return (
        <Combobox
          multiple
          options={field?.type === 'select' ? field.options : []}
          value={(condition.value as string[]) ?? []}
          onValueChange={(v) => onValue(v)}
          placeholder="Select values"
          aria-label={name}
        />
      );

    default:
      return null;
  }
}
