import { cn } from '@/lib/utils';

/**
 * No library dependency in the reference (pure div composition) — ported
 * directly onto our tokens. Composes a borderless InputGroupInput with
 * InputGroupAddon segments inside one bordered container that shares
 * one focus-within ring — matching TextField's own conventions
 * (height, focus-ring token, and the border+bg pairing on error) so a
 * separately-built input-shaped component doesn't drift from it.
 */
function InputGroup({ className, onMouseDown, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      // Clicking anywhere in the group (padding, an addon) focuses the
      // input — matching the reference. Without this, only a click
      // directly on the input's own hit area would focus it, even
      // though the whole bordered box reads as one clickable field.
      onMouseDown={(event) => {
        onMouseDown?.(event);
        if (event.defaultPrevented || event.button !== 0) return;
        const target = event.target as HTMLElement;
        if (target.closest('input, button, a, select, textarea, [role=button]')) return;
        const input = event.currentTarget.querySelector<HTMLInputElement>('input:not(:disabled)');
        if (!input) return;
        event.preventDefault();
        input.focus();
      }}
      className={cn(
        // `group` so InputGroupAddon can react to the input's own
        // aria-invalid state via group-has-* below.
        'group flex h-[var(--size-size-control-size-control-2xl)] w-full min-w-0 items-stretch overflow-hidden',
        'rounded-[var(--size-border-radius-border-radius-lg)] border border-solid',
        'border-[var(--color-border-border-default)] bg-[var(--color-bg-input-bg-input)]',
        'text-body-m text-[var(--color-text-text)]',
        'transition-[border-color,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
        'has-[input:hover]:not-has-[input:disabled]:not-has-[input[aria-invalid=true]]:border-[var(--color-border-border-primary)]',
        'not-has-[input[aria-invalid=true]]:focus-within:border-[var(--color-border-border-primary)]',
        // Same equal-specificity clash as the border rule above — this
        // was unguarded, so it could win over the invalid group's danger
        // bg on focus-within.
        'not-has-[input[aria-invalid=true]]:focus-within:bg-[var(--color-bg-input-bg-input-active)]',
        'focus-within:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
        'has-[input:disabled]:border-[var(--color-border-border-subtle)]',
        // Both border AND background change on error, matching
        // TextField's own error variant — not border alone.
        'has-[input[aria-invalid=true]]:border-[var(--color-border-border-danger)]',
        'has-[input[aria-invalid=true]]:bg-[var(--color-bg-input-bg-input-danger)]',
        // Named explicitly (not just relying on the :not() guards above) so
        // hover/focus-within on an invalid field can't win the specificity
        // tie against this rule — same fix pattern as NumberField/Select.
        'has-[input[aria-invalid=true]]:hover:border-[var(--color-border-border-danger-hover)]',
        'has-[input[aria-invalid=true]]:focus-within:border-[var(--color-border-border-danger)]',
        // One step denser than the idle/hover danger bg while the inner
        // input is actively focused.
        'has-[input[aria-invalid=true]]:focus-within:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
        'has-[input[aria-invalid=true]]:focus-within:shadow-[0_0_0_4px_var(--color-focus-focus-ring-error)]',
        className,
      )}
      {...props}
    />
  );
}

export interface InputGroupAddonProps extends React.ComponentProps<'div'> {
  position?: 'start' | 'end';
  divider?: boolean;
}

/** Non-interactive segment: short text ("https://") or a 16px icon. */
function InputGroupAddon({ className, position = 'start', divider = true, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-position={position}
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center gap-1.5 px-[var(--size-margin-margin-s)]',
        'bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-text-text-subtler)] select-none',
        // Reacts to the sibling input's aria-invalid via the group set
        // on InputGroup — a plain sibling selector can't reach an addon
        // sitting BEFORE the input in DOM order (position="start").
        'group-has-[input[aria-invalid=true]]:bg-[var(--color-bg-danger-bg-danger-subtler)]',
        'group-has-[input[aria-invalid=true]]:text-[var(--color-icon-icon-danger)]',
        'group-has-[input:disabled]:text-[var(--color-icon-icon-subtle)]',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        divider && position === 'start' && 'border-r border-solid border-[var(--color-border-border-subtle)]',
        divider && position === 'end' && 'border-l border-solid border-[var(--color-border-border-subtle)]',
        className,
      )}
      {...props}
    />
  );
}

/** Borderless field — the GROUP owns border/hover/focus, this drops its own chrome. */
function InputGroupInput({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-full w-full min-w-0 flex-1 bg-transparent px-[var(--size-margin-margin-s)]',
        'text-body-m text-[var(--color-text-text)] outline-none',
        'placeholder:text-[var(--color-text-text-subtler)]',
        // Value AND placeholder both go danger when invalid, matching the
        // group wrapper's own border/bg — this input never got either.
        'aria-[invalid=true]:text-[var(--color-text-text-danger)]',
        'aria-[invalid=true]:placeholder:text-[var(--color-text-text-danger)]',
        'disabled:cursor-not-allowed disabled:text-[var(--color-text-text-subtler)] disabled:italic',
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupInput };
