import { useId, useMemo, useState, useRef, useLayoutEffect, lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import {  } from 'iconoir-react';
import { KebabIconVertical } from './kebab-icon';
import { cn } from '@/lib/utils';
import { Autocomplete, type AutocompleteOption } from './autocomplete';
import { Badge, type BadgeTone, type BadgeSize } from './badge';
import { Button, type ButtonProps } from './button';
import { Checkbox } from './checkbox';
import { Combobox, type ComboboxOption } from './combobox';
import { TextField } from './text-field';
import { NumberField } from './number-field';
import { DateRangePicker, type DateRangePickerProps } from './date-range-picker';
import type { DateRange } from 'react-day-picker';
import { Progress } from './progress';
import { Switch } from './switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Skeleton } from './skeleton';
import { TextArea } from './textarea';
import { type SparklineTone } from './sparkline';
import { Slider } from './slider';
import { StatusDot, type StatusTone } from './status-dot';

/**
 * The one kind that costs a library. Sparkline wraps recharts, so it
 * is fetched lazily when a `sparkline` cell first renders, and the
 * cost lands only on the table that asked for it.
 */
const LazySparkline = lazy(() => import('./sparkline').then((m) => ({ default: m.Sparkline })));

/**
 * How a table cell renders its value. `selector` and `menu` are the
 * two CONTROL columns, here so they share the row-height box instead
 * of sizing the row from their own padding.
 *
 * Simplified vs the reference: there is no TagInput component in this
 * design system — the `tags` kind is built on Combobox in multiple
 * mode with allowCreate instead, so free-typed tags still work but
 * without a dedicated remove-on-Backspace-at-caret affordance. A
 * single-date `date` kind is not implemented yet (DatePicker exists
 * now, so it can be added on request). DateRangePicker has no readOnly
 * of its own — `date-range` maps readOnly to disabled, a known
 * simplification vs the reference.
 */
export type DataTableCellKind = 'text' | 'mono' | 'primary' | 'status' | 'badge' | 'usage' | 'sparkline' | 'input' | 'textarea' | 'number' | 'select' | 'combobox' | 'autocomplete' | 'tags' | 'date-range' | 'switch' | 'slider' | 'selector' | 'menu' | 'custom';

export interface CellBoxProps {
  /** Lines the cell is sized for. You rarely pass it — inherits the table's `lines` unless this cell has a second line of its own. */
  lines?: 1 | 2;
  /** Keep the row height as a minimum rather than fixed, for content whose line count varies by row. */
  grow?: boolean;
  /** Render the first-load placeholder for this kind instead of the value. */
  loading?: boolean;
}

export interface SecondLineProps {
  secondary?: ReactNode;
  /** Render the second line in monospace (right for an identifier, wrong for a sentence). */
  secondaryMono?: boolean;
}

export interface TextCellProps extends CellBoxProps, SecondLineProps {
  kind?: 'text';
  value: ReactNode;
  mono?: boolean;
  muted?: boolean;
}

export interface MonoCellProps extends CellBoxProps, SecondLineProps {
  kind: 'mono';
  value: ReactNode;
  muted?: boolean;
}

export interface PrimaryCellProps extends CellBoxProps, SecondLineProps {
  kind: 'primary';
  value: ReactNode;
  /** Sits before the text: an Avatar, an icon, a favicon. Keep it ≤32px. */
  leading?: ReactNode;
  mono?: boolean;
  /** Extra lines under `secondary` — sized as a minimum since they appear only at some widths. */
  below?: ReactNode;
}

export interface StatusCellProps extends CellBoxProps {
  kind: 'status';
  tone?: StatusTone;
  /** Required: status is never color alone. */
  label: ReactNode;
}

export interface BadgeCellBadge {
  label: ReactNode;
  tone?: BadgeTone;
}

export interface BadgeCellSingle extends CellBoxProps {
  kind: 'badge';
  tone?: BadgeTone;
  size?: BadgeSize;
  label: ReactNode;
  badges?: undefined;
  collapsedLabel?: undefined;
}

export interface BadgeCellMultiple extends CellBoxProps {
  kind: 'badge';
  /** Several badges, worst severity first. Collapse from the tail as the column narrows. */
  badges: BadgeCellBadge[];
  /** Applies to every badge in the group, including the collapsed "N more" pill. */
  size?: BadgeSize;
  /** Noun used once every badge collapses into one ("4 alerts"). Defaults to "badges". */
  collapsedLabel?: string;
  label?: undefined;
  tone?: undefined;
}

export type BadgeCellProps = BadgeCellSingle | BadgeCellMultiple;

export interface UsageCellProps extends CellBoxProps {
  kind: 'usage';
  value: number;
  /** null for an unlimited/indeterminate quota: no bar, no misleading 0%. */
  total: number | null;
  label?: ReactNode;
  header?: string;
}

export interface SparklineCellProps extends CellBoxProps {
  kind: 'sparkline';
  data: number[];
  tone?: SparklineTone;
  area?: boolean;
  /** The number the trend belongs to — carries the meaning; the line only shows the shape. */
  label?: ReactNode;
  ariaLabel: string;
  width?: number;
  height?: number;
}

/** An editable cell must be named after the ROW as well as the field — "Plan for shop.seashell.dev". */
export type EditableNameProps = { label: string; labelledBy?: undefined } | { label?: undefined; labelledBy: string };

export type EditableCellProps = EditableNameProps & {
  id?: string;
  describedBy?: string;
  disabled?: boolean;
  /** Value stays selectable and normal-ink; gives up border/hover wash/affordances. */
  readOnly?: boolean;
  invalid?: boolean;
  errorMessage?: string;
};

export type InputCellProps = CellBoxProps & EditableCellProps & {
  kind: 'input';
  value: string;
  onValueChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'url' | 'tel';
  mono?: boolean;
};

/** NOT a table kind — a multi-line field sizes the row as a floor. Use `input` in a table; this is for PropertyGrid. */
export type TextareaCellProps = CellBoxProps & EditableCellProps & {
  kind: 'textarea';
  value: string;
  onValueChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  rows?: number;
};

export type NumberCellProps = CellBoxProps & EditableCellProps & {
  kind: 'number';
  value: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: Intl.NumberFormatOptions;
  placeholder?: string;
};

export type SelectCellProps = CellBoxProps & EditableCellProps & {
  kind: 'select';
  value: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: ReactNode; disabled?: boolean }[];
  placeholder?: string;
};

