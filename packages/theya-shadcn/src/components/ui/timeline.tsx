import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A vertical activity/event feed. A left rail draws a dot (or, with
 * an `icon`, a small chip) for each event, with a connector line
 * running to the next item; the last item has no connector. Pure
 * presentational — no client JS.
 *
 *   <Timeline>
 *     <TimelineItem tone="success" time="14:02" icon={<CheckCircle />}>
 *       <TimelineTitle>Certificate issued</TimelineTitle>
 *       <TimelineDescription>shop.seashell.dev · valid 90 days</TimelineDescription>
 *     </TimelineItem>
 *   </Timeline>
 *
 * The dot/icon is decorative; for a non-neutral tone an sr-only word
 * is announced so status is never color-alone.
 */
export type TimelineTone = 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'primary';

// Same `-status` family StatusDot uses, and the same light/dark split
// (Мария caught this on StatusDot first, 2026-09-26, then flagged
// Timeline's warning dot as having the same issue): in light theme this
// is the plain solid `bg-{tone}` fill (matching Button/Badge), one step
// darker than `-status` — except `warning`, which uses the `yellow-300`
// primitive directly rather than any semantic warning token, per her
// explicit call. In dark theme every tone (including warning) uses the
// lighter `-status` step, which is what this family was originally
// built for — see status-dot.tsx for the full rationale, including why
// `neutral` has no `-status` counterpart and keeps the solid
// `icon-icon-subtle` token instead in both themes.
const TONE_DOT: Record<TimelineTone, string> = {
  neutral: 'bg-[var(--color-icon-icon-subtle)]',
  success: 'bg-[var(--color-bg-success-bg-success)] [[data-theme=dark]_&]:bg-[var(--color-bg-success-bg-success-status)]',
  warning: 'bg-[var(--color-yellow-yellow-300)] [[data-theme=dark]_&]:bg-[var(--color-bg-warning-bg-warning-status)]',
  destructive: 'bg-[var(--color-bg-danger-bg-danger)] [[data-theme=dark]_&]:bg-[var(--color-bg-danger-bg-danger-status)]',
  info: 'bg-[var(--color-bg-info-bg-info)] [[data-theme=dark]_&]:bg-[var(--color-bg-info-bg-info-status)]',
  primary: 'bg-[var(--color-bg-primary-bg-primary)] [[data-theme=dark]_&]:bg-[var(--color-bg-primary-bg-primary-status)]',
};

// Same light/dark split as TONE_DOT above (Мария caught this was still
// unfixed on the "With Icons" story, 2026-09-27 — the dot-only fix
// didn't touch this map). White ink (`icon-icon-on-dark`) for every
// tone in BOTH themes, EXCEPT warning in light theme: light-theme
// warning's bg is now the `yellow-300` primitive (`#efb300`, a light
// gold), and white text on it fails contrast badly — needs the same
// dark-ink treatment as `neutral` (`--color-black`, no semantic "dark
// icon on a fixed light surface" token exists yet). In dark theme,
// warning's bg is back to the darker `-status` orange, where white
// already measures 3.45:1 (passes the WCAG 3:1 graphical-object floor),
// so it switches back to white ink there. `neutral` keeps its own
// permanent dark-ink treatment in both themes — its bg is the light,
// solid `icon-icon-subtle`, never a `-status`/`-bg` token — same pairing
// issue the Switch checkmark fix solved earlier this session.
const TONE_ICON: Record<TimelineTone, string> = {
  neutral: 'bg-[var(--color-icon-icon-subtle)] text-[var(--color-black)]',
  success: 'bg-[var(--color-bg-success-bg-success)] text-[var(--color-icon-icon-on-dark)] [[data-theme=dark]_&]:bg-[var(--color-bg-success-bg-success-status)]',
  warning: 'bg-[var(--color-yellow-yellow-300)] text-[var(--color-black)] [[data-theme=dark]_&]:bg-[var(--color-bg-warning-bg-warning-status)] [[data-theme=dark]_&]:text-[var(--color-icon-icon-on-dark)]',
  destructive: 'bg-[var(--color-bg-danger-bg-danger)] text-[var(--color-icon-icon-on-dark)] [[data-theme=dark]_&]:bg-[var(--color-bg-danger-bg-danger-status)]',
  info: 'bg-[var(--color-bg-info-bg-info)] text-[var(--color-icon-icon-on-dark)] [[data-theme=dark]_&]:bg-[var(--color-bg-info-bg-info-status)]',
  primary: 'bg-[var(--color-bg-primary-bg-primary)] text-[var(--color-icon-icon-on-dark)] [[data-theme=dark]_&]:bg-[var(--color-bg-primary-bg-primary-status)]',
};

const TONE_SR: Record<TimelineTone, string> = {
  neutral: '',
  success: 'success',
  warning: 'warning',
  destructive: 'error',
  info: 'info',
  primary: 'highlighted',
};

export function Timeline({ className, ...props }: React.ComponentProps<'ol'>) {
  return <ol data-slot="timeline" role="list" className={cn('flex flex-col', className)} {...props} />;
}

export interface TimelineItemProps extends React.ComponentProps<'li'> {
  tone?: TimelineTone;
  icon?: ReactNode;
  time?: ReactNode;
  toneLabel?: string;
}

export function TimelineItem({ className, tone = 'neutral', icon, time, toneLabel, children, ...props }: TimelineItemProps) {
  const status = tone !== 'neutral' ? (toneLabel ?? TONE_SR[tone]) : null;

  return (
    <li data-slot="timeline-item" role="listitem" className={cn('group/item relative flex gap-3 pb-6 last:pb-0', className)} {...props}>
      <span data-slot="timeline-connector" aria-hidden="true" className="absolute left-2.5 top-5 bottom-0 w-px -translate-x-1/2 bg-[var(--color-border-border-subtle)] group-last/item:hidden" />
      <div data-slot="timeline-rail" aria-hidden="true" className="relative flex w-5 shrink-0 justify-center">
        {icon ? (
          <span data-slot="timeline-icon" className={cn('relative z-10 mt-0.5 flex size-5 items-center justify-center rounded-full [&_svg]:size-3 [&_svg]:shrink-0', TONE_ICON[tone])}>{icon}</span>
        ) : (
          <span data-slot="timeline-dot" className={cn('relative z-10 mt-1.5 size-2.5 rounded-full ring-4 ring-[var(--color-bg-surface-bg-surface)]', TONE_DOT[tone])} />
        )}
      </div>
      <div data-slot="timeline-content" className="min-w-0 flex-1 pt-0.5">
        {status && <span className="sr-only">{status}: </span>}
        {time && <TimelineTime>{time}</TimelineTime>}
        {children}
      </div>
    </li>
  );
}

export function TimelineTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="timeline-title" className={cn('min-w-0 break-words font-body text-body-m font-medium text-[var(--color-text-text)]', className)} {...props} />;
}

export function TimelineDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="timeline-description" className={cn('mt-0.5 min-w-0 break-words font-body text-body-s text-[var(--color-text-text-subtler)]', className)} {...props} />;
}

export function TimelineTime({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="timeline-time" className={cn('mb-0.5 min-w-0 break-all text-body-s tabular-nums text-[var(--color-text-text-subtler)]', className)} {...props} />;
}
