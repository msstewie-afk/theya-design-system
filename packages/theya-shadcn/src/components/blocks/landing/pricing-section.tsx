'use client';

import { useId, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Check } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { CountUp } from '../../ui/count-up';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group';
import { SectionHead } from './feature-shared';

export type PricingPeriod = 'monthly' | 'yearly';

export interface PricingPlan {
  id: string;
  name: string;
  /** One line: who the plan is for. */
  description?: ReactNode;
  /** Price per month, billed monthly. */
  monthly: number;
  /** Price per month, billed yearly. */
  yearly: number;
  /** Replaces the number for plans without a list price ("Let's talk"). */
  priceLabel?: ReactNode;
  /** What the plan includes. Keep it to the differences: four to six lines. */
  features: ReactNode[];
  /** "Everything in Starter, plus:" above the list. */
  featuresIntro?: ReactNode;
  /** One plan at most: the filled card, the filled button and the badge. */
  recommended?: boolean;
  /** Badge text on the recommended plan. Default "Most popular". */
  badge?: ReactNode;
  /** Button label. Default "Start with {name}". */
  cta?: string;
  /** Makes the button a link. */
  href?: string;
}

export interface PricingSectionProps extends Omit<ComponentProps<'section'>, 'title' | 'onSelect'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  plans: PricingPlan[];
  /** Default 'yearly'. */
  defaultPeriod?: PricingPeriod;
  currency?: string;
  locale?: string;
  onSelect?: (planId: string, period: PricingPeriod) => void;
  /** A quiet line under the plans ("Prices without VAT. Cancel anytime."). */
  footnote?: ReactNode;
}

/**
 * Landing pricing: two to four plan cards under a monthly / yearly switch
 * that shows the yearly saving. The recommended plan is the filled card.
 * When the period changes the prices count to their new value (at once
 * with reduced motion). Works on the page and inside SectionPanel
 * tone="gradient", where the cards turn to frosted white.
 *
 * For a full feature table inside a product, use PlanComparison.
 */
export function PricingSection({
  eyebrow,
  title,
  description,
  plans,
  defaultPeriod = 'yearly',
  currency = 'USD',
  locale = 'en-US',
  onSelect,
  footnote,
  className,
  ...props
}: PricingSectionProps) {
  const uid = useId();
  const [period, setPeriod] = useState<PricingPeriod>(defaultPeriod);
  // The prices count from the previous period's values, not from zero.
  const previous = useRef<PricingPeriod>(defaultPeriod);
  const changePeriod = (next: PricingPeriod) => {
    previous.current = period;
    setPeriod(next);
  };
  const maxSaving = Math.max(0, ...plans.map((p) => (p.monthly > 0 ? Math.round((1 - p.yearly / p.monthly) * 100) : 0)));
  const money: Intl.NumberFormatOptions = { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 };

  return (
    <section data-slot="pricing-section" data-scale="display" aria-labelledby={`${uid}-title`} className={cn('section-display', className)} {...props}>
      <div className="container-display flex flex-col items-center gap-10">
        <SectionHead align="center" eyebrow={eyebrow} title={<span id={`${uid}-title`}>{title}</span>} description={description} />

        <ToggleGroup
          type="single"
          appearance="outlined"
          value={period}
          onValueChange={(v) => v && changePeriod(v as PricingPeriod)}
          aria-label="Billing period"
        >
          <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
          <ToggleGroupItem value="yearly">
            Yearly
            {maxSaving > 0 && (
              <Badge tone="success" appearance="filled" className="ms-2">
                −{maxSaving}%
              </Badge>
            )}
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Container query: the cards wrap by the space the section gets. */}
        <div className="@container w-full">
          <ul
            role="list"
            className={cn(
              'm-0 grid w-full list-none items-stretch gap-4 p-0 @2xl:gap-5',
              plans.length === 3 ? '@2xl:grid-cols-2 @5xl:grid-cols-3' : '@2xl:grid-cols-2',
              plans.length >= 4 && '@6xl:grid-cols-4',
            )}
          >
            {plans.map((plan) => {
              const price = period === 'yearly' ? plan.yearly : plan.monthly;
              const was = previous.current === 'yearly' ? plan.yearly : plan.monthly;
              const label = plan.cta ?? `Start with ${plan.name}`;
              return (
                <li key={plan.id} className="min-w-0">
                  <Card
                    appearance={plan.recommended ? 'filled' : 'outlined'}
                    className="flex h-full flex-col gap-6 rounded-[var(--size-border-radius-border-radius-4xl)] p-6 @2xl:p-7"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="m-0 font-heading text-heading-s">{plan.name}</h3>
                        {plan.recommended && (
                          // Inverse of the card: the on-primary color as the fill, the primary as the text.
                          <Badge
                            tone="neutral"
                            appearance="filled"
                            className="shrink-0 bg-[var(--color-text-text-on-primary)] text-[var(--color-bg-primary-bg-primary)]"
                          >
                            {plan.badge ?? 'Most popular'}
                          </Badge>
                        )}
                      </div>
                      {plan.description && <p className="m-0 font-body text-body-m text-[var(--color-text-text-subtle)]">{plan.description}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                      {plan.priceLabel ? (
                        <p className="m-0 font-heading text-heading-xl">{plan.priceLabel}</p>
                      ) : (
                        <p className="m-0 flex items-baseline gap-2">
                          {/* key: a new CountUp per period, so it runs from the old price to the new one. */}
                          <CountUp key={period} from={was} to={price} duration={500} format={money} className="font-heading text-heading-2xl" />
                          <span className="font-body text-body-m text-[var(--color-text-text-subtle)]">/ month</span>
                        </p>
                      )}
                      <p className="m-0 font-body text-body-s text-[var(--color-text-text-subtle)]">
                        {plan.priceLabel
                          ? 'Custom terms and billing'
                          : price === 0
                            ? 'Free for good'
                            : period === 'yearly'
                              ? `${new Intl.NumberFormat(locale, money).format(price * 12)} billed yearly`
                              : 'Billed monthly, cancel anytime'}
                      </p>
                    </div>

                    <Button
                      appearance={plan.recommended ? 'filled' : 'tonal'}
                      tone={plan.recommended ? 'primary' : 'secondary'}
                      size="lg"
                      fullWidth
                      asChild={!!plan.href}
                      onClick={() => onSelect?.(plan.id, period)}
                    >
                      {plan.href ? <a href={plan.href}>{label}</a> : label}
                    </Button>

                    <div className="flex flex-col gap-3 border-0 border-t border-solid border-[var(--color-border-border-subtle)] pt-6">
                      {plan.featuresIntro && <p className="m-0 font-body text-body-s font-semibold">{plan.featuresIntro}</p>}
                      <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex gap-3 font-body text-body-m">
                            <Check
                              aria-hidden
                              className={cn(
                                'mt-0.5 size-5 shrink-0',
                                plan.recommended ? 'text-[var(--color-text-text)]' : 'text-[var(--color-icon-icon-primary)]',
                              )}
                            />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>

        {footnote && <p className="m-0 text-center font-body text-body-s text-[var(--color-text-text-subtle)]">{footnote}</p>}
      </div>
    </section>
  );
}
