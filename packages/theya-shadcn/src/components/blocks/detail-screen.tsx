import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Badge, statusToneToBadgeVariant } from '@/components/ui/badge';
import { StatusDot, type StatusTone } from '@/components/ui/status-dot';
import { Stat, type StatTone } from '@/components/ui/stat';
import { DotSeparator } from '@/components/ui/dot-separator';
import { cn } from '@/lib/utils';

/**
 * A reusable scaffold for a single-resource detail page. Composes a
 * hero header (title + status left, an action row right that wraps
 * on mobile), a meta row of small muted facts joined by DotSeparator,
 * an optional responsive KPI factbar built from Stat (2-up at base,
 * 4-up from sm), then the body (typically Tabs) as children.
 *
 * The title renders in mono when it looks like a domain/id (contains
 * a dot or has no spaces) so identifiers stay monospaced.
 *
 *   <DetailScreen title="shop.seashell.dev" status={{ tone: "success", label: "Running" }}
 *     meta={["eu-west-1", "Created Mar 2026", "v2.4.0"]}
 *     actions={<Button>Deploy</Button>}
 *     stats={[{ label: "Visits", value: "128k" }]}>
 *     <Tabs>…</Tabs>
 *   </DetailScreen>
 */
export type DetailStatusTone = StatusTone;

export interface DetailStatus {
  tone: DetailStatusTone;
  label: string;
}

export interface DetailStat {
  label: string;
  /** The fact value — "128k", "4.2 GB", "99.98%", or a composite node. */
  value: ReactNode;
  hint?: string;
  /** Renders a StatusDot beside the value (never color-alone). */
  tone?: StatTone;
  toneLabel?: string;
}

function looksLikeIdentifier(value: string) {
  return /\./.test(value) || !/\s/.test(value);
}

export interface DetailScreenProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** The resource identifier; rendered mono when it looks like a domain/id. */
  title: string;
  status?: DetailStatus;
  /** A row of small muted facts, joined by DotSeparator between items. */
  meta?: ReactNode[];
  /** Right-aligned action row; wraps below the title on mobile. */
  actions?: ReactNode;
  /** Optional KPI factbar: 2-up at base, 4-up from sm. */
  stats?: DetailStat[];
}

export function DetailScreen({ className, title, status, meta, actions, stats, children, ...props }: DetailScreenProps) {
  const mono = looksLikeIdentifier(title);
  const hasMeta = Array.isArray(meta) && meta.length > 0;
  const hasStats = Array.isArray(stats) && stats.length > 0;

  return (
    <div className={cn('flex w-full flex-col gap-6', className)} {...props}>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className={cn('min-w-0 break-words font-body text-heading-s font-semibold text-[var(--color-text-text)]', mono && 'font-mono')}>{title}</h1>
              {status && (
                <Badge variant={statusToneToBadgeVariant(status.tone)}>
                  <StatusDot tone={status.tone} />
                  {status.label}
                </Badge>
              )}
            </div>

            {hasMeta && (
              <p className="flex flex-wrap items-center font-body text-body-s text-[var(--color-text-text-subtler)]">
                {meta.map((item, i) => (
                  <Fragment key={i}>
                    {i > 0 && <DotSeparator />}
                    <span className="min-w-0 break-words">{item}</span>
                  </Fragment>
                ))}
              </p>
            )}
          </div>

          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </header>

      {hasStats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, i) =>
            stat.hint ? (
              <div key={i} className="flex flex-col gap-1.5">
                <Stat label={stat.label} value={stat.value} tone={stat.tone} toneLabel={stat.toneLabel} />
                <p className="px-1 font-body text-body-xs text-[var(--color-text-text-subtler)]">{stat.hint}</p>
              </div>
            ) : (
              <Stat key={i} label={stat.label} value={stat.value} tone={stat.tone} toneLabel={stat.toneLabel} />
            ),
          )}
        </div>
      )}

      {children}
    </div>
  );
}
