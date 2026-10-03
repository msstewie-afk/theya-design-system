import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { NavArrowDown } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from './command';
import { InputGroup, InputGroupInput } from './input-group';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

/**
 * Phone number with a country-code picker. Formats as you type in the
 * selected country's own pattern, shows that country's example number as
 * the placeholder, and reports the value in E.164 (`+359888123456`) — the
 * one format every backend and SMS provider accepts.
 *
 * - Typing or pasting a number that starts with `+` switches the country
 *   automatically (autofill usually delivers it that way).
 * - Checked on blur, with a specific message: too short / too long for the
 *   chosen country, or not a number. The message clears as soon as the
 *   number is fixed.
 * - Rules come from libphonenumber-js (Google's libphonenumber data, the
 *   "min" metadata: lengths per country, not per carrier range).
 * - Flags are emoji: they render on macOS, iOS, Android and Linux; Windows
 *   shows the two-letter code instead, which still reads fine.
 */
export type PhoneFieldSize = 'sm' | 'md';

export interface PhoneFieldChange {
  country: CountryCode;
  /** True when the number has a valid length for its country. */
  valid: boolean;
}

export interface PhoneFieldProps {
  /** Controlled value in E.164, e.g. "+359888123456". Empty string when cleared. */
  value?: string;
  /** Uncontrolled starting value in E.164. */
  defaultValue?: string;
  onValueChange?: (value: string, details: PhoneFieldChange) => void;
  /** Starting country when there's no value. Defaults to the browser's region, then US. */
  defaultCountry?: CountryCode;
  /** Pinned to the top of the country list, e.g. where most of your customers are. */
  preferredCountries?: CountryCode[];
  label?: ReactNode;
  description?: ReactNode;
  /** External error; replaces the built-in length check message. */
  error?: string;
  required?: boolean;
  optional?: boolean;
  heightSize?: PhoneFieldSize;
  disabled?: boolean;
  /** Name for the hidden input that carries the E.164 value in a native form post. */
  name?: string;
  id?: string;
  className?: string;
  /** Language for country names in the picker. */
  locale?: string;
  'aria-label'?: string;
}

const flag = (code: string) => String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
const digitsOf = (s: string) => s.replace(/\D/g, '');

function browserCountry(): CountryCode | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const region = navigator.language.split('-')[1]?.toUpperCase();
  return region && (getCountries() as string[]).includes(region) ? (region as CountryCode) : undefined;
}

// While typing: as-you-type grouping of whatever was entered.
function formatTyping(digits: string, country: CountryCode) {
  return digits ? new AsYouType(country).input(digits) : '';
}

// Settled text (initial value, paste, country switch, blur). AsYouType
// leaves a number without its trunk prefix ungrouped ("888123456" in BG,
// "2079460958" in GB); a complete number is shown in the country's full
// national form instead ("088 812 3456", "020 7946 0958").
function formatNational(digits: string, country: CountryCode) {
  if (!digits) return '';
  const typed = formatTyping(digits, country);
  if (/\D/.test(typed)) return typed;
  const parsed = parsePhoneNumberFromString(digits, country);
  return parsed?.isPossible() ? parsed.formatNational() : typed;
}

function toE164(digits: string, country: CountryCode) {
  return digits ? (parsePhoneNumberFromString(digits, country)?.number ?? '') : '';
}

