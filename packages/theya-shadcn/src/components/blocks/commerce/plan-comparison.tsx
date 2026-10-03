import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Minus } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpIcon } from '@/components/ui/help-icon';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatMoney } from './shared';

export type BillingPeriod = 'monthly' | 'yearly';

export interface ComparedPlan {
  id: string;
  name: string;
  description?: string;
  /** Price per month when billed monthly. */
  monthly: number;
  /** Price per month when billed yearly. */
  yearly: number;
  /** One plan at most: gets a "Recommended" badge and the filled button. */
  recommended?: boolean;
}

export interface ComparedFeature {
  id: string;
  label: string;
  /** Explains a term people may not know ("Staging", "SSH"). */
  hint?: ReactNode;
  /** Per plan id: true/false for included or not, or a value in the same unit across plans ("10 GB", "25 GB"). */
  values: Record<string, string | boolean>;
}

export interface PlanComparisonProps {
  plans: ComparedPlan[];
  features: ComparedFeature[];
  /** Period selected at first. Default 'yearly'. */
  defaultPeriod?: BillingPeriod;
  currency?: string;
  onSelect?: (planId: string, period: BillingPeriod) => void;
  /** Current plan, if the person already has one: its button reads "Current plan" and is disabled. */
  currentPlanId?: string;
  className?: string;
}

/**
 * Plans side by side. The period toggle shows the yearly saving up front;
 * values use the same unit in every column; rows that differ read stronger
 * than rows that don't, and "Only differences" hides the identical ones.
 * The plan header row sticks while scrolling the features. Below md the
 * table becomes one tab per plan, since columns don't fit a phone.
 */
