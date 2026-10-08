'use client';

import { Children, cloneElement, isValidElement, useRef, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';
import { useInView } from './use-in-view';

/**
 * Motion preset (landing pages): content eases in the first time it
 * scrolls into view. Ported from Kinetics' Stagger Entrance (MIT,
 * kinetics.colorion.co) onto Theya's motion tokens: `duration-slower`
 * (450ms) on `ease-glide`, the same 14px rise and 90ms step.
 *
 * - `Reveal` animates one element; `RevealGroup` animates its direct
 *   children one after another (`stagger`, ms).
 * - With prefers-reduced-motion the content is simply there — no
 *   transition, no waiting for the scroll position.
 * - Until the page's script runs, revealed content is invisible; keep
 *   it to decoration and secondary blocks, never the only copy of
 *   something essential above the fold.
 */
export type RevealEffect = 'rise' | 'fade' | 'scale' | 'blur';

const EFFECT: Record<RevealEffect, string> = {
  fade: 'data-[state=hidden]:opacity-0',
  rise: 'data-[state=hidden]:opacity-0 data-[state=hidden]:translate-y-3.5',
  scale: 'data-[state=hidden]:opacity-0 data-[state=hidden]:scale-[0.96]',
  blur: 'data-[state=hidden]:opacity-0 data-[state=hidden]:blur-sm',
};

const BASE = 'transition-[opacity,translate,scale,filter] duration-slower ease-glide motion-reduce:transition-none';

interface RevealTriggerProps {
  /** How the content enters. */
  effect?: RevealEffect;
  /** Wait this long (ms) after the element comes into view. */
  delay?: number;
  /** Share of the element that must be visible before it starts, 0–1. */
  threshold?: number;
  /** Play once (default) or every time it scrolls back into view. */
  once?: boolean;
}

export interface RevealProps extends RevealTriggerProps, React.HTMLAttributes<HTMLElement> {
  /** Animate the child element itself instead of a wrapping div. */
  asChild?: boolean;
}

export function Reveal({ effect = 'rise', delay = 0, threshold = 0.2, once = true, asChild, className, style, ...props }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold, once });
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="reveal"
      data-state={inView ? 'visible' : 'hidden'}
      className={cn(BASE, EFFECT[effect], className)}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
      {...props}
    />
  );
}

export interface RevealGroupProps extends RevealTriggerProps, React.HTMLAttributes<HTMLDivElement> {
  /** Time between one child and the next, ms. */
  stagger?: number;
  children?: ReactNode;
}

/** Reveals its direct children in sequence. The children keep their own markup (list items stay list items); a bare string is wrapped in a span. */
export function RevealGroup({ effect = 'rise', delay = 0, stagger = 90, threshold = 0.2, once = true, className, children, ...props }: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold, once });
  const state = inView ? 'visible' : 'hidden';
  let index = 0;
  return (
    <div ref={ref} data-slot="reveal-group" className={className} {...props}>
      {Children.map(children, (child) => {
        if (child == null || typeof child === 'boolean') return child;
        const i = index++;
        const itemDelay = `${delay + i * stagger}ms`;
        if (!isValidElement(child)) {
          return (
            <span data-state={state} className={cn('inline-block', BASE, EFFECT[effect])} style={{ transitionDelay: itemDelay }}>
              {child}
            </span>
          );
        }
        const el = child as ReactElement<{ className?: string; style?: CSSProperties }>;
        return cloneElement(el, {
          // @ts-expect-error data attribute on an arbitrary child
          'data-state': state,
          className: cn(BASE, EFFECT[effect], el.props.className),
          style: { ...el.props.style, transitionDelay: itemDelay },
        });
      })}
    </div>
  );
}
