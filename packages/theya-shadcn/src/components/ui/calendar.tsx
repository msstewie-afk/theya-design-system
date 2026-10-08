'use client';

import { useRef, useEffect } from 'react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';
import { NavArrowLeft, NavArrowRight, NavArrowDown } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

/**
 * Themed date grid on react-day-picker (v10) — supports mode="single" |
 * "multiple" | "range". Used standalone or inside a Popover by
 * DatePicker/DateRangePicker. Nav and day buttons are styled directly
 * with our tokens rather than through Button: they are grid cells driven
 * by react-day-picker's modifiers (selected, range start/middle/end,
 * today), which Button's appearance/tone/size API has no states for.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const { dateLocale } = useTheyaI18n();
  const defaultClassNames = getDefaultClassNames();

  const navButtonClass = cn(
    'inline-flex items-center justify-center size-7 rounded-[var(--size-border-radius-border-radius-md)]',
    'text-[var(--color-icon-icon-subtle)] cursor-pointer select-none',
    'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
    'transition-colors duration-standard ease-enter motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:focus-ring',
  );

  return (
    <DayPicker
      // Month and weekday names in the app's locale (a `locale` prop still wins).
      locale={dateLocale}
      showOutsideDays={showOutsideDays}
      className={cn('w-fit p-3', className)}
      captionLayout={captionLayout}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn('absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1', defaultClassNames.nav),
        button_previous: cn(navButtonClass, defaultClassNames.button_previous),
        button_next: cn(navButtonClass, defaultClassNames.button_next),
        month_caption: cn('flex h-8 w-full items-center justify-center px-8', defaultClassNames.month_caption),
        dropdowns: cn('flex h-8 w-full items-center justify-center gap-1.5 text-body-s font-medium', defaultClassNames.dropdowns),
        dropdown_root: cn(
          'relative rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border)]',
          'has-focus:border-[var(--color-border-border-primary)] has-focus:focus-ring',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn('absolute inset-0 bg-[var(--color-bg-surface-bg-surface-overlay)] opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'font-medium text-[var(--color-text-text)]',
          captionLayout === 'label' ? 'text-body-s' : 'flex h-8 items-center gap-1 rounded-[var(--size-border-radius-border-radius-lg)] ps-2 pe-1 text-body-s [&>svg]:size-3.5 [&>svg]:text-[var(--color-icon-icon-subtle)]',
          defaultClassNames.caption_label,
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn('flex-1 text-body-xs font-normal text-[var(--color-text-text-subtler)]', defaultClassNames.weekday),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-8', defaultClassNames.week_number_header),
        week_number: cn('text-body-xs text-[var(--color-text-text-subtler)]', defaultClassNames.week_number),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-s-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]', defaultClassNames.range_start),
        range_middle: cn('rounded-none bg-[var(--color-bg-neutral-bg-neutral-subtle)]', defaultClassNames.range_middle),
        range_end: cn('rounded-e-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]', defaultClassNames.range_end),
        today: cn(
          'rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] data-[selected=true]:rounded-none',
          defaultClassNames.today,
        ),
        outside: cn('text-[var(--color-text-text-subtler)] aria-selected:text-[var(--color-text-text-subtler)]', defaultClassNames.outside),
        disabled: cn('text-[var(--color-text-text-subtler)] opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
          if (orientation === 'left') return <NavArrowLeft className={cn(cn('size-4', chevronClassName), 'rtl:-scale-x-100')} {...chevronProps} />;
          if (orientation === 'right') return <NavArrowRight className={cn(cn('size-4', chevronClassName), 'rtl:-scale-x-100')} {...chevronProps} />;
          return <NavArrowDown className={cn('size-4', chevronClassName)} {...chevronProps} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...weekProps }) => (
          <td {...weekProps}>
            <div className="flex size-8 items-center justify-center text-center">{children}</div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // A Calendar inside a portaled Popover can live far from its trigger in the
    // DOM (notably in Storybook Docs). Native focus scrolling then moves the
    // whole document to the portal when the focused day mounts. Keep keyboard
    // focus on the day without changing the page's scroll position.
    if (modifiers.focused) ref.current?.focus({ preventScroll: true });
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'flex aspect-square size-auto w-full min-w-8 items-center justify-center rounded-[var(--size-border-radius-border-radius-md)]',
        'text-body-s font-normal text-[var(--color-text-text)] cursor-pointer',
        'transition-colors duration-standard ease-enter motion-reduce:transition-none',
        'hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'focus-visible:outline-none focus-visible:focus-ring',
        'disabled:cursor-not-allowed disabled:pointer-events-none',
        'data-[selected-single=true]:bg-[var(--color-bg-primary-bg-primary)] data-[selected-single=true]:text-[var(--color-text-text-on-primary)]',
        'data-[selected-single=true]:hover:bg-[var(--color-bg-primary-bg-primary-hover)]',
        'data-[range-middle=true]:rounded-none',
        'data-[range-start=true]:rounded-s-[var(--size-border-radius-border-radius-md)] data-[range-start=true]:rounded-e-none',
        'data-[range-start=true]:bg-[var(--color-bg-primary-bg-primary)] data-[range-start=true]:text-[var(--color-text-text-on-primary)]',
        'data-[range-start=true]:hover:bg-[var(--color-bg-primary-bg-primary-subtle)] data-[range-start=true]:hover:text-[var(--color-text-text-link-on-tonal)]',
        'data-[range-end=true]:rounded-s-none data-[range-end=true]:rounded-e-[var(--size-border-radius-border-radius-md)]',
        'data-[range-end=true]:bg-[var(--color-bg-primary-bg-primary)] data-[range-end=true]:text-[var(--color-text-text-on-primary)]',
        'data-[range-end=true]:hover:bg-[var(--color-bg-primary-bg-primary-subtle)] data-[range-end=true]:hover:text-[var(--color-text-text-link-on-tonal)]',
        className,
      )}
      {...props}
    />
  );
}
