import { forwardRef, useId, useImperativeHandle, useState } from 'react';
import { CreditCard, Lock, Wallet } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { HelpIcon } from '@/components/ui/help-icon';
import { Label } from '@/components/ui/label';
import { MaskedInput } from '@/components/ui/masked-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextField } from '@/components/ui/text-field';

export type PaymentMethodId = 'card' | 'paypal';
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export interface CardDetails {
  name: string;
  /** Digits only. */
  number: string;
  /** "MM/YY". */
  expiry: string;
  cvc: string;
}

export interface PaymentState {
  method: PaymentMethodId;
  card: CardDetails;
  brand: CardBrand;
  /** True when the chosen method needs nothing more (PayPal), or the card passes every check. */
  complete: boolean;
}

export interface PaymentMethodHandle {
  /** Shows every error and focuses the first invalid field. Returns true when payment details are complete. */
  validate: () => boolean;
}

export interface PaymentMethodProps {
  defaultMethod?: PaymentMethodId;
  onChange?: (state: PaymentState) => void;
  /** Today, for the expiry check. Injectable for stories/tests. */
  now?: Date;
  className?: string;
}

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
}

const BRAND_LABEL: Record<CardBrand, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', unknown: '' };

/** Luhn checksum — catches a mistyped digit before the payment provider does. */
export function luhnValid(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return digits.length > 0 && sum % 10 === 0;
}

type CardErrors = Partial<Record<keyof CardDetails, string>>;

function checkCard(card: CardDetails, now: Date): CardErrors {
  const brand = detectBrand(card.number);
  const length = brand === 'amex' ? 15 : 16;
  const errors: CardErrors = {};
  if (!card.name.trim()) errors.name = 'Enter the name as it appears on the card.';
  if (!card.number) errors.number = 'Enter the card number.';
  else if (card.number.length < length) errors.number = `The card number is ${length} digits — ${length - card.number.length} missing.`;
  else if (!luhnValid(card.number)) errors.number = 'One of the digits looks mistyped. Check the number on the card.';
  const [mm, yy] = card.expiry.split('/').map((p) => p.trim());
  if (!card.expiry.replace(/\D/g, '')) errors.expiry = 'Enter the expiry date.';
  else if (!mm || !yy || mm.length < 2 || yy.length < 2) errors.expiry = 'Use MM / YY, e.g. 08 / 29.';
  else if (Number(mm) < 1 || Number(mm) > 12) errors.expiry = 'The month should be 01–12.';
  else {
    const expiresEnd = new Date(2000 + Number(yy), Number(mm), 1); // first day after the expiry month
    if (expiresEnd <= now) errors.expiry = 'This card has expired. Use another card.';
  }
  const cvcLength = brand === 'amex' ? 4 : 3;
  if (!card.cvc) errors.cvc = 'Enter the security code.';
  else if (card.cvc.length < cvcLength) errors.cvc = `The security code is ${cvcLength} digits.`;
  return errors;
}

/**
 * Payment as tabs with the card selected by default, so the most common
 * route needs no extra click; third-party wallets come second, and say
 * what happens after you pick them. Card fields sit in one visibly
 * enclosed, "secured" block, format themselves as you type (spaces in the
 * number, " / " in the date), detect the brand, and catch a mistyped digit
 * (Luhn) when you leave the field — not on every keystroke.
 */
