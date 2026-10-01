import { useRef, useEffect } from 'react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';
import { NavArrowLeft, NavArrowRight, NavArrowDown } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * Themed date grid on react-day-picker (v10) — supports mode="single" |
 * "multiple" | "range". Used standalone or inside a Popover by
 * DatePicker/DateRangePicker. Nav/day buttons are styled directly with
 * our tokens rather than through our Button component — Button's API
 * (appearance/tone/size) doesn't map cleanly onto shadcn's buttonVariants
 * shape the reference used (variant/size), so mixing the two risked
 * confusing which system governs which class.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  const navButtonClass = cn(
    'inline-flex items-center justify-center size-7 rounded-[var(--size-border-radius-border-radius-md)]',
    'text-[var(--color-icon-icon-subtle)] cursor-pointer select-none',
    'hover:bg-[var(--color-bg-neutral-bg-neutral-subtle)] hover:text-[var(--color-icon-icon)]',
    'transition-colors duration-standard ease-enter motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
  );

  return (
    <DayPicker
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
        month_caption: cn('flex h-[30px] w-full items-center justify-center px-[30px]', defaultClassNames.month_caption),
        dropdowns: cn('flex h-[30px] w-full items-center justify-center gap-1.5 text-body-s font-medium', defaultClassNames.dropdowns),
        dropdown_root: cn(
          'relative rounded-[var(--size-border-radius-border-radius-md)] border border-solid border-[var(--color-border-border-default)]',
          'has-focus:border-[var(--color-border-border-primary)] has-focus:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn('absolute inset-0 bg-[var(--color-bg-surface-bg-surface-overlay)] opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'font-medium text-[var(--color-text-text)]',
          captionLayout === 'label' ? 'text-body-s' : 'flex h-8 items-center gap-1 rounded-[var(--size-border-radius-border-radius-lg)] pl-2 pr-1 text-body-s [&>svg]:size-3.5 [&>svg]:text-[var(--color-icon-icon-subtle)]',
          defaultClassNames.caption_label,
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn('flex-1 text-body-xs font-normal text-[var(--color-text-text-subtler)]', defaultClassNames.weekday),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-[30px]', defaultClassNames.week_number_header),
        week_number: cn('text-body-xs text-[var(--color-text-text-subtler)]', defaultClassNames.week_number),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-l-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]', defaultClassNames.range_start),
        range_middle: cn('rounded-none bg-[var(--color-bg-neutral-bg-neutral-subtle)]', defaultClassNames.range_middle),
        range_end: cn('rounded-r-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-neutral-bg-neutral-subtle)]', defaultClassNames.range_end),
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
          if (orientation === 'left') return <NavArrowLeft className={cn('size-4', chevronClassName)} {...chevronProps} />;
          if (orientation === 'right') return <NavArrowRight className={cn('size-4', chevronClassName)} {...chevronProps} />;
          return <NavArrowDown className={cn('size-4', chevronClassName)} {...chevronProps} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...weekProps }) => (
          <td {...weekProps}>
            <div className="flex size-[34px] items-center justify-center text-center">{children}</div>
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
        'flex aspect-square size-auto w-full min-w-[34px] items-center justify-center rounded-[var(--size-border-radius-border-radius-md)]',
        'text-body-s font-normal text-[var(--color-text-text)] cursor-pointer',
        'transition-colors duration-standard ease-enter motion-reduce:transition-none',
        'hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        'disabled:cursor-not-allowed disabled:pointer-events-none',
        'data-[selected-single=true]:bg-[var(--color-bg-primary-bg-primary)] data-[selected-single=true]:text-[var(--color-icon-icon-on-dark)]',
        'data-[selected-single=true]:hover:bg-[var(--color-bg-primary-bg-primary-hover)]',
        'data-[range-middle=true]:rounded-none',
        'data-[range-start=true]:rounded-l-[var(--size-border-radius-border-radius-md)] data-[range-start=true]:rounded-r-none',
        'data-[range-start=true]:bg-[var(--color-bg-primary-bg-primary)] data-[range-start=true]:text-[var(--color-icon-icon-on-dark)]',
        'data-[range-start=true]:hover:bg-[var(--color-bg-primary-bg-primary-subtle)] data-[range-start=true]:hover:text-[var(--color-text-text-link-on-tonal)]',
        'data-[range-end=true]:rounded-l-none data-[range-end=true]:rounded-r-[var(--size-border-radius-border-radius-md)]',
        'data-[range-end=true]:bg-[var(--color-bg-primary-bg-primary)] data-[range-end=true]:text-[var(--color-icon-icon-on-dark)]',
        'data-[range-end=true]:hover:bg-[var(--color-bg-primary-bg-primary-subtle)] data-[range-end=true]:hover:text-[var(--color-text-text-link-on-tonal)]',
        className,
      )}
      {...props}
    />
  );
}