export type ComboboxCellProps = CellBoxProps & EditableCellProps & {
  kind: 'combobox';
  value: string;
  onValueChange?: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  emptyMessage?: ReactNode;
};

export type AutocompleteCellProps = CellBoxProps & EditableCellProps & {
  kind: 'autocomplete';
  value: string;
  onValueChange?: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
};

export type TagsCellProps = CellBoxProps & EditableCellProps & {
  kind: 'tags';
  value: string[];
  onValueChange?: (value: string[]) => void;
  options?: string[];
  placeholder?: string;
  max?: number;
};

export type DateRangeCellProps = CellBoxProps & EditableCellProps & {
  kind: 'date-range';
  value: DateRange | undefined;
  onValueChange?: (value: DateRange | undefined) => void;
  placeholder?: string;
  numberOfMonths?: number;
  calendarProps?: DateRangePickerProps['calendarProps'];
};

export type SwitchCellProps = CellBoxProps & EditableCellProps & {
  kind: 'switch';
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export type SliderCellProps = CellBoxProps & EditableCellProps & {
  kind: 'slider';
  /** ONE value: a cell has no room for a two-thumb range — that belongs in `custom`. */
  value: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Doubles as the visible readout and the thumb's aria-valuetext. Defaults to the bare number. */
  formatValue?: (value: number) => string;
};

export interface SelectorCellProps extends CellBoxProps {
  kind: 'selector';
  checked: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Required: name the ROW, not the action — "Select shop.seashell.dev". */
  label: string;
}

export interface MenuCellProps extends CellBoxProps {
  kind: 'menu';
  children: ReactNode;
  /** Keep the control invisible until hovered/focused/open. Needs `group/row` on the row. */
  revealOnHover?: boolean;
}

export interface CustomCellProps extends CellBoxProps {
  kind: 'custom';
  children: ReactNode;
}

export type DataTableCellValueProps =
  | TextCellProps
  | MonoCellProps
  | PrimaryCellProps
  | StatusCellProps
  | BadgeCellProps
  | UsageCellProps
  | SparklineCellProps
  | InputCellProps
  | TextareaCellProps
  | NumberCellProps
  | SelectCellProps
  | ComboboxCellProps
  | AutocompleteCellProps
  | TagsCellProps
  | DateRangeCellProps
  | SwitchCellProps
  | SliderCellProps
  | SelectorCellProps
  | MenuCellProps
  | CustomCellProps;

export interface LoadingCellProps extends CellBoxProps {
  kind?: DataTableCellKind;
  loading: true;
  leading?: ReactNode;
  secondary?: ReactNode;
}

export type DataTableCellProps = DataTableCellValueProps | LoadingCellProps;

function pctOf(value: number, total: number): number {
  if (!(total > 0)) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

function UsageCell({ value, total, label, header }: Omit<UsageCellProps, 'kind'>) {
  if (total == null) {
    return (
      <div className="flex w-full min-w-0 max-w-[10rem] items-baseline gap-1.5 font-body text-body-m">
        {label != null && <span className="truncate font-medium tabular-nums text-[var(--color-text-text)]">{label}</span>}
        <span className="shrink-0 text-[var(--color-text-text-subtler)]">Unlimited</span>
      </div>
    );
  }
  const pct = pctOf(value, total);
  const tone = pct >= 90 ? 'text-[var(--color-text-text-danger)]' : pct >= 75 ? 'text-[var(--color-text-text-warning)]' : 'text-[var(--color-text-text)]';
  const ariaLabel = [header ? `${header}: ` : '', `${pct}%`, typeof label === 'string' ? `, ${label}` : ''].join('');
  return (
    <div className="flex w-full min-w-0 max-w-[10rem] flex-col gap-1">
      <div className="flex items-center justify-between gap-2 font-body text-body-m">
        <span className={cn('font-medium tabular-nums', tone)}>{pct}%</span>
        {label != null && <span className="truncate text-[var(--color-text-text-subtler)]">{label}</span>}
      </div>
      <Progress value={pct} aria-label={ariaLabel} />
    </div>
  );
}

/** Worst first. `success` ranks below `neutral` (good news, not a severity); `solid` ranks mild so it never outranks a real warning. */
const BADGE_SEVERITY_RANK: Record<BadgeTone, number> = {
  danger: 6,
  warning: 5,
  info: 4,
  primary: 3,
  neutral: 1,
  success: 0,
};

function sortBadgesBySeverity(badges: BadgeCellBadge[]): BadgeCellBadge[] {
  return [...badges].sort((a, b) => BADGE_SEVERITY_RANK[b.tone ?? 'neutral'] - BADGE_SEVERITY_RANK[a.tone ?? 'neutral']);
}

const BADGES_GAP = 4;

/**
 * A row of badges that collapses from the tail as the column narrows,
 * rather than wrapping or clipping mid-badge. Same measure-a-hidden-
 * twin technique as DataTableToolbar's useVisibleActionCount.
 */
function BadgesCell({ badges, collapsedLabel = 'badges', size }: { badges: BadgeCellBadge[]; collapsedLabel?: string; size?: BadgeSize }) {
  const sorted = useMemo(() => sortBadgesBySeverity(badges), [badges]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [collapsedCount, setCollapsedCount] = useState(0);

  const steps = useMemo(() => {
    const result = [0];
    for (let k = 2; k <= sorted.length; k++) result.push(k);
    return result;
  }, [sorted.length]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const mirror = mirrorRef.current;
    if (!container || !mirror || sorted.length === 0) return;

    const recalc = () => {
      const available = container.clientWidth;
      const badgeEls = Array.from(mirror.children).slice(0, sorted.length) as HTMLElement[];
      const collapsedEls = Array.from(mirror.children).slice(sorted.length) as HTMLElement[];
      const badgeWidths = badgeEls.map((el) => el.offsetWidth);
      const collapsedWidths = collapsedEls.map((el) => el.offsetWidth);

      let chosen = steps[steps.length - 1];
      for (const k of steps) {
        const visibleCount = sorted.length - k;
        const itemCount = visibleCount + (k > 0 ? 1 : 0);
        const width = badgeWidths.slice(0, visibleCount).reduce((sum, w) => sum + w, 0) + (k > 0 ? collapsedWidths[k - 2] : 0) + BADGES_GAP * Math.max(0, itemCount - 1);
        if (width <= available) {
          chosen = k;
          break;
        }
      }
      setCollapsedCount(chosen);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    return () => observer.disconnect();
  }, [sorted, steps]);

  if (sorted.length === 0) return null;

  const visibleCount = sorted.length - collapsedCount;
  const visible = sorted.slice(0, visibleCount);
  const collapsed = collapsedCount > 0 ? sorted[visibleCount] : undefined;
  const collapsedText = collapsedCount === sorted.length ? `${collapsedCount} ${collapsedLabel}` : `${collapsedCount} more`;

  return (
    <div ref={containerRef} className="flex w-full min-w-0 items-center gap-1 overflow-hidden">
      <div ref={mirrorRef} aria-hidden="true" className="pointer-events-none invisible fixed top-0 left-0 flex gap-1">
        {sorted.map((badge, index) => (
          <Badge key={index} tone={badge.tone} size={size}>
            {badge.label}
          </Badge>
        ))}
        {steps.slice(1).map((k) => (
          <Badge key={`collapsed-${k}`} tone={sorted[sorted.length - k].tone} size={size}>
            {k === sorted.length ? `${k} ${collapsedLabel}` : `${k} more`}
          </Badge>
        ))}
      </div>
      {visible.map((badge, index) => (
        <Badge key={index} tone={badge.tone} size={size} className="shrink-0">
          {badge.label}
        </Badge>
      ))}
      {collapsed && (
        <Badge tone={collapsed.tone} size={size} className="shrink-0">
          {collapsedText}
        </Badge>
      )}
    </div>
  );
}

/** The text stack shared by `text`, `mono` and `primary`: value plus an optional second line. Both truncate rather than wrap. */
function TextStack({ value, secondary, secondaryMono, below, valueClassName }: SecondLineProps & { value: ReactNode; below?: ReactNode; valueClassName?: string }) {
  const line = <span className={cn('truncate font-body text-body-m', valueClassName)}>{value}</span>;
  if (secondary == null && below == null) return line;
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      {line}
      {secondary != null && <span className={cn('truncate font-body text-body-s font-normal text-[var(--color-text-text-subtler)]', secondaryMono && 'font-mono')}>{secondary}</span>}
      {below}
    </span>
  );
}

/** The first-load placeholder for one kind — stands in for the shape (a bar, a dot beside a word) so the table doesn't redraw silhouettes. */
function CellSkeleton({ kind, leading, secondary }: { kind: DataTableCellKind; leading?: boolean; secondary?: boolean }) {
  switch (kind) {
    case 'selector':
    case 'menu':
      return null;
    case 'status':
      return (
        <span className="flex items-center gap-2">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </span>
      );
    case 'badge':
      return <Skeleton className="h-[1.3125rem] w-14 rounded-full" />;
    case 'switch':
      return <Skeleton className="h-5 w-[2.125rem] rounded-full" />;
    case 'slider':
      return (
        <span className="flex w-full min-w-0 max-w-[12rem] items-center gap-2.5">
          <Skeleton className="h-3 w-8 shrink-0" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </span>
      );
    case 'tags':
      return (
        <span className="flex items-center gap-1">
          <Skeleton className="h-[1.3125rem] w-14 rounded-full" />
          <Skeleton className="h-[1.3125rem] w-10 rounded-full" />
        </span>
      );
    case 'usage':
      return (
        <span className="flex w-full min-w-0 max-w-[10rem] flex-col gap-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </span>
      );
    case 'sparkline':
      return (
        <span className="flex items-center gap-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-5 w-16" />
        </span>
      );
    case 'textarea':
      return (
        <span className="flex w-full min-w-0 flex-col gap-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </span>
      );
    case 'mono':
      return <Skeleton className="h-4 w-24" />;
    case 'primary':
      return (
        <span className="flex min-w-0 items-center gap-3">
          {leading && <Skeleton className="size-8 shrink-0 rounded-full" />}
          <span className="flex min-w-0 flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            {secondary && <Skeleton className="h-3 w-24" />}
          </span>
        </span>
      );
    default:
      return <Skeleton className="h-4 w-full max-w-[8.75rem]" />;
  }
}

/** The trigger for a `menu` cell: the row's overflow control. Ghost, full 44px touch target below md. */
export function DataTableCellMenuTrigger({ label, className, children, ...props }: ButtonProps & { label: string }) {
  return (
    <Button appearance="ghost" iconOnly size="md" aria-label={label} className={cn('max-md:size-11 [&_svg]:text-[var(--color-text-text)]', className)} leftIcon={children ?? <KebabIconVertical />} {...props} />
  );
}

/** aria-errormessage takes an ID reference, not the message — render it off-screen next to the field it belongs to. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="sr-only">
      {message}
    </span>
  );
}

/** The rendered content of one kind, unsized — DataTableCell owns the box. */
function CellContent(props: DataTableCellValueProps) {
  const errorId = useId();
  switch (props.kind) {
    case 'custom':
    case 'menu':
      return <>{props.children}</>;
    case 'input':
      // TextField has its own working invalid+message wiring (`error`,
      // below — aria-invalid plus a real aria-describedby'd message, not
      // aria-errormessage): use it instead of stapling aria-invalid/
      // aria-errormessage on from outside. That combination this used to
      // build here left aria-errormessage pointing at a FieldError span
      // that only mattered if nothing else associated the message —
      // TextField already does the equivalent internally, so the extra
      // machinery was redundant right up to the axe aria-valid-attr-value
      // failure it produced.
      return (
        <TextField
          id={props.id}
          value={props.value}
          type={props.type}
          placeholder={props.placeholder}
          disabled={props.disabled}
          readOnly={props.readOnly}
          aria-label={props.label}
          aria-labelledby={props.labelledBy}
          aria-describedby={props.describedBy}
          error={props.invalid ? (props.errorMessage ?? true) : undefined}
          onChange={(event) => props.onValueChange?.(event.target.value)}
          onBlur={props.onBlur}
          widthSize="full"
          className={cn(props.mono && 'font-mono')}
        />
      );
    case 'textarea':
      // Same as 'input' above — TextArea's own `error` prop replaces the
      // hand-rolled aria-invalid/aria-errormessage/FieldError trio.
      return (
        <TextArea
          id={props.id}
          value={props.value}
          rows={props.rows}
          placeholder={props.placeholder}
          disabled={props.disabled}
          readOnly={props.readOnly}
          aria-label={props.label}
          aria-labelledby={props.labelledBy}
          aria-describedby={props.describedBy}
          error={props.invalid ? (props.errorMessage ?? true) : undefined}
          onChange={(event) => props.onValueChange?.(event.target.value)}
          onBlur={props.onBlur}
          className="w-full"
        />
      );
    case 'number':
      // NumberField has no distinct readOnly appearance yet, so readOnly
      // maps to disabled here — a known simplification vs the reference.
      return (
        <NumberField
          id={props.id}
          value={props.value ?? undefined}
          onValueChange={(value) => props.onValueChange?.(value ?? null)}
          min={props.min}
          max={props.max}
          step={props.step}
          // NumberField has no Intl.NumberFormatOptions support yet — a
          // known simplification vs the reference's `format` prop.
          placeholder={props.placeholder}
          disabled={props.disabled || props.readOnly}
          aria-label={props.label}
          aria-labelledby={props.labelledBy}
          aria-describedby={props.describedBy}
          aria-invalid={props.invalid || undefined}
          // NumberField has no widthSize of its own — w-full is baked into
          // its own base classes unconditionally, so it always fills
          // whatever contains it. A stepper stretched across a wide column
          // reads wrong, so it's capped here rather than left full-width,
          // matching the same max-w-[10rem] convention as usage/slider.
          className="min-w-0 max-w-[10rem] font-body text-body-m"
        />
      );
    case 'select':
      return (
        // readOnly used to only drop the trigger from the tab order: a
        // pointer could still open it and change the value, while keyboard
        // users couldn't reach the value at all. Now it stays focusable
        // (aria-readonly) and simply never opens.
        <Select
          value={props.value}
          onValueChange={props.readOnly ? undefined : props.onValueChange}
          disabled={props.disabled}
          open={props.readOnly ? false : undefined}
        >
          <SelectTrigger
            id={props.id}
            aria-readonly={props.readOnly || undefined}
            aria-label={props.label}
            aria-labelledby={props.labelledBy}
            aria-describedby={props.describedBy}
            aria-invalid={props.invalid || undefined}
            aria-errormessage={props.invalid && props.errorMessage ? errorId : undefined}
            className="w-full font-body text-body-m"
          >
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
          {props.invalid && <FieldError id={errorId} message={props.errorMessage} />}
        </Select>
      );
    case 'combobox':
      return (
        <Combobox
          id={props.id}
          options={props.options}
          value={props.value}
          onValueChange={(value) => props.onValueChange?.(value as string)}
          placeholder={props.placeholder}
          emptyMessage={props.emptyMessage}
          disabled={props.disabled}
          readOnly={props.readOnly}
          aria-label={props.label}
          aria-labelledby={props.labelledBy}
          aria-describedby={props.describedBy}
          aria-invalid={props.invalid || undefined}
          className="w-full min-w-0 font-body text-body-m"
        />
      );
    case 'autocomplete':
      return (
        <Autocomplete
          id={props.id}
          options={props.options}
          value={props.value}
          onValueChange={props.onValueChange}
          placeholder={props.placeholder ?? ''}
          disabled={props.disabled}
          readOnly={props.readOnly}
          aria-label={props.label}
          aria-labelledby={props.labelledBy}
          aria-describedby={props.describedBy}
          aria-invalid={props.invalid || undefined}
          className="w-full min-w-0 font-body text-body-m"
        />
      );
    case 'tags':
      // No TagInput exists in this system — substituted with Combobox in
      // multiple mode + allowCreate, so free-typed tags still work.
      return (
        <Combobox
          multiple
          id={props.id}
          options={(props.options ?? []).map((o) => ({ value: o, label: o }))}
          value={props.value}
          onValueChange={(value) => props.onValueChange?.(value as string[])}
          allowCreate
          placeholder={props.placeholder}
          disabled={props.disabled}
          readOnly={props.readOnly}
          aria-label={props.label}
          aria-labelledby={props.labelledBy}
          aria-describedby={props.describedBy}
          aria-invalid={props.invalid || undefined}
          className="w-full min-w-0 font-body text-body-m"
        />
      );
    case 'date-range':
      // DateRangePicker has no readOnly of its own — readOnly maps to
      // disabled here, a known simplification vs the reference.
      return (
        <DateRangePicker
          id={props.id}
          value={props.value}
          onChange={props.onValueChange}
          placeholder={props.placeholder}
          numberOfMonths={props.numberOfMonths}
          disabled={props.disabled || props.readOnly}
          calendarProps={props.calendarProps}
          aria-label={props.label}
          aria-labelledby={props.labelledBy}
          aria-describedby={props.describedBy}
          aria-invalid={props.invalid || undefined}
          className="w-full font-body text-body-m"
        />
      );
    case 'switch':
      return (
        <Switch
          id={props.id}
          checked={props.checked}
          onCheckedChange={(checked) => props.onCheckedChange?.(checked === true)}
          disabled={props.disabled || props.readOnly}
          aria-label={props.label}
          aria-labelledby={props.labelledBy}
          aria-describedby={props.describedBy}
          aria-invalid={props.invalid || undefined}
        />
      );
    case 'slider': {
      const read = props.formatValue?.(props.value) ?? String(props.value);
      return (
        <span className="flex w-full min-w-0 max-w-[12rem] items-center gap-2.5">
          <span className="shrink-0 font-body text-body-m font-medium tabular-nums">{read}</span>
          <Slider
            value={[props.value]}
            onValueChange={(next) => props.onValueChange?.(next[0])}
            min={props.min}
            max={props.max}
            step={props.step}
            disabled={props.disabled || props.readOnly}
            formatValue={props.formatValue ? (value: number) => props.formatValue!(value) : undefined}
            aria-label={props.label}
            aria-labelledby={props.labelledBy}
            aria-describedby={props.describedBy}
            aria-invalid={props.invalid || undefined}
          />
        </span>
      );
    }
    case 'selector':
      return (
        <Checkbox
          checked={props.checked}
          disabled={props.disabled}
          onCheckedChange={(checked) => props.onCheckedChange?.(checked === true)}
          aria-label={props.label}
          className="relative after:absolute after:-inset-2.5 after:content-['']"
        />
      );
    case 'status':
      return (
        <span className="flex min-w-0 items-center gap-2 font-body text-body-m">
          <StatusDot tone={props.tone} />
          <span className="truncate">{props.label}</span>
        </span>
      );
    case 'badge':
      // Reverted to Badge's own bare default ('sm') — 'md' read too big
      // in a table row (Sep 2026).
      return props.badges ? (
        <BadgesCell badges={props.badges} collapsedLabel={props.collapsedLabel} size={props.size} />
      ) : (
        <Badge tone={props.tone} size={props.size}>
          {props.label}
        </Badge>
      );
    case 'usage':
      return <UsageCell value={props.value} total={props.total} label={props.label} header={props.header} />;
    case 'sparkline':
      return (
        <span className="flex min-w-0 items-center gap-2">
          {props.label != null && <span className="shrink-0 font-body text-body-m font-medium tabular-nums">{props.label}</span>}
          <Suspense fallback={<Skeleton style={{ width: props.width ?? 64, height: props.height ?? 20 }} />}>
            <LazySparkline data={props.data} tone={props.tone} area={props.area} width={props.width ?? 64} height={props.height ?? 20} ariaLabel={props.ariaLabel} />
          </Suspense>
        </span>
      );
    case 'mono':
      return <TextStack value={props.value} secondary={props.secondary} secondaryMono={props.secondaryMono} valueClassName={cn('min-w-0 font-mono', props.muted && 'text-[var(--color-text-text-subtler)]')} />;
    case 'primary':
      // Flex, matching TeamMembers' own avatar+name/email row: the leading
      // icon/avatar centers against the FULL text stack (value + secondary
      // + below), not just the value line. A taller avatar (e.g. size-8)
      // next to a single short text row read as visibly unbalanced/
      // misaligned under the previous grid approach, which centered the
      // icon against only the value line's own track height.
      return (
        <span className="flex min-w-0 items-center gap-3">
          {props.leading && <span className="flex shrink-0 items-center">{props.leading}</span>}
          <span className="flex min-w-0 flex-col gap-y-0.5">
            <span className={cn('truncate font-body text-body-m font-medium', props.mono && 'font-mono')}>{props.value}</span>
            {props.secondary != null && (
              <span className={cn('truncate font-body text-body-s font-normal text-[var(--color-text-text-subtler)]', props.secondaryMono && 'font-mono')}>{props.secondary}</span>
            )}
            {props.below != null && <span>{props.below}</span>}
          </span>
        </span>
      );
    default:
      return <TextStack value={props.value} secondary={props.secondary} secondaryMono={props.secondaryMono} valueClassName={cn('min-w-0', props.mono && 'font-mono', props.muted && 'text-[var(--color-text-text-subtler)]')} />;
  }
}

/** Kinds holding an interactive control. Nothing clips them; below md they keep a 44px floor over density. */
const CONTROL_KINDS: readonly DataTableCellKind[] = ['selector', 'menu', 'switch', 'slider', 'input', 'textarea', 'number', 'select', 'combobox', 'autocomplete', 'tags', 'date-range'];

/** Control kinds that are a FIELD: fill the cell edge to edge and carry its 16px gutter themselves. */
const FIELD_KINDS: readonly DataTableCellKind[] = ['input', 'textarea', 'number', 'select', 'combobox', 'autocomplete', 'tags', 'date-range'];

/** Kinds whose height cannot be fixed, so the box states a minimum instead. */
function growsPastTheRow(kind: DataTableCellKind, readOnly?: boolean): boolean {
  if (kind === 'textarea') return true;
  return Boolean(readOnly) && (kind === 'combobox' || kind === 'tags');
}

/**
 * Kinds whose single line is plain text with no chrome of its own — the
 * only kinds that default to the tight --wp-row-h (44px) row. Every
 * other kind (Badge, a control, Usage, Sparkline, ...) has its own
 * vertical padding or control height that doesn't sit well at 44px, so
 * it defaults to --wp-row-h-2 (56px) even at a single line. An explicit
 * `lines` prop, or an auto-detected `secondary` (always 2 lines),
 * overrides this regardless of kind — Мария's rule (Sep 2026).
 */
const COMPACT_KINDS: readonly DataTableCellKind[] = ['text', 'mono', 'primary', 'status'];

/**
 * The shared rendering vocabulary for a DataTable cell. Encodes the
 * house rules once (status is a StatusDot plus a text label, never
 * color alone; identifiers are monospace; a usage bar/sparkline/
 * slider all state their number in text) so a hand-written column
 * def gets them without re-deriving them per screen.
 *
 * Every kind renders into the same box — --wp-row-h tall, content
 * centred — so row height stops tracking whichever kind is tallest.
 * These CSS custom properties are defined by DataTable (--wp-row-h,
 * --wp-row-h-2, --wp-cell-h); this component only reads them.
 *
 * It takes RESOLVED values, not the row — pulling a value out of a
 * row is the column's job, this only decides how it looks.
 */
export function DataTableCell(props: DataTableCellProps) {
  const kind: DataTableCellKind = props.kind ?? 'text';
  const control = CONTROL_KINDS.includes(kind);
  const field = FIELD_KINDS.includes(kind);
  const hasSecondLine = 'secondary' in props && props.secondary != null;
  const lines: 1 | 2 = props.lines ?? (hasSecondLine ? 2 : COMPACT_KINDS.includes(kind) ? 1 : 2);
  const readOnly = 'readOnly' in props ? props.readOnly : undefined;
  const floorOnly = Boolean(props.grow) || ('below' in props && props.below != null) || growsPastTheRow(kind, readOnly);
  const box = floorOnly ? 'min-h-[var(--wp-cell-h,var(--wp-row-h))]' : 'h-[var(--wp-cell-h,var(--wp-row-h))]';
  // `lines` above always resolves to 1 or 2 now (kind-defaulted), so this
  // always sets its own --wp-cell-h rather than falling through to the
  // table's ambient default.
  const ownHeight = lines === 2 ? '[--wp-cell-h:var(--wp-row-h-2)]' : '[--wp-cell-h:var(--wp-row-h)]';

  return (
    <span
      data-kind={kind}
      data-lines={lines}
      data-readonly={readOnly ? '' : undefined}
      data-loading={props.loading ? '' : undefined}
      className={cn(
        'flex min-w-0',
        // Fields keep their own natural height and border (no more forcing them
        // to fill the row via percentage h-full — that fought the components'
        // own wrapper markup and kept collapsing). floorOnly kinds (textarea,
        // readOnly combobox/tags) still stretch since their height IS the row.
        floorOnly && field ? 'items-stretch' : 'items-center',
        box,
        ownHeight,
        control && 'relative z-[1]',
        'px-4',
        kind !== 'custom' && !control && !floorOnly && 'overflow-hidden',
        control && 'min-h-11 md:min-h-0',
        kind === 'menu' && 'justify-end',
        'revealOnHover' in props && props.revealOnHover && 'md:opacity-0 md:transition-opacity md:group-hover/row:opacity-100 md:focus-within:opacity-100 md:has-[[data-state=open]]:opacity-100',
      )}
    >
      {props.loading ? (
        <CellSkeleton kind={kind} leading={'leading' in props && props.leading != null} secondary={'secondary' in props && props.secondary != null} />
      ) : (
        <CellContent {...(props as DataTableCellValueProps)} />
      )}
    </span>
  );
}