export function PhoneField({
  value: valueProp,
  defaultValue,
  onValueChange,
  defaultCountry,
  preferredCountries = [],
  label,
  description,
  error: errorProp,
  required,
  optional,
  heightSize = 'md',
  disabled = false,
  name,
  id,
  className,
  locale = 'en',
  'aria-label': ariaLabel,
}: PhoneFieldProps) {
  const initial = parsePhoneNumberFromString(valueProp ?? defaultValue ?? '');
  const [country, setCountry] = useState<CountryCode>(initial?.country ?? defaultCountry ?? browserCountry() ?? 'US');
  const [national, setNational] = useState(() => (initial?.country ? formatNational(initial.nationalNumber, initial.country) : ''));
  const [lengthError, setLengthError] = useState<string>();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEmitted = useRef(valueProp ?? defaultValue ?? '');
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  const names = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale]);
  const countryName = (c: CountryCode) => names.of(c) ?? c;
  const countries = useMemo(
    () => (getCountries() as CountryCode[]).map((c) => ({ code: c, name: names.of(c) ?? c, dial: getCountryCallingCode(c) })).sort((a, b) => a.name.localeCompare(b.name, locale)),
    [names, locale],
  );

  // A controlled value changed from outside (reset, server data): re-derive.
  useEffect(() => {
    if (valueProp === undefined || valueProp === lastEmitted.current) return;
    lastEmitted.current = valueProp;
    const parsed = parsePhoneNumberFromString(valueProp);
    if (parsed?.country) setCountry(parsed.country);
    setNational(parsed?.country ? formatNational(parsed.nationalNumber, parsed.country) : '');
    setLengthError(undefined);
  }, [valueProp]);

  const check = (digits: string, c: CountryCode) => {
    if (!digits) return undefined;
    const problem = validatePhoneNumberLength(digits, c);
    if (problem === 'TOO_SHORT') return `This number is too short for ${countryName(c)}.`;
    if (problem === 'TOO_LONG') return `This number is too long for ${countryName(c)}.`;
    if (problem === 'NOT_A_NUMBER') return 'Use digits only.';
    if (problem === 'INVALID_LENGTH') return `Check the number — that length isn’t used in ${countryName(c)}.`;
    return undefined;
  };

  const emit = (digits: string, c: CountryCode) => {
    const e164 = toE164(digits, c);
    lastEmitted.current = e164;
    onValueChange?.(e164, { country: c, valid: Boolean(digits) && !check(digits, c) });
  };

  const apply = (digits: string, c: CountryCode, format: typeof formatNational = formatTyping) => {
    setNational(format(digits, c));
    if (lengthError) setLengthError(check(digits, c));
    emit(digits, c);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // "+44 20 7946 0958" typed, pasted or autofilled: take the country from it.
    if (raw.trim().startsWith('+')) {
      const parsed = parsePhoneNumberFromString(raw);
      if (parsed?.country) {
        setCountry(parsed.country);
        apply(parsed.nationalNumber, parsed.country, formatNational);
        return;
      }
      setNational(raw);
      return;
    }
    let digits = digitsOf(raw);
    // Backspace over a formatting character (space, bracket, dash) leaves
    // the digits unchanged and the formatter would put the character right
    // back — delete the digit before it instead.
    if (digits === digitsOf(national) && raw.length < national.length) digits = digits.slice(0, -1);
    const caretAtEnd = e.target.selectionStart === raw.length;
    if (caretAtEnd) {
      apply(digits, country);
    } else {
      // Editing in the middle: keep the person's text and caret as typed;
      // it's reformatted on blur.
      setNational(raw);
      if (lengthError) setLengthError(check(digits, country));
      emit(digits, country);
    }
  };

  const onBlur = () => {
    const digits = digitsOf(national);
    setNational(formatNational(digits, country));
    setLengthError(check(digits, country));
  };

  const pickCountry = (c: CountryCode) => {
    setCountry(c);
    setOpen(false);
    const digits = digitsOf(national);
    setNational(formatNational(digits, c));
    if (lengthError) setLengthError(check(digits, c));
    emit(digits, c);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const example = getExampleNumber(country, examples)?.formatNational();
  const error = errorProp ?? lengthError;
  const preferred = countries.filter((c) => preferredCountries.includes(c.code));
  const e164 = toE164(digitsOf(national), country);

  const item = (c: (typeof countries)[number], group: string) => (
    <CommandItem key={`${group}-${c.code}`} value={`${group}-${c.code}`} keywords={[c.name, `+${c.dial}`, c.dial, c.code]} onSelect={() => pickCountry(c.code)}>
      <span aria-hidden="true" className="text-body-l leading-none">
        {flag(c.code)}
      </span>
      <span className="min-w-0 flex-1 truncate">{c.name}</span>
      <CommandShortcut className="font-body text-body-s tracking-normal">+{c.dial}</CommandShortcut>
    </CommandItem>
  );

  const sm = heightSize === 'sm';

  return (
    <div data-slot="phone-field" className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={inputId} required={required} optional={optional} className={cn(sm && 'text-body-s')}>
          {label}
        </Label>
      )}
      <InputGroup className={cn(sm && 'h-[var(--size-size-control-size-control-lg)] text-body-s')}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Country code: ${countryName(country)} +${getCountryCallingCode(country)}`}
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-1.5 border-r border-solid border-[var(--color-border-border-subtler)] pr-2 pl-[var(--size-margin-margin-s)]',
                'bg-[var(--color-bg-neutral-bg-neutral-subtle)] font-body text-[var(--color-text-text)] outline-none',
                'hover:not-disabled:bg-[var(--color-bg-neutral-bg-neutral-subtle-hover)] focus-visible:bg-[var(--color-bg-neutral-bg-neutral-subtle-hover)]',
                'disabled:cursor-not-allowed disabled:text-[var(--color-text-text-disabled)]',
                sm ? 'text-body-s' : 'text-body-m',
              )}
            >
              <span aria-hidden="true" className="text-body-l leading-none">
                {flag(country)}
              </span>
              <span className="tabular-nums">+{getCountryCallingCode(country)}</span>
              <NavArrowDown aria-hidden="true" className="size-3.5 text-[var(--color-icon-icon-subtle)]" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[320px] p-0" aria-label="Choose a country">
            <Command label="Countries">
              <CommandInput placeholder="Search country or code" />
              <CommandList className="p-1">
                <CommandEmpty>No country matches.</CommandEmpty>
                {preferred.length > 0 && <CommandGroup heading="Suggested">{preferred.map((c) => item(c, 'pref'))}</CommandGroup>}
                <CommandGroup heading={preferred.length > 0 ? 'All countries' : undefined}>{countries.map((c) => item(c, 'all'))}</CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <InputGroupInput
          ref={inputRef}
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={national}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          placeholder={example}
          aria-label={label ? undefined : (ariaLabel ?? 'Phone number')}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || description ? messageId : undefined}
          className={cn('tabular-nums', sm && 'text-body-s')}
        />
      </InputGroup>
      {name && <input type="hidden" name={name} value={e164} />}
      {error ? (
        <div id={messageId} className="flex items-start gap-1">
          <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden="true" className="mt-px shrink-0 text-[var(--color-icon-icon-danger)]">
            <circle cx="6" cy="6" r="6" fill="currentColor" />
            <rect x="5.25" y="2.5" width="1.5" height="4" rx="0.75" fill="white" />
            <circle cx="6" cy="8.5" r="0.9" fill="white" />
          </svg>
          <span className="font-body text-body-xs font-normal text-[var(--color-text-text-danger)]">{error}</span>
        </div>
      ) : description ? (
        <span id={messageId} className="font-body text-body-xs font-normal text-[var(--color-text-text-subtler)]">
          {description}
        </span>
      ) : null}
    </div>
  );
}
