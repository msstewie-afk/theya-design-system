import { forwardRef, useState, useCallback } from 'react';
import { TextField } from './text-field';

/**
 * Not in the reference repo, and no headless library covers this
 * shape — built from scratch, but the actual field it renders IS a
 * TextField (not a hand-styled raw <input>) so it inherits TextField's
 * exact chrome, height, focus ring, and error/danger treatment for
 * free instead of duplicating them. Formats as you type against a
 * fixed template (phone, card, date, IP).
 *
 * Known simplification vs a full mask-input library: caret position
 * isn't precisely preserved when editing in the middle (it can jump
 * to the end after a keystroke) — deferred, same spirit as
 * NumberField's deferred press-and-hold.
 */
export interface ModifyResult {
  mask?: string;
  replacement?: Record<string, RegExp>;
  showMask?: boolean;
  separate?: boolean;
}
export type Track = (rawInput: string) => string;
export type Modify = (rawInput: string) => ModifyResult;

export interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  /** Mask template, e.g. "+1 (___) ___-____" or "__/__/____". */
  mask: string;
  /** Placeholder-char to allowed-pattern map. Default { _: /\d/ }. Pass a string like "#" as shorthand for { "#": /./ }. */
  replacement?: Record<string, RegExp> | string;
  /** Show the full mask template while empty. */
  showMask?: boolean;
  /** Keep entered characters in place when deleting in the middle. */
  separate?: boolean;
  /** Conditionally transform the entered value before masking. */
  track?: Track;
  /** Conditionally tweak mask/replacement/showMask/separate before masking. */
  modify?: Modify;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called with the raw value (mask literals stripped) on every change. */
  onUnmaskedChange?: (raw: string) => void;
  /** Same error prop as TextField — turns the field danger-styled and can carry a message. */
  error?: boolean | React.ReactNode;
}

function normalizeReplacement(replacement: Record<string, RegExp> | string | undefined): Record<string, RegExp> {
  if (!replacement) return { _: /\d/ };
  if (typeof replacement === 'string') return { [replacement]: /./ };
  return replacement;
}

function buildMasked(
  inputChars: string[],
  mask: string,
  replacement: Record<string, RegExp>,
  showMask: boolean,
): { masked: string; raw: string } {
  let masked = '';
  let raw = '';
  let ptr = 0;
  let ranOut = false;

  for (const ch of mask) {
    const pattern = replacement[ch];
    if (pattern) {
      if (!ranOut && ptr < inputChars.length && pattern.test(inputChars[ptr])) {
        masked += inputChars[ptr];
        raw += inputChars[ptr];
        ptr++;
      } else {
        ranOut = true;
        if (showMask) masked += ch;
        else break;
      }
    } else {
      if (!ranOut || showMask) masked += ch;
      else break;
    }
  }
  return { masked, raw };
}

/** Strips characters from raw input that can't fill any mask slot. */
function normalizeMaskChars(raw: string, mask: string, replacement: Record<string, RegExp>): string[] {
  const patterns = Object.values(replacement);
  return raw.split('').filter((ch) => patterns.some((p) => p.test(ch)));
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(function MaskedInput(
  {
    mask,
    replacement,
    showMask = false,
    separate: _separate = false,
    track,
    modify,
    value,
    defaultValue,
    onChange,
    onUnmaskedChange,
    placeholder,
    error,
    ...props
  },
  ref,
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() => {
    const base = defaultValue ?? '';
    const inputChars = normalizeMaskChars(base, mask, normalizeReplacement(replacement));
    return buildMasked(inputChars, mask, normalizeReplacement(replacement), showMask).masked;
  });
  const current = isControlled ? value! : internal;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawInput = e.target.value;
      if (track) rawInput = track(rawInput);

      const overrides = modify?.(rawInput) ?? {};
      const activeMask = overrides.mask ?? mask;
      const activeReplacement = normalizeReplacement(overrides.replacement ?? replacement);
      const activeShowMask = overrides.showMask ?? showMask;

      const inputChars = normalizeMaskChars(rawInput, activeMask, activeReplacement);
      const { masked, raw } = buildMasked(inputChars, activeMask, activeReplacement, activeShowMask);

      if (!isControlled) setInternal(masked);
      onUnmaskedChange?.(raw);
      onChange?.({ ...e, target: { ...e.target, value: masked } } as React.ChangeEvent<HTMLInputElement>);
    },
    [track, modify, mask, replacement, showMask, isControlled, onChange, onUnmaskedChange],
  );

  return (
    <TextField
      ref={ref}
      value={current}
      onChange={handleChange}
      placeholder={placeholder ?? mask}
      error={error}
      widthSize="full"
      {...props}
    />
  );
});
