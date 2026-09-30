import { useId } from 'react';
import type { ReactNode } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

/**
 * Selectable bordered card on @radix-ui/react-radio-group (the same
 * package already backing our plain Radio) — no new dependency needed,
 * just a card-shaped Item instead of a circular one. Wrap items in
 * OptionCardGroup (RadioGroupPrimitive.Root, laid out as a grid).
 */
function OptionCardGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn('grid gap-3 sm:grid-cols-2', className)} {...props} />;
}

export interface OptionCardProps
  extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, 'title' | 'children'> {
  title: string;
  description?: string;
  icon?: ReactNode;
}

function OptionCard({ className, value, title, description, icon, ...props }: OptionCardProps) {
  // Named by the title, described by the description. From content alone
  // the radio's name ran both together ("HTTP-01Serve a token file…").
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;
  return (
    <RadioGroupPrimitive.Item
      value={value}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        'group relative flex w-full items-start gap-3 text-left cursor-pointer outline-none',
        'rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid',
        'border-[var(--color-border-border-default)] bg-[var(--color-bg-surface-bg-surface)]',
        'p-[var(--size-margin-margin-lg)]',
        'transition-[background-color,border-color] duration-150 ease-out motion-reduce:transition-none',
        'hover:not-disabled:not-data-[state=checked]:border-[var(--color-border-border-primary)]',
        'focus-visible:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        'data-[state=checked]:border-[var(--color-border-border-primary)]',
        'data-[state=checked]:bg-[var(--color-bg-primary-bg-primary-subtle)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center',
            'text-[var(--color-icon-icon-subtle)] group-data-[state=checked]:text-[var(--color-icon-icon-primary)]',
            '[&_svg]:size-4',
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span id={titleId} className="font-body text-body-m font-medium leading-tight text-[var(--color-text-text)]">
          {title}
        </span>
        {description && (
          <span id={descriptionId} className="font-body text-body-s font-normal text-[var(--color-text-text-subtler)]">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex aspect-square size-4 shrink-0 items-center justify-center rounded-full',
          'border-[1.5px] border-solid border-[var(--color-border-border-default)]',
          'bg-[var(--color-bg-input-bg-input)]',
          'transition-[background-color,border-color] duration-150 ease-out motion-reduce:transition-none',
          'group-hover:border-[var(--color-border-border-primary)]',
          'group-data-[state=checked]:border-[var(--color-bg-primary-bg-primary)]',
          'group-data-[state=checked]:bg-[var(--color-bg-primary-bg-primary)]',
        )}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <span className="size-1.5 rounded-full bg-[var(--color-icon-icon-on-dark)]" />
        </RadioGroupPrimitive.Indicator>
      </span>
    </RadioGroupPrimitive.Item>
  );
}

export { OptionCardGroup, OptionCard };
