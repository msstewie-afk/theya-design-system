'use client';

import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Inline text link. Navigation only — an action that looks like a link is a
 * Button (`appearance="ghost"`), and a link that looks like a button is
 * `<Button asChild><a/></Button>`.
 *
 * - `size` omitted (default): inherits font and size from the surrounding
 *   text, for a link inside a sentence. Set it for a standalone link
 *   (body-xs … body-l).
 * - `underline`: off by default — the underline appears on hover. Turn it
 *   on for a link inside running text, where color alone can't tell it from
 *   a word (WCAG 1.4.1); the hover then thickens it, as in Prose.
 * - `inverse`: the -on-dark link colors and the white focus ring, for a
 *   dark or primary surface (same name as StatusDot / Sidebar `inverse`).
 * - `asChild`: renders onto a router link (Next.js <Link>, React Router).
 *
 * Mirrors the Figma Link component (Theya Design System, page Link).
 */
export type LinkSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<LinkSize, string> = {
  xs: 'font-body text-body-xs',
  sm: 'font-body text-body-s',
  md: 'font-body text-body-m',
  lg: 'font-body text-body-l',
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Type step for a standalone link. Omit inside text to inherit the surrounding size. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Always underlined (links in running text). Off: underline on hover only. */
  underline?: boolean;
  /** Colors and focus ring for a dark or primary surface. */
  inverse?: boolean;
  /** Render onto the child element (a router link) instead of an <a>. */
  asChild?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { className, size, underline = false, inverse = false, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      ref={ref}
      data-slot="link"
      className={cn(
        'rounded-[var(--size-border-radius-border-radius-sm)] decoration-1 underline-offset-4 outline-none',
        inverse
          ? 'text-[var(--color-text-text-link-on-dark)] hover:text-[var(--color-text-text-link-on-dark-hover)] focus-visible:focus-ring-on-primary'
          : 'text-[var(--color-text-text-link)] hover:text-[var(--color-text-text-link-hover)] focus-visible:focus-ring',
        underline ? 'underline hover:decoration-2' : 'no-underline hover:underline',
        size && SIZE_CLASS[size],
        className,
      )}
      {...props}
    />
  );
});
