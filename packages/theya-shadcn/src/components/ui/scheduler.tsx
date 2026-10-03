import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  differenceInMinutes,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import type { StatusTone } from './status-dot';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

/**
 * Scheduler — events on a calendar grid: maintenance windows, bookings,
 * shifts, release plans, content calendars.
 *
 * - `week` / `day`: time grid with an all-day row, overlapping events laid
 *   out side by side, a "now" line, and drag to move (time and day) or
 *   resize from the bottom edge in 15-minute steps (`onEventChange`).
 *   Click an empty slot → `onSlotClick` (create flow).
 * - `month`: 6-week grid, up to `maxEventsPerDay` chips per cell and a
 *   "+N more" button that opens that day.
 *
 * Events are buttons named with title and time; the header has Today,
 * previous/next and a view switch. Dates are formatted with Intl for
 * `locale`; weeks start on `weekStartsOn` (Monday by default).
 */

export type SchedulerView = 'day' | 'week' | 'month';

export interface SchedulerEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  tone?: StatusTone;
  /** Disables drag/resize for this event. */
  locked?: boolean;
}

export interface SchedulerProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  events: SchedulerEvent[];
  view?: SchedulerView;
  defaultView?: SchedulerView;
  onViewChange?: (view: SchedulerView) => void;
  /** The date the visible range is built around. */
  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  views?: SchedulerView[];
  onEventClick?: (event: SchedulerEvent) => void;
  /** Drag/resize finished. Omit to make events read-only. */
  onEventChange?: (event: SchedulerEvent, next: { start: Date; end: Date }) => void;
  /** Empty slot clicked: a 1-hour range in week/day view, a whole day in month view. */
  onSlotClick?: (range: { start: Date; end: Date; allDay: boolean }) => void;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Pixel height of one hour in week/day view. */
  hourHeight?: number;
  /** Hour the time grid scrolls to on open. */
  scrollToHour?: number;
  /** Month view: chips per day before "+N more". */
  maxEventsPerDay?: number;
  /** Fixed "now" for stories/tests; defaults to the real clock. */
  now?: Date;
}

/* ------------------------------------------------------------------ */

const TONE: Record<StatusTone, string> = {
  primary: 'bg-[var(--color-bg-primary-bg-primary-subtle)] border-[var(--color-border-border-primary)]',
  info: 'bg-[var(--color-bg-info-bg-info-subtle)] border-[var(--color-border-border-info)]',
  success: 'bg-[var(--color-bg-success-bg-success-subtle)] border-[var(--color-border-border-success)]',
  warning: 'bg-[var(--color-bg-warning-bg-warning-subtle)] border-[var(--color-border-border-warning)]',
  danger: 'bg-[var(--color-bg-danger-bg-danger-subtle)] border-[var(--color-border-border-danger)]',
  neutral: 'bg-[var(--color-bg-neutral-bg-neutral-subtle)] border-[var(--color-border-border-neutral)]',
};

const STEP = 15; // minutes
const snap = (min: number) => Math.round(min / STEP) * STEP;

function useNow(fixed?: Date) {
  const [now, setNow] = useState(() => fixed ?? new Date());
  useEffect(() => {
    if (fixed) {
      setNow(fixed);
      return;
    }
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [fixed]);
  return now;
}

interface Placed {
  event: SchedulerEvent;
  top: number; // minutes from day start
  height: number; // minutes
  col: number;
  cols: number;
}

/** Side-by-side layout for overlapping timed events of one day. */
function layoutDay(events: SchedulerEvent[], day: Date): Placed[] {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  const items = events
    .filter((e) => !e.allDay && e.start < dayEnd && e.end > dayStart)
    .map((event) => {
      const s = Math.max(0, differenceInMinutes(event.start, dayStart));
      const en = Math.min(24 * 60, differenceInMinutes(event.end, dayStart));
      return { event, top: s, height: Math.max(STEP, en - s), col: 0, cols: 1 };
    })
    .sort((a, b) => a.top - b.top || b.height - a.height);

  const out: Placed[] = [];
  let cluster: Placed[] = [];
  let clusterEnd = -1;
  const flush = () => {
    const columns: number[] = []; // end minute per column
    for (const p of cluster) {
      let c = columns.findIndex((end) => end <= p.top);
      if (c === -1) c = columns.push(0) - 1;
      columns[c] = p.top + p.height;
      p.col = c;
    }
    for (const p of cluster) p.cols = columns.length;
    out.push(...cluster);
    cluster = [];
  };
  for (const item of items) {
    if (item.top >= clusterEnd) flush();
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.top + item.height);
  }
  flush();
  return out;
}

