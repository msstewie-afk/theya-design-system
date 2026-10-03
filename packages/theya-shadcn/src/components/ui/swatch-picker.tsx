import { useId, useState } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

/**
 * SwatchPicker — pick a color/material/pattern by its look: product
 * variants (PDP), a color facet in a catalog filter, a label or theme color.
 *
 * - `type="single"` (default) is a Radix RadioGroup — arrow keys move, one
 *   value, works as a form field (`name`).
 * - `type="multiple"` is a Radix ToggleGroup of pressed buttons — for filters.
 *
 * Each swatch is a plain color, a two-tone split (`colors`) or an image
 * (fabric, finish). `unavailable` swatches stay selectable but are struck
 * through — shoppers still want to see the variant exists (Baymard).
 * With a `legend` the group shows "Color: Midnight" — the selected name,
 * because swatches alone don't tell which shade "navy" vs "midnight" is.
 */

export interface SwatchOption {
  value: string;
  /** Human name — tooltip, accessible name and the legend value. */
  label: string;
  /** Any CSS color. */
  color?: string;
  /** Two or more colors, split diagonally (e.g. a two-tone product). */
  colors?: string[];
  /** Image URL (fabric, wood, pattern) — fills the swatch. */
  image?: string;
  /** Out of stock: struck through, still selectable. */
  unavailable?: boolean;
  disabled?: boolean;
}

const itemVariants = cva(
  [
    'group/swatch relative shrink-0 cursor-pointer p-0 outline-none disabled:cursor-not-allowed disabled:opacity-40',
    // Selection ring — a pseudo border with a gap, so it reads on any swatch color.
    'before:pointer-events-none before:absolute before:rounded-[inherit] before:border-2 before:border-solid before:border-[var(--color-bg-primary-bg-primary)] before:opacity-0 before:content-[""]',
    'data-[state=checked]:before:opacity-100 data-[state=on]:before:opacity-100',
    'not-disabled:hover:before:opacity-100 not-disabled:hover:before:border-[var(--color-border-border-neutral)] data-[state=checked]:hover:before:border-[var(--color-bg-primary-bg-primary)] data-[state=on]:hover:before:border-[var(--color-bg-primary-bg-primary)]',
    // Focus as an outline outside the selection ring (box-shadow would sit under it).
    'focus-visible:outline-4 focus-visible:outline-solid focus-visible:outline-[var(--color-focus-focus-ring)]',
  ],
  {
    variants: {
      size: {
        sm: 'size-5 before:-inset-[3px] focus-visible:outline-offset-[3px]',
        md: 'size-8 before:-inset-1 focus-visible:outline-offset-4',
        lg: 'size-10 before:-inset-1 focus-visible:outline-offset-4',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-[var(--size-border-radius-border-radius-md)]',
      },
    },
    defaultVariants: { size: 'md', shape: 'circle' },
  },
);

const GAP: Record<'sm' | 'md' | 'lg', string> = { sm: 'gap-2', md: 'gap-3', lg: 'gap-3' };

