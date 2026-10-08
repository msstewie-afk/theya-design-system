'use client';

import { useRef, type ReactNode } from 'react';
import { Check } from 'iconoir-react';
import { cn } from '../../lib/utils';
import { useTheyaI18n } from '../../lib/i18n';

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
  /**
   * Makes completed steps clickable (their label becomes a button), so
   * people can jump back to a step they've done instead of pressing Back
   * repeatedly. Current and upcoming steps stay plain text.
   */
  onStepClick?: (index: number) => void;
}

export function Stepper({
  className,
  steps,
  current,
  orientation = 'horizontal',
  labelAlign = 'start',
  onStepClick,
  'aria-label': ariaLabel,
  ...props
}: StepperProps) {
  const { t } = useTheyaI18n();
  if (ariaLabel === undefined) ariaLabel = t.stepper.label;
  const isVertical = orientation === 'vertical';
  const total = steps.length;
  const safeCurrent = Number.isFinite(current) ? Math.min(Math.max(Math.trunc(current), -1), total) : -1;
  // Motion (Kinetics' Step Progress, MIT): a segment fills when the step before it
  // completes, then the new current step pops — once the step has actually changed,
  // so the starting step doesn't pop on load.
  const initialCurrent = useRef(safeCurrent);
  const moved = useRef(false);
  if (safeCurrent !== initialCurrent.current) moved.current = true;

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
        const onClick = isComplete && onStepClick ? () => onStepClick(index) : undefined;

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
                  <StepIndicator index={index} total={total} status={status} isComplete={isComplete} isCurrent={isCurrent} onClick={onClick} animate={moved.current} />
                  {!isLast && (
                    <Segment vertical filled={segmentAfterComplete} className="my-1 min-h-2 w-0.5 flex-1" />
                  )}
                </div>
                <StepText step={step} status={status} onClick={onClick} reserveDescription className={cn('pt-1', !isLast && 'pb-6')} />
              </>
            ) : (
              <>
                <div className="flex w-full items-center">
                  <StepIndicator index={index} total={total} status={status} isComplete={isComplete} isCurrent={isCurrent} onClick={onClick} animate={moved.current} />
                  {!isLast && (
                    <Segment filled={segmentAfterComplete} className="h-0.5 flex-1" />
                  )}
                </div>
                <StepText
                  step={step}
                  status={status}
                  onClick={onClick}
                  className={cn(
                    'mt-2 px-1',
                    labelAlign === 'center' ? 'w-max max-w-28 translate-x-[calc(0.875rem-50%)] rtl:translate-x-[calc(50%-0.875rem)] items-center text-center' : 'items-start text-start',
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
  onClick,
  animate = false,
}: {
  index: number;
  total: number;
  status: StepStatus;
  isComplete: boolean;
  isCurrent: boolean;
  /** Mouse shortcut only; the label's button is the keyboard/AT target. */
  onClick?: () => void;
  /** Pop when this step becomes current (off on the first render). */
  animate?: boolean;
}) {
  const { t } = useTheyaI18n();
  return (
    <span
      onClick={onClick}
      className={cn(
        onClick && 'cursor-pointer',
        'flex size-7 shrink-0 items-center justify-center rounded-full font-body text-body-s font-medium tabular-nums',
        isComplete && 'bg-[var(--color-bg-success-bg-success)] text-[var(--color-text-text-on-dark)]',
        isCurrent && 'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-text-text-on-primary)] focus-ring',
        // After the segment before it has filled.
        isCurrent && animate && 'animate-[theya-pop-soft_400ms_var(--ease-spring)_250ms] motion-reduce:animate-none',
        'transition-[background-color,color] duration-slow ease-enter motion-reduce:transition-none',
        !isComplete && !isCurrent && 'border border-solid border-[var(--color-border-border)] bg-[var(--color-bg-surface-bg-surface)] text-[var(--color-text-text-subtler)]',
      )}
    >
      <span className="sr-only">{t.stepper.step(index + 1, total, status)}</span>
      {isComplete ? <Check width={16} height={16} aria-hidden="true" /> : <span aria-hidden="true">{index + 1}</span>}
    </span>
  );
}

function StepText({
  step,
  status,
  className,
  reserveDescription,
  onClick,
}: {
  step: StepperStep;
  status: StepStatus;
  className?: string;
  onClick?: () => void;
  /**
   * Vertical only: reserve one line of description height even when this
   * step has none, so every indicator sits an equal distance apart instead
   * of the connector rail's length depending on whether each step happens
   * to carry a description.
   */
  reserveDescription?: boolean;
}) {
  const { t } = useTheyaI18n();
  return (
    <span className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="cursor-pointer self-start rounded-[var(--size-border-radius-border-radius-sm)] text-start font-body text-body-m font-medium break-words text-[var(--color-text-text)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring"
        >
          {step.label}
          <span className="sr-only">{t.stepper.goBack}</span>
        </button>
      ) : (
        <span
          className={cn(
            'font-body text-body-m font-medium break-words',
            status === 'upcoming' ? 'text-[var(--color-text-text-subtler)]' : 'text-[var(--color-text-text)]',
          )}
        >
          {step.label}
        </span>
      )}
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

/** The line between two steps: a track with a success fill that grows in when the step before it completes. */
function Segment({ filled, vertical = false, className }: { filled: boolean; vertical?: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('relative overflow-hidden rounded-full bg-[var(--color-border-border)]', className)}>
      <span
        className={cn(
          'absolute inset-0 rounded-full bg-[var(--color-bg-success-bg-success)] transition-[scale] duration-slower ease-glide motion-reduce:transition-none',
          vertical ? 'origin-top' : 'origin-left rtl:origin-right',
          filled ? 'scale-100' : vertical ? 'scale-y-0' : 'scale-x-0',
        )}
      />
    </span>
  );
}