export const PaymentMethod = forwardRef<PaymentMethodHandle, PaymentMethodProps>(function PaymentMethod({ defaultMethod = 'card', onChange, now = new Date(), className }, ref) {
  const uid = useId();
  const ids = { name: `${uid}-name`, number: `${uid}-number`, expiry: `${uid}-expiry`, cvc: `${uid}-cvc` };
  const [method, setMethod] = useState<PaymentMethodId>(defaultMethod);
  const [card, setCard] = useState<CardDetails>({ name: '', number: '', expiry: '', cvc: '' });
  const [shown, setShown] = useState<Partial<Record<keyof CardDetails, boolean>>>({});

  const brand = detectBrand(card.number);
  const errors = checkCard(card, now);
  const complete = method === 'paypal' || Object.keys(errors).length === 0;
  const errorFor = (k: keyof CardDetails) => (shown[k] ? errors[k] : undefined);

  const emit = (next: Partial<{ method: PaymentMethodId; card: CardDetails }>) => {
    const m = next.method ?? method;
    const c = next.card ?? card;
    onChange?.({ method: m, card: c, brand: detectBrand(c.number), complete: m === 'paypal' || Object.keys(checkCard(c, now)).length === 0 });
  };
  const update = (k: keyof CardDetails, v: string) => {
    const next = { ...card, [k]: v };
    setCard(next);
    emit({ card: next });
  };
  const reveal = (k: keyof CardDetails) => setShown((s) => ({ ...s, [k]: true }));

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (method === 'paypal') return true;
      setShown({ name: true, number: true, expiry: true, cvc: true });
      const first = (['name', 'number', 'expiry', 'cvc'] as const).find((k) => errors[k]);
      if (first) document.getElementById(ids[first])?.focus();
      return !first;
    },
  }));

  return (
    <Tabs
      value={method}
      onValueChange={(v) => {
        setMethod(v as PaymentMethodId);
        emit({ method: v as PaymentMethodId });
      }}
      className={cn('flex w-full flex-col gap-4', className)}
    >
      <TabsList aria-label="Payment method">
        <TabsTrigger value="card" icon={<CreditCard />}>
          Card
        </TabsTrigger>
        <TabsTrigger value="paypal" icon={<Wallet />}>
          PayPal
        </TabsTrigger>
      </TabsList>

      <TabsContent value="card">
        {/* One enclosed block with a lock: people read the card fields as
            the secured part of the page. */}
        {/* Surface, not a tinted fill: the fields' translucent error fill
            blended with a tinted block dropped their text under 4.5:1 in dark. */}
        <fieldset className="m-0 flex min-w-0 flex-col gap-4 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5">
          <legend className="sr-only">Card details</legend>
          <p className="flex items-center gap-2 font-body text-body-s text-[var(--color-text-text-subtle)]">
            <Lock className="size-4 shrink-0 text-[var(--color-icon-icon-success)]" aria-hidden="true" />
            Encrypted and sent straight to the payment provider. We never store the full number.
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.name} required>
              Name on card
            </Label>
            <TextField
              id={ids.name}
              autoComplete="cc-name"
              value={card.name}
              onChange={(e) => update('name', e.currentTarget.value)}
              onBlur={() => card.name && reveal('name')}
              error={errorFor('name')}
              description="Exactly as printed on the card."
              widthSize="full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.number} required>
              Card number
              {brand !== 'unknown' && <span className="font-normal text-[var(--color-text-text-subtle)]">· {BRAND_LABEL[brand]}</span>}
            </Label>
            <MaskedInput
              id={ids.number}
              mask="____ ____ ____ ____"
              // American Express groups 4-6-5.
              modify={(raw) => (/^3[47]/.test(raw.replace(/\D/g, '')) ? { mask: '____ ______ _____' } : {})}
              onUnmaskedChange={(raw) => update('number', raw)}
              onBlur={() => card.number && reveal('number')}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 1234 1234 1234"
              error={errorFor('number')}
              className="font-mono"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={ids.expiry} required>
                Expiry date
              </Label>
              <MaskedInput
                id={ids.expiry}
                mask="__ / __"
                onChange={(e) => update('expiry', e.currentTarget.value.replace(/\s/g, ''))}
                onBlur={() => card.expiry && reveal('expiry')}
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                error={errorFor('expiry')}
                className="font-mono"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-1">
                <Label htmlFor={ids.cvc} required>
                  Security code
                </Label>
                <HelpIcon label="Where to find the security code">{brand === 'amex' ? '4 digits printed on the front of the card, above the number.' : 'The last 3 digits printed on the back of the card, next to the signature.'}</HelpIcon>
              </span>
              <MaskedInput
                id={ids.cvc}
                mask={brand === 'amex' ? '____' : '___'}
                onUnmaskedChange={(raw) => update('cvc', raw)}
                onBlur={() => card.cvc && reveal('cvc')}
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder={brand === 'amex' ? '1234' : '123'}
                error={errorFor('cvc')}
                className="font-mono"
              />
            </div>
          </div>
        </fieldset>
      </TabsContent>

      <TabsContent value="paypal">
        <div className="flex flex-col gap-2 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] p-5">
          <p className="font-body text-body-m text-[var(--color-text-text)]">You'll sign in to PayPal in a new window and approve the payment there.</p>
          <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">Then you come back here to review the order. Nothing is charged until you confirm it.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
});