function fillStyle(option: SwatchOption): React.CSSProperties {
  if (option.image) return { backgroundImage: `url(${option.image})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  if (option.colors?.length) {
    const step = 100 / option.colors.length;
    const stops = option.colors.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(', ');
    return { background: `linear-gradient(135deg, ${stops})` };
  }
  return { background: option.color };
}

function SwatchFill({ option }: { option: SwatchOption }) {
  return (
    <>
      <span
        aria-hidden
        style={fillStyle(option)}
        // Hairline inner edge keeps white/black swatches visible on a same-colored page.
        className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_var(--black-a200)] [[data-theme=dark]_&]:shadow-[inset_0_0_0_1px_var(--white-a300)]"
      />
      {option.unavailable && (
        <span aria-hidden className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <span className="absolute left-1/2 top-1/2 h-[2px] w-[150%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[var(--color-white)] shadow-[0_0_0_1px_var(--black-a300)]" />
        </span>
      )}
    </>
  );
}

interface SwatchPickerBaseProps extends VariantProps<typeof itemVariants> {
  options: SwatchOption[];
  /** Group label, e.g. "Color". Shown as "Color: <selected name>". */
  legend?: React.ReactNode;
  /** Hides the selected name after the legend. */
  hideValueLabel?: boolean;
  /** Shows the swatch name in a tooltip on hover/focus. */
  tooltips?: boolean;
  /** Text appended to the accessible name of unavailable swatches. */
  unavailableLabel?: string;
  /** Display only the first N swatches, then a "+K" counter (product cards). */
  max?: number;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export interface SwatchPickerSingleProps extends SwatchPickerBaseProps {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
}

export interface SwatchPickerMultipleProps extends SwatchPickerBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type SwatchPickerProps = SwatchPickerSingleProps | SwatchPickerMultipleProps;

export function SwatchPicker(props: SwatchPickerProps) {
  const {
    options,
    legend,
    hideValueLabel = false,
    tooltips = true,
    unavailableLabel = 'out of stock',
    max,
    size = 'md',
    shape,
    className,
    disabled,
    'aria-label': ariaLabel,
  } = props;
  const legendId = useId();

  const shown = max !== undefined ? options.slice(0, max) : options;
  const hiddenCount = options.length - shown.length;

  // Always drive Radix as controlled so the legend can show the live selection.
  const [inner, setInner] = useState<string | string[] | undefined>(props.defaultValue);
  const current = props.value ?? inner;
  const selected = Array.isArray(current) ? current : current ? [current] : [];
  const selectedLabel = options
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label)
    .join(', ');

  const accessibleName = (o: SwatchOption) => (o.unavailable ? `${o.label}, ${unavailableLabel}` : o.label);

  const renderItem = (o: SwatchOption, Item: typeof RadioGroupPrimitive.Item | typeof ToggleGroupPrimitive.Item) => {
    const item = (
      <Item key={o.value} value={o.value} disabled={o.disabled} aria-label={accessibleName(o)} className={itemVariants({ size, shape })}>
        <SwatchFill option={o} />
      </Item>
    );
    if (!tooltips) return item;
    return (
      <Tooltip key={o.value}>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent>{o.unavailable ? `${o.label} — ${unavailableLabel}` : o.label}</TooltipContent>
      </Tooltip>
    );
  };

  const more = hiddenCount > 0 && (
    <span className="self-center text-body-s text-[var(--color-text-text-subtle)]">
      +{hiddenCount}
      <span className="sr-only"> more</span>
    </span>
  );

  const groupClass = cn('flex flex-wrap items-center', GAP[size ?? 'md'], size === 'sm' ? 'p-[3px]' : 'p-1');
  const labelling = legend ? { 'aria-labelledby': legendId } : { 'aria-label': ariaLabel };

  const group =
    props.type === 'multiple' ? (
      <ToggleGroupPrimitive.Root
        type="multiple"
        value={(current as string[] | undefined) ?? []}
        onValueChange={(v: string[]) => {
          setInner(v);
          props.onValueChange?.(v);
        }}
        disabled={disabled}
        className={groupClass}
        {...labelling}
      >
        {shown.map((o) => renderItem(o, ToggleGroupPrimitive.Item))}
        {more}
      </ToggleGroupPrimitive.Root>
    ) : (
      <RadioGroupPrimitive.Root
        value={(current as string | undefined) ?? ''}
        onValueChange={(v: string) => {
          setInner(v);
          props.onValueChange?.(v);
        }}
        name={props.name}
        required={props.required}
        disabled={disabled}
        orientation="horizontal"
        className={groupClass}
        {...labelling}
      >
        {shown.map((o) => renderItem(o, RadioGroupPrimitive.Item))}
        {more}
      </RadioGroupPrimitive.Root>
    );

  if (!legend) return <div className={className}>{group}</div>;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div id={legendId} className="text-body-m text-[var(--color-text-text)]">
        <span className="font-medium">{legend}</span>
        {!hideValueLabel && selectedLabel && (
          <>
            <span className="font-medium">:</span> <span className="text-[var(--color-text-text-subtle)]">{selectedLabel}</span>
          </>
        )}
      </div>
      {group}
    </div>
  );
}
