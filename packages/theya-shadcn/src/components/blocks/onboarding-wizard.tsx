'use client';

import { createContext, useCallback, useContext, useId, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Globe } from 'iconoir-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Stepper } from '../ui/stepper';
import { OptionCard, OptionCardGroup } from '../ui/option-card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { TextField } from '../ui/text-field';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '../ui/description-list';

export interface WizardStep {
  id?: string;
  label: string;
  description?: string;
  content?: ReactNode;
  /**
   * Runs on Next before leaving this step; return false (or resolve to
   * false) to stay — e.g. `() => form.trigger()`. Without it, Next always
   * advanced, so an empty required field was simply skipped.
   */
  validate?: () => boolean | Promise<boolean>;
}

interface WizardContextValue {
  /** Jump to a step by index or id (e.g. from an "Edit" link on a review step). */
  goTo: (step: number | string) => void;
  /** Same as pressing Next — runs the step's `validate` first. Wire it to Enter in a step's form. */
  next: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

/** For step content: navigate the surrounding OnboardingWizard. */
export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside OnboardingWizard step content.');
  return ctx;
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
  /** Stepper layout. `auto` (default): vertical on phones with more than two steps or when the steps don't fit. */
  orientation?: 'horizontal' | 'vertical' | 'auto';
  /** Spinner on the final button while your create call runs (set it from onComplete). */
  completing?: boolean;
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
  title = 'Create a client portal',
  description,
  steps: stepsProp,
  current: controlledCurrent,
  onStepChange,
  onComplete,
  completeLabel = 'Create portal',
  backLabel = 'Back',
  nextLabel = 'Next',
  orientation = 'auto',
  completing = false,
  className,
}: OnboardingWizardProps) {
  const defaultSteps = useDefaultSteps();
  const steps = stepsProp ?? defaultSteps;
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
  const nextId = useId();
  const panelId = useId();

  const goto = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), Math.max(total - 1, 0));
      if (!isControlled) setUncontrolled(clamped);
      onStepChange?.(clamped);
      // If the move left focus nowhere — Back disabled on the first step,
      // or a Stepper/Edit link that just got hidden — land on the new
      // step's first field, else on Next (WCAG 2.4.3).
      requestAnimationFrame(() => {
        const ae = document.activeElement as HTMLElement | null;
        const lost = !ae || ae === document.body || (ae as HTMLButtonElement).disabled || !ae.offsetParent;
        if (!lost) return;
        const panel = document.getElementById(panelId);
        const field = panel?.querySelector<HTMLElement>(':scope > div:not([hidden]) :is(input, select, textarea, [role="radio"][tabindex="0"], [role="combobox"])');
        (field ?? document.getElementById(nextId))?.focus();
      });
    },
    [isControlled, onStepChange, total, nextId, panelId],
  );

  const handleNext = async () => {
    if (completing) return;
    if (activeStep?.validate && !(await activeStep.validate())) return;
    if (isLast) {
      onComplete?.();
      return;
    }
    goto(currentIndex + 1);
  };

  const goTo = (target: number | string) => {
    const index = typeof target === 'number' ? target : steps.findIndex((s) => s.id === target);
    if (index >= 0) goto(index);
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
        <Stepper
          steps={steps.map((s) => ({ label: s.label, description: s.description }))}
          current={currentIndex}
          orientation={orientation}
          aria-label={`${title} progress`}
          // Completed steps are links back; nothing ahead can be skipped to.
          onStepClick={completing ? undefined : (i) => i < currentIndex && goto(i)}
        />
      </div>

      <Separator />

      <div id={panelId} role="group" aria-labelledby={panelLabelId} className="flex flex-col gap-4">
        <h3 id={panelLabelId} className="sr-only">
          {`Step ${currentIndex + 1} of ${total}: ${activeStep?.label ?? ''}`}
        </h3>
        {/* Every step stays mounted, inactive ones hidden: rendering only the
            active step's content unmounted the rest, so Back showed an
            empty form and a picked plan reset. */}
        <WizardContext.Provider value={{ goTo, next: () => void handleNext() }}>
          {steps.map((step, i) => (
            <div key={step.id ?? i} hidden={i !== currentIndex} className={i === currentIndex ? 'contents' : undefined}>
              {step.content}
            </div>
          ))}
        </WizardContext.Provider>
      </div>

      <Separator />

      <div className="flex flex-wrap justify-between gap-3">
        <Button appearance="outlined" tone="secondary" size="2xl" disabled={isFirst || completing} onClick={() => goto(currentIndex - 1)} className="max-sm:w-full" leftIcon={<ArrowLeft className="rtl:-scale-x-100" />}>
          {backLabel}
        </Button>
        <Button id={nextId} appearance="filled" tone="primary" size="2xl" onClick={handleNext} loading={isLast && completing} className="max-sm:w-full" leftIcon={isLast ? <Check /> : undefined} rightIcon={!isLast ? <ArrowRight className="rtl:-scale-x-100" /> : undefined}>
          {isLast ? completeLabel : nextLabel}
        </Button>
      </div>
    </div>
  );
}

