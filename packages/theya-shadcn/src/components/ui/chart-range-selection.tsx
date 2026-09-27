import { useState, useMemo, Children, cloneElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
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
  className?: string;
}

/**
 * Adds drag-to-select range behavior to a categorical Recharts chart.
 *
 *   <ChartRangeSelection labels={data.map((p) => p.label)} onRangeChange={setRange}>
 *     <AreaChart data={data}><Area dataKey="value" /></AreaChart>
 *   </ChartRangeSelection>
 */
export function ChartRangeSelection({ children, labels, height = 240, selectedRange, onRangeChange, disabled = false, className }: ChartRangeSelectionProps) {
  const [internalSelection, setInternalSelection] = useState<ChartSelectionRange | null>(null);
  const selection = selectedRange !== undefined ? selectedRange : internalSelection;
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);

  const normalizedLabels = useMemo(() => labels.map(String), [labels]);

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
      if (selectedRange === undefined) setInternalSelection(null);
      onRangeChange?.(null);
    } else {
      const startIndex = normalizedLabels.indexOf(selectionStart);
      const endIndex = normalizedLabels.indexOf(selectionEnd);
      if (startIndex < 0 || endIndex < 0) {
        if (selectedRange === undefined) setInternalSelection(null);
        onRangeChange?.(null);
      } else {
        const next = startIndex <= endIndex ? { from: selectionStart, to: selectionEnd } : { from: selectionEnd, to: selectionStart };
        if (selectedRange === undefined) setInternalSelection(next);
        onRangeChange?.(next);
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

  const chart = cloneElement(
    children,
    disabled ? {} : { onMouseDown: startSelection, onMouseMove: extendSelection, onMouseUp: finishSelection, onMouseLeave: selectionStart ? finishSelection : children.props.onMouseLeave },
    ...chartChildren,
  );

  return (
    <div className={cn('relative z-[2] w-full', !disabled && 'cursor-crosshair select-none', className)}>
      <ResponsiveContainer width="100%" height={height}>
        {chart}
      </ResponsiveContainer>
    </div>
  );
}
