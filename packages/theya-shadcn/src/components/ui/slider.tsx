import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

/**
 * Range input on @radix-ui/react-slider. Simpler than the Base UI
 * reference: Radix's Thumb is already a real focusable element with
 * role="slider" and its aria-* props settable directly (no inputRef
 * workaround needed to reach a nested native input for aria-invalid).
 * Supports multiple thumbs the same way (value/defaultValue arrays).
 */
export interface SliderProps
  extends Omit<React.ComponentProps<typeof SliderPrimitive.Root>, 'value' | 'defaultValue' | 'onValueChange'> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Map a thumb's numeric value to a human-readable string for aria-valuetext. */
  formatValue?: (value: number, index: number) => string;
  /** Marks the slider as invalid — track fill + thumb switch to danger colors. */
  invalid?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  formatValue,
  invalid = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...props
}: SliderProps) {
  const values = value ?? defaultValue ?? [min];
  const thumbCount = values.length || 1;

  const thumbLabel = (index: number): string | undefined => {
    if (!ariaLabel) return undefined;
    if (thumbCount <= 1) return ariaLabel;
    if (thumbCount === 2) return `${ariaLabel} ${index === 0 ? 'minimum' : 'maximum'}`;
    return `${ariaLabel} value ${index + 1}`;
  };

  return (
    <SliderPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        'data-[orientation=vertical]:h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        'data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          'relative grow rounded-full bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
          'data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full',
          'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            'absolute rounded-full',
            'data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
            invalid ? 'bg-[var(--color-bg-danger-bg-danger)]' : 'bg-[var(--color-bg-primary-bg-primary)]',
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={thumbLabel(i)}
          aria-describedby={ariaDescribedby}
          aria-invalid={invalid || undefined}
          aria-valuetext={formatValue ? formatValue(values[i] ?? min, i) : undefined}
          className={cn(
            'relative block size-4 shrink-0 rounded-full border border-solid',
            'bg-[var(--color-bg-input-bg-input)] shadow-elevation-sm outline-none',
            'transition-[border-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
            invalid ? 'border-[var(--color-border-border-danger)]' : 'border-[var(--color-border-border-primary)]',
            // Hover lifts the thumb; the ring is reserved for keyboard focus.
            'hover:shadow-elevation-md',
            'focus-visible:focus-ring',
            invalid && 'focus-visible:focus-ring-error',
            'data-[disabled]:pointer-events-none',
            // Extends the pointer/touch hit area to 44px (WCAG 2.5.8) without
            // visually growing the 16px dot.
            'before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[""]',
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
