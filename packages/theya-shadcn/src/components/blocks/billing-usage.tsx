import { ArrowUpRight, CreditCard, GraphUp } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusDot, type StatusTone } from '@/components/ui/status-dot';
import { Stat, type StatTone } from '@/components/ui/stat';
import { UsageBar, type UsageSegment } from '@/components/ui/usage-bar';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * A reusable billing & usage overview block: a current-plan header
 * (plan name + Badge + price + an "Upgrade plan" action), a KPI Stat
 * grid, quota usage widgets (a Progress bar per quota plus a single
 * segmented UsageBar), and a recent-invoices Table with a
 * per-invoice status. Status never color-alone (StatusDot + text
 * label, quota fullness carried by numbers + percent text).
 *
 * Ships with seeded, realistic defaults so it renders standalone.
 *
 *   <BillingUsage plan={plan} stats={kpis} quotas={quotas} invoices={rows} />
 */
export interface BillingPlan {
  name: string;
  price?: string;
  renewal?: string;
  badge?: BadgeTone;
}

export interface BillingStat {
  label: string;
  value: string | number;
  hint?: string;
  tone?: StatTone;
  toneLabel?: string;
}

/** A metered quota: `used` of `total` `unit`. */
export interface BillingQuota {
  label: string;
  used: number;
  total: number;
  unit?: string;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'due' | 'failed';
}

export interface BillingUsageProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title?: string;
  plan?: BillingPlan;
  /** KPI tiles (renders a 2-up / lg:3-up grid). */
  stats?: BillingStat[];
  /** Metered quotas, one Progress bar each. */
  quotas?: BillingQuota[];
  /** Breakdown of a single storage pool by category, shown as one segmented UsageBar. */
  storageBreakdown?: UsageSegment[];
  /** The storage pool size (denominator for the breakdown bar); defaults to the segment sum. */
  storageTotal?: number;
  storageUnit?: string;
  invoices?: BillingInvoice[];
  onUpgrade?: () => void;
  upgradeLabel?: string;
}

/** A quota at or above this percent reads as "near limit" (text, not color-alone). */
const NEAR_LIMIT = 85;

const INVOICE_STATUS: Record<BillingInvoice['status'], { tone: StatusTone; label: string }> = {
  paid: { tone: 'success', label: 'Paid' },
  due: { tone: 'warning', label: 'Due' },
  failed: { tone: 'danger', label: 'Failed' },
};

const DEFAULT_PLAN: BillingPlan = { name: 'Pro', price: '$79 / mo', renewal: 'Renews Jul 1, 2026', badge: 'primary' };

const DEFAULT_STATS: BillingStat[] = [
  { label: 'Current spend', value: '$79.00', hint: 'This billing period' },
  { label: 'Next invoice', value: '$112.40', hint: 'Due Jul 1, 2026', tone: 'warning', toneLabel: 'includes overage' },
  { label: 'Sites', value: '9 of 12', hint: 'Included in plan', tone: 'primary', toneLabel: 'within plan' },
];

const DEFAULT_QUOTAS: BillingQuota[] = [
  { label: 'Bandwidth', used: 812, total: 1000, unit: 'GB' },
  { label: 'Storage', used: 188, total: 250, unit: 'GB' },
];

const DEFAULT_STORAGE_BREAKDOWN: UsageSegment[] = [
  { label: 'Sites', value: 96 },
  { label: 'Databases', value: 52 },
  { label: 'Backups', value: 30 },
  { label: 'Logs', value: 10 },
];

const DEFAULT_STORAGE_TOTAL = 250;

const DEFAULT_INVOICES: BillingInvoice[] = [
  { id: 'inv-2026-006', date: 'Jun 1, 2026', amount: '$79.00', status: 'due' },
  { id: 'inv-2026-005', date: 'May 1, 2026', amount: '$79.00', status: 'paid' },
  { id: 'inv-2026-004', date: 'Apr 1, 2026', amount: '$94.20', status: 'paid' },
  { id: 'inv-2026-003', date: 'Mar 1, 2026', amount: '$79.00', status: 'failed' },
  { id: 'inv-2026-002', date: 'Feb 1, 2026', amount: '$79.00', status: 'paid' },
];

