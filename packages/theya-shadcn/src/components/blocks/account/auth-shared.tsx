import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Logo mark + heading + one line, centred above an auth form (same as LoginForm). */
export function AuthHeader({ appName, title, children }: { appName: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div aria-hidden="true" className="grid size-11 place-content-center rounded-[var(--size-border-radius-border-radius-xl)] bg-[var(--color-bg-primary-bg-primary)] font-body text-body-l font-semibold text-[var(--color-text-text-on-primary)]">
        {appName.charAt(0)}
      </div>
      <h1 tabIndex={-1} className="font-body text-heading-s font-semibold text-[var(--color-text-text)]">{title}</h1>
      {children && <div className="font-body text-body-m text-[var(--color-text-text-subtle)]">{children}</div>}
    </div>
  );
}

export const authLink =
  'rounded-[var(--size-border-radius-border-radius-sm)] font-medium text-[var(--color-text-text-link)] underline-offset-4 outline-none hover:underline focus-visible:focus-ring';

export function AuthFrame({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex w-full max-w-sm flex-col gap-6', className)}>{children}</div>;
}

export const MIN_PASSWORD = 8;
export const passwordProblem = (v: string) => (!v ? 'Enter a password.' : v.length < MIN_PASSWORD ? `Use at least ${MIN_PASSWORD} characters — ${MIN_PASSWORD - v.length} more.` : undefined);
