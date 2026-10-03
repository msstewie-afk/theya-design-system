import { useId } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle } from 'iconoir-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { withDots } from './shared';

export interface CompletionAction {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export interface CompletionScreenProps {
  title?: string;
  /** One line on what just happened. */
  description?: ReactNode;
  orderNumber?: string;
  /** Where the confirmation went, shown so a typo is caught now, not in a week. */
  email?: string;
  onResendEmail?: () => void;
  details?: { term: string; value: ReactNode }[];
  /** The logical next step — usually "start using what you bought". */
  primaryAction?: CompletionAction;
  secondaryActions?: CompletionAction[];
  className?: string;
}

/**
 * The end of a purchase: an unmistakable "done", the order number, the
 * full details (the receipt people screenshot), where the confirmation
 * email went and what to do if it doesn't arrive, and a clear next step
 * instead of a dead end.
 */
export function CompletionScreen({ title = "You're all set", description, orderNumber, email, onResendEmail, details = [], primaryAction, secondaryActions = [], className }: CompletionScreenProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={cn('mx-auto flex w-full max-w-xl flex-col gap-6', className)}>
      <div className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-icon-icon-success)] [&_svg]:size-7">
          <CheckCircle />
        </span>
        <h2 id={titleId} className="font-body text-heading-m font-semibold text-[var(--color-text-text)]">
          {title}
        </h2>
        {description && <p className="font-body text-body-m text-[var(--color-text-text-subtle)]">{description}</p>}
        {orderNumber && (
          <p className="font-body text-body-s text-[var(--color-text-text-subtler)]">
            Order <span className="font-mono text-[var(--color-text-text)]">{orderNumber}</span>
          </p>
        )}
      </div>

      {email && (
        <div className="rounded-[var(--size-border-radius-border-radius-2xl)] bg-[var(--color-bg-neutral-bg-neutral-subtle)] px-5 py-4 font-body text-body-s text-[var(--color-text-text-subtle)]">
          <p>
            We sent the receipt to <span className="font-medium text-[var(--color-text-text)]">{email}</span>.
          </p>
          <p className="mt-1">
            Not there in a few minutes? Check the spam folder
            {onResendEmail && (
              <>
                {' or '}
                <button
                  type="button"
                  onClick={onResendEmail}
                  className="cursor-pointer rounded-[var(--size-border-radius-border-radius-sm)] font-medium text-[var(--color-text-text-link)] underline underline-offset-4 outline-none focus-visible:focus-ring"
                >
                  send it again
                </button>
              </>
            )}
            .
          </p>
        </div>
      )}

      {details.length > 0 && (
        <DescriptionList>
          {details.map((d) => (
            <DescriptionItem key={d.term}>
              <DescriptionTerm>{d.term}</DescriptionTerm>
              <DescriptionDetails>{withDots(d.value)}</DescriptionDetails>
            </DescriptionItem>
          ))}
        </DescriptionList>
      )}

      {(primaryAction || secondaryActions.length > 0) && (
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          {primaryAction && (
            <Button appearance="filled" tone="primary" size="xl" leftIcon={primaryAction.icon} onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryActions.map((a) => (
            <Button key={a.label} appearance="outlined" tone="secondary" size="xl" leftIcon={a.icon} onClick={a.onClick}>
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
