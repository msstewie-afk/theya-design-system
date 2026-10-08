'use client';

import type { ReactNode } from 'react';
import { HelpCircle } from 'iconoir-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { useTheyaI18n } from '../../lib/i18n';

const helpIconVariants = cva(
  cn(
    'relative inline-flex shrink-0 justify-center rounded-full text-[var(--color-icon-icon-subtle)] outline-none',
    'transition-colors duration-standard ease-enter motion-reduce:transition-none',
    'hover:text-[var(--color-icon-icon)] data-[state=delayed-open]:text-[var(--color-icon-icon)] data-[state=instant-open]:text-[var(--color-icon-icon)]',
    'focus-visible:outline-none focus-visible:focus-ring',
    '[&_svg]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  ),
  {
    variants: {
      size: {
        sm: "size-[1lh] items-start justify-center pt-px align-middle after:absolute after:-inset-1 after:content-['']",
        md: 'size-[1.875rem] items-center justify-center',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);

/**
 * A question-mark glyph that reveals a short hint on hover/focus. Put
 * it next to a label, a table header, or a stat whose meaning needs
 * one line of explanation. size="sm" (default) is one line tall for
 * sitting inline next to text; size="md" is a standalone 30x30 hit
 * area. Like every tooltip this is supplementary and doesn't open on
 * touch — never put a required instruction here.
 */
export interface HelpIconProps extends React.ComponentProps<'button'>, VariantProps<typeof helpIconVariants> {
  children?: ReactNode;
  label?: string;
  icon?: ReactNode;
  contentClassName?: string;
  side?: React.ComponentProps<typeof TooltipContent>['side'];
  align?: React.ComponentProps<typeof TooltipContent>['align'];
  sideOffset?: React.ComponentProps<typeof TooltipContent>['sideOffset'];
}

export function HelpIcon({
  children,
  className,
  contentClassName,
  label,
  icon = <HelpCircle />,
  size,
  side = 'top',
  align,
  sideOffset,
  ...props
}: HelpIconProps) {
  const { t } = useTheyaI18n();
  const accessibleName = label ?? (typeof children === 'string' ? children : t.helpIcon.label);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={accessibleName}
          className={cn(helpIconVariants({ size }), className)}
          {...props}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} align={align} sideOffset={sideOffset} className={contentClassName}>
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

export { helpIconVariants };
