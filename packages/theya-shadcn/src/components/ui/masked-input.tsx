'use client';

import { forwardRef, useState, useCallback } from 'react';
import { TextField } from './text-field';

/**
 * Formats as you type against a fixed template (phone, card, date, IP).
 * The masking logic is Theya's own; the field it renders IS a TextField
 * (not a hand-styled raw <input>), so it inherits TextField's chrome,
 * height, focus ring, and error/danger treatment instead of duplicating
 * them.
 *
 * Known limitation: the caret position isn't preserved when editing in
 * the middle (it can jump to the end after a keystroke). Deferred.
 */
export interface MaskedInputModifyResult {
  mask?: string;
  replacement?: Record<string, RegExp>;
  showMask?: boolean;
}
export type MaskedInputTrack = (rawInput: string) => string;
export type MaskedInputModify = (rawInput: string) => MaskedInputModifyResult;

export interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  /** Mask template, e.g. "+1 (___) ___-____" or "__/__/____". */
  mask: string;
  /** Placeholder-char to allowed-pattern map. Default { _: /\d/ }. Pass a string like "#" as shorthand for { "#": /./ }. */
  replacement?: Record<string, RegExp> | string;
  /** Show the full mask template while empty. */
  showMask?: boolean;
  /** Conditionally transform the entered value before masking. */
  track?: MaskedInputTrack;
  /** Conditionally tweak mask/replacement/showMask before masking. */
  modify?: MaskedInputModify;
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
  if (inputChars.length === 0 && !showMask) return { masked: '', raw: '' };
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
      // Without showMask, stop at the literals after the last entered char.
      // Appending them ("+1 (415) ") would make Backspace a no-op: the
      // deleted literal just comes back on the next re-parse.
      if (showMask) masked += ch;
      else if (!ranOut && ptr < inputChars.length) masked += ch;
      else break;
    }
  }
  return { masked, raw };
}

/**
 * Pulls the slot characters out of whatever is in the field.
 *
 * The field's own value is already formatted, so it contains mask
 * literals — and some of those literals are themselves valid slot chars
 * (the "1" in "+1 (___) ___-____"). Filtering by pattern alone would
 * re-consume them as user input on every keystroke and shift every
 * digit by one. So when the value starts with the mask's leading
 * literal prefix we treat it as formatted and skip any character that
 * sits exactly where the mask has the same literal. Otherwise (pasted
 * or typed digits, "4155552671") every pattern-matching char counts.
 */
function normalizeMaskChars(raw: string, mask: string, replacement: Record<string, RegExp>): string[] {
  const patterns = Object.values(replacement);
  const fits = (ch: string) => patterns.some((p) => p.test(ch));
  const isSlot = (ch: string | undefined) => ch !== undefined && ch in replacement;

  let prefixEnd = 0;
  while (prefixEnd < mask.length && !isSlot(mask[prefixEnd])) prefixEnd++;
  const prefix = mask.slice(0, prefixEnd);

  // Backspacing into the prefix ("+1 (" -> "+1 ") leaves no user input.
  if (prefix && raw.length <= prefix.length && prefix.startsWith(raw)) return [];

  if (!prefix || !raw.startsWith(prefix)) return raw.split('').filter(fits);

  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const maskCh = mask[i];
    if (maskCh !== undefined && !isSlot(maskCh) && ch === maskCh) continue;
    if (fits(ch)) out.push(ch);
  }
  return out;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(function MaskedInput(
  {
    mask,
    replacement,
    showMask = false,
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
