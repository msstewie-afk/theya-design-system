import type { ReactNode } from 'react';
import { WarningTriangle, ArrowRight, CheckCircle, Globe, Pause, Refresh, ShieldCheck, Activity } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusDot, type StatusTone } from '@/components/ui/status-dot';
import { Stat, type StatTone, type StatDelta } from '@/components/ui/stat';
import { AreaChart, type AreaChartPoint } from '@/components/ui/area-chart';
import { UsageBar, type UsageSegment } from '@/components/ui/usage-bar';
import { Progress } from '@/components/ui/progress';
import { Timeline, TimelineItem, TimelineTitle, TimelineDescription } from '@/components/ui/timeline';

/**
 * A reusable, triage-first account overview block. Leads with the
 * few things that need action ("Needs attention"), then a 4-up KPI
 * Stat grid, a requests AreaChart beside a multi-metric usage widget
 * (a Progress bar per metered resource plus an optional segmented
 * breakdown UsageBar), and a recent-activity Timeline. Status never
 * color-alone (numbers + percent carry usage).
 *
 * Ships with seeded, realistic defaults so it renders standalone.
 *
 *   <DashboardOverview attention={items} stats={kpis} requests={series} />
 */
export type AttentionTone = 'warning' | 'destructive';

export interface AttentionItem {
  /** Mono identifier for the affected resource (e.g. a domain). */
  id: string;
  tone: AttentionTone;
  /** Short status word beside the dot (status is never color-alone). */
  severity: string;
  reason: string;
  /** Verb-first label for the row's primary action. */
  actionLabel: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: StatTone;
  toneLabel?: string;
  delta?: StatDelta;
}

export interface ActivityItem {
  tone: StatusTone;
  icon: ReactNode;
  time: string;
  title: string;
  description: ReactNode;
}

export interface DashboardQuota {
  label: string;
  used: number;
  total: number;
  /** Unit appended in the used-of-total line, e.g. "GB". */
  unit?: string;
}

export interface DashboardOverviewProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title?: string;
  summary?: ReactNode;
  /** Worst-first items needing action; the lede. Empty = healthy state. */
  attention?: AttentionItem[];
  /** Total count the attention badge is "n of" (e.g. all sites). */
  attentionTotal?: number;
  /** KPI cards (renders a 2-up / lg:4-up grid). */
  stats?: DashboardStat[];
  requests?: AreaChartPoint[];
  requestsAriaLabel?: string;
  /** Metered resource bars: one Progress bar each. */
  quotas?: DashboardQuota[];
  /** Breakdown of one pool, shown as a segmented UsageBar below the quota bars. */
  capacity?: UsageSegment[];
  capacityTotal?: number;
  capacityFormat?: (n: number) => string;
  activity?: ActivityItem[];
  onAttentionAction?: (item: AttentionItem) => void;
  onViewAll?: () => void;
  /** "View all" link target. Renders the footer as an anchor. */
  viewAllHref?: string;
}

/** Disk/usage at or above this reads as a "needs attention" signal. */
const NEAR_FULL = 85;

const DEFAULT_ATTENTION: AttentionItem[] = [
  { id: 'legacy.seashell.dev', tone: 'destructive', severity: 'Error', reason: 'Disk 91% full · backups paused', actionLabel: 'Investigate' },
  { id: 'old.seashell.dev', tone: 'destructive', severity: 'Error', reason: 'Certificate renewal failed', actionLabel: 'Reissue certificate' },
  { id: 'staging.seashell.dev', tone: 'warning', severity: 'Suspended', reason: 'Over plan quota · suspended yesterday', actionLabel: 'Resume site' },
];

const DEFAULT_STATS: DashboardStat[] = [
  { label: 'Active sites', value: 9, icon: <Globe />, delta: { value: '+4 this month', direction: 'up' } },
  { label: 'Open incidents', value: 2, icon: <WarningTriangle />, tone: 'warning', toneLabel: 'needs attention', delta: { value: '+1 today', direction: 'down' } },
  { label: 'Certificates expiring', value: 3, icon: <ShieldCheck />, tone: 'warning', toneLabel: 'due soon', delta: { value: 'within 30 days', direction: 'flat' } },
  { label: 'Requests / day', value: '7.1M', icon: <Activity />, tone: 'primary', toneLabel: 'latest day', delta: { value: '+9% vs last week', direction: 'up' } },
];

