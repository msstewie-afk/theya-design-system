import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'iconoir-react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

/**
 * Start/end date field composing Button + Popover + a range Calendar.
 * Stays open through selection (a range needs two clicks); close by
 * clicking away or Esc. Two months by default (numberOfMonths), stack
 * vertically below md.
 */
export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  numberOfMonths?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
  calendarProps?: Omit<React.ComponentProps<typeof Calendar>, 'mode' | 'selected' | 'onSelect' | 'numberOfMonths'>;
}

export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  placeholder = 'Pick a date range',
  numberOfMonths = 2,
  disabled,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  calendarProps,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<DateRange | undefined>(defaultValue);
  const selected = value !== undefined ? value : internal;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const commit = (next: DateRange | undefined) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const fmt = new Intl.DateTimeFormat(mounted ? undefined : 'en-US', { dateStyle: 'medium' });
  const label = selected?.from ? (selected.to ? `${fmt.format(selected.from)} – ${fmt.format(selected.to)}` : fmt.format(selected.from)) : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="outlined"
          intent="secondary"
          size="xl"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
          leftIcon={<CalendarIcon />}
          className={cn(
            'w-full justify-start font-normal',
            !selected?.from && 'text-[var(--color-text-text-subtler)]',
            className,
          )}
        >
          {selected?.from ? label : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[var(--radix-popover-content-available-height)] w-auto overflow-y-auto p-0" align="start">
        <Calendar mode="range" selected={selected} onSelect={commit} numberOfMonths={numberOfMonths} autoFocus {...calendarProps} />
      </PopoverContent>
    </Popover>
  );
}
