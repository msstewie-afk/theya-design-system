import { useId } from 'react';
import type { ReactNode } from 'react';
import { Check, WarningCircle, Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timeline, TimelineDescription, TimelineItem, TimelineTitle } from '@/components/ui/timeline';
import type { TimelineTone } from '@/components/ui/timeline';

export interface TrackerStep {
  id: string;
  label: string;
  /** What happens in this step, in one line. */
  description?: string;
}

export interface TrackerEvent {
  id: string;
  time: string;
  text: string;
  detail?: string;
  tone?: TimelineTone;
}

export interface StatusTrackerProps {
  title: string;
  /** Order or job reference people quote to support. */
  reference: string;
  startedLabel: string;
  steps: TrackerStep[];
  /** Index of the step in progress (or the one that failed). */
  current: number;
  state: 'running' | 'failed' | 'done';
  /** Percent of the current step, when known. */
  progress?: number;
  /** "About 12 minutes left". */
  eta?: string;
  /** Newest first. */
  events?: TrackerEvent[];
  failure?: { title: string; description: string };
  onRetry?: () => void;
  onCancel?: () => void;
  supportHref?: string;
  /** Shown when done: where to go next. */
  doneActions?: ReactNode;
  className?: string;
}

const STATE_BADGE = {
  running: { label: 'In progress', tone: 'info' },
  failed: { label: 'Stopped', tone: 'danger' },
  done: { label: 'Completed', tone: 'success' },
} as const;

/**
 * The page for one long operation — a migration, a deploy, an order being
 * set up. It answers the questions people come with, in order: is it
 * still going, where is it, how long left, can I leave, and — if it
 * stopped — why and what now. Steps are named, the current one is marked
 * for screen readers too, and the log keeps the exact history.
 */
export function StatusTracker({
  title,
  reference,
  startedLabel,
  steps,
  current,
  state,
  progress,
  eta,
  events = [],
  failure,
  onRetry,
  onCancel,
  supportHref,
  doneActions,
  className,
}: StatusTrackerProps) {
  const uid = useId();
  const step = steps[Math.min(current, steps.length - 1)];
  const headline =
    state === 'done' ? 'Everything is done' : state === 'failed' ? `Stopped at “${step.label}”` : `${step.label} — step ${current + 1} of ${steps.length}`;

  return (
    <div className={cn('@container flex w-full flex-col gap-6', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-body text-heading-m font-semibold text-[var(--color-text-text)]">{title}</h1>
          <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">
            <span className="font-mono">{reference}</span>
            {` · Started ${startedLabel}`}
          </p>
        </div>
        <Badge tone={STATE_BADGE[state].tone} size="md">
          {STATE_BADGE[state].label}
        </Badge>
      </header>

      {/* The answer first: where it is and how long is left. */}
      <section aria-labelledby={`${uid}-now`} className="flex flex-col gap-4 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] p-5">
        <div className="flex flex-col gap-1">
          <h2 id={`${uid}-now`} className="font-body text-heading-xs font-semibold text-[var(--color-text-text)]">
            {headline}
          </h2>
          {state === 'running' && (
            <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">
              {[step.description, eta].filter(Boolean).join('. ')}
              {'. You can close this page — we’ll email you when it’s done.'}
            </p>
          )}
        </div>
        {state === 'running' && progress !== undefined && <Progress value={progress} aria-label={`${step.label} progress`} />}
        {/* Announces step changes and the final result. */}
        <p role="status" className="sr-only">
          {headline}
        </p>

        <ol className="grid gap-3 @3xl:grid-flow-col @3xl:auto-cols-fr @3xl:gap-2">
          {steps.map((s, i) => {
            const status = state === 'done' || i < current ? 'done' : i === current ? (state === 'failed' ? 'failed' : 'current') : 'upcoming';
            return (
              <li key={s.id} aria-current={status === 'current' ? 'step' : undefined} className="flex items-start gap-3 @3xl:flex-col @3xl:gap-2">
                <div className="flex items-center gap-2 @3xl:w-full">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-full border-2 border-solid [&_svg]:size-3.5',
                      status === 'done' && 'border-[var(--color-bg-success-bg-success)] bg-[var(--color-bg-success-bg-success)] text-[var(--color-icon-icon-on-dark)]',
                      status === 'current' && 'border-[var(--color-border-border-primary)]',
                      status === 'failed' && 'border-[var(--color-bg-danger-bg-danger)] bg-[var(--color-bg-danger-bg-danger)] text-[var(--color-icon-icon-on-dark)]',
                      status === 'upcoming' && 'border-[var(--color-border-border-subtle)]',
                    )}
                  >
                    {status === 'done' && <Check />}
                    {status === 'failed' && <Xmark />}
                    {status === 'current' && <span className="size-2 animate-pulse rounded-full bg-[var(--color-bg-primary-bg-primary)] motion-reduce:animate-none" />}
                  </span>
                  <span className={cn('hidden h-0.5 flex-1 rounded-full @3xl:block', status === 'done' ? 'bg-[var(--color-bg-success-bg-success)]' : 'bg-[var(--color-border-border-subtler)]')} />
                </div>
                <div className="min-w-0">
                  <p className={cn('font-body text-body-m', status === 'upcoming' ? 'text-[var(--color-text-text-subtle)]' : 'font-medium text-[var(--color-text-text)]')}>
                    {s.label}
                    <span className="sr-only">{` — ${status === 'current' ? 'in progress' : status === 'failed' ? 'failed' : status === 'done' ? 'done' : 'not started'}`}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {state === 'running' && onCancel && (
          <Button appearance="ghost" tone="secondary" size="md" className="self-start" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </section>

      {state === 'failed' && failure && (
        <Alert tone="danger">
          <WarningCircle />
          {/* Title, text and actions in one column next to the icon. */}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <AlertTitle>{failure.title}</AlertTitle>
            <AlertDescription>{failure.description}</AlertDescription>
            <div className="mt-2 flex flex-wrap gap-2">
              {onRetry && (
                <Button appearance="filled" tone="primary" size="md" onClick={onRetry}>
                  {`Retry from “${step.label}”`}
                </Button>
              )}
              {supportHref && (
                <Button asChild appearance="outlined" tone="secondary" size="md">
                  <a href={supportHref}>{`Contact support (quote ${reference})`}</a>
                </Button>
              )}
            </div>
          </div>
        </Alert>
      )}

      {state === 'done' && doneActions && <div className="flex flex-wrap gap-2">{doneActions}</div>}

      {events.length > 0 && (
        <section aria-labelledby={`${uid}-log`} className="flex flex-col gap-3">
          <h2 id={`${uid}-log`} className="font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">
            Activity
          </h2>
          <Timeline>
            {events.map((e) => (
              <TimelineItem key={e.id} tone={e.tone} time={e.time}>
                <TimelineTitle>{e.text}</TimelineTitle>
                {e.detail && <TimelineDescription>{e.detail}</TimelineDescription>}
              </TimelineItem>
            ))}
          </Timeline>
        </section>
      )}
    </div>
  );
}