const DEFAULT_REQUESTS: AreaChartPoint[] = [
  { label: 'Jun 1', value: 5.1 },
  { label: 'Jun 2', value: 5.4 },
  { label: 'Jun 3', value: 5.8 },
  { label: 'Jun 4', value: 6.0 },
  { label: 'Jun 5', value: 5.7 },
  { label: 'Jun 6', value: 6.3 },
  { label: 'Jun 7', value: 6.6 },
  { label: 'Jun 8', value: 6.9 },
  { label: 'Jun 9', value: 6.5 },
  { label: 'Jun 10', value: 7.4 },
  { label: 'Jun 11', value: 7.7 },
  { label: 'Jun 12', value: 8.1 },
  { label: 'Jun 13', value: 7.6 },
  { label: 'Jun 14', value: 7.1 },
];

const DEFAULT_REQUESTS_ARIA = 'Requests across all sites over the last 14 days in millions per day, rising from 5.1M on Jun 1 to a peak of 8.1M on Jun 12 and 7.1M on Jun 14 - a healthy trend.';

const DEFAULT_CAPACITY: UsageSegment[] = [
  { label: 'Uploads', value: 96 },
  { label: 'Databases', value: 64 },
  { label: 'Backups', value: 48 },
  { label: 'Logs', value: 20 },
];

const DEFAULT_CAPACITY_TOTAL = 250;

const DEFAULT_QUOTAS: DashboardQuota[] = [
  { label: 'Storage', used: 228, total: 250, unit: 'GB' },
  { label: 'Bandwidth', used: 812, total: 1000, unit: 'GB' },
];

function pctOf(used: number, total: number): number {
  if (!(total > 0)) return 0;
  return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
}
const defaultCapacityFormat = (n: number) => `${n} GB`;

const DEFAULT_ACTIVITY: ActivityItem[] = [
  {
    tone: 'success',
    icon: <CheckCircle />,
    time: '2h ago',
    title: 'Certificate renewed',
    description: (
      <>
        <span className="font-mono">shop.seashell.dev</span> · valid 90 days
      </>
    ),
  },
  {
    tone: 'primary',
    icon: <Refresh />,
    time: '5h ago',
    title: 'Deploy succeeded',
    description: (
      <>
        <span className="font-mono">api.seashell.dev</span> · <span className="font-mono">v2.4.0</span>
      </>
    ),
  },
  {
    tone: 'warning',
    icon: <Pause />,
    time: 'yesterday',
    title: 'Site suspended',
    description: (
      <>
        <span className="font-mono">staging.seashell.dev</span> · over plan quota
      </>
    ),
  },
  {
    tone: 'destructive',
    icon: <WarningTriangle />,
    time: '2d ago',
    title: 'Disk almost full',
    description: (
      <>
        <span className="font-mono">legacy.seashell.dev</span> · 91% of 50 GB
      </>
    ),
  },
];

