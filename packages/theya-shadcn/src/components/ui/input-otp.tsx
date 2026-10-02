import { useContext } from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Minus } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * Segmented one-time-code field on `input-otp` (an independent headless
 * library, not tied to Base UI — ports over almost unchanged). Renders
 * one real <input>; put `aria-invalid` on <InputOTP> itself (not a
 * slot) since that's the single real focusable element the library
 * mounts. Pair with visible, described error text via aria-describedby
 * — the destructive border alone isn't sufficient (color-only signal).
 */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & { containerClassName?: string }) {
  return (
    <OTPInput
      containerClassName={cn(
        // `group` lets slots react to the real input's aria-invalid via group-has.
        'group flex flex-wrap items-center gap-2',
        containerClassName,
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...props} />;
}

function InputOTPSlot({ index, className, ...props }: React.ComponentProps<'div'> & { index: number }) {
  const inputOTPContext = useContext(OTPInputContext);
  const slot = inputOTPContext.slots?.[index] ?? {};
  const { char, hasFakeCaret, isActive } = slot as {
    char?: string | null;
    hasFakeCaret?: boolean;
    isActive?: boolean;
  };

  return (
    <div
      // Slots are a visual mirror of the single real <input>, which already
      // exposes the value to assistive tech. Without aria-hidden a screen
      // reader in browse mode reads every digit a second time as loose text.
      aria-hidden="true"
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        // Separate boxes with a gap (via InputOTPGroup's gap-2), not a
        // merged segmented strip — every slot gets its own full border
        // and its own corners, instead of first/last owning the ends.
        'relative flex h-10 w-10 items-center justify-center border border-solid',
        'rounded-[var(--size-border-radius-border-radius-lg)]',
        'border-[var(--color-border-border-default)] bg-[var(--color-bg-input-bg-input)]',
        // Matches TextField's own disabled treatment (border-subtle +
        // bg-neutral-subtler), not just the container's opacity-50.
        'group-has-[:disabled]:border-[var(--color-border-border-subtle)]',
        'group-has-[:disabled]:bg-[var(--color-bg-neutral-bg-neutral-subtler)]',
        'group-has-[:disabled]:text-[var(--color-text-text-disabled)] group-has-[:disabled]:italic',
        'text-body-m text-[var(--color-text-text)] outline-none',
        'transition-[border-color,box-shadow] duration-standard ease-enter motion-reduce:transition-none',
        'data-[active=true]:z-10 data-[active=true]:border-[var(--color-border-border-primary)]',
        'data-[active=true]:bg-[var(--color-bg-input-bg-input-active)]',
        'data-[active=true]:shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        'group-has-[[aria-invalid=true]]:border-[var(--color-border-border-danger)]',
        'group-has-[[aria-invalid=true]]:bg-[var(--color-bg-input-bg-input-danger)]',
        // Active slot's own border/bg (above) don't know about invalid —
        // named explicitly here so an active slot in an invalid OTP field
        // stays danger-colored instead of flashing back to primary, same
        // fix pattern as Select's data-error+data-state=open combo.
        'group-has-[[aria-invalid=true]]:data-[active=true]:border-[var(--color-border-border-danger)]',
        // One step denser than the idle/inactive danger bg for the
        // actively-focused slot.
        'group-has-[[aria-invalid=true]]:data-[active=true]:bg-[var(--color-bg-input-bg-input-danger-pressed)]',
        'group-has-[[aria-invalid=true]]:data-[active=true]:shadow-[0_0_0_4px_var(--color-focus-focus-ring-error)]',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px bg-[var(--color-text-text)]" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div role="separator" className={cn('flex items-center', className)} {...props}>
      <Minus width={16} height={16} className="text-[var(--color-icon-icon-subtle)]" aria-hidden="true" />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
