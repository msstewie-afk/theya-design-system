import { useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Globe, Lock, OpenNewWindow } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Stepper } from '@/components/ui/stepper';
import { CompletionScreen } from './completion-screen';
import { OrderReview } from './order-review';
import { PaymentMethod, type PaymentMethodHandle, type PaymentState } from './payment-method';
import { PricedOptions } from './priced-options';
import { OrderSummary, computeTotals, type OrderLine } from './shared';

export interface CheckoutProps {
  /** Signed-in account; the receipt goes here. */
  email?: string;
  taxRate?: number;
  taxLabel?: string;
  /** "Back to cart" in the header. */
  onExit?: () => void;
  onComplete?: (order: { lines: OrderLine[]; total: number }) => void;
  /** How long the demo charge takes, ms. */
  chargeDelay?: number;
  className?: string;
}

const STEPS = [
  { id: 'options', label: 'Options', description: 'Billing, region, backups' },
  { id: 'payment', label: 'Payment', description: 'Card or PayPal' },
  { id: 'review', label: 'Review', description: 'Check and pay' },
];

const REGIONS: Record<string, string> = { 'eu-west': 'Frankfurt', 'us-east': 'Virginia', 'ap-south': 'Singapore' };
const BACKUPS: Record<string, { label: string; monthly: number }> = {
  weekly: { label: 'Weekly, kept 4 weeks', monthly: 0 },
  daily: { label: 'Daily, kept 30 days', monthly: 4 },
  hourly: { label: 'Hourly, kept 90 days', monthly: 12 },
};

/**
 * An enclosed checkout: no site navigation to wander off into, just the
 * brand, a "secure checkout" note and a way back to the cart. A Stepper
 * shows where you are (completed steps link back), forms stay one column,
 * and the order summary with the full cost rides along on every step. The
 * review step charges; the completion screen ends with a next step.
 */
