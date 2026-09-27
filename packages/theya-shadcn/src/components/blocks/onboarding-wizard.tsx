import { useState, useCallback, useId } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Globe } from 'iconoir-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Stepper } from '@/components/ui/stepper';
import { OptionCard, OptionCardGroup } from '@/components/ui/option-card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TextField } from '@/components/ui/text-field';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';

export interface WizardStep {
  id?: string;
  label: string;
  description?: string;
  content?: ReactNode;
}

export interface OnboardingWizardProps {
  title?: string;
  description?: string;
  steps?: WizardStep[];
  current?: number;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
  completeLabel?: string;
  backLabel?: string;
  nextLabel?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * A multi-step wizard: title + Stepper, the active step's content, and
 * Back/Next actions — composed from shipped primitives (Stepper, Button,
 * OptionCard, Form). No Card/border of its own (Card-vs-hierarchy rule):
 * this is PAGE-level structure for one step at a time, not a discrete
 * object, so it reads via typographic hierarchy + Separator instead of a
 * bordered box. Drop it inside a Dialog (or any surface) when the flow
 * itself needs a boundary — composition provides that, not this block.
 */
export function OnboardingWizard({
  title = 'Create a new site',
  description,
  steps = DEFAULT_STEPS,
  current: controlledCurrent,
  onStepChange,
  onComplete,
  completeLabel = 'Create site',
  backLabel = 'Back',
  nextLabel = 'Next',
  orientation = 'horizontal',
  className,
}: OnboardingWizardProps) {
  const isControlled = controlledCurrent != null;
  const [uncontrolled, setUncontrolled] = useState(0);
  const total = steps.length;
  const raw = isControlled ? controlledCurrent! : uncontrolled;
  const currentIndex = Math.min(Math.max(raw, 0), Math.max(total - 1, 0));

  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= total - 1;
  const activeStep = steps[currentIndex];

  const headingId = useId();
  const panelLabelId = useId();

  const goto = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), Math.max(total - 1, 0));
      if (!isControlled) setUncontrolled(clamped);
      onStepChange?.(clamped);
    },
    [isControlled, onStepChange, total],
  );

  const handleNext = () => {
    if (isLast) {
      onComplete?.();
      return;
    }
    goto(currentIndex + 1);
  };

  return (
    <div role="group" aria-labelledby={headingId} className={cn('flex w-full flex-col gap-4', className)}>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Step ${currentIndex + 1} of ${total}: ${activeStep?.label ?? ''}`}
      </p>

      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h2 id={headingId} className="font-body text-heading-s font-semibold leading-tight text-[var(--color-text-text)]">
            {title}
          </h2>
          {description && <p className="mt-0.5 font-body text-body-s text-[var(--color-text-text-subtler)]">{description}</p>}
        </div>
        <Stepper steps={steps.map((s) => ({ label: s.label, description: s.description }))} current={currentIndex} orientation={orientation} aria-label={`${title} progress`} />
      </div>

      <Separator />

      <div role="group" aria-labelledby={panelLabelId} className="flex flex-col gap-4">
        <h3 id={panelLabelId} className="sr-only">
          {`Step ${currentIndex + 1} of ${total}: ${activeStep?.label ?? ''}`}
        </h3>
        {activeStep?.content}
      </div>

      <Separator />

      <div className="flex flex-wrap justify-between gap-3">
        <Button type="outlined" intent="secondary" size="2xl" disabled={isFirst} onClick={() => goto(currentIndex - 1)} className="max-sm:w-full" leftIcon={<ArrowLeft />}>
          {backLabel}
        </Button>
        <Button type="filled" intent="primary" size="2xl" onClick={handleNext} className="max-sm:w-full" leftIcon={isLast ? <Check /> : undefined} rightIcon={!isLast ? <ArrowRight /> : undefined}>
          {isLast ? completeLabel : nextLabel}
        </Button>
      </div>
    </div>
  );
}

const domainSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(1, 'Enter a domain.')
    .regex(/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i, 'Enter a valid domain, e.g. shop.seashell.dev.'),
});

type DomainValues = z.infer<typeof domainSchema>;

function DomainStep() {
  const form = useForm<DomainValues>({
    resolver: zodResolver(domainSchema),
    defaultValues: { domain: '' },
    mode: 'onTouched',
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" noValidate>
        <FormField
          control={form.control}
          name="domain"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <FormControl>
                {/* FormLabel/FormMessage read validation state through
                    useFormField()'s context automatically, but TextField
                    isn't form-context-aware — it only shows its own danger
                    styling (border/icon) when told to via its own `error`
                    prop. Without this, blurring an invalid field left the
                    label and message text red while the field itself
                    stayed neutral (Мария: "лейбл и нотификация под полем
                    danger, но само поле нет" — a recurring miss, so wiring
                    `fieldState.error` through explicitly here). */}
                <TextField {...field} error={fieldState.error?.message} type="text" inputMode="url" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="shop.seashell.dev" className="font-mono" widthSize="full" />
              </FormControl>
              <FormDescription>The address visitors will use. You can connect more domains after the site is created.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

type PlanId = 'starter' | 'pro' | 'business';

const PLANS: { id: PlanId; title: string; price: string; description: string }[] = [
  { id: 'starter', title: 'Starter', price: '$8 / mo', description: '1 site, 10 GB disk, shared resources.' },
  { id: 'pro', title: 'Pro', price: '$24 / mo', description: '5 sites, 25 GB disk, daily backups.' },
  { id: 'business', title: 'Business', price: '$60 / mo', description: 'Unlimited sites, 100 GB disk, priority support.' },
];

function PlanStep() {
  const [plan, setPlan] = useState<PlanId>('pro');

  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 font-body text-body-s font-medium text-[var(--color-text-text)]">Choose a plan</legend>
      <OptionCardGroup aria-label="Plan" value={plan} onValueChange={(v) => setPlan(v as PlanId)} className="sm:grid-cols-3">
        {PLANS.map((p) => (
          <OptionCard key={p.id} value={p.id} title={p.title} description={`${p.price} - ${p.description}`} />
        ))}
      </OptionCardGroup>
      <p className="mt-3 font-body text-body-s text-[var(--color-text-text-subtler)]">You can change your plan at any time. Prices are billed monthly.</p>
    </fieldset>
  );
}

function ReviewStep() {
  const selected = PLANS.find((p) => p.id === 'pro') ?? PLANS[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] p-4">
        <Globe className="mt-0.5 size-5 shrink-0 text-[var(--color-icon-icon-subtle)]" aria-hidden="true" />
        <p className="min-w-0 break-words font-body text-body-s text-[var(--color-text-text)]">Review the details below, then create your site. You can change any of this later from the site settings.</p>
      </div>
      <DescriptionList>
        <DescriptionItem>
          <DescriptionTerm>Domain</DescriptionTerm>
          <DescriptionDetails className="font-mono">shop.seashell.dev</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Plan</DescriptionTerm>
          <DescriptionDetails>{`${selected.title}, ${selected.price}`}</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Region</DescriptionTerm>
          <DescriptionDetails className="font-mono">eu-west-1</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
    </div>
  );
}

const DEFAULT_STEPS: WizardStep[] = [
  { id: 'domain', label: 'Domain', description: 'Name your site', content: <DomainStep /> },
  { id: 'plan', label: 'Plan', description: 'Pick a tier', content: <PlanStep /> },
  { id: 'review', label: 'Review', description: 'Confirm and create', content: <ReviewStep /> },
];
