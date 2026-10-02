import { createContext, useContext, cloneElement, isValidElement } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, NavArrowDown, NavArrowUp } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { StatusDot, type StatusTone } from './status-dot';
import { Badge, type BadgeTone } from './badge';

/**
 * Single-value picker on @radix-ui/react-select. Carries over TextField's
 * own conventions: the same widthSize scale/tokens, the same heightSize
 * naming (m=40px/body-m, s=32px/body-s — was a bare 36px before, matching
 * nothing), the same danger border+bg pairing on error, and the dropdown's
 * own item text now matches the trigger's size via context (was always
 * body-m regardless of heightSize before).
 */
// Same 4 pixel values TextField uses, relabeled to match how Select's
// own widths actually get picked: s for short values (units, metrics),
// m (default) for typical values, l for long values that still
// truncate with an ellipsis past this width, xl as a ceiling.
const WIDTH_CLASSES = {
  full: 'w-full',
  sm: 'w-[var(--size-width-width-control-sm)]', // 60px
  md: 'w-[var(--size-width-width-control-xl)]', // 240px
  lg: 'w-[var(--size-width-width-control-2xl)]', // 348px
  xl: 'w-[var(--size-width-width-control-3xl)]', // 500px
} as const;

const SelectSizeContext = createContext<'md' | 'sm' | 'lg'>('md');