export function Checkout({ email = 'dana@seashell.dev', taxRate = 0.2, taxLabel = 'VAT (20%)', onExit, onComplete, chargeDelay = 1200, className }: CheckoutProps) {
  const [step, setStep] = useState(0);
  const [period, setPeriod] = useState('yearly');
  const [region, setRegion] = useState('eu-west');
  const [backups, setBackups] = useState('weekly');
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);
  const paymentRef = useRef<PaymentMethodHandle>(null);
  const cardSummary = useRef('');
  const headingId = useId();

  const yearly = period === 'yearly';
  const lines = useMemo<OrderLine[]>(() => {
    const months = yearly ? 12 : 1;
    const out: OrderLine[] = [
      { id: 'plan', name: 'Pro plan', detail: yearly ? 'Billed yearly' : 'Billed monthly', unitPrice: yearly ? 288 : 30, quantity: 1 },
      { id: 'domain', name: 'seashell.shop', detail: 'Domain · 1 year', unitPrice: 14, quantity: 1 },
    ];
    const b = BACKUPS[backups];
    if (b.monthly) out.push({ id: 'backups', name: 'Backups', detail: b.label, unitPrice: b.monthly * months, quantity: 1 });
    if (region === 'ap-south') out.push({ id: 'region', name: 'Singapore region', detail: 'Regional surcharge', unitPrice: 3 * months, quantity: 1 });
    return out;
  }, [yearly, backups, region]);
  const totals = computeTotals(lines, { taxRate });

  const goTo = (i: number) => {
    setStep(i);
    requestAnimationFrame(() => document.getElementById(headingId)?.focus());
  };
  const next = () => {
    if (step === 1) {
      if (!paymentRef.current?.validate()) return;
      if (payment?.method === 'card') cardSummary.current = `${payment.brand === 'unknown' ? 'Card' : payment.brand[0].toUpperCase() + payment.brand.slice(1)} ending ${payment.card.number.slice(-4)}`;
      else cardSummary.current = 'PayPal';
    }
    goTo(step + 1);
  };
  const pay = () => {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      setDone(true);
      onComplete?.({ lines, total: totals.total });
    }, chargeDelay);
  };

  return (
    <div className={cn('flex min-h-full w-full flex-col bg-[var(--color-bg-surface-bg-surface-base)]', className)}>
      {/* Enclosed: brand + reassurance + one way out, no site navigation. */}
      <header className="flex items-center justify-between gap-4 border-b border-solid border-[var(--color-border-border-subtle)] px-6 py-4">
        <span className="font-body text-body-l font-semibold text-[var(--color-text-text)]">Seashell</span>
        <span className="flex items-center gap-1.5 font-body text-body-s text-[var(--color-text-text-subtle)]">
          <Lock className="size-4 text-[var(--color-icon-icon-success)]" aria-hidden="true" />
          Secure checkout
        </span>
        {onExit && !done ? (
          <Button appearance="ghost" tone="secondary" size="sm" leftIcon={<ArrowLeft />} onClick={onExit}>
            Back to cart
          </Button>
        ) : (
          <span />
        )}
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
        {done ? (
          <CompletionScreen
            description="Your Pro plan is active and seashell.shop is registered."
            orderNumber="SH-20261003-4821"
            email={email}
            onResendEmail={() => undefined}
            details={[
              { term: 'Plan', value: `Pro, billed ${period}` },
              { term: 'Region', value: REGIONS[region] },
              { term: 'Backups', value: BACKUPS[backups].label },
              { term: 'Paid with', value: cardSummary.current },
            ]}
            primaryAction={{ label: 'Open site dashboard', icon: <OpenNewWindow /> }}
            secondaryActions={[
              { label: 'Set up DNS', icon: <Globe /> },
              { label: 'Download invoice', icon: <Download /> },
            ]}
          />
        ) : (
          <>
            <Stepper steps={STEPS} current={step} onStepClick={placing ? undefined : goTo} aria-label="Checkout progress" />
            <h1 id={headingId} tabIndex={-1} className="sr-only">
              {`Step ${step + 1} of ${STEPS.length}: ${STEPS[step].label}`}
            </h1>

            {/* The form steps stay mounted under the review, so Edit brings
                back exactly what was entered (card details included). */}
            {step === 2 && (
              <OrderReview
                lines={lines}
                totals={totals}
                taxLabel={taxLabel}
                placing={placing}
                onPlaceOrder={pay}
                legal="By paying you agree to the Terms of Service. The plan renews until you cancel; we email you 14 days before each renewal."
                sections={[
                  { id: 'account', title: 'Account', rows: [{ term: 'Email', value: email }] },
                  {
                    id: 'options',
                    title: 'Options',
                    onEdit: () => goTo(0),
                    rows: [
                      { term: 'Billing', value: yearly ? 'Yearly' : 'Monthly' },
                      { term: 'Region', value: REGIONS[region] },
                      { term: 'Backups', value: BACKUPS[backups].label },
                    ],
                  },
                  { id: 'payment', title: 'Payment', onEdit: () => goTo(1), rows: [{ term: 'Method', value: cardSummary.current }] },
                ]}
              />
            )}
            <div hidden={step === 2} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <div className="flex min-w-0 flex-col gap-6">
                {/* Both steps stay mounted so going back keeps what was entered. */}
                <div hidden={step !== 0} className="flex flex-col gap-6">
                  <PricedOptions
                    legend="Billing period"
                    priceMode="total"
                    value={period}
                    onValueChange={setPeriod}
                    columns={2}
                    options={[
                      { value: 'monthly', title: 'Monthly', description: '$30 a month, cancel anytime', price: 30, priceUnit: '/ mo' },
                      { value: 'yearly', title: 'Yearly', description: '$24 a month, save 20%', price: 288, priceUnit: '/ year' },
                    ]}
                  />
                  <PricedOptions
                    legend="Server region"
                    description="Pick the one closest to most of your visitors."
                    value={region}
                    onValueChange={setRegion}
                    columns={3}
                    options={[
                      { value: 'eu-west', title: 'Frankfurt', description: 'Europe', price: 0 },
                      { value: 'us-east', title: 'Virginia', description: 'Americas', price: 0 },
                      { value: 'ap-south', title: 'Singapore', description: 'Asia', price: 3, priceUnit: '/ mo' },
                    ]}
                  />
                  <PricedOptions
                    legend="Backups"
                    value={backups}
                    onValueChange={setBackups}
                    options={Object.entries(BACKUPS).map(([value, b]) => ({ value, title: value[0].toUpperCase() + value.slice(1), description: b.label.split(', ')[1], price: b.monthly, priceUnit: '/ mo' }))}
                  />
                </div>
                <div hidden={step !== 1} className="flex flex-col gap-4">
                  <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">
                    Signed in as <span className="font-medium text-[var(--color-text-text)]">{email}</span>
                  </p>
                  <PaymentMethod ref={paymentRef} onChange={setPayment} />
                </div>
                <Separator />
                <div className="flex flex-wrap justify-between gap-3">
                  <Button appearance="outlined" tone="secondary" size="xl" leftIcon={<ArrowLeft />} disabled={step === 0} onClick={() => goTo(step - 1)} className="max-sm:w-full">
                    Back
                  </Button>
                  <Button appearance="filled" tone="primary" size="xl" rightIcon={<ArrowRight />} onClick={next} className="max-sm:w-full">
                    {step === 0 ? 'Continue to payment' : 'Review order'}
                  </Button>
                </div>
              </div>
              <OrderSummary lines={lines} totals={totals} taxLabel={taxLabel} className="lg:sticky lg:top-6">
                <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">You'll review everything before paying.</p>
              </OrderSummary>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
