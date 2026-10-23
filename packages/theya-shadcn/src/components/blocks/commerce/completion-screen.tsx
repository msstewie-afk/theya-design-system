'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle } from 'iconoir-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '../../ui/description-list';
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
  /**
   * Move keyboard focus to the title when the screen mounts. Turn it on
   * when a flow swaps this screen in place of the step that was just
   * submitted (after Pay, after confirming a cancellation): the pressed
   * button is gone, so focus would otherwise drop to <body> and the result
   * would go unannounced. Screen readers then read the title, followed by
   * the description. Leave it off when the screen is a page's initial
   * content, so loading the page doesn't steal focus.
   */
  focusOnMount?: boolean;
  className?: string;
}

/**
 * The end of a purchase: an unmistakable "done", the order number, the
 * full details (the receipt people screenshot), where the confirmation
 * email went and what to do if it doesn't arrive, and a clear next step
 * instead of a dead end.
 */
export function CompletionScreen({ title = "You're all set", description, orderNumber, email, onResendEmail, details = [], primaryAction, secondaryActions = [], focusOnMount = false, className }: CompletionScreenProps) {
  const titleId = useId();
  const descriptionId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  // Mount only: the screen replaces the submitted step, so this runs once,
  // after the swap has rendered. Re-renders (e.g. "send it again") must not
  // pull focus back to the title.
  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section aria-labelledby={titleId} className={cn('mx-auto flex w-full max-w-xl flex-col gap-6', className)}>
      <div className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-[var(--color-bg-success-bg-success-subtle)] text-[var(--color-icon-icon-success)] [&_svg]:size-7">
          <CheckCircle />
        </span>
        {/* tabIndex={-1}: focusable from script (focusOnMount) without
            joining the Tab order; outline-none like the other headings that
            receive programmatic focus. The description is attached so it's
            read together with the title on focus. */}
        <h2
          ref={titleRef}
          id={titleId}
          tabIndex={-1}
          aria-describedby={description ? descriptionId : undefined}
          className="font-body text-heading-s font-semibold text-[var(--color-text-text)] outline-none"
        >
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="font-body text-body-m text-[var(--color-text-text-subtle)]">
            {description}
          </p>
        )}
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
                  // On the neutral-subtle panel plain text-link was 4.38:1 in dark.
                  className="cursor-pointer rounded-[var(--size-border-radius-border-radius-sm)] font-medium text-[var(--color-text-text-link-on-tonal)] underline underline-offset-4 outline-none focus-visible:focus-ring"
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
