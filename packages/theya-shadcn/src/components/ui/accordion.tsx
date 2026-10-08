'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { NavArrowDown } from 'iconoir-react';
import { cn } from '../../lib/utils';

/**
 * Vertically stacked, collapsible sections on @radix-ui/react-accordion.
 * The value is a string in single mode and a string[] in multiple mode.
 * A single-mode Radix accordion only lets the open item close again when
 * `collapsible` is set, so Theya defaults it to true: an open section can
 * always be closed by its own trigger.
 */
export interface AccordionSingleProps extends Omit<React.ComponentProps<typeof AccordionPrimitive.Root>, 'type'> {
  type: 'single';
  collapsible?: boolean;
}
export interface AccordionMultipleProps extends Omit<React.ComponentProps<typeof AccordionPrimitive.Root>, 'type'> {
  type: 'multiple';
}
export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export function Accordion(props: AccordionProps) {
  // The runtime discriminant (props.type) already guarantees value/onValueChange
  // match the chosen mode; `any` here breaks out of a union TS can't narrow
  // through this destructure+spread on its own.
  if (props.type === 'single') {
    const { collapsible = true, ...rest } = props;
    return <AccordionPrimitive.Root {...(rest as any)} type="single" collapsible={collapsible} />;
  }
  return <AccordionPrimitive.Root {...(props as any)} type="multiple" />;
}

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn('border-b border-solid border-[var(--color-border-border-subtler)] last:border-b-0', className)} {...props} />;
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'flex flex-1 items-start justify-between gap-4 rounded-[var(--size-border-radius-border-radius-md)] py-4 cursor-pointer',
          'text-start font-body text-body-m font-medium text-[var(--color-text-text)] outline-none',
          'transition-all duration-standard ease-enter motion-reduce:transition-none hover:underline',
          'focus-visible:outline-none focus-visible:focus-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          '[&[data-state=open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <NavArrowDown className="pointer-events-none mt-0.5 size-4 shrink-0 text-[var(--color-icon-icon-subtle)] transition-transform duration-moderate ease-enter motion-reduce:transition-none" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        'overflow-hidden font-body text-body-m text-[var(--color-text-text-subtler)]',
        'data-[state=closed]:animate-none data-[state=open]:animate-none',
        'transition-[height] duration-moderate ease-enter motion-reduce:transition-none',
        'data-[state=closed]:h-0 data-[state=open]:h-[var(--radix-accordion-content-height)]',
      )}
      {...props}
    >
      <div className={cn('pb-4 pt-0', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