/* ------------------------------------------------------------------ */

export function Scheduler({
  events,
  view: viewProp,
  defaultView = 'week',
  onViewChange,
  date: dateProp,
  defaultDate,
  onDateChange,
  views = ['day', 'week', 'month'],
  onEventClick,
  onEventChange,
  onSlotClick,
  locale,
  weekStartsOn = 1,
  hourHeight = 48,
  scrollToHour = 8,
  maxEventsPerDay = 3,
  now: nowProp,
  className,
  ...props
}: SchedulerProps) {
  const now = useNow(nowProp);
  const [viewState, setViewState] = useState(defaultView);
  const [dateState, setDateState] = useState(() => defaultDate ?? nowProp ?? new Date());
  const view = viewProp ?? viewState;
  const date = dateProp ?? dateState;
  const setView = (v: SchedulerView) => {
    if (viewProp === undefined) setViewState(v);
    onViewChange?.(v);
  };
  const setDate = (d: Date) => {
    if (dateProp === undefined) setDateState(d);
    onDateChange?.(d);
  };

  const fmt = useMemo(
    () => ({
      monthYear: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      dayLong: new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      dayShort: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      dayNum: new Intl.DateTimeFormat(locale, { day: 'numeric' }),
      hour: new Intl.DateTimeFormat(locale, { hour: 'numeric' }),
      time: new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
    }),
    [locale],
  );
  const timeRange = (e: { start: Date; end: Date }) => `${fmt.time.format(e.start)} – ${fmt.time.format(e.end)}`;

  const days = useMemo(() => {
    if (view === 'day') return [startOfDay(date)];
    if (view === 'week') {
      const s = startOfWeek(date, { weekStartsOn });
      return Array.from({ length: 7 }, (_, i) => addDays(s, i));
    }
    const s = startOfWeek(startOfMonth(date), { weekStartsOn });
    return Array.from({ length: 42 }, (_, i) => addDays(s, i));
  }, [view, date, weekStartsOn]);

  const title =
    view === 'month'
      ? fmt.monthYear.format(date)
      : view === 'day'
        ? fmt.dayLong.format(date)
        : (() => {
            const s = days[0];
            const e = days[6];
            return isSameMonth(s, e) ? `${fmt.dayShort.format(s)} – ${fmt.dayNum.format(e)}, ${e.getFullYear()}` : `${fmt.dayShort.format(s)} – ${fmt.dayShort.format(e)}, ${e.getFullYear()}`;
          })();

  const step = (dir: 1 | -1) => setDate(view === 'month' ? addMonths(date, dir) : view === 'week' ? addWeeks(date, dir) : addDays(date, dir));
  const prevLabel = view === 'month' ? 'Previous month' : view === 'week' ? 'Previous week' : 'Previous day';
  const nextLabel = view === 'month' ? 'Next month' : view === 'week' ? 'Next week' : 'Next day';

  return (
    <div
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]',
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-solid border-[var(--color-border-border-subtler)] px-3 py-2">
        <Button size="sm" appearance="outlined" tone="neutral" onClick={() => setDate(nowProp ?? new Date())}>
          Today
        </Button>
        <div className="flex items-center">
          <Button size="sm" appearance="ghost" tone="neutral" iconOnly leftIcon={<NavArrowLeft />} aria-label={prevLabel} onClick={() => step(-1)} />
          <Button size="sm" appearance="ghost" tone="neutral" iconOnly leftIcon={<NavArrowRight />} aria-label={nextLabel} onClick={() => step(1)} />
        </div>
        <h2 className="min-w-0 flex-1 truncate text-heading-2xs text-[var(--color-text-text)]" aria-live="polite">
          {title}
        </h2>
        {views.length > 1 && (
          <ToggleGroup type="single" size="sm" appearance="outlined" value={view} onValueChange={(v) => v && setView(v as SchedulerView)} aria-label="Calendar view">
            {views.map((v) => (
              <ToggleGroupItem key={v} value={v}>
                {v === 'day' ? 'Day' : v === 'week' ? 'Week' : 'Month'}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </div>

      {view === 'month' ? (
        <MonthGrid
          days={days}
          date={date}
          now={now}
          events={events}
          fmt={fmt}
          maxEventsPerDay={maxEventsPerDay}
          timeRange={timeRange}
          onEventClick={onEventClick}
          onSlotClick={onSlotClick}
          onMore={(d) => {
            setDate(d);
            setView('day');
          }}
        />
      ) : (
        <TimeGrid
          days={days}
          now={now}
          events={events}
          fmt={fmt}
          hourHeight={hourHeight}
          scrollToHour={scrollToHour}
          timeRange={timeRange}
          onEventClick={onEventClick}
          onEventChange={onEventChange}
          onSlotClick={onSlotClick}
          onDayClick={views.includes('day') && days.length > 1 ? (d) => (setDate(d), setView('day')) : undefined}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

type Fmt = Record<'monthYear' | 'dayLong' | 'dayShort' | 'weekday' | 'weekdayLong' | 'dayNum' | 'hour' | 'time', Intl.DateTimeFormat>;

// Secondary text inside chips (times) stays on text-text, distinguished by weight only:
// text-subtle fails 4.5:1 on the tinted *-subtle fills in dark.
function EventChip({
  event,
  label,
  onClick,
  className,
  children,
  ...rest
}: { event: SchedulerEvent; label: string; onClick?: () => void } & Omit<React.ComponentProps<'button'>, 'onClick'>) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'block w-full min-w-0 cursor-pointer overflow-hidden rounded-[var(--size-border-radius-border-radius-sm)] border-0 border-l-[3px] border-solid text-left text-[var(--color-text-text)] outline-none focus-visible:z-10 focus-visible:focus-ring',
        TONE[event.tone ?? 'primary'],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function TimeGrid({
  days,
  now,
  events,
  fmt,
  hourHeight,
  scrollToHour,
  timeRange,
  onEventClick,
  onEventChange,
  onSlotClick,
  onDayClick,
}: {
  days: Date[];
  now: Date;
  events: SchedulerEvent[];
  fmt: Fmt;
  hourHeight: number;
  scrollToHour: number;
  timeRange: (e: { start: Date; end: Date }) => string;
  onEventClick?: (e: SchedulerEvent) => void;
  onEventChange?: (e: SchedulerEvent, next: { start: Date; end: Date }) => void;
  onSlotClick?: SchedulerProps['onSlotClick'];
  onDayClick?: (d: Date) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const pxPerMin = hourHeight / 60;

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, scrollToHour * hourHeight - 8);
    // Only on mount and when the hour scale changes.
  }, [hourHeight, scrollToHour]);

  // Drag state: a preview of the event being moved/resized.
  const [drag, setDragState] = useState<{ id: string; start: Date; end: Date } | null>(null);
  // Mirror of `drag` for onPointerUp: pointermove renders aren't flushed synchronously,
  // so a quick drag-and-release read a stale `drag` (null) and the move was lost.
  const dragRef = useRef<{ id: string; start: Date; end: Date } | null>(null);
  const setDrag = (next: { id: string; start: Date; end: Date } | null) => {
    dragRef.current = next;
    setDragState(next);
  };
  const dragInfo = useRef<{
    event: SchedulerEvent;
    mode: 'move' | 'resize';
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const colWidth = () => (columnsRef.current ? columnsRef.current.clientWidth / days.length : 1);

  const onPointerDown = (e: React.PointerEvent, event: SchedulerEvent, mode: 'move' | 'resize') => {
    if (!onEventChange || event.locked || e.button !== 0) return;
    e.stopPropagation();
    dragInfo.current = { event, mode, x: e.clientX, y: e.clientY, moved: false };
    // Capture can throw for a pointer the browser no longer tracks (e.g. synthetic
    // or already-released); the drag still works through the element's own handlers.
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* no capture */
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const info = dragInfo.current;
    if (!info) return;
    const dy = e.clientY - info.y;
    const dx = e.clientX - info.x;
    if (!info.moved && Math.hypot(dx, dy) < 4) return;
    info.moved = true;
    const minutes = snap(dy / pxPerMin);
    if (info.mode === 'resize') {
      const end = addMinutes(info.event.end, minutes);
      setDrag({ id: info.event.id, start: info.event.start, end: end > addMinutes(info.event.start, STEP) ? end : addMinutes(info.event.start, STEP) });
    } else {
      const dayDelta = days.length > 1 ? Math.round(dx / colWidth()) : 0;
      const delta = minutes + dayDelta * 24 * 60;
      setDrag({ id: info.event.id, start: addMinutes(info.event.start, delta), end: addMinutes(info.event.end, delta) });
    }
  };
  const onPointerUp = () => {
    const info = dragInfo.current;
    dragInfo.current = null;
    if (!info) return;
    const preview = dragRef.current;
    if (info.moved && preview) onEventChange?.(info.event, { start: preview.start, end: preview.end });
    else if (!info.moved && info.mode === 'move') onEventClick?.(info.event);
    setDrag(null);
  };

  const shown = useMemo(() => (drag ? events.map((e) => (e.id === drag.id ? { ...e, start: drag.start, end: drag.end } : e)) : events), [events, drag]);
  const allDay = (day: Date) => shown.filter((e) => e.allDay && startOfDay(e.start) <= day && e.end > day);
  const hasAllDay = days.some((d) => allDay(d).length > 0);
  const gridCols = { gridTemplateColumns: `4rem repeat(${days.length}, minmax(0, 1fr))` };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Day headers */}
      {/* Header rows reserve the same scrollbar gutter as the body so the columns line up. */}
      <div className="grid shrink-0 overflow-y-hidden scrollbar-thin [scrollbar-gutter:stable] border-b border-solid border-[var(--color-border-border-subtler)]" style={gridCols}>
        <div />
        {days.map((d) => {
          const today = isSameDay(d, now);
          const content = (
            <>
              <span className="text-body-xs uppercase text-[var(--color-text-text-subtle)]">{fmt.weekday.format(d)}</span>
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-body-m font-medium',
                  today ? 'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary-fill)]' : 'text-[var(--color-text-text)]',
                )}
              >
                {fmt.dayNum.format(d)}
              </span>
            </>
          );
          return (
            <div key={d.toISOString()} className="flex justify-center border-l border-solid border-[var(--color-border-border-subtler)] py-1.5">
              {onDayClick ? (
                <button
                  type="button"
                  onClick={() => onDayClick(d)}
                  aria-label={`${fmt.dayLong.format(d)}${today ? ', today' : ''}`}
                  className="flex cursor-pointer flex-col items-center gap-0.5 rounded-[var(--size-border-radius-border-radius-md)] px-2 outline-none hover:bg-[var(--color-bg-neutral-bg-neutral-subtler)] focus-visible:focus-ring"
                >
                  {content}
                </button>
              ) : (
                <div className="flex flex-col items-center gap-0.5">{content}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      {hasAllDay && (
        <div className="grid shrink-0 overflow-y-hidden scrollbar-thin [scrollbar-gutter:stable] border-b border-solid border-[var(--color-border-border-subtler)]" style={gridCols}>
          <div className="px-2 py-1.5 text-right text-body-xs text-[var(--color-text-text-subtle)]">All day</div>
          {days.map((d) => (
            <div key={d.toISOString()} className="flex flex-col gap-0.5 border-l border-solid border-[var(--color-border-border-subtler)] p-0.5">
              {allDay(d).map((e) => (
                <EventChip key={e.id} event={e} label={`${e.title}, all day`} onClick={() => onEventClick?.(e)} className="px-1.5 py-0.5 text-body-xs font-medium">
                  <span className="block truncate">{e.title}</span>
                </EventChip>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Time grid */}
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto scrollbar-thin [scrollbar-gutter:stable]">
        <div className="grid" style={{ ...gridCols, height: hourHeight * 24 }}>
          {/* Hour labels */}
          <div className="relative">
            {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 text-body-xs tabular-nums text-[var(--color-text-text-subtle)]"
                style={{ top: h * hourHeight }}
              >
                {fmt.hour.format(new Date(2000, 0, 1, h))}
              </span>
            ))}
          </div>
          <div ref={columnsRef} className="relative grid" style={{ gridColumn: '2 / -1', gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map((d) => {
              const placed = layoutDay(shown, d);
              const today = isSameDay(d, now);
              const nowTop = differenceInMinutes(now, startOfDay(d)) * pxPerMin;
              return (
                <div
                  key={d.toISOString()}
                  role="group"
                  aria-label={fmt.dayLong.format(d)}
                  className="relative border-l border-solid border-[var(--color-border-border-subtler)]"
                  style={{
                    // Hour lines + lighter half-hour lines.
                    backgroundImage: `linear-gradient(to bottom, var(--color-border-border-subtler) 1px, transparent 1px)`,
                    backgroundSize: `100% ${hourHeight}px`,
                  }}
                  onClick={(e) => {
                    if (!onSlotClick || e.target !== e.currentTarget) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const min = Math.floor((e.clientY - rect.top) / pxPerMin / 30) * 30;
                    const start = addMinutes(startOfDay(d), min);
                    onSlotClick({ start, end: addMinutes(start, 60), allDay: false });
                  }}
                >
                  {placed.map(({ event, top, height, col, cols }) => {
                    const isDragging = drag?.id === event.id;
                    const draggable = Boolean(onEventChange) && !event.locked;
                    const short = height < 45;
                    return (
                      <EventChip
                        key={event.id}
                        event={event}
                        label={`${event.title}, ${fmt.dayLong.format(event.start)}, ${timeRange(event)}`}
                        onClick={draggable ? undefined : () => onEventClick?.(event)}
                        onKeyDown={(e) => {
                          if (draggable && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            onEventClick?.(event);
                          }
                        }}
                        onPointerDown={(e) => onPointerDown(e, event, 'move')}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={() => ((dragInfo.current = null), setDrag(null))}
                        className={cn(
                          'absolute touch-none px-1.5 py-1 text-body-xs',
                          draggable && 'cursor-grab',
                          isDragging && 'z-20 cursor-grabbing opacity-90 shadow-elevation-md',
                        )}
                        style={{
                          top: top * pxPerMin + 1,
                          height: height * pxPerMin - 2,
                          left: `calc(${(col / cols) * 100}% + 2px)`,
                          width: `calc(${100 / cols}% - 4px)`,
                        }}
                      >
                        <span className={cn('block font-medium', short ? 'truncate' : 'line-clamp-2')}>
                          {event.title}
                          {short && <span className="font-normal"> {fmt.time.format(event.start)}</span>}
                        </span>
                        {!short && <span className="block truncate">{timeRange(event)}</span>}
                        {draggable && (
                          <span
                            aria-hidden
                            onPointerDown={(e) => onPointerDown(e, event, 'resize')}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
                          />
                        )}
                      </EventChip>
                    );
                  })}
                  {today && nowTop >= 0 && nowTop <= 24 * hourHeight && (
                    <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10" style={{ top: nowTop }}>
                      <div className="absolute -left-1 -top-1 size-2 rounded-full bg-[var(--color-bg-danger-bg-danger)]" />
                      <div className="h-0.5 -translate-y-1/2 bg-[var(--color-bg-danger-bg-danger)]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MonthGrid({
  days,
  date,
  now,
  events,
  fmt,
  maxEventsPerDay,
  timeRange,
  onEventClick,
  onSlotClick,
  onMore,
}: {
  days: Date[];
  date: Date;
  now: Date;
  events: SchedulerEvent[];
  fmt: Fmt;
  maxEventsPerDay: number;
  timeRange: (e: { start: Date; end: Date }) => string;
  onEventClick?: (e: SchedulerEvent) => void;
  onSlotClick?: SchedulerProps['onSlotClick'];
  onMore: (d: Date) => void;
}) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  // Drop a trailing week that's entirely in the next month.
  const weeks = differenceInCalendarDays(endOfWeek(monthEnd), days[0]) < 35 ? 5 : 6;
  const visible = days.slice(0, weeks * 7);

  const onDay = (d: Date) =>
    events
      .filter((e) => startOfDay(e.start) <= d && (e.allDay ? e.end > d : startOfDay(e.end) >= d && e.end > d))
      .sort((a, b) => Number(!a.allDay) - Number(!b.allDay) || a.start.getTime() - b.start.getTime());

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid shrink-0 grid-cols-7 border-b border-solid border-[var(--color-border-border-subtler)]">
        {visible.slice(0, 7).map((d) => (
          <div key={d.getDay()} className="py-1.5 text-center text-body-xs uppercase text-[var(--color-text-text-subtle)]">
            <abbr title={fmt.weekdayLong.format(d)} className="no-underline">
              {fmt.weekday.format(d)}
            </abbr>
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7" style={{ gridTemplateRows: `repeat(${weeks}, minmax(6.5rem, 1fr))` }}>
        {visible.map((d, i) => {
          const list = onDay(d);
          const shown = list.slice(0, maxEventsPerDay);
          const more = list.length - shown.length;
          const inMonth = d >= monthStart && d <= monthEnd;
          const today = isSameDay(d, now);
          return (
            <div
              key={d.toISOString()}
              role="group"
              aria-label={`${fmt.dayLong.format(d)}${list.length ? `, ${list.length} ${list.length === 1 ? 'event' : 'events'}` : ''}`}
              className={cn(
                'flex min-w-0 flex-col gap-0.5 border-solid border-[var(--color-border-border-subtler)] p-1',
                i % 7 !== 0 && 'border-l',
                i >= 7 && 'border-t',
                !inMonth && 'bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
              )}
              onClick={(e) => {
                if (!onSlotClick || e.target !== e.currentTarget) return;
                onSlotClick({ start: d, end: addDays(d, 1), allDay: true });
              }}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center self-end rounded-full text-body-s',
                  today ? 'bg-[var(--color-bg-primary-bg-primary)] font-medium text-[var(--color-text-text-on-primary-fill)]' : inMonth ? 'text-[var(--color-text-text)]' : 'text-[var(--color-text-text-subtle)]',
                )}
              >
                {fmt.dayNum.format(d)}
              </span>
              {shown.map((e) => (
                <EventChip
                  key={e.id}
                  event={e}
                  label={`${e.title}, ${e.allDay ? 'all day' : timeRange(e)}`}
                  onClick={() => onEventClick?.(e)}
                  className="px-1.5 py-0.5 text-body-xs"
                >
                  <span className="block truncate">
                    {!e.allDay && <span className="tabular-nums">{fmt.time.format(e.start)} </span>}
                    <span className="font-medium">{e.title}</span>
                  </span>
                </EventChip>
              ))}
              {more > 0 && (
                <button
                  type="button"
                  onClick={() => onMore(d)}
                  className="cursor-pointer self-start rounded-[var(--size-border-radius-border-radius-sm)] px-1.5 text-body-xs font-medium text-[var(--color-text-text-link)] outline-none hover:underline focus-visible:focus-ring"
                >
                  +{more} more
                  <span className="sr-only"> on {fmt.dayLong.format(d)}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
