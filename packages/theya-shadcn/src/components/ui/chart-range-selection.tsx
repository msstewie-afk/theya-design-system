import { useState, useMemo, useId, Children, cloneElement } from 'react';
import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import { ReferenceArea, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export interface ChartSelectionRange {
  from: string;
  to: string;
}

interface RechartsPointerState {
  activeLabel?: string | number;
}

interface SelectableChartProps {
  children?: ReactNode;
  onMouseDown?: (state: RechartsPointerState) => void;
  onMouseMove?: (state: RechartsPointerState) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
}

export interface ChartRangeSelectionProps {
  /** A categorical Recharts chart (AreaChart, LineChart, BarChart, ComposedChart). Pass it without a ResponsiveContainer — this provides one. */
  children: ReactElement<SelectableChartProps>;
  /** X-axis values in the same order as the wrapped chart's data. */
  labels: ReadonlyArray<string | number>;
  height?: number;
  /** Controlled selection. Omit to use internal state. */
  selectedRange?: ChartSelectionRange | null;
  onRangeChange?: (range: ChartSelectionRange | null) => void;
  /** Disable drag selection while continuing to display selectedRange. */
  disabled?: boolean;
  /** Accessible name of the selector. Default "Select a range". */
  'aria-label'?: string;
  className?: string;
}

/**
 * Adds drag-to-select range behavior to a categorical Recharts chart.
 *
 * Keyboard (the drag was mouse-only, failing WCAG 2.1.1): the wrapper is
 * focusable; ←/→ move a cursor over the x-axis values, Shift+←/→ extend a
 * selection from where Shift was first pressed, Home/End jump to the ends,
 * Esc clears. Cursor moves and selections are announced in a live region.
 *
 *   <ChartRangeSelection labels={data.map((p) => p.label)} onRangeChange={setRange}>
 *     <AreaChart data={data}><Area dataKey="value" /></AreaChart>
 *   </ChartRangeSelection>
 */
export function ChartRangeSelection({
  children,
  labels,
  height = 240,
  selectedRange,
  onRangeChange,
  disabled = false,
  'aria-label': ariaLabel = 'Select a range',
  className,
}: ChartRangeSelectionProps) {
  const [internalSelection, setInternalSelection] = useState<ChartSelectionRange | null>(null);
  const selection = selectedRange !== undefined ? selectedRange : internalSelection;
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);

  const normalizedLabels = useMemo(() => labels.map(String), [labels]);

  // Keyboard state: a cursor over the labels and the anchor a Shift-extend
  // started from. Neither is shown until the wrapper has keyboard focus.
  const [cursor, setCursor] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const helpId = useId();

  const commit = (next: ChartSelectionRange | null) => {
    if (selectedRange === undefined) setInternalSelection(next);
    onRangeChange?.(next);
  };

  const describe = (range: ChartSelectionRange | null) => (range ? `Selected ${range.from} to ${range.to}` : 'Selection cleared');

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || normalizedLabels.length === 0) return;
    const last = normalizedLabels.length - 1;
    const start = cursor ?? (selection ? Math.max(0, normalizedLabels.indexOf(selection.from)) : 0);
    let nextCursor: number | null = null;
    if (e.key === 'ArrowRight') nextCursor = Math.min(start + (cursor === null ? 0 : 1), last);
    else if (e.key === 'ArrowLeft') nextCursor = Math.max(start - (cursor === null ? 0 : 1), 0);
    else if (e.key === 'Home') nextCursor = 0;
    else if (e.key === 'End') nextCursor = last;
    else if (e.key === 'Escape') {
      if (!selection) return;
      e.preventDefault();
      setAnchor(null);
      commit(null);
      setAnnouncement(describe(null));
      return;
    } else return;

    e.preventDefault();
    setCursor(nextCursor);
    if (e.shiftKey) {
      const from = anchor ?? start;
      if (anchor === null) setAnchor(from);
      if (from === nextCursor) return;
      const [a, b] = from < nextCursor ? [from, nextCursor] : [nextCursor, from];
      const range = { from: normalizedLabels[a], to: normalizedLabels[b] };
      commit(range);
      setAnnouncement(describe(range));
    } else {
      setAnchor(null);
      setAnnouncement(normalizedLabels[nextCursor]);
    }
  };

  const pointerLabel = (state: RechartsPointerState) => (state.activeLabel === undefined ? null : String(state.activeLabel));

  const startSelection = (state: RechartsPointerState) => {
    const label = pointerLabel(state);
    if (!label) return;
    setSelectionStart(label);
    setSelectionEnd(label);
  };

  const extendSelection = (state: RechartsPointerState) => {
    if (!selectionStart) return;
    const label = pointerLabel(state);
    if (label) setSelectionEnd(label);
  };

  const finishSelection = () => {
    if (!selectionStart || !selectionEnd || selectionStart === selectionEnd) {
      commit(null);
    } else {
      const startIndex = normalizedLabels.indexOf(selectionStart);
      const endIndex = normalizedLabels.indexOf(selectionEnd);
      if (startIndex < 0 || endIndex < 0) {
        commit(null);
      } else {
        commit(startIndex <= endIndex ? { from: selectionStart, to: selectionEnd } : { from: selectionEnd, to: selectionStart });
      }
    }
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const activeSelection = selectionStart && selectionEnd ? { from: selectionStart, to: selectionEnd } : selection;

  // Recharts discovers axes/series from the chart's DIRECT children — keep
  // them direct rather than nested in a Fragment, or the chart mounts with
  // no series.
  const chartChildren = Children.toArray(children.props.children);
  if (activeSelection) {
    chartChildren.push(
      <ReferenceArea
        key="chart-range-selection"
        x1={activeSelection.from}
        x2={activeSelection.to}
        // --color-bg-chart-01 (globals.css) — same shared chart palette
        // AreaChart/LineChart/BarChart/DonutChart read; chart-01 is blue,
        // matching --color-bg-primary-bg-primary, so this stays the same
        // brand blue as before.
        fill="var(--color-bg-chart-01)"
        fillOpacity={0.16}
        stroke="var(--color-bg-chart-01)"
        strokeOpacity={0.65}
      />,
    );
  }
  if (focused && cursor !== null && normalizedLabels[cursor] !== undefined) {
    // Keyboard cursor: a one-category outline, only while focused.
    chartChildren.push(
      <ReferenceArea
        key="chart-range-selection-cursor"
        x1={normalizedLabels[cursor]}
        x2={normalizedLabels[cursor]}
        fill="none"
        stroke="var(--color-border-border-primary)"
        strokeWidth={2}
        strokeDasharray="4 3"
      />,
    );
  }

  const chart = cloneElement(
    children,
    disabled ? {} : { onMouseDown: startSelection, onMouseMove: extendSelection, onMouseUp: finishSelection, onMouseLeave: selectionStart ? finishSelection : children.props.onMouseLeave },
    ...chartChildren,
  );

  return (
    <div
      role="group"
      aria-roledescription="range selector"
      aria-label={ariaLabel}
      aria-describedby={disabled ? undefined : helpId}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setAnchor(null);
      }}
      className={cn(
        'relative z-[2] w-full rounded-[var(--size-border-radius-border-radius-lg)] outline-none',
        'focus-visible:focus-ring',
        !disabled && 'cursor-crosshair select-none',
        className,
      )}
    >
      <ResponsiveContainer width="100%" height={height}>
        {chart}
      </ResponsiveContainer>
      <span id={helpId} className="sr-only">
        Use left and right arrow keys to move, Shift plus arrow keys to select a range, Escape to clear.
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </div>
  );
}