export function PlanComparison({ plans, features, defaultPeriod = 'yearly', currency = 'USD', onSelect, currentPlanId, className }: PlanComparisonProps) {
  const [period, setPeriod] = useState<BillingPeriod>(defaultPeriod);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const diffId = useId();

  const differs = (f: ComparedFeature) => new Set(plans.map((p) => String(f.values[p.id]))).size > 1;
  const rows = onlyDifferences ? features.filter(differs) : features;
  const maxSaving = Math.max(...plans.map((p) => Math.round((1 - p.yearly / p.monthly) * 100)));

  const price = (p: ComparedPlan) => (period === 'yearly' ? p.yearly : p.monthly);
  const action = (p: ComparedPlan) => {
    const isCurrent = p.id === currentPlanId;
    return (
      <Button
        appearance={p.recommended ? 'filled' : 'outlined'}
        tone={p.recommended ? 'primary' : 'secondary'}
        size="lg"
        fullWidth
        disabled={isCurrent}
        onClick={() => onSelect?.(p.id, period)}
        aria-label={isCurrent ? `${p.name}: current plan` : `Choose ${p.name}, ${formatMoney(price(p), currency)} per month, billed ${period}`}
      >
        {isCurrent ? 'Current plan' : `Choose ${p.name}`}
      </Button>
    );
  };

  return (
    <div className={cn('flex w-full flex-col gap-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ToggleGroup type="single" appearance="outlined" value={period} onValueChange={(v) => v && setPeriod(v as BillingPeriod)} aria-label="Billing period">
          <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
          <ToggleGroupItem value="yearly">
            Yearly
            {maxSaving > 0 && (
              <Badge tone="success" className="ml-2">
                Save up to {maxSaving}%
              </Badge>
            )}
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="hidden items-center gap-2 md:flex">
          <Switch id={diffId} checked={onlyDifferences} onCheckedChange={setOnlyDifferences} />
          <label htmlFor={diffId} className="cursor-pointer font-body text-body-m text-[var(--color-text-text)]">
            Only differences
          </label>
        </div>
      </div>

      {/* Desktop: one table, plan header sticky. */}
      {/* table-fixed + colgroup: the feature column gets a fixed share and
          every plan column the same fluid width, so the plan blocks line up. */}
      <table className="hidden w-full table-fixed border-separate border-spacing-0 font-body md:table">
        <caption className="sr-only">{`Plan comparison, prices per month billed ${period}`}</caption>
        <colgroup>
          <col className="w-[22%]" />
          {plans.map((p) => (
            <col key={p.id} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="sticky top-0 z-[1] bg-[var(--color-bg-surface-bg-surface-base)] p-0 text-left align-bottom">
              <span className="sr-only">Feature</span>
            </th>
            {plans.map((p) => (
              <th key={p.id} scope="col" className="sticky top-0 z-[1] bg-[var(--color-bg-surface-bg-surface-base)] px-2 pb-4 text-left align-top font-normal">
                <div
                  className={cn(
                    'flex h-full flex-col gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid p-4',
                    p.recommended ? 'border-[var(--color-border-border-primary)] bg-[var(--color-bg-primary-bg-primary-subtle)]' : 'border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-body text-body-l font-semibold text-[var(--color-text-text)]">{p.name}</span>
                    {p.recommended && (
                      <Badge tone="primary" appearance="filled">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  {p.description && <p className={cn('font-body text-body-s', p.recommended ? 'text-[var(--color-text-text-subtler-on-tonal)]' : 'text-[var(--color-text-text-subtler)]')}>{p.description}</p>}
                  <PlanPrice plan={p} period={period} currency={currency} tonal={p.recommended} />
                  {action(p)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => {
            const different = differs(f);
            return (
              <tr key={f.id}>
                <th scope="row" className="border-t border-solid border-[var(--color-border-border-subtler)] py-3 pr-4 text-left align-top font-normal">
                  <span className="inline-flex items-center gap-1.5 font-body text-body-m text-[var(--color-text-text)]">
                    {f.label}
                    {f.hint && <HelpIcon label={`About ${f.label}`}>{f.hint}</HelpIcon>}
                  </span>
                </th>
                {plans.map((p) => (
                  <td key={p.id} className="border-t border-solid border-[var(--color-border-border-subtler)] px-6 py-3 align-top">
                    <FeatureValue value={f.values[p.id]} strong={different} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Phone: a tab per plan. */}
      <Tabs defaultValue={plans.find((p) => p.recommended)?.id ?? plans[0]?.id} className="md:hidden">
        <TabsList aria-label="Plans">
          {plans.map((p) => (
            <TabsTrigger key={p.id} value={p.id}>
              {p.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {plans.map((p) => (
          <TabsContent key={p.id} value={p.id} className="flex flex-col gap-4 pt-4">
            {p.description && <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{p.description}</p>}
            <PlanPrice plan={p} period={period} currency={currency} />
            {action(p)}
            <dl className="flex flex-col">
              {features.map((f) => (
                <div key={f.id} className="flex items-start justify-between gap-4 border-t border-solid border-[var(--color-border-border-subtler)] py-3">
                  <dt className="font-body text-body-m text-[var(--color-text-text)]">{f.label}</dt>
                  <dd className="m-0 text-right">
                    <FeatureValue value={f.values[p.id]} strong />
                  </dd>
                </div>
              ))}
            </dl>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function PlanPrice({ plan, period, currency, tonal }: { plan: ComparedPlan; period: BillingPeriod; currency: string; tonal?: boolean }) {
  const perMonth = period === 'yearly' ? plan.yearly : plan.monthly;
  const subtle = tonal ? 'text-[var(--color-text-text-subtler-on-tonal)]' : 'text-[var(--color-text-text-subtler)]';
  return (
    <div className="flex flex-col">
      <span className="font-body text-[var(--color-text-text)]">
        <span className="text-heading-m font-semibold tabular-nums">{formatMoney(perMonth, currency)}</span>
        <span className={cn('text-body-s', subtle)}> / month</span>
      </span>
      <span className={cn('font-body text-body-s', subtle)}>{period === 'yearly' ? `${formatMoney(perMonth * 12, currency)} billed yearly` : 'Billed monthly, cancel anytime'}</span>
    </div>
  );
}

function FeatureValue({ value, strong }: { value: string | boolean | undefined; strong: boolean }) {
  if (value === true)
    return (
      <span className="inline-flex text-[var(--color-icon-icon-success)]">
        <Check className="size-5" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </span>
    );
  if (value === false || value === undefined)
    return (
      <span className="inline-flex text-[var(--color-icon-icon-subtler)]">
        <Minus className="size-5" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </span>
    );
  return <span className={cn('font-body text-body-m tabular-nums', strong ? 'font-medium text-[var(--color-text-text)]' : 'text-[var(--color-text-text-subtle)]')}>{value}</span>;
}