const SelectGroup = SelectPrimitive.Group;
function SelectValue({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  // Radix mirrors the selected item's ItemText content into this node
  // (icon + text, our own flex row) — without min-w-0/overflow-hidden
  // HERE too, that content can't shrink to fit the trigger, so truncate
  // on the inner text span had no constrained parent to truncate against.
  return (
    <SelectPrimitive.Value
      className={cn('flex min-w-0 flex-1 items-center overflow-hidden', className)}
      {...props}
    />
  );
}

function Select({ heightSize = 'md', children, ...props }: React.ComponentProps<typeof SelectPrimitive.Root> & { heightSize?: 'sm' | 'md' | 'lg' }) {
  return (
    <SelectSizeContext.Provider value={heightSize}>
      <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
    </SelectSizeContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  widthSize?: keyof typeof WIDTH_CLASSES;
  /** Turns the trigger danger-styled (border + bg together, matching TextField's own error variant). Stays danger while the popup is open too — see the InvalidOpen story for why that needs its own rule. */
  error?: boolean;
}

function SelectTrigger({ className, widthSize = 'md', error, children, ...props }: SelectTriggerProps) {
  const heightSize = useContext(SelectSizeContext);
  return (
    <SelectPrimitive.Trigger
      data-error={error || undefined}
      aria-invalid={error || undefined}
      className={cn(
        'flex items-center justify-between gap-2',
        WIDTH_CLASSES[widthSize],
        'rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
        'border-[var(--color-border-border-default)] bg-[var(--color-bg-input-bg-input)]',
        'px-[var(--size-margin-margin-s)] text-[var(--color-text-text)]',
        heightSize === 'sm'
          ? 'h-[var(--size-size-control-size-control-lg)] text-body-s'
          : heightSize === 'lg'
            ? 'h-[var(--size-size-control-size-control-4xl)] text-body-m'
            : 'h-[var(--size-size-control-size-control-2xl)] text-body-m',
        'transition-[border-color,background-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none outline-none',
        'data-[placeholder]:text-[var(--color-text-text-subtler)]',
        // data-[placeholder] and data-[error=true] are independent
        // attributes that can both be true at once (an invalid Select
        // with nothing chosen yet still shows its placeholder) — same
        // specificity as each other, so whichever rule lands later in
        // the compiled stylesheet wins regardless of order here. Name
        // the combined state explicitly so the placeholder stays
        // danger-colored on an invalid trigger instead of reverting to
        // the neutral placeholder gray.
        'data-[error=true]:data-[placeholder]:text-[var(--color-text-text-danger)]',
        'hover:not-disabled:not-data-[error=true]:border-[var(--color-border-border-primary)]',
        'focus-visible:border-[var(--color-border-border-primary)]',
        'focus-visible:bg-[var(--color-bg-input-bg-input-active)]',
        'focus-visible:focus-ring',
        'disabled:cursor-not-allowed disabled:border-[var(--color-border-border-subtle)] disabled:bg-[var(--color-bg-neutral-bg-neutral-subtler)] disabled:text-[var(--color-text-text-disabled)] disabled:italic',
        'data-[state=open]:border-[var(--color-border-border-primary)]',
        'data-[state=open]:bg-[var(--color-bg-input-bg-input-active)]',
        // Both border AND bg change together on error, matching TextField's
        // own danger pairing — border alone was the earlier bug pattern.
        'data-[error=true]:border-[var(--color-border-border-danger)] data-[error=true]:bg-[var(--color-bg-input-bg-input-danger)] data-[error=true]:text-[var(--color-text-text-danger)]',
        // One step denser than the idle/hover danger bg while actively
        // focused (keyboard) or with its own popup open.
        'data-[error=true]:focus-visible:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
        'data-[error=true]:focus-visible:focus-ring-error',
        // The open state's own neutral border (data-[state=open]:border-primary
        // above) sits at equal specificity with the error rule, so which one
        // wins is down to declaration order, not intent — name the combined
        // state explicitly so an invalid trigger stays visibly invalid while
        // its own popup is open (the same regression the reference guards
        // with its InvalidOpen story).
        'data-[error=true]:data-[state=open]:border-[var(--color-border-border-danger)]',
        'data-[error=true]:data-[state=open]:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        '[&_svg]:text-[var(--color-icon-icon)] disabled:[&_svg]:text-[var(--color-icon-icon-subtle)]',
        // Chevron stayed neutral regardless of error before.
        'data-[error=true]:[&_svg]:text-[var(--color-icon-icon-danger)]',
        className,
      )}
      {...props}
    >
      {/* Radix wraps the mirrored ItemText content in its own unstyled <span> (pointer-events:none) — a flex item with default min-width:auto, so it refuses to shrink below its content's width and blocks every min-w-0/truncate set deeper inside it. [&>span] reaches that specific wrapper to force it to actually shrink. */}
      <span className="flex min-w-0 flex-1 items-center overflow-hidden text-left [&>span]:flex [&>span]:min-w-0 [&>span]:flex-1 [&>span]:overflow-hidden">{children}</span>
      <SelectPrimitive.Icon asChild>
        <NavArrowDown />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={sideOffset}
        className={cn(
          'relative z-popover w-fit min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-content-available-width)] overflow-hidden',
          'rounded-[var(--size-border-radius-border-radius-xl)] border border-solid',
          'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface-overlay)]',
          'text-[var(--color-text-text)] shadow-elevation-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none!',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-[var(--size-margin-margin-2xs)]',
            // Width is elastic to content (grows to fit the widest item,
            // never narrower than the trigger), capped by max-w on the
            // outer Content — truncate on SelectItem/ItemText only kicks
            // in once that cap is actually hit.
            position === 'popper' && 'h-[var(--radix-select-trigger-height)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        'px-[var(--size-margin-margin-s)] pb-[var(--size-margin-margin-4xs)] pt-[var(--size-margin-margin-xs)]',
        // Was a hardcoded 10px with no token at all — the only group-label
        // style in the system not built on font-heading/text-heading-*.
        // Matches DropdownMenuLabel's convention now.
        'font-heading text-heading-3xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtle)]',
        className,
      )}
      {...props}
    />
  );
}

export interface SelectItemProps extends React.ComponentProps<typeof SelectPrimitive.Item> {
  /** Icon shown before the text — 16px by default, decorative. Pass `iconSize="lg"` for the 32px media variant (bold label, matches the Figma media-icon item). Mutually exclusive with `status` — same slot. */
  icon?: React.ReactNode;
  iconSize?: 'sm' | 'lg';
  /** Colored dot before the text instead of `icon` — same slot, so passing both just shows the dot. */
  status?: StatusTone;
  /** Pill shown after the text, before the checkmark space. */
  badge?: { label: React.ReactNode; tone?: BadgeTone };
  /** Second line under the text, smaller and subtler — for extra context, not truncated interaction. */
  description?: React.ReactNode;
}

function SelectItem({ className, children, icon, iconSize = 'sm', status, badge, description, ...props }: SelectItemProps) {
  const heightSize = useContext(SelectSizeContext);
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-default select-none items-center gap-2',
        'rounded-[var(--size-border-radius-border-radius-md)]',
        'py-[var(--size-margin-margin-xs)] pl-[var(--size-margin-margin-s)] pr-8',
        // Matches the trigger's own heightSize-driven text size — was
        // always text-body-m regardless of the trigger's size before.
        heightSize === 'sm' ? 'text-body-s' : 'text-body-m',
        'text-[var(--color-text-text)] outline-none',
        'data-[highlighted]:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute right-2.5 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check width={14} height={14} className="text-[var(--color-icon-icon-primary)]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText asChild>
        <span className={cn('flex min-w-0 flex-1 gap-2 overflow-hidden', description ? 'items-start' : 'items-center')}>
          {(icon || status) && (
            <span className={cn('flex shrink-0 items-center justify-center text-[var(--color-icon-icon-subtle)]', description && 'mt-[2px]')}>
              {status ? (
                <StatusDot tone={status} />
              ) : isValidElement<{ className?: string }>(icon) ? (
                cloneElement(icon, {
                  className: cn(iconSize === 'lg' ? 'size-8' : 'size-4', icon.props.className),
                })
              ) : (
                icon
              )}
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <span className="min-w-0 truncate">{children}</span>
            {description && (
              <span className="min-w-0 truncate text-body-xs font-normal text-[var(--color-text-text-subtler)]">
                {description}
              </span>
            )}
          </span>
          {badge && (
            <Badge tone={badge.tone} className="shrink-0 self-center">
              {badge.label}
            </Badge>
          )}
        </span>
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-[var(--color-border-border-subtler)]', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        'flex cursor-default items-center justify-center py-1 bg-[var(--color-bg-surface-bg-surface-overlay)]',
        className,
      )}
      {...props}
    >
      <NavArrowUp width={16} height={16} />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        'flex cursor-default items-center justify-center py-1 bg-[var(--color-bg-surface-bg-surface-overlay)]',
        className,
      )}
      {...props}
    >
      <NavArrowDown width={16} height={16} />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