const portalSchema = z.object({
  portal: z
    .string()
    .trim()
    .min(1, 'Enter a portal address.')
    .regex(/^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i, 'Enter a valid address, e.g. selene-weddings.aether.photo.'),
});

type PortalValues = z.infer<typeof portalSchema>;

function PortalStep({ form }: { form: UseFormReturn<PortalValues> }) {
  const { next } = useWizard();
  return (
    <Form {...form}>
      {/* Enter in the field = Next (validates first). With no onSubmit it
          used to do a native GET submit and reload the page. */}
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <FormField
          control={form.control}
          name="portal"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Portal address</FormLabel>
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
                <TextField {...field} error={fieldState.error?.message} type="text" inputMode="url" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="selene-weddings.aether.photo" className="font-mono" widthSize="full" />
              </FormControl>
              <FormDescription>The address clients will use to see their photos. You can add more portals later.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

type PlanId = 'free' | 'pro' | 'business';

const PLANS: { id: PlanId; title: string; price: string; description: string }[] = [
  { id: 'free', title: 'Free', price: '$0 / mo', description: '1 client portal, 10 GB storage.' },
  { id: 'pro', title: 'Pro', price: '$24 / mo', description: '5 client portals, 384 GB storage, nightly archive copies.' },
  { id: 'business', title: 'Business', price: '$60 / mo', description: 'Unlimited client portals, 2 TB storage, priority support.' },
];

function PlanStep({ plan, setPlan }: { plan: PlanId; setPlan: (plan: PlanId) => void }) {
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

function ReviewStep({ portal, plan }: { portal: string; plan: PlanId }) {
  const { goTo } = useWizard();
  // Was hardcoded to one address + Pro whatever the user entered.
  const selected = PLANS.find((p) => p.id === plan) ?? PLANS[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] p-4">
        <Globe className="mt-0.5 size-5 shrink-0 text-[var(--color-icon-icon-subtle)]" aria-hidden="true" />
        <p className="min-w-0 break-words font-body text-body-s text-[var(--color-text-text)]">Review the details below, then create your portal. You can change any of this later from the portal settings.</p>
      </div>
      <DescriptionList>
        {/* Each group links straight back to the step that set it. */}
        <DescriptionItem>
          <DescriptionTerm>Portal address</DescriptionTerm>
          <DescriptionDetails className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 break-all font-mono">{portal.trim() || '—'}</span>
            <EditLink label="portal address" onClick={() => goTo('portal')} />
          </DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Plan</DescriptionTerm>
          <DescriptionDetails className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">{`${selected.title}, ${selected.price}`}</span>
            <EditLink label="plan" onClick={() => goTo('plan')} />
          </DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Studio</DescriptionTerm>
          <DescriptionDetails>Helios Studio</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
    </div>
  );
}

function EditLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 cursor-pointer rounded-[var(--size-border-radius-border-radius-sm)] font-body text-body-s font-medium text-[var(--color-text-text-link)] outline-none hover:text-[var(--color-text-text-link-hover)] focus-visible:focus-ring"
    >
      Edit<span className="sr-only"> {label}</span>
    </button>
  );
}

/**
 * The seeded demo flow, with its state lifted here so the steps share it:
 * Review shows what was actually entered, and Portal validates on Next.
 * Always called (hook rules) — used only when no `steps` prop is passed.
 */
function useDefaultSteps(): WizardStep[] {
  const form = useForm<PortalValues>({
    resolver: zodResolver(portalSchema),
    defaultValues: { portal: '' },
    mode: 'onTouched',
  });
  const [plan, setPlan] = useState<PlanId>('pro');
  const portal = form.watch('portal');
  return [
    { id: 'portal', label: 'Portal', description: 'Name your portal', content: <PortalStep form={form} />, validate: () => form.trigger('portal', { shouldFocus: true }) },
    { id: 'plan', label: 'Plan', description: 'Pick a tier', content: <PlanStep plan={plan} setPlan={setPlan} /> },
    { id: 'review', label: 'Review', description: 'Confirm and create', content: <ReviewStep portal={portal} plan={plan} /> },
  ];
}
