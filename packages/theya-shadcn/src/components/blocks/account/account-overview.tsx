'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import { NavArrowRight } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ToneIcon } from '../../ui/tone-icon';
import { initials, type AccountUser } from './account-menu';
import { Link } from '../../ui/link';

export interface AttentionItem {
  id: string;
  tone: 'warning' | 'danger' | 'info';
  title: string;
  description?: string;
  action: { label: string; href: string };
}

export interface AccountArea {
  id: string;
  title: string;
  icon: ReactNode;
  href: string;
  /** Two or three facts that show the current state without opening the area. */
  facts: { label: string; value: ReactNode; tone?: 'success' | 'warning' | 'danger' }[];
  /** The tasks people come here for, by name. */
  tasks: { label: string; href: string }[];
}

export interface AccountOverviewProps {
  user: AccountUser & { memberSince?: string; workspace?: string };
  attention?: AttentionItem[];
  areas: AccountArea[];
  className?: string;
}

const linkClass =
  'inline-flex items-center gap-1';

const FACT_TONE = {
  success: 'text-[var(--color-text-text-success)]',
  warning: 'text-[var(--color-text-text-warning)]',
  danger: 'text-[var(--color-text-text-danger)]',
} as const;


/**
 * One page that lists everything the account can do, so nobody has to
 * guess which menu holds "change password" or "download invoices". Things
 * that need action come first. Then every area as a card: its current
 * state in a few facts (2FA on or off, next payment, plan) and the tasks
 * people come for, named — not just a "Manage" link.
 */
export function AccountOverview({ user, attention = [], areas, className }: AccountOverviewProps) {
  const uid = useId();
  return (
    <div className={cn('@container flex w-full flex-col gap-8', className)}>
      <header className="flex items-center gap-4">
        <Avatar size="lg">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{user.name}</h1>
          <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">{[user.email, user.workspace].filter(Boolean).join(' · ')}</p>
          {user.memberSince && <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">{`Member since ${user.memberSince}`}</p>}
        </div>
      </header>

      {attention.length > 0 && (
        <section aria-labelledby={`${uid}-att`} className="flex flex-col gap-3">
          <h2 id={`${uid}-att`} className="font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">
            {`Needs your attention (${attention.length})`}
          </h2>
          {/* No borders or dividers: a tinted panel groups the rows, the tone icon carries the urgency. */}
          <ul className="flex flex-col gap-1 rounded-[var(--size-border-radius-border-radius-2xl)] bg-[var(--color-bg-neutral-bg-neutral-subtler)] p-2">
            {attention.map((a) => (
              <li key={a.id} className="flex flex-col gap-3 p-3 @xl:flex-row @xl:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <ToneIcon tone={a.tone} />
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-body-m font-medium text-[var(--color-text-text)]">
                      <span className="sr-only">{a.tone === 'info' ? 'Note: ' : a.tone === 'danger' ? 'Urgent: ' : 'Warning: '}</span>
                      {a.title}
                    </p>
                    {a.description && <p className="font-body text-body-s text-[var(--color-text-text-subtle)]">{a.description}</p>}
                  </div>
                </div>
                <Button asChild appearance="tonal" tone={a.tone} size="md" className="ms-11 self-start @xl:ms-0 @xl:self-center">
                  <a href={a.action.href}>{a.action.label}</a>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby={`${uid}-areas`} className="flex flex-col gap-3">
        <h2 id={`${uid}-areas`} className="font-heading text-heading-2xs uppercase tracking-[0.07em] text-[var(--color-text-text-subtler)]">
          Everything in your account
        </h2>
        <ul className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {areas.map((area) => (
            <li key={area.id}>
              <Card className="h-full">
                <CardHeader divider={false}>
                  <CardTitle>
                    <h3 className="contents">
                    <a href={area.href} className="inline-flex items-center gap-2 rounded-[var(--size-border-radius-border-radius-sm)] text-[var(--color-text-text)] outline-none hover:text-[var(--color-text-text-link)] focus-visible:focus-ring">
                      <span aria-hidden="true" className="grid size-8 place-items-center rounded-[var(--size-border-radius-border-radius-lg)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] text-[var(--color-icon-icon-subtle)] [&_svg]:size-4">
                        {area.icon}
                      </span>
                      {area.title}
                    </a>
                    </h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-0">
                  <dl className="flex flex-col gap-1.5">
                    {area.facts.map((f) => (
                      <div key={f.label} className="flex items-baseline justify-between gap-3">
                        <dt className="font-body text-body-s text-[var(--color-text-text-subtle)]">{f.label}</dt>
                        <dd className={cn('m-0 text-end font-body text-body-m font-medium text-[var(--color-text-text)]', f.tone && FACT_TONE[f.tone])}>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <ul className="flex flex-col gap-1.5 border-t border-solid border-[var(--color-border-border-subtler)] pt-3">
                    {area.tasks.map((t) => (
                      <li key={t.href}>
                        <Link href={t.href} size="md" className={linkClass}>
                          {t.label}
                          <NavArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
