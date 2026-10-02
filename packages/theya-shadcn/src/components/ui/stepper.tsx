import type { ReactNode } from 'react';
import { Check } from 'iconoir-react';
import { cn } from '@/lib/utils';

/**
 * No library dependency — a multi-step progress header for wizards/
 * onboarding. Data-driven, pure presentational, fully controlled:
 * pass steps + the 0-based current index, it derives each step's
 * status. Status is never color-alone — color pairs with a numeral
 * (or Check on completed), ordered-list position, and an sr-only word.
 */
export interface StepperStep {
  label: ReactNode;
  description?: ReactNode;
}

type StepStatus = 'complete' | 'current' | 'upcoming';

const STATUS_SR: Record<StepStatus, string> = {
  complete: 'completed',
  current: 'current step',
  upcoming: 'upcoming',
};

function getStatus(index: number, current: number): StepStatus {
  if (index < current) return 'complete';
  if (index === current) return 'current';
  return 'upcoming';
}

export interface StepperProps extends Omit<React.ComponentProps<'ol'>, 'children'> {
  steps: StepperStep[];
  /** 0-based index of the in-progress step. */
  current: number;
  orientation?: 'horizontal' | 'vertical';
  /** Horizontal only: "start" matches the indicator's left edge; "center" pins under it (short labels only). */
  labelAlign?: 'start' | 'center';
}

export function Stepper({
  className,
  steps,
  current,
  orientation = 'horizontal',
  labelAlign = 'start',
  'aria-label': ariaLabel = 'Progress',
  ...props
}: StepperProps) {
  const isVertical = orientation === 'vertical';
  const total = steps.length;
  const safeCurrent = Number.isFinite(current) ? Math.min(Math.max(Math.trunc(current), -1), total) : -1;

  return (
    <ol
      role="list"
      aria-label={ariaLabel}
      className={cn('flex w-full min-w-0', isVertical ? 'flex-col' : 'flex-row items-start', className)}
      {...props}
    >
      {steps.map((step, index) => {
        const status = getStatus(index, safeCurrent);
        const isComplete = status === 'complete';
        const isCurrent = status === 'current';
        const isLast = index === total - 1;
        const segmentAfterComplete = index < safeCurrent;

        return (
          <li
            key={index}
            role="listitem"
            aria-current={isCurrent ? 'step' : undefined}
            className={cn('flex min-w-0', isVertical ? 'gap-3' : cn('flex-col', isLast ? 'flex-none' : 'flex-1'))}
          >
            {isVertical ? (
              <>
                <div className="flex flex-col items-center self-stretch">
                  <StepIndicator index={index} total={total} status={status} isComplete={isComplete} isCurrent={isCurrent} />
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'my-1 min-h-2 w-0.5 flex-1 rounded-full',
                        segmentAfterComplete ? 'bg-[var(--color-bg-success-bg-success)]' : 'bg-[var(--color-border-border-subtle)]',
                      )}
                    />
                  )}
                </div>
                <StepText step={step} status={status} reserveDescription className={cn('pt-1', !isLast && 'pb-6')} />
              </>
            ) : (
              <>
                <div className="flex w-full items-center">
                  <StepIndicator index={index} total={total} status={status} isComplete={isComplete} isCurrent={isCurrent} />
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-0.5 flex-1 rounded-full',
                        segmentAfterComplete ? 'bg-[var(--color-bg-success-bg-success)]' : 'bg-[var(--color-border-border-subtle)]',
                      )}
                    />
                  )}
                </div>
                <StepText
                  step={step}
                  status={status}
                  className={cn(
                    'mt-2 px-1',
                    labelAlign === 'center' ? 'w-max max-w-28 translate-x-[calc(0.875rem-50%)] items-center text-center' : 'items-start text-left',
                  )}
                />
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepIndicator({
  index,
  total,
  status,
  isComplete,
  isCurrent,
}: {
  index: number;
  total: number;
  status: StepStatus;
  isComplete: boolean;
  isCurrent: boolean;
}) {
  return (
    <span
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full font-body text-body-s font-medium tabular-nums',
        isComplete && 'bg-[var(--color-bg-success-bg-success)] text-[var(--color-text-text-on-dark)]',
        isCurrent && 'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)] shadow-[0_0_0_4px_var(--color-focus-focus-ring)]',
        !isComplete && !isCurrent && 'border border-solid border-[var(--color-border-border-default)] bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text-subtler)]',
      )}
    >
      <span className="sr-only">{`step ${index + 1} of ${total}, ${STATUS_SR[status]}: `}</span>
      {isComplete ? <Check width={16} height={16} aria-hidden="true" /> : <span aria-hidden="true">{index + 1}</span>}
    </span>
  );
}

function StepText({
  step,
  status,
  className,
  reserveDescription,
}: {
  step: StepperStep;
  status: StepStatus;
  className?: string;
  /**
   * Vertical only: reserve one line of description height even when this
   * step has none, so every indicator sits an equal distance apart instead
   * of the connector rail's length depending on whether each step happens
   * to carry a description.
   */
  reserveDescription?: boolean;
}) {
  return (
    <span className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      <span
        className={cn(
          'font-body text-body-m font-medium break-words',
          status === 'upcoming' ? 'text-[var(--color-text-text-subtler)]' : 'text-[var(--color-text-text)]',
        )}
      >
        {step.label}
      </span>
      {step.description ? (
        <span className="font-body text-body-s break-words text-[var(--color-text-text-subtler)]">{step.description}</span>
      ) : (
        reserveDescription && (
          <span className="invisible font-body text-body-s" aria-hidden="true">
            &nbsp;
          </span>
        )
      )}
    </span>
  );
}