export function DashboardOverview({
  className,
  title = 'Dashboard',
  summary,
  attention = DEFAULT_ATTENTION,
  attentionTotal,
  stats = DEFAULT_STATS,
  requests = DEFAULT_REQUESTS,
  requestsAriaLabel = DEFAULT_REQUESTS_ARIA,
  quotas = DEFAULT_QUOTAS,
  capacity = DEFAULT_CAPACITY,
  capacityTotal = DEFAULT_CAPACITY_TOTAL,
  capacityFormat = defaultCapacityFormat,
  activity = DEFAULT_ACTIVITY,
  onAttentionAction,
  onViewAll,
  viewAllHref,
  ...props
}: DashboardOverviewProps) {
  const attentionCount = attention.length;
  const total = attentionTotal ?? attentionCount;
  const anyNearLimit = quotas.some((q) => pctOf(q.used, q.total) >= NEAR_FULL);

  return (
    <div className={cn('mx-auto flex w-full max-w-[73.75rem] flex-col gap-6 px-4 py-8 md:px-6', className)} {...props}>
      <header className="min-w-0">
        <h1 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</h1>
        {summary && <p className="mt-1 font-body text-body-s text-[var(--color-text-text-subtler)]">{summary}</p>}
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-body text-body-l font-semibold leading-tight text-[var(--color-text-text)]">Needs attention</h3>
            <CardDescription>{attentionCount > 0 ? 'The items most in need of action right now' : 'Everything is healthy right now'}</CardDescription>
          </div>
          {attentionCount > 0 && (
            <Badge variant="warning">
              <StatusDot tone="warning" />
              <span className="tabular-nums">{attentionCount}</span>
              {total > attentionCount && (
                <>
                  {' '}
                  of <span className="tabular-nums">{total}</span>
                </>
              )}
            </Badge>
          )}
        </div>

        {attentionCount > 0 ? (
          <ul
            role="list"
            className="flex flex-col overflow-hidden rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)]"
          >
            {attention.map((item) => (
              <li
                key={item.id}
                className="relative flex flex-col gap-3 px-5 py-4 after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-[var(--color-border-border-subtle)] last:after:hidden sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StatusDot tone={item.tone} />
                    <span className="sr-only">{item.severity}: </span>
                    <span className="truncate font-mono text-body-m font-medium">{item.id}</span>
                  </div>
                  <p className={cn('flex items-center gap-1.5 font-body text-body-s', item.tone === 'destructive' ? 'text-[var(--color-text-text-danger)]' : 'text-[var(--color-text-text-warning)]')}>
                    <WarningTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 break-words">
                      <span className="font-medium">{item.severity}</span>
                      {' · '}
                      {item.reason}
                    </span>
                  </p>
                </div>
                <Button type="outlined" intent="secondary" className="max-md:h-11 max-md:w-full sm:shrink-0" onClick={() => onAttentionAction?.(item)}>
                  {item.actionLabel}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-[var(--size-border-radius-border-radius-2xl)] border border-solid border-[var(--color-border-border-subtle)] bg-[var(--color-bg-surface-bg-surface)] px-5 py-4">
            <CheckCircle className="size-5 shrink-0 text-[var(--color-icon-icon-success)]" aria-hidden="true" />
            <p className="font-body text-body-s">Nothing needs your attention.</p>
          </div>
        )}

        {attentionCount > 0 && (onViewAll || viewAllHref) && (
          <div>
            {viewAllHref ? (
              <Button type="ghost" intent="secondary" size="md" asChild>
                <a href={viewAllHref}>
                  View all
                  <ArrowRight />
                </a>
              </Button>
            ) : (
              <Button type="ghost" intent="secondary" size="md" onClick={onViewAll} rightIcon={<ArrowRight />}>
                View all
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />

      {stats.length > 0 && (
        <section aria-labelledby="dashboard-kpi-heading">
          <h2 id="dashboard-kpi-heading" className="sr-only">
            Account health at a glance
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <Stat key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} toneLabel={s.toneLabel} delta={s.delta} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-wrap">
            <div className="min-w-0">
              <CardTitle>Requests</CardTitle>
              <CardDescription>Across all sites · last 14 days · millions / day</CardDescription>
            </div>
            <Badge variant="success">
              <StatusDot tone="success" />
              Healthy
            </Badge>
          </CardHeader>
          <CardContent>
            <AreaChart data={requests} height={240} yStep={2} unit="M" ariaLabel={requestsAriaLabel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="min-w-0">
              <CardTitle>Usage</CardTitle>
              <CardDescription>Metered against your plan</CardDescription>
            </div>
            {anyNearLimit && (
              <Badge variant="warning">
                <StatusDot tone="warning" />
                Near limit
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {quotas.map((q) => {
              const pct = pctOf(q.used, q.total);
              const nearLimit = pct >= NEAR_FULL;
              const unit = q.unit ? ` ${q.unit}` : '';
              return (
                <div key={q.label} className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 font-body text-body-s">
                    <span className="font-medium">{q.label}</span>
                    <span className="text-[var(--color-text-text-subtler)]">
                      <span className="tabular-nums text-[var(--color-text-text)]">
                        {q.used}
                        {unit}
                      </span>{' '}
                      of{' '}
                      <span className="tabular-nums">
                        {q.total}
                        {unit}
                      </span>{' '}
                      <span className={cn('font-medium tabular-nums', nearLimit ? 'text-[var(--color-text-text-warning)]' : 'text-[var(--color-text-text-subtler)]')}>
                        ({pct}%{nearLimit ? ', near limit' : ''})
                      </span>
                    </span>
                  </div>
                  <Progress value={pct} aria-label={`${q.label}: ${q.used}${unit} of ${q.total}${unit}, ${pct} percent${nearLimit ? ', near limit' : ''}`} />
                </div>
              );
            })}

            {capacity.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-solid border-[var(--color-border-border-subtle)] pt-4">
                <p className="font-body text-body-s font-medium">Storage breakdown</p>
                <UsageBar segments={capacity} total={capacityTotal} formatValue={capacityFormat} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {activity.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-4">
            <h3 className="font-body text-body-l font-semibold leading-tight text-[var(--color-text-text)]">Recent activity</h3>
            <Timeline aria-label="Recent account activity">
              {activity.map((item, i) => (
                <TimelineItem key={i} tone={item.tone} icon={item.icon} time={item.time}>
                  <TimelineTitle>{item.title}</TimelineTitle>
                  <TimelineDescription>{item.description}</TimelineDescription>
                </TimelineItem>
              ))}
            </Timeline>
          </div>
        </>
      )}
    </div>
  );
}