function pctOf(used: number, total: number): number {
  if (!(total > 0)) return 0;
  return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
}

export function BillingUsage({
  className,
  title = 'Billing & usage',
  plan = DEFAULT_PLAN,
  stats = DEFAULT_STATS,
  quotas = DEFAULT_QUOTAS,
  storageBreakdown = DEFAULT_STORAGE_BREAKDOWN,
  storageTotal = DEFAULT_STORAGE_TOTAL,
  storageUnit = 'GB',
  invoices = DEFAULT_INVOICES,
  onUpgrade,
  upgradeLabel = 'Upgrade plan',
  ...props
}: BillingUsageProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <h2 className="sr-only">{title}</h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-[var(--size-border-radius-border-radius-md)] bg-[var(--color-bg-primary-bg-primary-subtle)] text-[var(--color-icon-icon-primary)]">
            <CreditCard className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">Current plan</span>
              <Badge tone={plan.badge}>{plan.name}</Badge>
            </div>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {plan.price && <span className="text-body-l font-semibold tabular-nums text-[var(--color-text-text)]">{plan.price}</span>}
              {plan.renewal && <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">{plan.renewal}</span>}
            </p>
          </div>
        </div>
        <Button appearance="outlined" tone="secondary" onClick={onUpgrade} className="max-md:h-11 max-md:w-full sm:shrink-0" leftIcon={<ArrowUpRight />}>
          {upgradeLabel}
        </Button>
      </div>

      <Separator />

      {stats.length > 0 && (
        <section aria-labelledby="billing-kpi-heading">
          <h3 id="billing-kpi-heading" className="sr-only">
            Billing at a glance
          </h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {stats.map((s) => (
              <Stat key={s.label} label={s.label} value={s.value} tone={s.tone} toneLabel={s.toneLabel} {...(s.hint ? { delta: { value: s.hint, direction: 'flat' as const } } : {})} />
            ))}
          </div>
        </section>
      )}

      {quotas.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-4">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-body text-body-l font-semibold leading-tight text-[var(--color-text-text)]">Usage this period</h3>
                <CardDescription>Metered against your plan quota</CardDescription>
              </div>
              <Badge tone="neutral">
                <GraphUp aria-hidden="true" />
                <span className="tabular-nums">{quotas.length}</span> metered
              </Badge>
            </div>
            <div className="flex flex-col gap-5">
              {quotas.map((q) => {
                const pct = pctOf(q.used, q.total);
                const nearLimit = pct >= NEAR_LIMIT;
                const unit = q.unit ? ` ${q.unit}` : '';
                return (
                  <div key={q.label} className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <span className="font-body text-body-s font-medium">{q.label}</span>
                      <span className="font-body text-body-s text-[var(--color-text-text-subtler)]">
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

              {storageBreakdown.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-solid border-[var(--color-border-border-subtle)] pt-4">
                  <p className="font-body text-body-s font-medium">Storage breakdown</p>
                  <UsageBar segments={storageBreakdown} total={storageTotal} formatValue={(n) => `${n} ${storageUnit}`} />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {invoices.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-4">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-body text-body-l font-semibold leading-tight text-[var(--color-text-text)]">Recent invoices</h3>
                <CardDescription>Your latest billing statements</CardDescription>
              </div>
              <CreditCard className="size-4 shrink-0 text-[var(--color-icon-icon-subtle)]" aria-hidden="true" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const s = INVOICE_STATUS[inv.status];
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="whitespace-nowrap">{inv.id}</TableCell>
                      <TableCell className="whitespace-nowrap text-[var(--color-text-text-subtler)]">{inv.date}</TableCell>
                      <TableCell className="whitespace-nowrap text-right tabular-nums">{inv.amount}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <StatusDot tone={s.tone} />
                          {s.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
