import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, Download, Pause, Undo, WarningTriangle, Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { Label } from '@/components/ui/label';
import { OptionCard, OptionCardGroup } from '@/components/ui/option-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompletionScreen } from './completion-screen';

export type CancellationOutcome = 'cancelled' | 'downgraded' | 'paused';

export interface CancellationFlowProps {
  planName?: string;
  /** Last day the paid period covers, already formatted ("Nov 3, 2026"). */
  accessUntil?: string;
  /** The cheaper plan offered instead, e.g. { name: 'Starter', price: '$8 / mo' }. Omit to hide the option. */
  downgradeTo?: { name: string; price: string };
  /** Offer a pause; omit to hide it. */
  pauseMonths?: number;
  onFinish?: (outcome: CancellationOutcome, reason?: string) => void;
  /** "Keep my plan" on any step. */
  onKeep?: () => void;
  className?: string;
}

const REASONS = ['Too expensive', 'Missing a feature I need', 'Moving to another provider', 'Only needed it for a project', 'Something else'];

/**
 * Cancelling stays a clear three-step path: what happens and when, the
 * alternatives (cheaper plan, pause) — offered once, skippable, no guilt
 * copy — then a confirmation that states the end date. "Keep my plan" is
 * always one click away, and the done screen says how to come back.
 */
export function CancellationFlow({ planName = 'Pro', accessUntil = 'Nov 3, 2026', downgradeTo = { name: 'Starter', price: '$8 / mo' }, pauseMonths = 3, onFinish, onKeep, className }: CancellationFlowProps) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<'cancel' | 'downgrade' | 'pause'>('cancel');
  const [reason, setReason] = useState<string>();
  const [outcome, setOutcome] = useState<CancellationOutcome | null>(null);
  const titleId = useId();
  const reasonId = useId();
  // The step's buttons are replaced on every move, so focus would drop to
  // <body>; move it to the new step's heading instead (not on first render).
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) {
      moved.current = true;
      return;
    }
    document.getElementById(titleId)?.focus();
  }, [step, titleId]);

  const finish = (o: CancellationOutcome) => {
    setOutcome(o);
    onFinish?.(o, reason);
  };
  const keep = (
    <Button appearance="outlined" tone="secondary" size="xl" onClick={onKeep} className="max-sm:w-full">
      Keep my plan
    </Button>
  );

  if (outcome) {
    const copy = {
      cancelled: { title: `${planName} plan cancelled`, description: `Everything keeps working until ${accessUntil}. You won't be charged again.` },
      downgraded: { title: `Switched to ${downgradeTo?.name}`, description: `From your next bill you pay ${downgradeTo?.price}. Your sites keep running.` },
      paused: { title: `${planName} plan paused`, description: `Billing stops for ${pauseMonths} months from ${accessUntil}; your sites and data are kept.` },
    }[outcome];
    return (
      <CompletionScreen
        className={className}
        title={copy.title}
        description={copy.description}
        primaryAction={outcome === 'cancelled' ? { label: 'Resume plan', icon: <Undo />, onClick: () => setOutcome(null) } : undefined}
        secondaryActions={outcome === 'cancelled' ? [{ label: 'Download your data', icon: <Download /> }] : []}
      />
    );
  }

  return (
    <section aria-labelledby={titleId} className={cn('mx-auto flex w-full max-w-xl flex-col gap-6', className)}>
      <div>
        <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{`Step ${step + 1} of 3`}</p>
        <h2 id={titleId} tabIndex={-1} className="mt-1 font-body text-heading-s font-semibold text-[var(--color-text-text)] outline-none">
          {step === 0 ? `Cancel your ${planName} plan?` : step === 1 ? 'Before you go' : 'Confirm cancellation'}
        </h2>
      </div>

      {step === 0 && (
        <>
          <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">Here's exactly what happens, so there are no surprises.</p>
          <DescriptionList>
            <DescriptionItem>
              <DescriptionTerm>Until {accessUntil}</DescriptionTerm>
              <DescriptionDetails>Nothing changes. Sites stay online and you keep every feature you paid for.</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>After that</DescriptionTerm>
              <DescriptionDetails>Sites go offline. Files, databases and backups are kept for 30 days, then deleted.</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>Domains</DescriptionTerm>
              <DescriptionDetails>Stay yours. They renew separately, on their own dates.</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>Charges</DescriptionTerm>
              <DescriptionDetails>None. There's no cancellation fee and no further bill.</DescriptionDetails>
            </DescriptionItem>
          </DescriptionList>
        </>
      )}

      {step === 1 && (
        <>
          <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">If cost or timing is the issue, one of these may suit you better. Otherwise, carry on.</p>
          <OptionCardGroup aria-label="What would you like to do?" value={choice} onValueChange={(v) => setChoice(v as typeof choice)} className="sm:grid-cols-1">
            {downgradeTo && <OptionCard value="downgrade" icon={<ArrowDown />} title={`Switch to ${downgradeTo.name}`} description={`Keep one site online for ${downgradeTo.price}.`} />}
            {pauseMonths && <OptionCard value="pause" icon={<Pause />} title={`Pause for up to ${pauseMonths} months`} description="No charges while paused; sites go offline, data is kept." />}
            <OptionCard value="cancel" icon={<Xmark />} title="Cancel the plan" description={`Access ends on ${accessUntil}.`} />
          </OptionCardGroup>
          <div className="flex flex-col gap-2">
            <Label htmlFor={reasonId} optional>
              Why are you cancelling?
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id={reasonId} widthSize="lg">
                <SelectValue placeholder="Choose a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Alert tone="warning">
            <WarningTriangle />
            <AlertDescription>{`Your sites go offline after ${accessUntil}. Files and backups are deleted 30 days later.`}</AlertDescription>
          </Alert>
          <DescriptionList>
            <DescriptionItem>
              <DescriptionTerm>Plan</DescriptionTerm>
              <DescriptionDetails>{planName}</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>Access until</DescriptionTerm>
              <DescriptionDetails>{accessUntil}</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>Final charge</DescriptionTerm>
              <DescriptionDetails>None</DescriptionDetails>
            </DescriptionItem>
          </DescriptionList>
        </>
      )}

      <div className="flex flex-wrap justify-between gap-3">
        {keep}
        {step === 0 && (
          <Button appearance="filled" tone="primary" size="xl" onClick={() => setStep(1)} className="max-sm:w-full">
            Continue
          </Button>
        )}
        {step === 1 &&
          (choice === 'cancel' ? (
            <Button appearance="filled" tone="primary" size="xl" onClick={() => setStep(2)} className="max-sm:w-full">
              Continue to cancel
            </Button>
          ) : (
            <Button appearance="filled" tone="primary" size="xl" onClick={() => finish(choice === 'pause' ? 'paused' : 'downgraded')} className="max-sm:w-full">
              {choice === 'pause' ? 'Pause plan' : `Switch to ${downgradeTo?.name}`}
            </Button>
          ))}
        {step === 2 && (
          <Button appearance="filled" tone="danger" size="xl" onClick={() => finish('cancelled')} className="max-sm:w-full">
            Cancel plan
          </Button>
        )}
      </div>
    </section>
  );
}
