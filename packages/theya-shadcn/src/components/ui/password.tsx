import { forwardRef, useState } from 'react';
import { Eye, EyeClosed } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { TextField, type TextFieldProps } from './text-field';

/**
 * TextField variant with a show/hide toggle. A thin wrapper AROUND
 * TextField itself (not a hand-copied duplicate of its label/message/
 * disabled styling) — the toggle goes in TextField's own `rightIcon`
 * slot. Trade-off: `rightIcon` overrides TextField's built-in error/
 * success ICON, so that small badge doesn't show here — the danger/
 * success border, background, and message below the field all still
 * do, since those come from TextField's own `error`/`success` props
 * untouched. Only two widths (m 200px, l 348px, mapped straight onto
 * TextField's own "lg"/"2xl" widthSize so the icon positions against
 * the field's REAL width, not a mismatched wrapper) and no left icon
 * or clear button — the toggle occupies the one right-side slot.
 */
const WIDTH_SIZE_MAP = {
  md: 'md', // 200px — TextField's own key names don't match their pixel sizes 1:1 (Figma-vs-token naming mismatch), confirmed: md=200px, lg=348px.
  lg: 'lg', // 348px
} as const;

export interface PasswordProps extends Omit<TextFieldProps, 'type' | 'leftIcon' | 'rightIcon' | 'widthSize'> {
  widthSize?: keyof typeof WIDTH_SIZE_MAP;
}

export const Password = forwardRef<HTMLInputElement, PasswordProps>(function Password(
  { widthSize = 'md', disabled, error, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <TextField
      ref={ref}
      type={visible ? 'text' : 'password'}
      disabled={disabled}
      error={error}
      widthSize={WIDTH_SIZE_MAP[widthSize]}
      rightIcon={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className={cn(
            'pointer-events-auto flex size-6 items-center justify-center rounded-[var(--size-border-radius-border-radius-lg)]',
            // Ghost/danger colors below, matching Button's own
            // type="ghost" intent="danger" combo — this toggle stayed
            // neutral gray before even while the field around it was
            // fully danger-styled.
            hasError
              ? 'text-[var(--color-icon-icon-danger)] hover:not-disabled:bg-[var(--color-bg-danger-bg-danger-subtler-hover)]'
              : 'text-[var(--color-icon-icon-subtle)] hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle)]',
            'transition-colors duration-150 ease-out motion-reduce:transition-none',
            'disabled:cursor-not-allowed',
          )}
        >
          {visible ? <Eye width={16} height={16} aria-hidden="true" /> : <EyeClosed width={16} height={16} aria-hidden="true" />}
        </button>
      }
      {...rest}
    />
  );
});
